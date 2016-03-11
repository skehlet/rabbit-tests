#!/usr/bin/env node

var Promise = require('bluebird');
var rabbit_rpc = require('./rabbit_rpc');

var promises = [];
promises.push(rabbit_rpc.rpc('fib', 20));
promises.push(rabbit_rpc.rpc('fib', 1));
promises.push(rabbit_rpc.rpc('fib', 5));
promises.push(rabbit_rpc.rpc('fib', 30));
promises.push(rabbit_rpc.rpc('fib', 15));

Promise.all(promises.map(function(promise) {
    return promise.reflect();
})).each(function(inspection) {
    if (inspection.isFulfilled()) {
        console.log('results:', inspection.value());
    } else {
        console.log('error:', inspection.reason());
    }
}).finally(function() {
    process.exit(0);
});
