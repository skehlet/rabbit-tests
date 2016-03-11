#!/usr/bin/env node

var rabbit_rpc = require('./rabbit_rpc');

var promises = [];
promises.push(rabbit_rpc.rpc('fib', 20));
promises.push(rabbit_rpc.rpc('fib', 1));
promises.push(rabbit_rpc.rpc('fib', 5));
promises.push(rabbit_rpc.rpc('fib', 30));
promises.push(rabbit_rpc.rpc('fib', 15));
Promise.all(promises).then(function(results) {
    console.log('results', results);
    process.exit(0);
}).catch(function(err) {
    console.log('Caught error:', err);
});
