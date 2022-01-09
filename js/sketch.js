let cnv, mic, fft, peakDetect, amplitude;
let easycam;
let shape = [];
const total = 55;
let col = 0;
let m0Slider, m0,
  m1Slider, m1,
  m2Slider, m2,
  m3Slider, m3,
  m4Slider, m4,
  m5Slider, m5,
  m6Slider, m6,
  m7Slider, m7,
  smoothSlider, smoothValue,
  strenghtSliderm0, strenghtValuem0,
  strenghtSliderm2, strenghtValuem2,
  strenghtSliderm4, strenghtValuem4,
  strenghtSliderm6, strenghtValuem6,
  button,
  button2,
  button3,
  button4,
  butCol;
let sourceIsStream = true;
let peakOn = false;
let sSize = 0.2;

/* const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
// get the audio element
const audioElement = document.querySelector('audio');
// pass it into the audio context
const audio = audioCtx.createMediaElementSource(audioElement); */

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
  easycam = createEasyCam();
}
function centerSliders() {
  m0Slider.position(10, 20);
  m1Slider.position(10, 50);
  m2Slider.position(10, 80);
  m3Slider.position(10, 110);
  m4Slider.position(10, 140);
  m5Slider.position(10, 170);
  m6Slider.position(10, 200);
  m7Slider.position(10, 230);
  smoothSlider.position(width - smoothSlider.width - 10, height - 30);
  strenghtSliderm0.position(width - strenghtSliderm0.width-10, 20);
  strenghtSliderm2.position(width - strenghtSliderm2.width-10, 80);
  strenghtSliderm4.position(width - strenghtSliderm2.width-10, 140);
  strenghtSliderm6.position(width - strenghtSliderm2.width-10, 200);
  button.position(width - button.width -  10, height - 100);
  button2.position(width - button.width - 10, height - 130);
  button3.position(width - button.width - 10, height - 160);
  button4.position(width - button.width - 10, height - 190);
}

function setup() {
  setAttributes("antialias", true);
  //cnv = createCanvas(windowWidth/3, windowHeight/1.5, WEBGL);
  cnv = createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB);
  // Slider
  m0Slider = createSlider(-9, 9, 0, 0.01); 
  m1Slider = createSlider(0, 9, 2);
  m2Slider = createSlider(-9, 9, 3, 0.01); 
  m3Slider = createSlider(0, 9, 2);
  m4Slider = createSlider(-9, 9, 8, 0.01); 
  m5Slider = createSlider(0, 9, 5);
  m6Slider = createSlider(0, 9, 3, 0.01); 
  m7Slider = createSlider(0, 9, 8);
  smoothSlider = createSlider(0.7, 1, 0.85, 0.001);
  strenghtSliderm0 = createSlider(-18, 18, 1, 0.01);
  strenghtSliderm2 = createSlider(-18, 18, 1, 0.01);
  strenghtSliderm4 = createSlider(-18, 18, 1, 0.01);
  strenghtSliderm6 = createSlider(-18, 18, 1, 0.01);
  button = createButton("PeakDet. aus");
  button2 = createButton("AudioSource");
  button3 = createButton("Load");
  button4 = createButton("Save");
  butCol = color(0, 255, 255);
  button.style("background-color", butCol);

  centerSliders();
  centerCanvas();

  // simple Kamera ohne Rechtsklick
  easycam = createEasyCam(this._renderer, { distance: 1600, center: [0, 0, 0] });
  document.oncontextmenu = function () {
    return false;
  };

  // Audio Analyse
  fft = new p5.FFT();
  mic = new p5.AudioIn();
  amplitude = new p5.Amplitude();
  peakDetect = new p5.PeakDetect(33, 90, 0.35, 40);
  audio = createAudio("http://a2r.twenty4seven.cc:8000/puredata.ogg");
  fft.setInput(audio);
  amplitude.setInput(audio);
  audio.play();

  //console.log(mic.getSources());
  //mic.start();
  //fft.setInput(mic)/*  */ 
}

function draw() {
  m0 = m0Slider.value();
  m1 = m1Slider.value();
  m2 = m2Slider.value();
  m3 = m3Slider.value();
  m4 = m4Slider.value();
  m5 = m5Slider.value();
  m6 = m6Slider.value();
  m7 = m7Slider.value();
  smoothValue = smoothSlider.value();
  strenghtValuem0 = strenghtSliderm0.value();
  strenghtValuem2 = strenghtSliderm2.value();
  strenghtValuem4 = strenghtSliderm4.value();
  strenghtValuem6 = strenghtSliderm6.value();
  butCol = peakOn ? color(0, 255, 255) : color(127, 255, 255);

  button.mousePressed(() => {peaks()});
  button2.mousePressed(() => {switchSource()});
  button3.mousePressed(() => {getPreset()});
  button4.mousePressed(() => {setPreset()});

  // Audio Spektrum
  let spectrum = fft.analyze(); // .analyze muss laufen
  fft.smooth(smoothValue);
  amplitude.smooth(0.8);

  // Bänder der Analyse
  let oBands = fft.getOctaveBands(1, 63);
  //console.log(oBands);
  let bands2 = fft.logAverages(oBands);
  //console.log(bands2);
  //let bands = fft.linAverages(12);
  //console.log(bands);

  // Peaks
  if (peakOn) peakDetect.update(fft);
  if (peakDetect.isDetected) {
    sSize = lerp(sSize, 0.4, 0.4);
  }  else if (amplitude.volume <= 0.1 && sourceIsStream) {
    sSize = lerp(sSize, 0.0, 0.3);
  }  else {
    sSize = lerp(sSize, 0.16, 0.1);
  }

  // Spektrum Animation
/*   beginShape();
    for (i = 0; i < spectrum.length; i++) {
      let x = map(log(i), 0, log(spectrum.length), 0, width);
      stroke(0);
      vertex(x-width/2, map(spectrum[i], 0, 255, height/2, 0)); // vorher i statt x
    }
  endShape();   */    

  let mov = map(bands2[0] + bands2[1], 0, 512, 0, strenghtValuem0);
  let mov2 = map(bands2[2] + bands2[3], 0, 512, 0, strenghtValuem2);
  let mov3= map(bands2[4] + bands2[5], 0, 255, 0, strenghtValuem4);
  let mov4 = map(bands2[6] + bands2[7] + bands2[8], 0, 255, 0, strenghtValuem6);
  let m = [m0 + mov4, m1, m2 + mov, m3, m4 + mov2, m5, m6 + mov3, m7];
  //bandValues(mov,mov2,mov3,mov4,bands2[0] + bands2[1],bands2[2] + bands2[3],bands2[4] + bands2[5],bands2[6] + bands2[7] + bands2[8])
  logValues();

  background(255);
  sphaere(m, sSize);
}

function sphaere(m, sSize) {
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

      shape[i][j] = createVector(x, y, z).mult(height * sSize); // amplitude.volume
    }
  }
  noStroke();
  for (let i = 0; i < total; i++) {
    beginShape(TRIANGLE_STRIP);
    for (let j = 0; j < total + 1; j++) {
      let hu = map(col, 0, 255, 255, 0);
      fill(hu, 255, 255);
      let v1 = shape[i][j % total];
      vertex(v1.x, v1.y, v1.z);
      let v2 = shape[i + 1][j % total];
      //stroke(0)
      vertex(v2.x, v2.y, v2.z);
      // Farben
      col = map(dist(v2.x, v2.y, v2.z, 0, 0, 0), 0, height/2 , 0, 127+(150 * amplitude.volume));
    }
    endShape();
  }
}

// Audio an in manchen Browsern
function touchStarted() {
  getAudioContext().resume();
} 

function peaks() {
  peakOn = !peakOn;
  button.elt.innerHTML = (peakOn) ? 'PeakDetect an' : 'PeakDet. aus'
  button.style("background-color", butCol);
}

function switchSource() {
  if (sourceIsStream) {
    button2.elt.innerHTML = 'Mic/External'
    audio.stop();
    mic = new p5.AudioIn();
    mic.start();
    fft.setInput(mic);
    amplitude = new p5.Amplitude();
    amplitude.setInput(mic);
    sourceIsStream = !sourceIsStream;
  } else {
    button2.elt.innerHTML = 'A2Random'
    mic.stop();
    audio = createAudio("http://a2r.twenty4seven.cc:8000/puredata.ogg");
    audio.play();
    fft.setInput(audio);
    amplitude = new p5.Amplitude();
    amplitude.setInput(audio);
    sourceIsStream = !sourceIsStream;
  }
}

function setPreset() {
  localStorage.clear();
  localStorage.setItem("m0", m0Slider.value());
  localStorage.setItem("m1", m1Slider.value());
  localStorage.setItem("m2", m2Slider.value());
  localStorage.setItem("m3", m3Slider.value());
  localStorage.setItem("m4", m4Slider.value());
  localStorage.setItem("m5", m5Slider.value());
  localStorage.setItem("m6", m6Slider.value());
  localStorage.setItem("m7", m7Slider.value());
  localStorage.setItem("smooth", smoothSlider.value());
  localStorage.setItem("sM0", strenghtSliderm0.value());
  localStorage.setItem("sM2", strenghtSliderm2.value());
  localStorage.setItem("sM4", strenghtSliderm4.value());
  localStorage.setItem("sM6", strenghtSliderm6.value()); 
  console.log("Gespeichert" + "/n" + localStorage)
}

function getPreset() {
  m0Slider.elt.value = localStorage.getItem("m0")
  m1Slider.elt.value = localStorage.getItem("m1")
  m2Slider.elt.value = localStorage.getItem("m2")
  m3Slider.elt.value = localStorage.getItem("m3")
  m4Slider.elt.value = localStorage.getItem("m4")
  m5Slider.elt.value = localStorage.getItem("m5")
  m6Slider.elt.value = localStorage.getItem("m6")
  m7Slider.elt.value = localStorage.getItem("m7")
  smoothSlider.elt.value = localStorage.getItem("smooth")
  strenghtSliderm0.elt.value = localStorage.getItem("sM0")
  strenghtSliderm2.elt.value = localStorage.getItem("sM2")
  strenghtSliderm4.elt.value = localStorage.getItem("sM4")
  strenghtSliderm6.elt.value = localStorage.getItem("sM6")
  console.log("Geladen" + "/n" + localStorage)
}

function logValues() {
   console.log(
    " m0: " + m0 + " strength: " + strenghtValuem0,
    "\n",
    "m1: " + m1,
    "\n",
    "m2: " + m2 + " strength: " + strenghtValuem2,
    "\n",
    "m3: " + m3,
    "\n",
    "m4: " + m4 + " strength: " + strenghtValuem4,
    "\n",
    "m5: " + m5,
    "\n",
    "m6: " + m6 + " strength: " + strenghtValuem6,
    "\n",
    "m7: " + m7,
    "\n"
  ); 
}

function bandValues(mov,mov2,mov3,mov4,band1,band2,band3,band4) {
  console.log(
  " band1: " + mov, + " " + band1 +
    "\n",
    "band2: " + mov2, + " " + band2 +
    "\n",
    "band3: " + mov3, + " " + band3 +
    "\n",
    "band4: " + mov4, + " " + band4 
  )
}