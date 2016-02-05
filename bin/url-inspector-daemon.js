#!/usr/bin/node

var express = require('express');
var app = express();
var crypto = require('crypto');
var inspector = require('url-inspector');
var fs = require('fs');
var mime = require('mime');
var dataUri = require('strong-data-uri');
var sharpie = require('sharpie')({
	rs: "w:320,h:240,max",
	bg: 'white',
	crop: 'center',
	flatten: true
});

function hash(buf) {
	return crypto.createHash('sha1').update(buf).digest("base64").replace(/[+=?]/g, '');
}

var rootDir = __dirname + '/..';

app.use('/cache', express.static(rootDir + '/cache'));

app.get('/images', sharpie);

app.get('/inspector', function(req, res, next) {
	inspector(req.query.url, function(err, data) {
		if (err) return next(err);
		var thumb = data.thumbnail;
		if (thumb) {
			if (thumb.startsWith('data:') == false) {
				data.thumbnail = '/images?url=' + encodeURIComponent(thumb);
			} else {
				var buf = dataUri.decode(thumb);
				var filePath = '/cache/' + hash(buf) + '.' + mime.extension(buf.mimetype);
				fs.writeFile(rootDir + filePath, buf, function(err) {
					if (err) console.error(err);
					else data.thumbnail = '/images?url=' + encodeURIComponent(filePath);
					res.send(data);
				});
				return;
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
