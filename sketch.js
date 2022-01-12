let cnv, mic, audio, fft, peakDetect, amplitude;
let easycam;
let shape = [];
let particles = [];
const total = 100;
let col = 0;
let m0Slider,
  m0,
  m1Slider,
  m1,
  m2Slider,
  m2,
  m3Slider,
  m3,
  m4Slider,
  m4,
  m5Slider,
  m5,
  m6Slider,
  m6,
  m7Slider,
  m7,
  smoothSlider,
  smoothValue,
  strenghtSliderm0,
  strenghtValuem0,
  strenghtSliderm2,
  strenghtValuem2,
  strenghtSliderm4,
  strenghtValuem4,
  strenghtSliderm6,
  strenghtValuem6,
  peakCheck,
  rotateCheck,
  audioSourceBtn,
  saveBtn,
  loadBtn,
  lightCheck,
  buttonMorph,
  morphSlider;
let sourceIsStream = false;
let peakOn = false;
let sSize = 0.2;
let offSet = 50;
let showLights = false;
let morphSpeed = 0;
let rotater = 0;

let myShader;
let matcap;

function preload() {
  // a shader is composed of two parts, a vertex shader, and a fragment shader
  // the vertex shader prepares the vertices and geometry to be drawn
  // the fragment shader renders the actual pixel colors
  // loadShader() is asynchronous so it needs to be in preload
  // loadShader() first takes the filename of a vertex shader, and then a frag shader
  // these file types are usually .vert and .frag, but you can actually use anything. .glsl is another common one
  myShader = loadShader("shader.vert", "shader.frag");

  matcap = loadImage("a2r.jpg");
}

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
  easycam = createEasyCam(this._renderer, { distance: 600, center: [0, 0, 0] });
  easycam.setDistanceMin(300);
  easycam.setDistanceMax(2000);
  particles.splice(0, particles.length);
  for (let i = 0; i < 377; i++) {
    particles.push(
      createVector(
        random(-width * 1.5, width * 1.5),
        random(-width * 1.5, width * 1.5),
        random(-width * 1.5, width * 1.5)
      )
    );
  }
}
function centerSliders() {
  //m0Slider.position(10, offSet + 30);
  /*  m1Slider.position(10, offSet + 50);
  m2Slider.position(10, offSet + 70);
  m3Slider.position(10, offSet + 90);
  m4Slider.position(10, offSet + 110);
  m5Slider.position(10, offSet + 130);
  m6Slider.position(10, offSet + 150);
  m7Slider.position(10, offSet + 170); */
  //smoothSlider.position(width - smoothSlider.width - 10, height - 30);
  /*   strenghtSliderm0.position(width - strenghtSliderm0.width - 10, offSet + 30);
  strenghtSliderm2.position(width - strenghtSliderm2.width - 10, offSet + 70);
  strenghtSliderm4.position(width - strenghtSliderm2.width - 10, offSet + 110);
  strenghtSliderm6.position(width - strenghtSliderm2.width - 10, offSet + 150); */
  //peakCheck.position(10, height - 30);
  //audioSourceBtn.position(10, height - 60);
  //lightCheck.position(10, height - 150);
  //buttonMorph.position(width - buttonMorph.width-50, height - 70);
  //morphSlider.position(width - smoothSlider.width - 10, height - 100);
}

function setup() {
  setAttributes("antialias", true);
  setAttributes("alpha", false);
  //cnv = createCanvas(windowWidth/3, windowHeight/1.5, WEBGL);
  cnv = createCanvas(windowWidth, windowHeight, WEBGL);

  cnv.style("z-index", -1);
  colorMode(HSB);
  // Slider
  m0Slider = document.getElementById("m0Slider"); //createSlider(-21, 21, 0, 0.01);
  m1Slider = document.getElementById("m1Slider"); //createSlider(0, 9, 1);
  m2Slider = document.getElementById("m2Slider"); //createSlider(-21, 21, 0, 0.01);
  m3Slider = document.getElementById("m3Slider"); //createSlider(0, 9, 2);
  m4Slider = document.getElementById("m4Slider"); //createSlider(-21, 21, 0, 0.01);
  m5Slider = document.getElementById("m5Slider"); //createSlider(0, 9, 1);
  m6Slider = document.getElementById("m6Slider"); //createSlider(-21, 21, 0, 0.01);
  m7Slider = document.getElementById("m7Slider"); //createSlider(0, 9, 1);
  smoothSlider = document.getElementById("smoothSlider"); //createSlider(0.5, 1, 0.78, 0.001);
  morphSlider = document.getElementById("morphSlider"); //createSlider(0.0001, 0.003, 0.0002, 0.00001);
  rotateSlider = document.getElementById("rotateSlider");
  strenghtSliderm0 = document.getElementById("strenghtSliderm0"); //createSlider(-21, 21, 9, 0.01);
  strenghtSliderm2 = document.getElementById("strenghtSliderm2"); //createSlider(-21, 21, 9, 0.01);
  strenghtSliderm4 = document.getElementById("strenghtSliderm4"); //createSlider(-21, 21, 9, 0.01);
  strenghtSliderm6 = document.getElementById("strenghtSliderm6"); //createSlider(-21, 21, 9, 0.01);
  peakCheck = document.getElementById("peakCheck");
  rotateCheck = document.getElementById("rotateCheck");
  audioSourceBtn = document.getElementById("audioSource");
  saveBtn = document.getElementById("saveBtn");
  loadBtn = document.getElementById("loadBtn");
  lightCheck = document.getElementById("lightCheck");
  buttonMorph = document.getElementById("morphCheck");
  peakCheck.addEventListener("change", () => {
    peakOn = !peakOn;
  });
  lightCheck.addEventListener("change", () => {
    showLights = !showLights;
  });
  audioSourceBtn.addEventListener("click", () => {
    switchSource();
  });
  saveBtn.addEventListener("click", () => {
    setPreset();
  });
  loadBtn.addEventListener("click", () => {
    getPreset();
  });
  document.getElementById("m0").addEventListener("click", () => {
    m0Slider.value = 0;
  });
  document.getElementById("m1").addEventListener("click", () => {
    m1Slider.value = 0;
  });
  document.getElementById("m2").addEventListener("click", () => {
    m2Slider.value = 0;
  });
  document.getElementById("m3").addEventListener("click", () => {
    m3Slider.value = 0;
  });
  document.getElementById("m4").addEventListener("click", () => {
    m4Slider.value = 0;
  });
  document.getElementById("m5").addEventListener("click", () => {
    m5Slider.value = 0;
  });
  document.getElementById("m6").addEventListener("click", () => {
    m6Slider.value = 0;
  });
  document.getElementById("m7").addEventListener("click", () => {
    m7Slider.value = 0;
  });
  document.getElementById("sM0").addEventListener("click", () => {
    strenghtSliderm0.value = 0;
  });
  document.getElementById("sM2").addEventListener("click", () => {
    strenghtSliderm2.value = 0;
  });
  document.getElementById("sM4").addEventListener("click", () => {
    strenghtSliderm4.value = 0;
  });
  document.getElementById("sM6").addEventListener("click", () => {
    strenghtSliderm6.value = 0;
  });
  centerSliders();
  centerCanvas();

  // simple Kamera ohne Rechtsklick
  easycam = createEasyCam(this._renderer, { distance: 600, center: [0, 0, 0] });
  easycam.setDistanceMin(300);
  easycam.setDistanceMax(2000);
  document.oncontextmenu = function () {
    return false;
  };

  // Audio Analyse
  fft = new p5.FFT();
  mic = new p5.AudioIn();
  amplitude = new p5.Amplitude();
  peakDetect = new p5.PeakDetect(33, 90, 0.35, 40);
  audio = createAudio("http://a2r.twenty4seven.cc:8000/puredata.ogg");
  fft.setInput(mic);
  //amplitude.setInput(mic);
  //audio.play();

  //console.log(mic.getSources());
  mic.start();

  for (let i = 0; i < 377; i++) {
    particles.push(
      createVector(
        random(-width * 1.5, width * 1.5),
        random(-width * 1.5, width * 1.5),
        random(-width * 1.5, width * 1.5)
      )
    );
  }
}

function htmlHandler() {
  document.getElementById("m0").innerHTML = "m0=" + m0;
  document.getElementById("m1").innerHTML = "m1=" + m1;
  document.getElementById("m2").innerHTML = "m2=" + m2;
  document.getElementById("m3").innerHTML = "m3=" + m3;
  document.getElementById("m4").innerHTML = "m4=" + m4;
  document.getElementById("m5").innerHTML = "m5=" + m5;
  document.getElementById("m6").innerHTML = "m6=" + m6;
  document.getElementById("m7").innerHTML = "m7=" + m7;
  document.getElementById("sM0").innerHTML = "m0St.=" + strenghtValuem0;
  document.getElementById("sM2").innerHTML = "m2St.=" + strenghtValuem2;
  document.getElementById("sM4").innerHTML = "m4St.=" + strenghtValuem4;
  document.getElementById("sM6").innerHTML = "m6St.=" + strenghtValuem6;
}

function spektrum(spectrum) {
  beginShape();
  for (i = 0; i < spectrum.length; i++) {
    let x = map(log(i), 0, log(spectrum.length), 0, width);
    stroke(255);
    vertex(x - width / 2, map(spectrum[i], 0, 255, height / 2, 0 + height / 3)); // vorher i statt x
  }
  endShape();
}

function draw() {
  morphSpeed = !morphCheck.checked ? morphSpeed : (morphSpeed += morphSlider.value / 100000);
  m0 = !morphCheck.checked
    ? m0Slider.value / 100
    : floor(map(sin(morphSpeed), -1, 1, 0, m0Slider.value / 100) * 1000) / 1000;
  m1 = m1Slider.value;
  m2 = !morphCheck.checked
    ? m2Slider.value / 100
    : floor(
        map(sin(morphSpeed + PI / 2), -1, 1, 0, m2Slider.value / 100) * 1000
      ) / 1000;
  m3 = m3Slider.value;
  m4 = !morphCheck.checked
    ? m4Slider.value / 100
    : floor(map(sin(morphSpeed + PI), -1, 1, 0, m4Slider.value / 100) * 1000) /
      1000;
  m5 = m5Slider.value;
  m6 = !morphCheck.checked
    ? m6Slider.value / 100
    : floor(
        map(sin(morphSpeed + TWO_PI - PI / 2), -1, 1, 0, m6Slider.value / 100) *
          1000
      ) / 1000;
  m7 = m7Slider.value;
  smoothValue = smoothSlider.value / 100;
  strenghtValuem0 = strenghtSliderm0.value / 100;
  strenghtValuem2 = strenghtSliderm2.value / 100;
  strenghtValuem4 = strenghtSliderm4.value / 100;
  strenghtValuem6 = strenghtSliderm6.value / 100;
  htmlHandler();

  // Audio Spektrum
  let spectrum = fft.analyze(); // .analyze muss laufen
  fft.smooth(smoothValue);
  amplitude.smooth(0.8);

  // Bänder der Analyse
  let oBands = fft.getOctaveBands(1, 90);
  //console.log(oBands);
  let bands2 = fft.logAverages(oBands);
  //console.log(bands2);
  //let bands = fft.linAverages(12);
  //console.log(bands);

  // Peaks
  if (peakOn) peakDetect.update(fft);
  if (peakDetect.isDetected) {
    sSize = lerp(sSize, 2, 0.3);
  } else {
    sSize = lerp(sSize, 1, 0.1);
  }

  let mov0 = map(bands2[0] + bands2[1], 0, 512, 0, strenghtValuem0);
  let mov2 = map(bands2[2] + bands2[3], 0, 512, 0, strenghtValuem2);
  let mov4 = map(bands2[4] + bands2[5], 0, 255, 0, strenghtValuem4);
  let mov6 = map(bands2[6] + bands2[7] + bands2[8], 0, 255, 0, strenghtValuem6);
  let m = [m0 + mov0, m1, m2 + mov2, m3, m4 + mov4, m5, m6 + mov6, m7];
  //bandValues(mov0,mov2,mov4,mov6,bands2[0] + bands2[1],bands2[2] + bands2[3],bands2[4] + bands2[5],bands2[6] + bands2[7] + bands2[8])
  //logValues();

  // Szene
  background(0);
  for (p of particles) {
    stroke(255, 0.5);
    strokeWeight(1.33);
    point(p.x, p.y, p.z);
  }

  noStroke();
  colorMode(HSB);
  lichter();
  //shader(myShader);

  // Send the texture to the shader
  //myShader.setUniform("uMatcapTexture", matcap);
  if (rotateCheck.checked) {
    rotater+=rotateSlider.value/100000;  
  }
  push(); 
  rotateX(rotater*0.6);
  rotateY(rotater)
  rotateZ(-rotater*0.8)
  sphaere(m, sSize);
  pop();
  // Spektrum Animation
  //spektrum(spectrum)
}

function sphaere(m, sSize) {
  noStroke();
  /*  stroke(255)
  strokeWeight(0.5) */
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

      shape[i][j] = createVector(x, y, z).mult(60 * sSize); // amplitude.volume
    }
  }

  for (let i = 0; i < total; i++) {
    let v1, v2;
    beginShape(TRIANGLE_STRIP);
    for (let j = 0; j < total + 1; j++) {
      v1 = shape[i][j % total];
      let v3 = v1;
      normal(v3);
      vertex(v1.x, v1.y, v1.z);
      v2 = shape[i + 1][j % total];
      let v4 = v2;
      //normal(v4);
      vertex(v2.x, v2.y, v2.z);
    }
    endShape();
  }
}

// Audio an in manchen Browsern
function touchStarted() {
  getAudioContext().resume();
}

function switchSource() {
  if (sourceIsStream) {
    audioSourceBtn.innerHTML = "Mic/External";
    audio.stop();
    mic = new p5.AudioIn();
    mic.start();
    fft.setInput(mic);
    /*     amplitude = new p5.Amplitude();
    amplitude.setInput(mic); */
    sourceIsStream = !sourceIsStream;
  } else {
    audioSourceBtn.innerHTML = "A2Random";
    mic.stop();
    audio = createAudio("http://a2r.twenty4seven.cc:8000/puredata.ogg");
    audio.play();
    fft.setInput(audio);
    /*     amplitude = new p5.Amplitude();
    amplitude.setInput(audio); */
    sourceIsStream = !sourceIsStream;
  }
}

function setPreset() {
  localStorage.clear();
  localStorage.setItem("m0", m0Slider.value);
  localStorage.setItem("m1", m1Slider.value);
  localStorage.setItem("m2", m2Slider.value);
  localStorage.setItem("m3", m3Slider.value);
  localStorage.setItem("m4", m4Slider.value);
  localStorage.setItem("m5", m5Slider.value);
  localStorage.setItem("m6", m6Slider.value);
  localStorage.setItem("m7", m7Slider.value);
  localStorage.setItem("smooth", smoothSlider.value);
  localStorage.setItem("morphCheck", morphCheck.checked);
  localStorage.setItem("morph", morphSlider.value);
  localStorage.setItem("rotateCheck", rotateCheck.checked);
  localStorage.setItem("rotate", rotateSlider.value);
  localStorage.setItem("sM0", strenghtSliderm0.value);
  localStorage.setItem("sM2", strenghtSliderm2.value);
  localStorage.setItem("sM4", strenghtSliderm4.value);
  localStorage.setItem("sM6", strenghtSliderm6.value);
  console.log("Gespeichert" + "\n" + localStorage);
}

function getPreset() {
  m0Slider.value = localStorage.getItem("m0");
  m1Slider.value = localStorage.getItem("m1");
  m2Slider.value = localStorage.getItem("m2");
  m3Slider.value = localStorage.getItem("m3");
  m4Slider.value = localStorage.getItem("m4");
  m5Slider.value = localStorage.getItem("m5");
  m6Slider.value = localStorage.getItem("m6");
  m7Slider.value = localStorage.getItem("m7");
  smoothSlider.value = localStorage.getItem("smooth");
  morphSlider.value = localStorage.getItem("morph"); 
  morphCheck.checked = localStorage.getItem("morphCheck")
  rotateSlider.value = localStorage.getItem("rotate");
  rotateCheck.checked = localStorage.getItem("rotateCheck");
  strenghtSliderm0.value = localStorage.getItem("sM0");
  strenghtSliderm2.value = localStorage.getItem("sM2");
  strenghtSliderm4.value = localStorage.getItem("sM4");
  strenghtSliderm6.value = localStorage.getItem("sM6");
  console.log("Geladen" + "\n" + localStorage);
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

function bandValues(mov0, mov2, mov4, mov6, band1, band2, band3, band4) {
  console.log(
    " band1: " + mov0,
    +" " + band1 + "\n",
    "band2: " + mov2,
    +" " + band2 + "\n",
    "band3: " + mov4,
    +" " + band3 + "\n",
    "band4: " + mov6,
    +" " + band4
  );
}

function lichter() {
  let angle = frameCount * 0.001;
  let angle2 = frameCount * 0.01;
  let radius = map(sin(angle2), -1, 1, 200, 500);
  let dirX = radius * cos(angle + PI);
  let dirY = radius * sin(angle + PI);
  let xLight = radius * cos(angle);
  let yLight = radius * sin(angle);
  let x2Light = radius * cos(angle2);
  let y2Light = radius * sin(angle2);
  let col = map(sin(angle + radians(0)), -1, 1, 0, 255);
  let col2 = map(sin(angle + radians(180)), -1, 1, 0, 255);
  let col3 = map(sin(angle + radians(30)), -1, 1, 0, 255);
  let col4 = map(sin(angle + radians(210)), -1, 1, 0, 255);

  shininess(25);
  directionalLight(col, 255, 100, -1, 1, 0);
  directionalLight(col2, 255, 100, 1, 1, 0);
  directionalLight(col3, 255, 100, -1, -1, 0);
  directionalLight(col4, 255, 100, 1, -1, 0);
  pointLight(col, 255, 255, dirX, dirY, x2Light);
  pointLight(col2, 255, 255, xLight, yLight, y2Light);
  pointLight(col3, 255, 255, -xLight, -x2Light, -yLight);
  pointLight(col4, 255, 255, -dirX, -y2Light, -dirY);
  let alphaV = 0.96;
  specularMaterial(90, alphaV);
  if (showLights) {
    //ambientLight(0);
    let center = createVector(0, 0, 0);

    push();
    translate(dirX, dirY, x2Light);
    stroke(col, 255, 255, alphaV);
    strokeWeight(5);
    point(0, 0, 0);
    pop();
    stroke(col, 255, 255, alphaV);
    line(center.x, center.y, center.z, dirX, dirY, x2Light);
    push();
    translate(xLight, yLight, y2Light);
    stroke(col2, 255, 255, alphaV);
    strokeWeight(5);
    point(0, 0, 0);
    pop();
    stroke(col2, 255, 255, alphaV);
    line(center.x, center.y, center.z, xLight, yLight, y2Light);
    push();
    translate(-xLight, -x2Light, -yLight);
    stroke(col3, 255, 255, alphaV);
    strokeWeight(5);
    point(0, 0, 0);
    pop();
    stroke(col3, 255, 255, alphaV);
    line(center.x, center.y, center.z, -xLight, -x2Light, -yLight);
    push();
    translate(-dirX, -y2Light, -dirY);
    stroke(col4, 255, 255, alphaV);
    strokeWeight(5);
    point(0, 0, 0);
    pop();
    stroke(col4, 255, 255, alphaV);
    line(center.x, center.y, center.z, -dirX, -y2Light, -dirY);
  }
}
