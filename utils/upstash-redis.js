// const redis = require('redis');
// const { promisify } = require('util');
// const client = redis.createClient({
// 	host: 'us1-teaching-pangolin-34803.upstash.io',
// 	port: '34803',
// 	password: '4c2ed042334b40c2acd625acc56d012a',
// 	tls: {},
// });
// client.on('error', function (err) {
// 	console.log(err);
// });

// const GET_ASYNC = promisify(client.get).bind(client);
// const SET_ASYNC = promisify(client.set).bind(client);

// //const cache = new NodeCache();

// module.exports = (duration) => async (req, res, next) => {
// 	if (req.method !== 'GET') {
// 		client.flushdb(function (err, succeeded) {
// 			console.log(succeeded); // will be true if successfull
// 		});
// 		return next();
// 	}
// 	let key;
// 	if (req.user) {
// 		key = `${req.originalUrl}_${req.user._id}`;
// 	} else {
// 		key = req.originalUrl;
// 	}
// 	console.log(key);

// 	const cachedResponse = await GET_ASYNC(key);

// 	if (cachedResponse) {
// 		console.log(`Cache hit for ${key}`);
// 		res.json(JSON.parse(cachedResponse));
// 	} else {
// 		console.log(`Cache miss for ${key}`);
// 		res.originalSend = res.json;
// 		res.json = async (body) => {
// 			res.originalSend(body);
// 			await SET_ASYNC(key, JSON.stringify(body), 'EX', duration);
// 			//cache.set(key, body, duration);
// 		};
// 		next();
// 	}
// };
