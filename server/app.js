/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var async = require('async');
var express = require('express');
var mongoose = require('mongoose');
var _ = require('lodash');
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
        limit: 1000
      };

      request.get('http://www.tripomatic.com/locations-service/best-pois-in-area')
        .query(params).end(function(err, data) {
          res.json({
            loc: loc,
            pois: data.body
          });
        });
    });
});

var SabreAPI = require('sabre-dev-studio');
var sabre = new SabreAPI({
  client_id: 'V1:i6ece78kp1s7ly4u:DEVCENTER:EXT',
  client_secret: '1dhBKy9A',
  uri: 'https://api.test.sabre.com'
});

app.get('/sabre_cats', function(req, res) {
  sabre.get('/v1/shop/themes', {}, function(err, data) {
    data = JSON.parse(data);
    var ret = [];
    _.forEach(data.Themes, function(theme) {
      ret.push(theme.Theme);
    });
    res.json({
      themes: ret
    });
  });
});

app.get('/sabre/:from/:theme', function(req, res) {
  sabre.get('/v1/shop/flights/fares', {
    origin: req.params.from.toUpperCase(),
    theme: req.params.theme.toUpperCase(),
    departuredate: req.query.departureDate,
    returndate: req.query.returnDate
  }, function(err, data) {
    var locs = JSON.parse(data).FareInfo;
    async.map(locs, function(loc, done) {
      request('https://airport.api.aero/airport/match/' + loc.DestinationLocation)
        .query({
          user_key: '689b57a34d4f33f2e9144b34e608c07a'
        })
        .set('Accept', 'application/json')
        .end(function(err, data) {
          loc.dest = data.body.airports[0].city;
          delete loc.Links;
          done(err, loc);
        });
    }, function(err, ret) {
      res.json({
        dests: ret
      });
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
