let homeCircles = [];
let blobs = [];

let colorPicker1;
let colorPicker2;

let uiActive = false;

let homeScreen = true;

let bgMusic;

function setup() {
  createCanvas(windowWidth, windowHeight);

   // start loop
  bgMusic.setVolume(0.4);
  bgMusic.loop();

  for (let i = 0; i < 18; i++) {
    homeCircles.push(new HomeCircle());
  }

  // CREATE WRAPPER
  let pickerWrap = createDiv();
  pickerWrap.class("color-pill");

 colorPicker1 = createColorPicker("#ffd6e0");
 colorPicker1.parent(pickerWrap);

 colorPicker1.mousePressed(() => uiActive = true);
 colorPicker1.mouseReleased(() => uiActive = false);

 colorPicker2 = createColorPicker("#f5bcd2");
 colorPicker2.parent(pickerWrap);

 colorPicker2.mousePressed(() => uiActive = true);
 colorPicker2.mouseReleased(() => uiActive = false);
}

function preload() {
  bgMusic = loadSound ("sound/background.mp3")
}

function draw() {

  // soft pink background
  background(255, 248, 250);

  
  // HOME SCREEN
  if (homeScreen) {

    for (let c of homeCircles) {
      c.move();
      c.checkEdges();
      c.checkOthers(homeCircles);
      c.sliceCheck();
      c.show();
    }

    noStroke();

// TITLE
textAlign(CENTER, CENTER);

// title styling
fill(140, 0, 0);
textFont("Limelight");
textSize(80);
textStyle(BOLD);

text(
  "drag, touch, relax",
  width / 2,
  height / 2 - 20
);

// SUBTITLE
drawingContext.shadowBlur = 0;

fill(120, 0, 0);
textFont("Georgia");
textSize(22);
text(
  " click to start",
  width / 2,
  height / 2 + 55
);
return;
  }



  // =========================
  // DRAWING MODE
  // =========================
  for (let blob of blobs) {
    blob.move();
    blob.checkEdges();
    blob.interact(blobs);
    blob.sliceCheck();
    blob.show();
  }

}


// CLICKING

function mousePressed() {

if (bgMusic && !bgMusic.isPlaying()) {
    bgMusic.loop();
  }
   
if (uiActive) return;

  // enter app
  if (homeScreen) {
    homeScreen = false;
    return;
  }

  let clickedBlob = false;

  // recolor clicked blob
  for (let blob of blobs) {

    let d = dist(
      mouseX,
      mouseY,
      blob.x,
      blob.y
    );

    if (d < blob.r) {
      blob.col = random(blob.colors);
      clickedBlob = true;
    }
  }

  // create new blob if empty space clicked
  if (!clickedBlob) {

    blobs.push(
    new LiquidBlob(
        mouseX,
        mouseY,
        random(25, 85)
      )
    );
  }
}

// hold mouse to paint circles
function mouseDragged() {

  if (!homeScreen && frameCount % 3 === 0) {

    blobs.push(
      new LiquidBlob(
        mouseX + random(-15, 15),
        mouseY + random(-15, 15),
        random(20, 70)
      )
    );
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// HOME SCREEN CIRCLES
class HomeCircle {

  constructor() {

    this.r = random(40, 90);

    this.x = random(this.r, width - this.r);
    this.y = random(this.r, height - this.r);

    this.vx = random(-1.2, 1.2);
    this.vy = random(-1.2, 1.2);

    this.colors = [
      color(255, 220, 230, 120),
      color(255, 210, 225, 120),
      color(255, 200, 218, 120),
      color(245, 190, 210, 120)
    ];

    this.col = random(this.colors);
  }

  move() {

    this.x += this.vx;
    this.y += this.vy;

    // repel from mouse
    let d = dist(mouseX, mouseY, this.x, this.y);

    if (d < 180) {

      let angle = atan2(
        this.y - mouseY,
        this.x - mouseX
      );

      let force = map(d, 0, 180, 0.5, 0);
      this.vx += cos(angle) * force;
      this.vy += sin(angle) * force;
    }

    // smooth movement
    this.vx *= 0.98;
    this.vy *= 0.98;
  }

  checkEdges() {

    // LEFT
    if (this.x - this.r < 0) {
      this.x = this.r;
      this.vx *= -1;
    }

    // RIGHT
    if (this.x + this.r > width) {
      this.x = width - this.r;
      this.vx *= -1;
    }

    // TOP
    if (this.y - this.r < 0) {
      this.y = this.r;
      this.vy *= -1;
    }

    // BOTTOM
    if (this.y + this.r > height) {
      this.y = height - this.r;
      this.vy *= -1;
    }
  }

  checkOthers(circles) {

    for (let other of circles) {

      if (other === this) continue;

      let d = dist(
        this.x,
        this.y,
        other.x,
        other.y
      );

      let minDist = this.r + other.r;

      if (d < minDist) {

        let angle = atan2(
          this.y - other.y,
          this.x - other.x
        );

        let overlap = minDist - d;

        let pushX = cos(angle) * overlap * 0.5;
        let pushY = sin(angle) * overlap * 0.5;

        this.x += pushX;
        this.y += pushY;

        other.x -= pushX;
        other.y -= pushY;
      }
    }
  }

sliceCheck() {

  let d = dist(mouseX, mouseY, this.x, this.y);

  if (d < this.r && this.r > 25) {

    let newR = this.r * 0.6;

    homeCircles.push(
      new HomeCircleSplit(
        this.x - newR * 0.5,
        this.y,
        newR
      )
    );

    homeCircles.push(
      new HomeCircleSplit(
        this.x + newR * 0.5,
        this.y,
        newR
      )
    );

    let index = homeCircles.indexOf(this);
    if (index > -1) {
      homeCircles.splice(index, 1);
    }
  }
}

  show() {

    noStroke();

    fill(this.col);

    ellipse(
      this.x,
      this.y,
      this.r * 2
    );
  }
}

class HomeCircleSplit extends HomeCircle {

  constructor(x, y, r) {

    super();

    this.x = x;
    this.y = y;

    this.r = r;

    this.vx = random(-2, 2);
    this.vy = random(-2, 2);
  }
}

// ======================================
// DRAWING BLOBS
// ======================================

class LiquidBlob {

constructor(x, y, r, col = null) {

    this.x = x;
    this.y = y;

    this.r = r;

    // movement
    this.vx = random(-1.2, 1.2);
    this.vy = random(-1.2, 1.2);

    // soft organic movement
    this.offset = random(1000);

    // colors
this.colors = [
  color(colorPicker1.value()),
  color(colorPicker2.value())
];

if (col) {

  this.col = col;

} else {

  this.col = lerpColor(
    this.colors[0],
    this.colors[1],
    random(1)
  );
}

}

  move() {

    this.x += this.vx;
    this.y += this.vy;

    // floating movement
    this.vx += random(-0.02, 0.02);
    this.vy += random(-0.02, 0.02);

    // smoothing
    this.vx *= 0.995;
    this.vy *= 0.995;
  }

  checkEdges() {

    // LEFT
    if (this.x - this.r < 0) {
      this.x = this.r;
      this.vx *= -1;
    }

    // RIGHT
    if (this.x + this.r > width) {
      this.x = width - this.r;
      this.vx *= -1;
    }

    // TOP
    if (this.y - this.r < 0) {
      this.y = this.r;
      this.vy *= -1;
    }

    // BOTTOM
    if (this.y + this.r > height) {
      this.y = height - this.r;
      this.vy *= -1;
    }
  }

  interact(blobs) {

    for (let other of blobs) {

      if (other === this) continue;

      let d = dist(
        this.x,
        this.y,
        other.x,
        other.y
      );

      let minDist = this.r + other.r;

      if (d < minDist) {

        let angle = atan2(
          this.y - other.y,
          this.x - other.x
        );

        let overlap = minDist - d;

        let pushX = cos(angle) * overlap * 0.5;
        let pushY = sin(angle) * overlap * 0.5;

        this.x += pushX;
        this.y += pushY;

        other.x -= pushX;
        other.y -= pushY;

        // soft bounce
        this.vx += pushX * 0.015;
        this.vy += pushY * 0.015;

        other.vx -= pushX * 0.015;
        other.vy -= pushY * 0.015;
      }
    }
  }

  sliceCheck() {

  let d = dist(mouseX, mouseY, this.x, this.y);

  // drag through blobs to remove them
  if (mouseIsPressed && d < this.r) {

    let index = blobs.indexOf(this);

    if (index > -1) {

      // shrink effect before disappearing
      this.r *= 0.9;

      // fully remove tiny blobs
      if (this.r < 10) {
        blobs.splice(index, 1);
        }
      }
    }
  }

  show() {

    noStroke();

    // soft glow
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = this.col;

    fill(this.col);

    // breathing effect
    let pulse =
      sin(frameCount * 0.05 + this.offset) * 3;

    ellipse(
      this.x,
      this.y,
      (this.r + pulse) * 2
    );

    drawingContext.shadowBlur = 0;
  }
}

function clearBlobs() {
  blobs = [];
}