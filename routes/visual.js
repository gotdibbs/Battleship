function getVisual(req, res) {
	res.render('visual', { 
		user: req.user, 
		title: 'Battleship: Visual Battle', 
		id: 'visual' 
	});
}

exports.getVisual = getVisual