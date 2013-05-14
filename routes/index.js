var upload = require('./upload.js'),
	fast = require('./fast.js'),
	visual = require('./visual.js'),
	api = require('./api/');

function getIndex(req, res){
	res.render('index', { user: req.user, title: 'Battleship', id: '/' });
}

// home page
exports.getIndex = getIndex;
// fast
exports.getFast = fast.getFast;
// visual
exports.getVisual = visual.getVisual;
// battleship API
exports.api = api;
// upload page
exports.getUpload = upload.getUpload;
exports.postUpload = upload.postUpload;

