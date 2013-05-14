var path = require('path'),
    fs = require('fs'),
	baseDir = path.dirname(process.argv[1]),
	aiDir = path.join(baseDir, 'ai_scripts');

function getAIs(req, res) {
	var i = 0,
		len,
		results = [];

	fs.readdir(aiDir, function (err, files) {
		if (err) res.writeHead(500, err.message);
		else if (!files.length) res.writeHead(404);
		else {
			for (len = files.length; i < len; i++) {
				results.push(files[i].replace(/\.js$/, ''));
			}
		
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(JSON.stringify(results));
		}
		res.end();
	});
};

exports.getAIs = getAIs;