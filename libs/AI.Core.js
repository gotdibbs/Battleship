/// <reference path="Battleship.Core.js" />

function AI () { };

AI.prototype.setupBoard = function setupBoard(ships) {
    return []; 
}

AI.prototype.fire = function fire(myMoves, theirMoves) {
    return new Battleship.Point(0, 0); 
}

AI.subClass = function subClass(obj) {
    obj.prototype = new AI();
};