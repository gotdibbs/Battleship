var path = require('path'),
	child = require('child_process'),
	baseDir = path.dirname(process.argv[1]);

function getGames(req, res) {
	var player1 = req.params.player1,
		player2 = req.params.player2,
		numberOfGames = req.params.gameCount,
		proc = child.fork(__dirname + '/gamePlayer.js'),
		isCompleted = false;
	
	proc.on('message', function (m) {
		if (m.type === "log") {
			console.log(m.message);
		}
		else {
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(JSON.stringify(m.message));
			res.end();
			proc.kill();
			isCompleted = true;
		}
	});
	
	proc.on('error', function (e) {
		res.writeHead(500, { 'Content-Type': 'application/json' });
		res.write(JSON.stringify(e));
		res.end();
		try { proc.kill(); } catch(e) { }
		isCompleted = true;
	});
	
	proc.on('disconnect', function (e) {
		if (!isCompleted) {
			res.writeHead(500, { 'Content-Type': 'application/json' });
			res.write('unexpected disconnect');
			res.end();
		}
	});
	
	proc.send({ 
			player1: player1, 
			player2: player2, 
			numberOfGames: numberOfGames, 
			baseDir: baseDir 
		}, 
		null, 
		{ env: process.env.ENV_VARIABLE});
}

exports.getGames = getGames;