/* * ===========================================================
 * Project: cold-today!
 * Copyright (c) 2026 @ouorgb. All rights reserved.
 * ===========================================================
 */

let font;
let particles = [];
let msg = "추워!"; 
let fontSize = 180;
let resolution = 3; 

function preload() {
  font = loadFont('GothicA1-Black.ttf'); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  let pg = createGraphics(width, height);
  pg.pixelDensity(1);
  pg.background(0);
  pg.textFont(font);
  pg.textSize(fontSize);
  pg.textAlign(CENTER, CENTER);
  pg.fill(255);
  pg.text(msg, width / 2, height / 2);
  pg.loadPixels();

  for (let x = 0; x < width; x += resolution) {
    for (let y = 0; y < height; y += resolution) {
      let index = (x + y * width) * 4;
      if (pg.pixels[index] > 128) {
        particles.push(new Particle(x, y));
      }
    }
  }
}

function draw() {
  background(255); 
  
  for (let p of particles) {
    p.behaviors();
    p.update();
    p.show();
  }
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(random(width), random(height));
    this.target = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.acc = createVector();
    this.maxspeed = 10;
    this.maxforce = 0.6;
  }

  behaviors() {
    let arrive = this.arrive(this.target);
    let mouse = createVector(mouseX, mouseY);
    let flee = this.flee(mouse);

    let jitter = p5.Vector.random2D();
    jitter.mult(0.3);
    this.applyForce(jitter);

    arrive.mult(1);
   
    flee.mult(2); 

    this.applyForce(arrive);
    this.applyForce(flee);
  }

  applyForce(f) {
    this.acc.add(f);
  }

  update() {
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.acc.mult(0);
    this.vel.mult(0.93);
  }

  show() {
 
    stroke(0, 255, 200, 230); 
    strokeWeight(1.5); 
    point(this.pos.x, this.pos.y);
  }

  arrive(target) {
    let desired = p5.Vector.sub(target, this.pos);
    let d = desired.mag();
    let speed = this.maxspeed;
    if (d < 100) {
      speed = map(d, 0, 100, 0, this.maxspeed);
    }
    desired.setMag(speed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxforce);
    return steer;
  }

  flee(target) {
    let desired = p5.Vector.sub(target, this.pos);
    let d = desired.mag();
  
    if (d < 60) { 
      desired.setMag(this.maxspeed);
      desired.mult(-1);
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxforce * 2);
      return steer;
    } else {
      return createVector(0, 0);
    }
  }
}


