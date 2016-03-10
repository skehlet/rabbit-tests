#!/usr/bin/env node

var amqp = require('amqplib');



amqp.connect('amqp://localhost')
	.then(function(conn) {
        conn.createChannel()
            .then(function(ch) {
                var q = 'hello';
                ch.assertQueue(q, {durable: false});
                ch.sendToQueue(q, new Buffer('Hello World!'));
                console.log(" [x] Sent 'Hello World!'");
            })
            .then(function() {
                // conn.close();
                setTimeout(function() { conn.close(); process.exit(0) }, 500);
            })

	}).catch(function(err) {
        console.log(err);
    });
