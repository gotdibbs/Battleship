var path = require('path'),
    fs = require('fs'),
	baseDir = path.dirname(process.argv[1]),
	aiDir = path.join(baseDir, 'ai_scripts');

function postUpload(req, res) {
    var fileName = req.param('aiName') + ".js" || req.files.aiScript.name,
        filePath = path.join(aiDir, fileName),
		exists = fs.existsSync(filePath);
	
	if (exists) {
		fs.unlinkSync(filePath);
	}
	if (req.user && req.user.email) {
		console.log('User ' + req.user.email + ' uploaded a file.');
	}
		
    fs.rename(req.files.aiScript.path, filePath, function (err) {
        var message = err ? err.message : 'Script uploaded.';
		
		err ? res.render('upload', {
			user: req.user,
			title: 'Battleship: Upload',
			id: 'upload',
			message: err.message
		}) : res.redirect('/');
    });
}

function getUpload(req, res) {
    res.render('upload', { 
		user: req.user,
        title: 'Battleship: Upload',
		id: 'upload',
    }); 
}

exports.getUpload = getUpload;
exports.postUpload = postUpload;