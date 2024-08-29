function getCollision(particle, particleList) {
    
    if (particleList.length>1) {
        for (let i=0; i<particleList.length; i++) {
            if (particle.x != particleList[i].x || particle.y != particleList[i].y) {
                if (Math.hypot(particle.x-particleList[i].x, particle.y-particleList[i].y) < particle.radius+particleList[i].radius) {
                    return { id: i}
                }
            }
        }
        return false;
    }
}

function drawVector(beginX, beginY, endX, endY, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(beginX, beginY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#ffffff";
}

function findOrientation(B, C) {
    let A = {x:B.x, y:B.y-1};
    var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
    var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
    var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
    if (C.x >= B.x) {
        return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
    }
    else {
        return 2*Math.PI - Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
    }
}

function findAngle(A, B, C) {
    var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
    var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
    var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
    return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.lineWidth = 1;
ctx.strokeStyle = "#ffffff";
ctx.lineCap = "round";
ctx.lineJoin = "round";

class Particle {
    constructor(radius, x, y, previousX, previousY, velocityX, velocityY, color){
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.previousX = previousX;
        this.previousY = previousY;
        this.color = color;
    }
}

let allParticles = [];
let temporaryParticle;
document.addEventListener("mousedown", e => {
    temporaryParticle = new Particle(50, e.clientX, e.clientY, e.clientX, e.clientY, 0, 0, "blue")
})

document.addEventListener("mouseup", e => {
    temporaryParticle.velocityX = (temporaryParticle.x - e.clientX)/30;
    temporaryParticle.velocityY = (temporaryParticle.y - e.clientY)/30;
    if (temporaryParticle.x + temporaryParticle.radius > window.innerWidth) {
        temporaryParticle.x = window.innerWidth - temporaryParticle.radius;
    }
    else if (temporaryParticle.x - temporaryParticle.radius < 0) {
        temporaryParticle.x = temporaryParticle.radius;
    }
    if (temporaryParticle.y + temporaryParticle.radius > window.innerHeight) {
        temporaryParticle.y = window.innerHeight - temporaryParticle.radius;
    }
    else if (temporaryParticle.y - temporaryParticle.radius < 0) {
        temporaryParticle.y = temporaryParticle.radius;
    }
    allParticles.push(temporaryParticle);
})

let elasticCoefficient = 0.95;
let gravityAcceleration = 0.005;
function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i=0; i<allParticles.length; i++) {
        let particle = allParticles[i];
        particle.previousX = particle.x;
        particle.previousY = particle.y;
        particle.y += particle.velocityY;
        particle.x += particle.velocityX;
        particle.velocityY += gravityAcceleration;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, 2*Math.PI)
        ctx.fill()
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(particle.previousX, particle.previousY, particle.radius, 0, 2*Math.PI)
        ctx.fill()
        ctx.stroke();
    }
    for (let i=0; i<allParticles.length; i++) {
        let particle = allParticles[i];
        if (particle.x + particle.radius > window.innerWidth || particle.x - particle.radius < 0) {
            particle.velocityX *= -elasticCoefficient;
            if (particle.x+particle.radius > window.innerWidth) {
                particle.x = window.innerWidth - particle.radius
            }
            else {
                particle.x = particle.radius;
            }
        }
        if (particle.y + particle.radius > window.innerHeight || particle.y - particle.radius < 0) {
            particle.velocityY *= -elasticCoefficient;
            if (particle.y+particle.radius > window.innerHeight) {
                particle.y = window.innerHeight - particle.radius
            }
            else {
                particle.y = particle.radius;
            }
        }
        let collision = getCollision(particle, allParticles);
        if (collision) {
            let collidedParticle = allParticles[collision.id];
            let distance = Math.hypot(particle.x-collidedParticle.x, particle.y-collidedParticle.y);
            if (Math.hypot(particle.velocityX, particle.velocityY) >= Math.hypot(collidedParticle.velocityX, collidedParticle.velocityY)
            || particle.y <= collidedParticle.y) {
                particle.x = 
                collidedParticle.x + (particle.x-collidedParticle.x) * (particle.radius+collidedParticle.radius)/distance;
                particle.y = 
                collidedParticle.y + (particle.y-collidedParticle.y) * (particle.radius+collidedParticle.radius)/distance;
            }
            else {
                collidedParticle.x = 
                particle.x + (collidedParticle.x-particle.x) * (particle.radius+collidedParticle.radius)/distance;
                collidedParticle.y = 
                particle.y + (collidedParticle.y-particle.y) * (particle.radius+collidedParticle.radius)/distance;
            }


            let particleVelocity = Math.hypot(particle.velocityX, particle.velocityY);
            let collisionOrientation = findOrientation(particle, collidedParticle);
            let velocityOrientation = findOrientation(particle, {x: particle.x+particle.velocityX, y:particle.y+particle.velocityY});
            if (isNaN(velocityOrientation)) {
                velocityOrientation = 0;
            }
            if (isNaN(collisionOrientation)) {
                collisionOrientation = 0;
            }
            let transferredVelocity = particleVelocity * Math.cos(velocityOrientation - collisionOrientation);
            let transferredVelocityX = transferredVelocity * Math.cos(Math.PI/2 - collisionOrientation);
            let transferredVelocityY = -transferredVelocity * Math.sin(Math.PI/2 - collisionOrientation);

            let collidedParticleVelocity = Math.hypot(collidedParticle.velocityX, collidedParticle.velocityY);
            let collisionOrientationC = findOrientation(collidedParticle, particle);
            let velocityOrientationC = 
            findOrientation(collidedParticle, 
                {x: collidedParticle.x+collidedParticle.velocityX, y:collidedParticle.y+collidedParticle.velocityY});
            if (isNaN(velocityOrientationC)) {
                velocityOrientationC = 0;
            }
            if (isNaN(collisionOrientationC)) {
                collisionOrientationC = 0;
            }
            let transferredVelocityC = collidedParticleVelocity * Math.cos(velocityOrientationC - collisionOrientationC);
            let transferredVelocityXC = transferredVelocityC * Math.cos(Math.PI/2 - collisionOrientationC);
            let transferredVelocityYC = -transferredVelocityC * Math.sin(Math.PI/2 - collisionOrientationC);
            collidedParticle.velocityX += (transferredVelocityX - transferredVelocityXC)*elasticCoefficient;
            collidedParticle.velocityY += (transferredVelocityY - transferredVelocityYC)*elasticCoefficient;
            particle.velocityX += (-transferredVelocityX + transferredVelocityXC)*elasticCoefficient;
            particle.velocityY += (-transferredVelocityY + transferredVelocityYC)*elasticCoefficient;
            
        }
    }
}

// document.addEventListener("keypress", () => {
//     draw()
// })
let clock = setInterval(draw, 1)