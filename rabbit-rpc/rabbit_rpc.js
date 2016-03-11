var amqplib = require('amqplib');
var nodeUuid = require('node-uuid');
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var logger = require('log4js').getLogger(module.filename);

var EXCHANGE_NAME = 'stevek';
var ee = new EventEmitter();
var rabbit;
var RPC_TIMEOUT = 10 * 1000; // 10sec

module.exports = {
    rpc: rpc
};

function responseConsumer(message) {
    var obj;
    try {
        obj = JSON.parse(message.content.toString());
    } catch (err) {
        obj = err;
    }
    ee.emit(message.properties.correlationId, obj);
}

function initRabbit() {
    logger.debug('establishing rabbit connection, channel, exchange, and responseQueue');
    var connection = amqplib.connect('amqp://localhost');
    var channel = connection.then(function (connection) {
        return connection.createChannel();
    });
    var exchange = channel.then(function (channel) {
        return channel.assertExchange(EXCHANGE_NAME, 'topic', {});
    });
    var queue = channel.then(function (channel) {
        return channel.assertQueue('', {exclusive: true}).then(function (queue) {
            channel.consume(queue.queue, responseConsumer);
            return queue;
        })
    });
    return Promise.all([connection, channel, exchange, queue]);
}

function getRabbit() {
    if (!rabbit) {
        rabbit = initRabbit();
    }
    return rabbit;
}

function publishToRabbit(correlationId, name, args) {
    return getRabbit().spread(function(connection, channel, exchange, responseQueue) {
        return channel.publish(exchange.exchange, name, new Buffer(JSON.stringify(args)), {
            correlationId: correlationId,
            replyTo: responseQueue.queue
        });
    });
}

/**
 * Perform an RPC call to a remote function.
 * @param name {String} Required. The routing key.
 * @returns A promise that is resolved with the results.
 */
function rpc(name /*, ...*/) {
    var args = Array.prototype.slice.call(arguments, 1);
    return new Promise(function (resolve, reject) {
        var startTime = new Date();
        var correlationId = nodeUuid();
        var handler = function (results) {
            clearTimeout(timeout);
            logger.debug('[' + correlationId + ']', results, '[' + ((new Date()) - startTime) + 'ms]');
            resolve(results);
        };
        var timeoutHandler = function () {
            ee.removeListener(correlationId, handler);
            reject(new Error('RPC request ' + name + '(' + args.join(', ') + ') timed out after ' + RPC_TIMEOUT + 'ms'));
        };
        var timeout = setTimeout(timeoutHandler, RPC_TIMEOUT);
        ee.once(correlationId, handler);
        logger.debug('[' + correlationId + ']', name + '(' + args.join(', ')  + ')');
        publishToRabbit(correlationId, name, args).catch(reject);
    });
}
