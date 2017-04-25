var cacheManager = require('cache-manager');

var redisStore = require('cache-manager-redis');

module.exports = {
    init: function () {
        this.cache = cacheManager.caching({
                                              store: redisStore,
                                              host: 'redis', // default value
                                              port: 6379, // default value
                                              auth_pass: 'test123',
                                              db: 2,
                                              ttl: 86400
                                          });
    },

    beforePhantomRequest: function (req, res, next) {
        if (req.method !== 'GET') {
            return next();
        }

        this.cache.get(req.prerender.url, function (err, result) {

            if (!err && result) {
                console.log('cache hit');
                return res.send(200, result);
            }

            next();
        });
    },

    afterPhantomRequest: function (req, res, next) {
        if (req.prerender.statusCode !== 200) {
            return next();
        }

        this.cache.set(req.prerender.url, req.prerender.documentHTML, function (err, result) {
            if (err) {
                console.error(err);
            }
            next();
        });

    }
};

