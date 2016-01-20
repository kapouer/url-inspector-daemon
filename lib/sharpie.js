var sharp = require('sharp');
var express = require('express');
var stream = require('stream');
var util = require('util');
var Request = require('request');
var MediaTyper = require('media-typer');
var Rsvg;
try {
	Rsvg = require('librsvg').Rsvg;
} catch(e) {
	debug("will not process svg files");
}

module.exports = function(defaults) {
	defaults = Object.assign({
		rs: "w:2048,h:2048,max"
	}, defaults);

	return function(req, res, next) {
		var url = req.query.url;
		var params = Object.assign({}, defaults, req.query);
		var resize = parseParams(params.rs);

		var pipeline = sharp()
		.withoutEnlargement()
		.resize(parseInt(resize.w), parseInt(resize.h));
		if (resize.max) pipeline.max();
		if (resize.min) pipeline.min();

		pipeline = pipeline.background({r: 1, g: 1, b: 1, a: 1}).embed().jpeg().pipe(res);

		var request = Request(url)
		.on('response', function(response) {
			var contentType = response.headers['content-type'];
			var typeObj = MediaTyper.parse(contentType);
			if (typeObj.type != "image") {
				request.abort();
				return res.status(400).send(`Unexpected Content-Type ${contentType}`);
			}
			if (typeObj.subtype == "svg") {
				if (!Rsvg) return res.status(400).send("SVG files not supported");
				var svg = new Rsvg();
				svg.on('finish', function() {
					var img = svg.render({
						width: resize.w,
						height: resize.h,
						format: 'png'
					});
					pipeline.end(img.data);
				});
				request.pipe(svg);
			} else {
				request.pipe(pipeline);
			}
		})
		.on('error', function(err) {
			res.status(500).send(`Requested file error ${err.toString()}`);
		});
	};
};

function parseParams(str) {
	var obj = {};
	str.split(',').forEach(function(str) {
		var couple = str.trim().split(':');
		obj[couple[0]] = couple.length == 2 ? couple[1] : true;
	});
	return obj;
}

