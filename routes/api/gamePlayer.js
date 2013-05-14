var path = require('path'),
	fs = require('fs'),
	util = require('util'),
	vm = require('vm'),
	baseDir,
	libsDir,
	aiDir,
	isLoaded = false,
	bsCore,
	aiCore,
	ResultType = {
		Tie: 0,
		Player1: 1,
		Player2: 2
	};
	
function _log(message) {
	process.send({ type: 'log', message: message });
}

function _validatePlacements(sandbox) {
	var places = sandbox.global.board,
		place, 
		size, 
		dir, 
		xChange = 0,
		yChange = 0,
		placeCounter = 0,
		j = 0,
		x, y,
		board = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];
		
	if (!places || !places.length) {
		throw new Error("Placements are undefined or empty.");
	}
	else if (places.length !== 5) {
		throw new Error("Incorrect number of placements encountered. Should've seen 5, instead saw: " + places.length);
	}
	
	placeCounter = places.length;
	while (placeCounter-- > 0) {
		place = places[placeCounter];
		
		if (!place || !place.begin || !place.end) {
			throw new Error("Placement #" + placeCounter + " is undefined or one of it's points are.");
		}
		
		if (place.begin.x < 0 || place.begin.x > 9 ||
			place.begin.y < 0 || place.begin.y > 9 ||
			place.end.x < 0 || place.end.x > 9 ||
			place.end.y < 0 || place.end.y > 9) {
			throw new Error("Placement #" + placeCounter + " is off the grid. P: " + place.toString());
		}
		
		if (place.begin.x !== place.end.x &&
			place.begin.y === place.end.y) {
			dir = 'x';
			size = Math.abs(place.end.x - place.begin.x) + 1;
		}
		else if (place.begin.x === place.end.x &&
			place.begin.y !== place.end.y) {
			dir = 'y';
			size = Math.abs(place.end.y - place.begin.y) + 1;
		}
		else {
			throw new Error("Placement #" + placeCounter + " appears diagonal. P: " + place.toString());
		}
		
		if (size < 0 || size > 5) {
			throw new Error("Placement #" + placeCounter + " is outside the valid ship length. Size: " + size);
		}
		
		xChange = dir === 'x' ? 1 : 0;
		yChange = dir === 'y' ? 1 : 0;
		while (size-- > 0) {
			x = place.begin.x + (size * xChange);
			y = place.begin.y + (size * yChange);
			if (!board[y][x]) {
				board[y][x] = 1;
			}
			else {
				throw new Error("Placement #" + placeCounter + " appears to overlap another placement. P: " + place.toString() + " " + JSON.stringify(places));
			}
		}
	}
}
	
function _setupBot(sandbox, player) {
	var playerVM, playerSetupVM;
	if (!isLoaded) {
		bsCore = vm.createScript(fs.readFileSync(path.join(libsDir, 'Battleship.Core.js')));
		aiCore = vm.createScript(fs.readFileSync(path.join(libsDir, 'AI.Core.js')));
	}
	bsCore.runInContext(sandbox);
	aiCore.runInContext(sandbox);
	
	playerVM = vm.createScript(fs.readFileSync(path.join(aiDir, player + ".js")));
	playerVM.runInContext(sandbox);
	playerSetupVM = vm.createScript("global.bot = new " + player + '();');
	playerSetupVM.runInContext(sandbox);
}

function _setupGame(sandbox, player) {
	var script = vm.createScript("global.board = global.bot.setupBoard([2,3,3,4,5]);");

	sandbox.global.moves = [];
	sandbox.global.board = null;

	script.runInContext(sandbox);
}

function _fire(player, pSandbox, oSandbox) {
	var move, 
		placement,
		isCoordMatch = false,
		counter = pSandbox.global.board.length,
		script;
	
	script = vm.createScript('global.bot.fire(global.moves, ' + JSON.stringify(oSandbox.global.moves) + ');');
	move = script.runInContext(pSandbox);
	pSandbox.global.moves.push(move);

	while (counter-- > 0) {
		placement = oSandbox.global.board[counter];
		
		if (!placement.hits) {
			placement.hits = 0;
			placement.sunk = false;
		}
		
		move.isHit = false;
		move.isSunk = false;
		
		isCoordMatch = (placement.begin.x <= move.x && 
			placement.end.x >= move.x &&
			placement.begin.y <= move.y &&
			placement.end.y >= move.y) ||
			(placement.begin.x >= move.x && 
			placement.end.x <= move.x &&
			placement.begin.y >= move.y &&
			placement.end.y <= move.y);
	
		if (!placement.sunk && isCoordMatch) {
			placement.hits++;
			move.isHit = true;
			
			if (placement.hits === placement.getLength()) {
				placement.sunk = true;
				move.isSunk = true;
				move.shipSize = placement.hits;
			}
			
			return placement.sunk;
		}
		else if (placement.sunk && isCoordMatch) {
			return false;
		}
	}
	
	return false;
}

function _runGame(player1, sandbox1, player2, sandbox2) {
	var player1_sunkCount = 0,
		player2_sunkCount = 0,
		roundCount = 100,
		result,
		isDone = false,
		p1Error = false,
		p2Error = false;
		
	sandbox1.global.lastError = null;
	sandbox2.global.lastError = null;
	
	try {
		_setupGame(sandbox1, player1);
		_validatePlacements(sandbox1);
	}
	catch (er) {
		_log(er.message);
		sandbox1.global.lastError = er.message + " " + er.stack;
		p1Error = true;
	}
	try {
		_setupGame(sandbox2, player2);
		_validatePlacements(sandbox2);
	}
	catch (er) {
		_log(er.message);
		sandbox2.global.lastError = er.message + " " + er.stack;
		p2Error = true;
	}
	if (p1Error && p2Error) {
		return ResultType.Tie;
	}
	else if (p1Error || p2Error) {
		return p1Error ? ResultType.Player2 : ResultType.Player1;
	}
	
	do {
		try {
			result = _fire(player1, sandbox1, sandbox2);
		}
		catch (er) {
			_log(er.message);
			sandbox1.global.lastError = er.message + " " + er.stack;
			return ResultType.Player2;
		}
		
		if (result) {
			if (++player1_sunkCount === 5) {
				isDone = true;
			}
		}
		result = null; // reset result for player 2
		
		try {
			// if player 1 hasn't already finished
			if (!isDone) {
				result = _fire(player2, sandbox2, sandbox1);
			}
		}
		catch (er) {
			_log(er.message);
			sandbox2.global.lastError = er.message + " " + er.stack;
			return ResultType.Player1;
		}
		
		if (result) {
			if (++player2_sunkCount === 5) {
				isDone = true;
			}
		}
		
	} while(--roundCount > 0 && !isDone);

	if (player1_sunkCount > player2_sunkCount) {
		return ResultType.Player1;
	}
	else if (player1_sunkCount < player2_sunkCount) {
		return ResultType.Player2;
	}
	else {
		return ResultType.Tie;
	}
}

function getGames(params) {
	var player1 = params.player1,
		player2 = params.player2,
		numberOfGames = params.numberOfGames,
		sandbox1 = vm.createContext({
			global: {}
		}),
		sandbox2 = vm.createContext({
			global: {}
		}),
		results = [], result;

	try {
		_setupBot(sandbox1, player1);
	}
	catch (ex) {
		_log(ex.message);
		return [{ winner: 2, player1_moves: [], player2_moves: [], player1LastError: ex.message + " " + er.stack }];
	}
	try {
		_setupBot(sandbox2, player2);
	}
	catch (ex) {
		_log(ex.message);
		return [{ winner: 1, player1_moves: [], player2_moves: [], player2LastError: ex.message + " " + er.stack }];
	}
	
	while (numberOfGames-- > 0) { 
		result = { 
			winner: _runGame(player1, sandbox1, player2, sandbox2),
			player1_moves: sandbox1.global.moves,
			player2_moves: sandbox2.global.moves
		};
		
		if (sandbox1.global.lastError) {
			result.player1LastError = sandbox1.global.lastError;
		}
		else if (sandbox2.global.lastError) {
			result.player2LastError = sandbox2.global.lastError;
		}
	
		results.push(result);
	}

	return results;
}

process.on('message', function (params) {
	var results;

	baseDir = params.baseDir;
	libsDir = path.join(baseDir, 'libs');
	aiDir = path.join(baseDir, 'ai_scripts');
	
	results = getGames(params);

	process.send({ type: 'results', message: results });
});