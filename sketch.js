/* * ===========================================================
 * Project: cold-today!
 * Copyright (c) 2026 @ouorgb. All rights reserved.
 * ===========================================================
 */

let font;
let particles = [];
let msg = "추워!"; 
let fontSize;
let resolution = 3; 

let marqueeX = 0; 
let marqueeSpeed = 1.2; 
let marqueeText = "데이터를 불러오는 중입니다...          ";

function preload() {
  try {
    font = loadFont('GothicA1-Black.ttf'); 
  } catch (e) {
    console.log("Font failed");
  }
}

function fetchSeoulWeather() {
  let url = 'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current_weather=true';
  loadJSON(url, (data) => {
    if (data && data.current_weather) {
      let temp = data.current_weather.temperature;
      marqueeText = `현재 서울 기온: ${temp}°C | 마우스로 글자를 흩뿌려보세요!          `;
    }
  }, () => {
    marqueeText = "기온 로드 실패 | 마우스로 글자를 흩뿌려보세요!          ";
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  fetchSeoulWeather();
  initParticles();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initParticles();
}

function initParticles() {
  particles = [];
  fontSize = min(width / 3, 300); 

  let pg = createGraphics(width, height);
  pg.pixelDensity(1);
  pg.background(0);
  if (font) pg.textFont(font);
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

  drawMarquee();
}

function drawMarquee() {
  push();
  fill(250, 250, 90);
  noStroke();
  rect(0, 0, width, 30); 
  
  fill(120, 140, 210);
  if (font) textFont(font);
  else textFont('sans-serif');
  textSize(16); 
  textAlign(LEFT, CENTER);
  
  let tw = textWidth(marqueeText);
  let gap = 100; 
  
  if (tw > 0) {
    let step = tw + gap;
    for (let xPos = marqueeX; xPos < width + step; xPos += step) {
      text(marqueeText, xPos, 15);
    }
    
    marqueeX -= marqueeSpeed;
    
    if (marqueeX <= -step) {
      marqueeX = 0; 
    }
  }
  pop();
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(random(width), random(height));
    this.target = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.acc = createVector();
    this.maxspeed = 18; 
    this.maxforce = 1.5; 
  }

  behaviors() {
    let arrive = this.arrive(this.target);
    let mouse = createVector(mouseX, mouseY);
    let flee = this.flee(mouse);
    let jitter = p5.Vector.random2D();
    jitter.mult(0.3);
    this.applyForce(jitter);
    arrive.mult(1);
    flee.mult(6); 
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
    this.vel.mult(0.95); 
  }

  show() {
    stroke(0, 200, 180, 230); 
    strokeWeight(2); 
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
    if (d < 80) { 
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
