/// <reference path="AI.Core.js" />
/// <reference path="Battleship.Core.js" />

function Dumbot() { }
AI.subClass(Dumbot);

Dumbot.prototype.setupBoard = function setupBoard(ships) {
    var board = [
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
        ],
        placements = [],
        placement,
        placed = false,
        valid = false,
        x = 0, y = 0,
        i = 0, j = 0;

    // ships = 2, 3, 3, 4, 5

    for (i = 0; i < ships.length; i++) {
        x = 0,
        y = 0,
        placed = false,
        valid = false;

        do {

            if (x === 9 && y === 9) {
                throw new Error("Failed to place all pieces!");
            }

            if (x === 9) {
                x = 0;
                y++;
            }

            if (x + ships[i] >= 9) {
                x = 0;
                y++;
            }

            for (j = 0; j < ships[i]; j++) {
                valid = !board[y][x + j];

                if (!valid) break;
            }

            if (valid) {
                for (j = 0; j < ships[i]; j++) {
                    board[y][x + j] = 1;
                }

                placed = true;
                break;
            }

            x++;
        } while (!placed);

        placements.push(new Battleship.Placement(new Battleship.Point(x, y), new Battleship.Point(x + ships[i] - 1, y)));
    }

    return placements;
};

Dumbot.prototype.fire = function fire(myMoves, theirMoves) {
    if (!myMoves || !myMoves.length) {
        return new Battleship.Point(0, 0);
    }

    var myLastMove = myMoves[myMoves.length - 1],
        myNewMove = new Battleship.Point(0, 0);

    if (myLastMove.x !== 9 && myLastMove.y !== 9) {
        myNewMove.x = myLastMove.x + 1;
        myNewMove.y = myLastMove.y;
    }
    else if (myLastMove.x === 9 && myLastMove.y !== 9) {
        myNewMove.x = 0;
        myNewMove.y = myLastMove.y + 1;
    }
    else if (myLastMove.y === 9 && myLastMove.x !== 9) {
        myNewMove.x = myLastMove.x + 1;
        myNewMove.y = myLastMove.y;
    }

    return myNewMove;
};