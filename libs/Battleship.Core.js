var Battleship = (function () {

    function Placement(begin, end) {
        this.begin = begin; // instance of 'point'
        this.end = end; // instance of 'point'

        this.getLength = function getLength() {
            var p0, p1;

            p0 = Math.abs(this.begin.x - this.end.x);
            p0 *= p0;
            p1 = Math.abs(this.end.y - this.begin.y);
            p1 *= p1;

            return Math.sqrt(p0 + p1) + 1;
        };

        this.toString = function toString() {
            return this.begin.toString() + " => " + this.end.toString();
        };
    };

    function Point(x, y) {
        this.x = x;
        this.y = y;
        this.toString = function toString() {
            return "[" + this.x + ", " + this.y + "]";
        };
    };

    return {
        Placement: Placement,
        Point: Point
    };

})();

