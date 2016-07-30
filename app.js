/*
 * Arvind Kumar
 * arvind.kumar@msn.com
 */

var express = require('express');
var app = express();
var request = require('request-promise');
var _ = require('lodash');

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/character/:name', function (req, res) {
    res.send('To be Implemented.');
});

app.get('/characters', function (req, res) {
    var base = 'http://swapi.co/api/people/';
    var urls = [base, base + '?page=2', base + '?page=3', base + '?page=4', base + '?page=5'];
    
    var all = urls.map(function (url) {
        return new Promise(function (resolve, reject) {
            request(url)
                .then(function (body) {
                    resolve(JSON.parse(body).results);
            });            
        });
    });

    Promise.all(all).then(function (response) {
        response = _.flatten(response);

        if('sort' in req.query) {
            res.send(_.sortBy(response, req.query.sort));
        } else {
            res.send(response);
        }
    })
});

app.get('/planetresidents', function (req, res) {
    function getData() {
        return new Promise(function(resolve, reject) {
            request('http://swapi.co/api/planets')
            .then(function (body) {
                var allPlanets = JSON.parse(body).results;
                _.each(allPlanets, function (planet) {
                    var planet = _.pick(planet, ['name', 'residents']);
                    var keyval = {};

                    var all = planet.residents.map(function (resident) {
                        return new Promise(function (resolve, reject) {
                            request(resident)
                            .then(function (body) {
                                resolve(JSON.parse(body).name);
                            });
                        })
                    });

                    Promise.all(all).then(function (residents) {
                        var response = {};
                        keyval[planet.name] = residents;
                        _.assign(response, keyval); 
                        resolve(response);
                    });
                });
            });
        });
    };

    getData().then(function (response) {
        res.send(response);
    });
})

var port = process.env.port || 3000;
app.listen(port, function () {
  console.log('app running at - http://localhost:' +port);
});