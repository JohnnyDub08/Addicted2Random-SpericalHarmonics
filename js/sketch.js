let cnv, mic, fft, peakDetect;
let easycam;
let shape = [];
const total = 55;
let col = 0;
let m0Slider, m1Slider, m3Slider, m4Slider, m5Slider, m6Slider, m7Slider, smoothSlider, strenghtSliderm0, strenghtSliderm2, strenghtSliderm4, strenghtSliderm6, button, butCol;
let peakOn = false;
let p = 0.04;
//var audio = new Audio('http://a2r.twenty4seven.cc:8000/puredata.ogg'); //MediaElement in WebAudio?

function centerCanvas() {
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  cnv.position(x, y);
}

function windowResized() {
  //resizeCanvas(windowWidth/3, windowHeight/1.5);
  resizeCanvas(windowWidth, windowHeight);
  centerCanvas();
  centerSliders();
}
function centerSliders() {
  m0Slider.position(20, 20);
  m1Slider.position(20, 50);
  m2Slider.position(20, 80);
  m3Slider.position(20, 110);
  m4Slider.position(20, 140);
  m5Slider.position(20, 170);
  m6Slider.position(20, 200);
  m7Slider.position(20, 230);
  smoothSlider.position(width-smoothSlider.width-20, height-30);
  strenghtSliderm0.position(width-strenghtSliderm0.width-20, 20);
  strenghtSliderm2.position(width-strenghtSliderm2.width-20, 80);
  strenghtSliderm4.position(width-strenghtSliderm2.width-20, 140);
  strenghtSliderm6.position(width-strenghtSliderm2.width-20, 200);
  button.position(width - button.width-20, height-100);  
}

function setup() {
  //setAttributes("antialias", true);
  //cnv = createCanvas(windowWidth/3, windowHeight/1.5, WEBGL);
  cnv = createCanvas(windowWidth, windowHeight, WEBGL);

  // the simplest method to enable the camera
  createEasyCam();
  // suppress right-click context menu
  document.oncontextmenu = function() { return false; }

  centerCanvas();

  strokeWeight(1)
  colorMode(HSB);

  // Audio Analyse
  mic = new p5.AudioIn();
  peakDetect = new p5.PeakDetect(33,90,0.35,40);
  //console.log(mic.getSources());
  mic.start();
  getAudioContext().resume();
  fft = new p5.FFT();
  fft.setInput(mic);

  // Slider
  m0Slider = createSlider(-300, 300, 1); //
  m1Slider = createSlider(0, 8, 1);
  m2Slider = createSlider(-900, 900, 1); //
  m3Slider = createSlider(0, 9, 1);
  m4Slider = createSlider(-120, 120, 1); //
  m5Slider = createSlider(0, 12, 1);
  m6Slider = createSlider(-74, 74, 1); //
  m7Slider = createSlider(0, 9, 1);
  smoothSlider = createSlider(70, 100, 80);
  strenghtSliderm0 = createSlider(0, 120, 33);
  strenghtSliderm2 = createSlider(0, 333, 33);
  strenghtSliderm4 = createSlider(0, 120, 33);
  strenghtSliderm6 = createSlider(0, 120, 33);
  button = createButton('PeakDetect');
  butCol = color(0, 255, 255);
  button.style('background-color', butCol)
  centerSliders()
}

function draw() {
  background(255);
  const m0 = m0Slider.value()*0.1;
  const m1 = m1Slider.value();
  const m2 = m2Slider.value()*0.01;
  const m3 = m3Slider.value();
  const m4 = m4Slider.value()*0.1;
  const m5 = m5Slider.value();
  const m6 = m6Slider.value()*0.1;
  const m7 = m7Slider.value();
  const smoothValue = smoothSlider.value()*0.01;
  const strenghtValuem0 = strenghtSliderm0.value()*0.1;
  const strenghtValuem2 = strenghtSliderm2.value()*0.1;
  const strenghtValuem4 = strenghtSliderm4.value()*0.1;
  const strenghtValuem6 = strenghtSliderm6.value()*0.1;
  butCol = (peakOn) ? color(0, 255, 255) : color(127, 255, 255);
  button.mousePressed(function() { peakOn = !peakOn ; button.style('background-color', butCol); console.log(peakOn)});
  

  // Audio Spektrum
  fft.smooth(smoothValue);
  let spectrum = fft.analyze();
  // Peaks
  if (peakOn) peakDetect.update(fft);
  //console.log(peakDetect.isDetected);
  if ( peakDetect.isDetected ) {
    p = lerp(p,0.2,0.4);
  } else {
    p = lerp(p,0.08,0.1);
  }
  //let bands = fft.linAverages(12);
  //console.log(bands);

  let oBands = fft.getOctaveBands(1,66);
  //console.log(oBands);
  let bands2 = fft.logAverages(oBands);
  //console.log(bands2);

  //noFill();
  stroke(0);
/*   beginShape();
    for (i = 0; i < spectrum.length; i++) {
      let x = map(log(i), 0, log(spectrum.length), 0, width);
      vertex(x-width/2, map(spectrum[i], 0, 255, height/2, 0)); // vorher i statt x
    }
  endShape();  */

  let mov = map(bands2[0]+bands2[1], 0, 512, 0, strenghtValuem0);
  let mov2 = map(bands2[2]+bands2[3], 0, 512, 0, strenghtValuem2);
  let mov3 = map(bands2[4]+bands2[5], 0, 512, 0, strenghtValuem4);
  let mov4 = map(bands2[6]+bands2[7]+bands2[8], 0, 256, 0, strenghtValuem6);

  let m = [m0+mov, m1, m2+mov2, m3, m4+mov3, m5, m6+mov4, m7];
  //let m = [5, 3, 8, 3, 8, 2, 4, 6];
  //let m = [5, 3, 8, 1, 1, 5, 7, 3];
  //let m = [8, 4, 8, 7, 4, 7, 5, 7];
  //let m = [6, 3, 8, 0, 6, 7, 0, 1];
  //let m = [8, 1, 8, 8, 3, 3, 4, 1];
  //let m = [8, 1, 3, 1, 2, 1, 7, 1];
  //let m = [5, 3, 8, 1, 1, 5, 3, 7];
  //let m = [9, mov2, mov, 8, mov3, 5, mov4, 5];
  //let m = [m0, m1, m2, m3, m4, m5, m6, m7];
 
  sphaere(m,p);
}

function sphaere(m,p) {
  for (let i = 0; i < total + 1; i++) {
    shape[i] = [];
    let phi = map(i, 0, total, 0, PI);
    for (let j = 0; j < total + 1; j++) {
      let theta = map(j, 0, total, 0, TWO_PI);
      let r = 0;

      r += pow(sin(m[0] * phi), m[1]);
      r += pow(cos(m[2] * phi), m[3]);
      r += pow(sin(m[4] * theta), m[5]);
      r += pow(cos(m[6] * theta), m[7]);

      let x = r * sin(phi) * cos(theta);
      let y = r * cos(phi);
      let z = r * sin(phi) * sin(theta);

      shape[i][j] = createVector(x, y, z).mult(height * p);
    }
  }
  push();
 // rotateX(frameCount * 0.005);
 // rotateY(frameCount * 0.004);
 // rotateZ(-frameCount * 0.002);
 //light();
  //ambientMaterial(255);
  
  noStroke();
  //stroke(col)
  for (let i = 0; i < total; i++) {
    beginShape(TRIANGLE_STRIP);
    for (let j = 0; j < total + 1; j++) {
      let hu = map(col, 0, 255, 255, 0);
      fill(hu,255,255);
      let v1 = shape[i][j % total];
      vertex(v1.x, v1.y, v1.z);
      let v2 = shape[i + 1][j % total];
      //stroke(0)
      vertex(v2.x, v2.y, v2.z);
      col = map(dist(v2.x,v2.y,v2.z,0,0,0),20,height/2,0,200);
    }
    endShape();
  }
  pop();
}

function light() {
    // Lichter
    ambientLight(255, 120, 32);
    pointLight(32, 255, 255, 0, 0, -300);
    /*push();
    translate(0, 0, -300);
    fill(32, 255, 255);
    sphere(20);
    pop();*/
    pointLight(160, 255, 255, 0, 0, 300);
    /*push();
    translate(0, 0, 300);
    fill(32, 255, 255);
    sphere(20);
    pop();*/
    pointLight(64, 255, 255, 0, -300, 0);
    /*push();
    translate(0, -300, 0);
    fill(54, 255, 255);
    sphere(20);
    pop();*/
    pointLight(128, 255, 255, 0, 300, 0);
    /*push();
    translate(0, 300, 0);
    fill(54, 255, 255);
    sphere(20);
    pop(); */
    pointLight(96, 255, 255, 300, 0, 0);
    /*push();
    translate(300, 0, 0);
    fill(156, 255, 255);
    sphere(20);
    pop(); */
    pointLight(32, 255, 255, -300, 0, 0);
  /*  push();
    translate(-300, 0, 0);
    fill(255, 255, 255);
    sphere(20);
    pop(); */
}

function touchStarted() {
  getAudioContext().resume();
}