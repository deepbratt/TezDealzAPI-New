const amqp = require('amqplib/callback_api');

exports.send = (queueName, data) => {
  console.log(queueName);
  amqp.connect(process.env.RABBITMQ_URL, function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      var queue = queueName;
      var msg = data;

      channel.sendToQueue(queue, Buffer.from(msg));
      console.log(' [x] Sent %s', msg);
    });
  });
};

exports.userbanReceiver = () => {
  amqp.connect(process.env.RABBITMQ_URL, function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      var queue = 'inactive_user';

      console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);

      channel.consume(
        queue,
        function (msg) {
          console.log(JSON.parse(msg.content));
          Car.updateMany(JSON.parse(msg.content), { active: false })
            .then((result) => {
              console.log(result);
            })
            .catch((err) => console.log(err));
        },
        {
          noAck: true,
        },
      );
    });
  });
};