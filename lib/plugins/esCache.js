var elasticsearch = require('elasticsearch');

var index = "prerender";
var type = "cache";

module.exports = {
    init: function () {
        console.log("init ################")
        this.client = new elasticsearch.Client(
            {
                host: 'es:9200',
                log: 'info'
            });
        var _this = this;
        this.client.indices.exists(
            {
                index: index,
            }, function (err, resp, respcode) {
                if (!err && !resp) {
                    _this.client.indices.create(
                        {
                            index: index,
                            body: {
                                "mappings": {
                                    "cache": {
                                        "properties": {
                                            "url": {
                                                "type": "string",
                                                "store": "no",
                                                "index": "not_analyzed"
                                            },
                                            "html": {
                                                "type": "string",
                                                "store": "no",
                                                "index": "no"
                                            }
                                        }
                                    }
                                },
                                "settings": {
                                    "index": {
                                        "number_of_shards": 1,
                                        "number_of_replicas": 0
                                    }
                                }
                            }
                        }, function (err, resp, respcode) {
                            console.log(err, resp, respcode);
                        });
                }
            }
        );

    },

    beforePhantomRequest: function (req, res, next) {
        if (req.method !== 'GET') {
            return next();
        }

        this.client.get(
            {
                index: index,
                type: type,
                id: req.prerender.url
            }, function (error, response) {
                if (!error && response) {
                    console.log('cache hit');
                    return res.send(200, response._source.html);
                }
                next();
            });

    },

    afterPhantomRequest: function (req, res, next) {
        if (req.prerender.statusCode !== 200) {
            return next();
        }
        this.client.index({
                              index: index,
                              type: type,
                              id: req.prerender.url,
                              body: {
                                  html: req.prerender.documentHTML,
                                  url: req.prerender.url
                              }
                          },
                          function (error, response) {
                              if (error) {
                                  console.error(error);
                              }
                              next();

                          });

    }
};

