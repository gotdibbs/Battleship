/// <reference path="/js/libraries/jquery.min.js" />

var Battleship = window.Battleship || {};

Battleship.VisualDemo = (function () {

    var aiListItemTmpl = '<option></option>',
		_games,
		_gameIndex;

    function _init() {
        $.get('/api/ais', _processAIs);
    }

    function _processAIs(data) {
        var i,
            $player1 = $('#player1'),
			$player2 = $('#player2');

        for (i = 0; i < data.length; i++) {
            $(aiListItemTmpl)
				.text(data[i])
				.attr('value', data[i])
				.appendTo($player1)
				.clone()
				.appendTo($player2);
        }

		$player1.chosen();
		$player2.chosen();

        $('#startGamesBtn').click(_startGame);
		$('#replay').click(_replayGame);
		$('#previous').click(_previousGame);
		$('#next').click(_nextGame);
    }
	
	function _previousGame() {
		if (_gameIndex === 0) {
			return;
		}
		
		_gameIndex--;
		
		if (_gameIndex === 0) {
			$('#previous').addClass('disabled');
		}
		else {
			$('#next').removeClass('disabled');
			$('#previous').removeClass('disabled');
		}
		
		_replayGame();
	}
	
	function _nextGame() {
		if (_gameIndex === 2) {
			return;
		}
		
		_gameIndex++;
		
		if (_gameIndex === 2) {
			$('#next').addClass('disabled');
		}
		else {
			$('#next').removeClass('disabled');
			$('#previous').removeClass('disabled');
		}
		
		_replayGame();
	}
	
	function _replayGame() {
		if (!_games) {
			return;
		}
		$("#player1board,#player2board").removeClass("btn-success");
		$("#player1board span,#player2board span").removeClass("badge-important badge-info");
		
		_games[_gameIndex].currentPlayer = 1;
		_games[_gameIndex].player1_moveCount = 0;
		_games[_gameIndex].player2_moveCount = 0;
		_games[_gameIndex].delay = parseInt($('#delay').val(), 10);
		
		_runGame(_games[_gameIndex]);
	}

    function _startGame() {
        var player1 = $("#player1").val(),
            player2 = $("#player2").val();

        if (player1 !== '' && player2 !== '') {
			$(".loader").show();
			$("#player1board,#player2board").removeClass("btn-success");
			$("#player1board span,#player2board span").removeClass("badge-important badge-info");
            $.get('/api/games/' + player1 + '/' + player2 + '/3')
				.done(_saveResults)
				.fail(_displayError);
        }
		else {
			alert('Invalid selection. Please check your Player selections before continuing.');
		}
    }
	
	function _displayError(e) {
		var status = e.status,
			statusText = e.statusText,
			detail = e.responseText;
			
		alert("An error was encountered while processing the game request.\nStatus: " + e.status + ": " + e.statusText + "\n" + detail);
		$(".loader").fadeOut();
	}
	
	function _setWins() {
		var i = 0,
			p1Wins = 0,
			p2Wins = 0;
			
		for (; i <= _gameIndex; i++) {
			if (_games[i].winner === 1) {
				p1Wins++;
			}
			else if (_games[i].winner === 2) {
				p2Wins++;
			}
		}
		
		$('#player1Wins').text(p1Wins);
		$('#player2Wins').text(p2Wins);
	}
	
	function _issueMove(gameState) {
		var selector = gameState.currentPlayer === 1 ? "#player1board span#" : "#player2board span#",
			move = gameState.currentPlayer == 1 ? 
				gameState.player1_moves[gameState.player1_moveCount] : 
				gameState.player2_moves[gameState.player2_moveCount];
		
		$(selector + "x_" + move.x + "_y_" + move.y).addClass(move.isHit ? "badge-important" : "badge-info");
		
		setTimeout(function () {
			if (gameState.currentPlayer === 1) {
				gameState.currentPlayer = 2;
				gameState.player1_moveCount++;
			}
			else {
				gameState.currentPlayer = 1;
				gameState.player2_moveCount++;
			}
			
			_runGame(gameState);
		}, gameState.delay);
	}

	function _runGame(gameState) {
		var p1total = gameState.player1_moves.length,
			p2total = gameState.player2_moves.length;
			
		$('#gameNumber').text(_gameIndex + 1);
			
		if (gameState.player1_moveCount >= p1total && gameState.player2_moveCount >= p2total) {
			if (gameState.winner === 1) {
				$("#player1board").addClass("btn-success");
			}
			else if (gameState.winner === 2) {
				$("#player2board").addClass("btn-success");
			}
			
			_setWins();
			return;
		}
		
		_issueMove(gameState);
	}
	
    function _displayResults(game) {
        var player1 = $('#player1').val(),
            player2 = $('#player2').val(),
			winner = game.winner,
			p1moves = game.player1_moves,
			p2moves = game.player2_moves,
			delay = parseInt($('#delay').val(), 10);
			
		if (game.player1LastError && typeof console !== 'undefined') {
			console.log("Player 1: " + game.player1LastError);
		}
		if (game.player2LastError && typeof console !== 'undefined') {
			console.log("Player 2: " + game.player2LastError);
		}
			
		_runGame(new GameState(p1moves, p2moves, winner, delay));
		
		$(".loader").fadeOut();
    }
	
	function _saveResults(results) {
		_games = results;
		_gameIndex = 0;
		
		$('#player1Wins').text(0);
		$('#player2Wins').text(0);
		$('#previous').addClass('disabled');
		$('#replay').removeClass('disabled');
		$('#next').removeClass('disabled');
		
		_displayResults(_games[_gameIndex]);
	}
	
	function GameState(player1_moves, player2_moves, winner, delay) {
		this.player1_moves = player1_moves;
		this.player2_moves = player2_moves;
		this.winner = winner;
		this.currentPlayer = 1;
		this.player1_moveCount = 0;
		this.player2_moveCount = 0;
		this.delay = delay;
	}

    $(document).ready(_init);

})();