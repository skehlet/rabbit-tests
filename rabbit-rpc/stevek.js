//mirthAmqp.publish([publishTopicName], message, {
//    correlationId: correlationId
//}).catch(function (err) {
//    logger.error(err);
//    mirthAmqp.revokeData(correlationId);
//    throw err;
//});


//var amqplib = require('amqplib');
//var Promise = require('bluebird');
//var _ = require('lodash');

var rabbit_rpc = require('./rabbit_rpc');

var promises = [];
promises.push(rabbit_rpc.rpc('fib', 20));
promises.push(rabbit_rpc.rpc('fib', 1));
promises.push(rabbit_rpc.rpc('fib', 5));
promises.push(rabbit_rpc.rpc('fib', 30));
promises.push(rabbit_rpc.rpc('fib', 15));
Promise.all(promises).then(function(results) {
    console.log('results', results);
});
