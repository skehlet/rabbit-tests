var amqplib = require('amqplib');
var nodeUuid = require('node-uuid');
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var logger = require('log4js').getLogger(module.filename);

var EXCHANGE_NAME = 'stevek';
var ee = new EventEmitter();
var rabbit;

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
    logger.debug('[' + message.properties.correlationId + '] ->', obj);
    ee.emit(message.properties.correlationId, obj);
}

function initRabbit() {
    logger.debug('establishing rabbit connection, channel, exchange, and responseQueue');
    return amqplib.connect('amqp://localhost').then(function (connection) {
        return connection.createChannel().then(function (channel) {
            return channel.assertExchange(EXCHANGE_NAME, 'topic', {}).then(function (exchange) {
                return channel.assertQueue('', {exclusive: true}).then(function (responseQueue) {
                    channel.consume(responseQueue.queue, responseConsumer);
                    return [connection, channel, exchange, responseQueue];
                });
            });
        });
    });
}

function getRabbit() {
    if (!rabbit) {
        rabbit = initRabbit();
    }
    return rabbit;
}

function publishToRabbit(correlationId, name, args) {
    logger.debug('[' + correlationId + ']', name + '(' + args.join(', ')  + ') ->');
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
        var correlationId = nodeUuid();
        ee.once(correlationId, resolve);
        publishToRabbit(correlationId, name, args).catch(reject);
    });
}
