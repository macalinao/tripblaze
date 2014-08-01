/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if (config.seedDB) {
  require('./config/seed');
}

// Setup server
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);

var request = require('superagent');

app.get('/pois/:loc', function(req, res) {
  request.get('https://maps.googleapis.com/maps/api/geocode/json')
    .query({
      key: config.googleKey,
      address: req.params.loc
    }).end(function(err, gdata) {
      var loc = gdata.body.results[0].geometry.location;
      var params = {
        southWestLatLng: (loc.lat - 0.25) + ',' + (loc.lng - 0.25),
        northEastLatLng: (loc.lat + 0.25) + ',' + (loc.lng + 0.25),
        limit: 150
      };

      request.get('http://www.tripomatic.com/locations-service/best-pois-in-area')
        .query(params).end(function(err, data) {
          res.json(data.body);
        });
    });
});

app.route('/*')
  .get(function(req, res) {
    res.sendfile(app.get('appPath') + '/index.html');
  });

// Start server
server.listen(config.port, config.ip, function() {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
