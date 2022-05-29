var BIRD_SIZE = 15;
var SEPARATION_DISTANCE = 20;
var Flock = /** @class */ (function () {
    function Flock(n, neighbourhood_size) {
        this.n = n;
        this.neighbourhood_size = neighbourhood_size;
        this.birds = [];
        for (var i = 0; i < this.n; i++) {
            this.birds.push(new Bird(BIRD_SIZE, 100, 100));
        }
    }
    Flock.prototype.update = function () {
        for (var _i = 0, _a = this.birds; _i < _a.length; _i++) {
            var bird = _a[_i];
            var neighbourhood = this.calculateNeighbourhood(bird, this.neighbourhood_size);
            bird.update(neighbourhood);
        }
    };
    Flock.prototype.render = function (context) {
        for (var _i = 0, _a = this.birds; _i < _a.length; _i++) {
            var bird = _a[_i];
            bird.render(context);
        }
    };
    Flock.prototype.calculateNeighbourhood = function (bird, neighbourhood_size) {
        var neighbourhood = new Neighbourhood();
        // This is slow. Use a graph maybe?
        for (var _i = 0, _a = this.birds; _i < _a.length; _i++) {
            var other_bird = _a[_i];
            if (calculateDistance(bird, other_bird) < neighbourhood_size) {
                neighbourhood.addBird(other_bird);
            }
        }
        neighbourhood.calcAverageDirection();
        neighbourhood.calcAveragePosition();
        return neighbourhood;
    };
    return Flock;
}());
var Neighbourhood = /** @class */ (function () {
    function Neighbourhood() {
        this.birds = [];
        this.averageDirection = 0;
        this.averagePositionX = 0;
        this.averagePositionY = 0;
    }
    Neighbourhood.prototype.addBird = function (bird) {
        this.birds.push(bird);
    };
    Neighbourhood.prototype.calcAverageDirection = function () {
        var directions = this.birds.map(function (_a) {
            var direction = _a.direction;
            return direction;
        });
        this.averageDirection = avgDirections(directions);
    };
    Neighbourhood.prototype.calcAveragePosition = function () {
        var xTotal = 0;
        var yTotal = 0;
        for (var _i = 0, _a = this.birds; _i < _a.length; _i++) {
            var bird = _a[_i];
            xTotal += bird.x;
            yTotal += bird.y;
        }
        this.averagePositionX = xTotal / this.birds.length;
        this.averagePositionY = yTotal / this.birds.length;
    };
    return Neighbourhood;
}());
function calculateDistance(bird1, bird2) {
    return Math.sqrt(Math.pow(bird1.x - bird2.x, 2) + Math.pow(bird1.y - bird2.y, 2));
}
function avgDirections(directions, weights) {
    if (weights === void 0) { weights = null; }
    var northSouthTotal = 0;
    var eastWestTotal = 0;
    for (var i = 0; i < directions.length; i++) {
        var weight = 1;
        if (weights != null) {
            weight = weights[i];
            ;
        }
        northSouthTotal += Math.cos(directions[i]) * weight;
        eastWestTotal += Math.sin(directions[i]) * weight;
    }
    return Math.atan2(northSouthTotal, eastWestTotal);
}
function applySpeedDirectionToPosition(x, y, speed, direction) {
    var new_x = x + Math.cos(direction) * speed;
    var new_y = y + Math.sin(direction) * speed;
    return [new_x, new_y];
}
var Bird = /** @class */ (function () {
    function Bird(size, x, y) {
        this.size = size;
        this.x = x;
        this.y = y;
        this.speed = 0;
        this.direction = 0;
    }
    Bird.prototype.update = function (neighbourhood) {
        var _a;
        this.speed = 1 + Math.random() * 0.3 - 0.3;
        this.direction = this.calculateDirection(neighbourhood);
        _a = applySpeedDirectionToPosition(this.x, this.y, this.speed, this.direction), this.x = _a[0], this.y = _a[1];
    };
    Bird.prototype.calculateDirection = function (neighbourhood) {
        var deltaX = this.x - neighbourhood.averagePositionX;
        var deltaY = this.y - neighbourhood.averagePositionY;
        var directionToCenter = Math.atan2(deltaX, deltaY);
        var randomAdjustment = Math.random() * 0.3 - 0.3;
        return avgDirections([neighbourhood.averageDirection, directionToCenter], [0.2, 1.1]) + randomAdjustment;
    };
    Bird.prototype.render = function (context) {
        var oldColor = context.fillStyle;
        context.fillStyle = 'rgb(0,0,255)';
        context.fillRect(this.x, this.y, this.size, this.size);
        context.fillStyle = oldColor;
    };
    return Bird;
}());
function createBirds(n) {
    return new Flock(n, 200);
}
var canvas = document.querySelector('.mainCanvas');
var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight;
var ctx = canvas.getContext('2d');
var flock = createBirds(300);
function loop() {
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, width, height);
    flock.render(ctx);
    flock.update();
    window.requestAnimationFrame(loop);
}
loop();
