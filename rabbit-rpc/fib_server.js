#!/usr/bin/env node

var amqp = require('amqplib');

amqp.connect('amqp://localhost')
    .then(function(conn) {
        conn.createChannel()
            .then(function(ch) {
                var ex = 'stevek';
                ch.assertExchange(ex, 'topic');
                ch.assertQueue('fib_queue').then(function (q) {
                    console.log('q:', q);
                    ch.bindQueue(q.queue, ex, 'fib');
                    ch.prefetch(1);
                    console.log(' [x] Awaiting RPC requests');

                    ch.consume(q.queue, function handler(request) {
                        var args = JSON.parse(request.content.toString());
                        var n = parseInt(args[0]);

                        console.log(" [.] fib(%d)", n);

                        var r = fibonacci(n);

                        ch.sendToQueue(
                            request.properties.replyTo,
                            new Buffer(JSON.stringify(r)),
                            {
                                correlationId: request.properties.correlationId
                            }
                        );

                        ch.ack(request);
                    });

                });

            });
    }).catch(function (err) {
        console.log('Caught error:', err);
    });

function fibonacci(n) {
    if (n == 0 || n == 1)
        return n;
    else
        return fibonacci(n - 1) + fibonacci(n - 2);
}
