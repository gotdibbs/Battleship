function getFast(req, res) {
	res.render('fast', { 
		user: req.user, 
		title: 'Battleship: Fast Battle', 
		id: 'fast' 
	});
}

exports.getFast = getFast;
