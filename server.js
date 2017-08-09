#!/usr/bin/env node
var prerender = require('./lib');

var server = prerender({
    workers: 1,
    iterations: 40
});


server.use(prerender.sendPrerenderHeader());
// server.use(prerender.basicAuth());
// server.use(prerender.whitelist());
server.use(prerender.blacklist());
// server.use(prerender.logger());
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());
// server.use(prerender.inMemoryHtmlCache());
// server.use(prerender.s3HtmlCache());
// server.use(prerender.redisCache())
server.use(prerender.esCache())
server.start();
