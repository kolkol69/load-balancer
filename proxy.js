const express = require('express');
const request = require('request');

const servers = ['http://localhost:3000', 'http://localhost:3001'];
let cur = 0;

const profilerMiddleware = (req, res, next) => {
    const start = Date.now();
    // The 'finish' event comes from core Node.js, it means Node is done handing
    // off the response headers and body to the underlying OS.
    
    res.on('finish', () => {
        console.log('Completed', req.method, req.url, Date.now() - start);
    });
    next();
};

const handler = (req, res) => {
    // Pipe the vanilla node HTTP request (a readable stream) into `request`
    // to the next server URL. Then, since `res` implements the writable stream
    // interface, you can just `pipe()` into `res`.

    req.pipe(request({
        url: servers[cur] + req.url
    })).pipe(res);
    cur = (cur + 1) % servers.length;
};
const server = express().use(profilerMiddleware).get('*', handler).post('*', handler);

server.listen(8080);