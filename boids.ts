const BIRD_SIZE = 15;
const SEPARATION_DISTANCE = 20;

const STEERING_LIMIT = 0.2;
const ACCELERATION_LIMIT = 0.05;

class Flock {
    n: number;
    neighbourhood_size: number;
    birds: Bird[];

    constructor(n, neighbourhood_size) {
        this.n = n;
        this.neighbourhood_size = neighbourhood_size;
        this.birds = []
        for (let i = 0; i < this.n; i++) {
            this.birds.push(new Bird(BIRD_SIZE, 100, 100))
        }
    }

    update() {
        for (var bird of this.birds) {
            const neighbourhood = this.calculateNeighbourhood(bird, this.neighbourhood_size)
            bird.update(neighbourhood);
        }
    }

    render(context: CanvasRenderingContext2D) {
        for (var bird of this.birds) {
            bird.render(context);
        }
    }

    private calculateNeighbourhood(bird: Bird, neighbourhood_size: number) {
        const neighbourhood = new Neighbourhood();
        // This is slow. Use a graph maybe?
        for (var other_bird of this.birds) {
            if (calculateDistance(bird, other_bird) < neighbourhood_size) {
                neighbourhood.addBird(other_bird);
            }
        }
        neighbourhood.calcAverageDirection();
        neighbourhood.calcAveragePosition();
        return neighbourhood
    }
}

class Neighbourhood {
    public birds: Bird[];
    averageDirection: number;
    averagePositionX: number;
    averagePositionY: number;

    constructor() {
        this.birds = []
        this.averageDirection = 0;
        this.averagePositionX = 0;
        this.averagePositionY = 0;
    }

    public addBird(bird: Bird) {
        this.birds.push(bird);
    }

    public calcAverageDirection() {
        const directions = this.birds.map(({direction}) => direction);
        this.averageDirection = avgDirections(directions);
    }

    public calcAveragePosition() {
        let xTotal = 0;
        let yTotal = 0;
        for (var bird of this.birds) {
            xTotal += bird.x;
            yTotal += bird.y;
        }
        this.averagePositionX = xTotal / this.birds.length;
        this.averagePositionY = yTotal / this.birds.length;
    }
}

function calculateDistance(bird1, bird2) {
    return Math.sqrt(Math.pow(bird1.x - bird2.x, 2) + Math.pow(bird1.y - bird2.y, 2));
}

function avgDirections(directions, weights=null) {
    let northSouthTotal = 0;
    let eastWestTotal = 0;
    for (let i = 0; i < directions.length; i++) {
        let weight = 1;
        if (weights != null) {
            weight = weights[i];;
        }

        northSouthTotal += Math.cos(directions[i]) * weight;
        eastWestTotal += Math.sin(directions[i]) * weight;
    }
    return Math.atan2(northSouthTotal, eastWestTotal);
}

function applySpeedDirectionToPosition(x, y, speed, direction) {
    const new_x = x + Math.cos(direction) * speed;
    const new_y = y + Math.sin(direction) * speed;

    return [new_x, new_y];
}

class Bird {
    private size: number;
    public x: number;
    public y: number;
    public speed: number;
    public direction: number;

    constructor(size, x, y) {
        this.size = size;
        this.x = x;
        this.y = y;
        this.speed = 0;
        this.direction = 0;
    }

    public update(neighbourhood: Neighbourhood) {
        this.speed = 1 + Math.random() * 0.3 - 0.3;
        this.direction = this.calculateDirection(neighbourhood);
        [this.x, this.y] = applySpeedDirectionToPosition(this.x, this.y, this.speed, this.direction);
    }

    private calculateDirection(neighbourhood: Neighbourhood) {
        const deltaX = this.x - neighbourhood.averagePositionX;
        const deltaY = this.y - neighbourhood.averagePositionY;
        const directionToCenter = Math.atan2(deltaX, deltaY);
        const randomAdjustment = Math.random() * 0.3 - 0.3;
        return avgDirections([neighbourhood.averageDirection, directionToCenter], [0.2, 1.1]) + randomAdjustment;
    }

    public render(context: CanvasRenderingContext2D) {
        const oldColor = context.fillStyle;
        context.fillStyle = 'rgb(0,0,255)';
        context.fillRect(this.x, this.y, this.size, this.size);
        context.fillStyle = oldColor;
    }
}

function createBirds(n) {
    return new Flock(n, 200);
}

const canvas: HTMLCanvasElement = document.querySelector('.mainCanvas');
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

const ctx = canvas.getContext('2d');

const flock = createBirds(300);

function loop() {
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, width, height);

    flock.render(ctx);
    flock.update();

    window.requestAnimationFrame(loop);
}

loop();