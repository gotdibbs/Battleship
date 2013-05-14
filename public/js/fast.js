/// <reference path="/js/libraries/jquery.min.js" />

var Battleship = window.Battleship || {};

Battleship.FastDemo = (function () {

    var aiListItemTmpl = '<option></option>',
		startTime = null,
		endTime = null;

    function _init() {
        $('#gameCount').val(10);

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

        $('#startGamesBtn').click(_startGames);
    }

    function _startGames() {
        var numberOfGames = parseInt($('#gameCount').val()),
            player1 = $("#player1").val(),
            player2 = $("#player2").val();

        if (!isNaN(numberOfGames) && player1 !== '' && player2 !== '') {
			$(".loader").show();
            $.get('/api/games/' + player1 + '/' + player2 + '/' + numberOfGames)
				.done(_displayResults)
				.fail(_displayError);
			startTime = new Date();
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
	
    function _displayResults(results) {
        var i,
            player1 = $('#player1').val(),
            player2 = $('#player2').val(),
			$player1Wins = $("#player1Wins span"),
			$player2Wins = $("#player2Wins span"),
			$ties = $("#ties span"),
            player1wins = 0,
            player2wins = 0,
			ties = 0,
			total = 0;
			
		endTime = new Date();
		$("#time span").text([((endTime - startTime)/1000).toFixed(2), "s"].join(""));

        for (i = 0; i < results.length; i++) {
            if (results[i].winner === 1) {
                player1wins++;
            } 
			else if (results[i].winner === 2) {
                player2wins++;
            }
			else {
				ties++;
			}
			total++;
			
			if (results[i].player1LastError && typeof console !== 'undefined') {
				console.log("Player 1: " + results[i].player1LastError);
			}
			if (results[i].player2LastError && typeof console !== 'undefined') {
				console.log("Player 2: " + results[i].player2LastError);
			}
        }

        $player1Wins.text([(player1wins/total * 100).toFixed(2), "%"].join(""))
			.removeClass("badge-success badge-important");
        $player2Wins.text([(player2wins/total * 100).toFixed(2), "%"].join(""))
			.removeClass("badge-success badge-important");
		$ties.text([(ties/total * 100).toFixed(2), "%"].join(""));
		
		if (player1wins > player2wins) {
			$player1Wins.addClass("badge-success");
			$player2Wins.addClass("badge-important");
		}
		else if (player1wins < player2wins) {
			$player1Wins.addClass("badge-important");
			$player2Wins.addClass("badge-success");
		}
		
		$(".loader").fadeOut();
    }

    $(document).ready(_init);

})();