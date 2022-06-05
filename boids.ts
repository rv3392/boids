const BIRD_SIZE = 15;
const SEPARATION_DISTANCE = 20;

const STEERING_LIMIT = 0.2;
const ACCELERATION_LIMIT = 0.05;

function add(vec_a: vec3, vec_b: vec3) {
    return new vec3(vec_a.x + vec_b.x, vec_a.y + vec_b.y, vec_a.z + vec_b.z);
}

/// vec_a - vec_b
function sub(vec_a: vec3, vec_b: vec3) {
    const negative_b = vec_b.clone();
    negative_b.scaleBy(-1);
    return add(vec_a, negative_b);
}

function avg(vec_list: Array<vec3>) {
    const avgVec = new vec3(0, 0, 0);
    for (let vec of vec_list) {
        avgVec.add(vec);
    }
    avgVec.scaleBy(1 / vec_list.length);
    return avgVec;
}

class vec3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(vec: vec3) {
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
    }

    scaleBy(scalar: number) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
    }

    getUnit() {
        const magnitude = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
        const scaled = this.clone();
        scaled.scaleBy(1 / magnitude);
        return scaled;
    }

    clone() {
        return new vec3(this.x, this.y, this.z);
    }
}

class Flock {
    n: number;
    neighbourhood_size: number;
    birds: Bird[];

    constructor(n: number, neighbourhood_size: number) {
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
        neighbourhood.calcAverageVelocity();
        neighbourhood.calcAveragePosition();
        return neighbourhood
    }
}

class Neighbourhood {
    public birds: Bird[];
    averageVelocity: vec3;
    averagePosition: vec3;

    constructor() {
        this.birds = []
        this.averageVelocity = new vec3(0, 0, 0);
        this.averagePosition = new vec3(0, 0, 0);
    }

    public addBird(bird: Bird) {
        this.birds.push(bird);
    }

    public calcAverageVelocity() {
        const velocities = this.birds.map(({velocity}) => velocity);
        this.averageVelocity = avg(velocities);
    }

    public calcAveragePosition() {
        const positions = this.birds.map(({position}) => position);
        this.averagePosition = avg(positions);
    }
}

function calculateDistance(bird1: Bird, bird2: Bird) {
    return Math.sqrt(Math.pow(bird1.position.x - bird2.position.x, 2) + Math.pow(bird1.position.y - bird2.position.y, 2));
}

class Bird {
    private size: number;
    public position: vec3;
    public velocity: vec3;

    constructor(size: number, x: number, y: number) {
        this.size = size;
        this.position = new vec3(x, y, 0);
        this.velocity = new vec3(0, 0, 0);
    }

    public update(neighbourhood: Neighbourhood) {
        this.updateVelocity(neighbourhood);
        this.position = add(this.position, this.velocity);
    }

    private updateVelocity(neighbourhood: Neighbourhood) {
        this.flyToCenter(neighbourhood);
        this.matchAlignment(neighbourhood);
        this.separate(neighbourhood);
    }

    private flyToCenter(neighbourhood: Neighbourhood) {
        const delta = sub(this.position, neighbourhood.averagePosition);
        const unitDelta = delta.getUnit();
        unitDelta.scaleBy(0.1);
        this.velocity = add(this.velocity, unitDelta);
    }

    private matchAlignment(neighbourhood: Neighbourhood) {
        const delta = sub(this.position, neighbourhood.averageVelocity);
        const unitDelta = delta.getUnit();
        unitDelta.scaleBy(0.1);
        this.velocity = add(this.velocity, unitDelta);
    }

    private separate(neighbourhood: Neighbourhood) {
        let lowestDistance = Number.MAX_VALUE;
        let closestBird: Bird = this;
        for (let bird of neighbourhood.birds) {
            const distance = calculateDistance(this, bird);
            if (distance < SEPARATION_DISTANCE && distance < lowestDistance && bird != this) {
                lowestDistance = distance;
                closestBird = bird;
            }
        }

        let delta = new vec3(Math.random() * 2 - 1, Math.random() * 2 - 1, 0);
        if (lowestDistance > 2) {
            delta = sub(this.position, closestBird.position);
        }

        const unitDelta = delta.getUnit();
        unitDelta.scaleBy(-0.01);
        this.velocity = add(this.velocity, unitDelta);
    }

    public render(context: CanvasRenderingContext2D) {
        const oldColor = context.fillStyle;
        context.fillStyle = 'rgb(0,0,255)';
        context.fillRect(this.position.x, this.position.y, this.size, this.size);
        context.fillStyle = oldColor;
    }
}

function createBirds(n: number) {
    return new Flock(n, 100);
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