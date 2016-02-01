#!/usr/bin/node

var express = require('express');
var app = express();
var inspector = require('url-inspector');
var sharpie = require('sharpie')({
	rs: "w:320,h:240,max",
	bg: 'white',
	crop: 'center',
	flatten: true
});

app.get('/images', sharpie);

app.get('/inspector', function(req, res, next) {
	inspector(req.query.url, function(err, data) {
		if (err) return next(err);
		if (data.thumbnail) {
			if (data.thumbnail.startsWith('data:') == false) {
				data.thumbnail = '/images?url=' + encodeURIComponent(data.thumbnail);
			}
		} else if (data.type == "image") {
			data.thumbnail = '/images?url=' + encodeURIComponent(data.url);
		}
		res.send(data);
	});
});
app.get('/domt.js', (req, res) => res.sendFile(require.resolve('domt')));
app.get('/fetch.js', (req, res) => res.sendFile(require.resolve('whatwg-fetch')));
app.get('*', express.static(__dirname + '/../public'));

var server = app.listen(3001, function() {
	console.log(`Please open
http://localhost:${server.address().port}/
`);
});
