const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cluster = require('cluster');
const os = require('os');
const cors = require('cors');
const path = require('path');
const { AppError, errorHandler, catchAsync } = require('@utils/tdb_globalutils');
//const {c}= require('tdb_globalutils')
dotenv.config({ path: './config/config.env' }); // read config.env to environmental variables
require('./config/dbConnection')(); // db connection
const session = require('cookie-session');
//const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression'); 
const numCpu = os.cpus().length;
// Global Error Handler
const { ERRORS, STATUS_CODE } = require('@constants/tdb-constants');
const jwt = require('jsonwebtoken');

const userRoute = require('./constants/routeConst').userRouteConsts.userRoute;
const userRouter = require('./routes/user/userRoutes');
const ticketRoutes = require('./constants/routeConst').ticketsRouteConsts.ticketRoute;
const ticketRouter = require('./routes/ticket/ticketRoutes');
const appointmentsRoute = require('./constants/routeConst').appointmentRouteConsts.appointmentRoute;
const appointmentsRouter = require('./routes/appointments/appointmentRoutes');
const adsRoutes = require("./constants/routeConst").AdsRouteConsts.carRoutes;
const adsRouter = require("./routes/ads/carRoutes");
// const rateLimitRoute = require('./constants/routeConts').routeConsts.rateLimitAPI;

const PORT = 3004; // port
const app = express();
const receivers = require("./utils/rabbitMQ");
// Security HTTP Headers
app.use(helmet());

// CORS
app.use(cors());

app.set('utils', path.join(__dirname, 'utils'));

app.use(
  morgan('dev', {
    skip: function (req, res) {
      return res.statusCode < 200;
    },
  }),
);

// GLOBAL MIDDLEWARES
app.use(express.json()); // body parser (reading data from body to req.body)
//app.use(cookieParser()); // cookie parser (reading data from cookie to req.cookie)

// Data Sanitization against noSQL query Injection
app.use(mongoSanitize());

// Data Sanitization against XSS(Cross site Scripting attack) (Remove HTML&JS Code in input)
app.use(xss());

app.use(
  session({
    signed: false,
  }),
);

app.use(compression());
// receivers.userbanReceiver();
//routes
app.use(userRoute, userRouter);
app.use(ticketRoutes,ticketRouter);
app.use(appointmentsRoute,appointmentsRouter);
app.use(adsRoutes, adsRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

exports.authenticate = (User) => {
	return catchAsync(async (req, res, next) => {
		//getting token and check is it there
		let token;
		if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
			token = req.headers.authorization.split(' ')[1];
		} else if (req.session.jwt) {
			token = req.session.jwt;
		}
		if (!token) {
			return next(new AppError(ERRORS.UNAUTHORIZED.NOT_LOGGED_IN, STATUS_CODE.UNAUTHORIZED));
		}
		//verification token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		//check if user sitll exists
		const currentUser = await User.findById(decoded.userdata.id);
		if (!currentUser) {
			return next(new AppError(`User ${ERRORS.INVALID.NOT_FOUND}`, STATUS_CODE.NOT_FOUND));
		}
		if (!currentUser.active || currentUser.banned) {
			return next(
				new AppError(
					`Your account is Banned or Inactive, Please contact the customer support`,
					STATUS_CODE.NOT_FOUND
				)
			);
		}
		//check if user changed password after the token was issued
		if (currentUser.changedPasswordAfter(decoded.iat)) {
			return next(new AppError(ERRORS.UNAUTHORIZED.INVALID_JWT, STATUS_CODE.UNAUTHORIZED));
		}
		//Grant access to protected route
		req.user = currentUser;
		next();
	});
};

exports.checkIsLoggedIn = (User) => {
	return async (req, res, next) => {
		//getting token and check is it there
		let token;
		if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
			token = req.headers.authorization.split(' ')[1];
		} else if (req.session.jwt) {
			token = req.session.jwt;
		}
		if (token) {
			try {
				//verification token
				const decoded = jwt.verify(token, process.env.JWT_SECRET);
				//check if user sitll exists
				const currentUser = await User.findById(decoded.userdata.id);
				if (!currentUser) {
					return next();
				}
				if (!currentUser.active || currentUser.banned) {
					return next();
				}
				//check if user changed password after the token was issued
				if (currentUser.changedPasswordAfter(decoded.iat)) {
					return next();
				}
				//Grant access to protected route
				req.user = currentUser;
				return next();
			} catch (err) {
				return next();
			}
		}
		next();
	};
};

exports.restrictTo = (...role) => {
	return (req, res, next) => {
		if (!role.includes(req.user.role)) {
			return next(new AppError(ERRORS.UNAUTHORIZED.UNAUTHORIZE, STATUS_CODE.UNAUTHORIZED));
		}
		next();
	};
};

if (cluster.isMaster) {
  for (let i = 0; i < numCpu; i++) {
    cluster.fork();
  }
} else {
  app.listen(PORT, () => {
    console.log(`${process.pid} listening on ${PORT}`);
  });
}
