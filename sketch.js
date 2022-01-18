let cnv, mic, audio, fft, spectrum, peakDetect, amplitude;
let easycam;
let shape = [];
let rotateShape = 0;
let particles = [];
let partOffset = [];
let total = 50;
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
  spaceCheck,
  audioSourceBtn,
  saveBtn,
  loadBtn,
  lightCheck,
  morphBtn,
  resetBtn,
  morphSlider,
  spaceSlider,
  rotateSliderX,
  rotateSliderY,
  rotateSliderZ,
  dropZone;
let sourceIsStream = true;
let sSize = 0.2;
let offSet = 50;
let morphSpeed = 0;
let streamAdress;
let counter;
let ampHistory = []; // Lautstärke Analyse
let lerpSpace;
let planetMode = false;
let rotationState = 0;
let planetTex;
let planetSize = 0;
let planetDist = 0;
let planetX;
let planetY;
let maxDistCam = 3000;

let shapeRot = 0; // Rotation um PLaneten
let pump; // Planet pumpt zum Peak
let alSterne; // Alpha
let mil; //millis()
let col = 0;
let col5 = 0 ; // Globale Farben

let myShader;
let matcap;
let lightVec;
let lightVecTemp;
let pg;
let l = 0; // LichtArray

/* function preload() {
  tex = loadImage("moon_tex.png");
} */

function centerCanvas() {
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  cnv.position(x, y);
}
function windowResized() {
  //resizeCanvas(windowWidth/3, windowHeight/1.5);
  resizeCanvas(windowWidth, windowHeight);
  centerCanvas();
  setStars();
  easycam = createEasyCam(this._renderer, { distance: 600, center: [0, 0, 0] });
  easycam.setDistanceMin(300);
  easycam.setDistanceMax(3000); 
  easycam.setRotation([0, -0.5, 0, 0],6000);
  easycam.setDistance(2000, 3000)  
  planetCheckBox.position(width - 100, 30);
  lichtCheckBox.position(width - 100, 60);
}

function setup() {
  setAttributes("antialias", true);
  setAttributes("alpha", false);
  //cnv = createCanvas(windowWidth/3, windowHeight/1.5, WEBGL);
  cnv = createCanvas(windowWidth, windowHeight, WEBGL);
  cnv.style("z-index", -1);
  colorMode(HSB);
  centerCanvas();

  //pg = createGraphics(256, 256, WEBGL);   // Textur
  //textureWrap(REPEAT); //CLAMP, REPEAT, or MIRROR


  // get GUI/Slider ids
  htmlEvents();

  // simple Kamera ohne Rechtsklick
  var state = {
    distance : 900,
    center   : [0, 0, 0],
    rotation : [0.5, 1, 0.5, 0],
  };
  
  easycam = new Dw.EasyCam(this._renderer, state);
  //easycam = createEasyCam(this._renderer, { distance: 600, center: [0, 0, 0] });
  easycam.setDistanceMin(300);
  easycam.setDistanceMax(3000);
  easycam.setRotation([1, -0.5, -1, 0],6000);
  easycam.setDistance(1000, 6000);  
  document.oncontextmenu = function () {
    return false;
  };
  document.getElementById("spaceCheck").checked = true;

  //Sterne
  setStars();
  lerpSpace = createVector(0, 0, 0);    // LightShow
  lightVec = createVector(0,0,0);
  lightVecTemp = createVector(0,0,0);

  // Audio Analyse
  fft = new p5.FFT();
  mic = new p5.AudioIn();
  amplitude = new p5.Amplitude();
  peakDetect = new p5.PeakDetect(33, 96, 0.5, 30);
  audio = createAudio("https://ice2.somafm.com/defcon-128-aac"); //("http://a2r.twenty4seven.cc:8000/puredata.ogg");
  fft.setInput(audio);
  amplitude.setInput(audio);
  audio.play();

  // PlanetDebug
  planetCheckBox = createCheckbox("planetMode", false);
  planetCheckBox.position(width - 100, 30);
  planetCheckBox.changed(changePlanetMode);
  lichtCheckBox = createCheckbox("Licht", false);
  lichtCheckBox.position(width - 100, 60);
  lichtCheckBox.changed(changeLichtMode);

  //console.log(mic.getSources());
  //mic.start();
}
function spektrum(spectrum) {
  pg.setAttributes("antialias", true);
  pg.background(255);
  let amount = 12
  let factor = pg.height/amount;
  pg.strokeWeight(1);
  for (j = 1; j < amount+1; j++) {
    pg.beginShape();
    for (i = 0; i < spectrum.length/2; i++) {
      pg.vertex(i, map(spectrum[i], 0, 255, factor*j, factor*(j-1)));
    }
    pg.endShape();
  } 
}
function changePlanetMode() {
  mil = millis();
  planetMode = !planetMode;
  setStars();
  if (planetMode) {
    easycam.setRotation([0.5, 0, 0.5, 0],3000);
    rotateSliderX.value = 200;
    rotateCheck.checked = true; 
    easycam.setDistance(950, 3000) 
    spaceCheck.checked = true; 
  } else {
    easycam.setDistance(1500, 3000)  
    easycam.setRotation([-0.5, 1, -0.5, 0],3000);
  } 
}
function changeLichtMode() {
  l++;
  l %= 2;
  console.log(l)
}

function showTrail() {
  let a = amplitude.getLevel();
  ampHistory.push(a);

  let maxArray = 50;
  let dis = 50 + spaceSlider.value/ 1000;
  let offSet = 450;

  noStroke();
  specularMaterial(100, 0.3);

  beginShape(); //TRIANGLE_FAN
  
  vertex(1, offSet - 200, 0);
  vertex(0, offSet - 200, 1);
  vertex(-1, offSet - 200, 0);
  vertex(0, offSet - 200, -1);
  for (let i = 0; i < ampHistory.length; i++) {
    let amp = floor(
      map(ampHistory[i], 0, 1, 1, (10 * spaceSlider.value) / 1000) // Hier map2 function!
    );
/*     let al = map(i, 0, ampHistory.length, 1, 1);
    specularMaterial(100,al) */
    normal(0, offSet + maxArray * dis - i * dis, amp);
    vertex(0, offSet + maxArray * dis - i * dis, amp);
    normal(amp, offSet + maxArray * dis - i * dis, 0);
    vertex(amp, offSet + maxArray * dis - i * dis, 0);
    normal(0, offSet + maxArray * dis - i * dis, -amp);
    vertex(0, offSet + maxArray * dis - i * dis, -amp);
    normal(-amp, offSet + maxArray * dis - i * dis, 0);
    vertex(-amp, offSet + maxArray * dis - i * dis, 0);
  }
  //vertex(0, offSet + maxArray * dis, 0);
  endShape();
  if (ampHistory.length > maxArray) {
    ampHistory.splice(0, 1);
  }
}

function draw() {
  // Disco Mode auf Peak legen
  //l = floor(frameCount*0.02 % 2);
  sliderLogic();
  htmlHandler();

  // Audio Spektrum
  spectrum = fft.analyze(); // .analyze muss laufen
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
  if (peakCheck.checked) peakDetect.update(fft);
  if (peakDetect.isDetected) {
    sSize = lerp(sSize, 2, 0.5);
    lightVecTemp = createVector(random(-10,10)/10,random(-10,10)/10,random(-10,10)/10);
  } else {
    sSize = lerp(sSize, 1, 0.1);
  }
 
  //Lichtsucher
  lightVec.x = lerp(lightVec.x,lightVecTemp.x,0.1);
  lightVec.y = lerp(lightVec.y,lightVecTemp.y,0.1);
  lightVec.z = lerp(lightVec.z,lightVecTemp.z,0.1);

  let mov0 = map(bands2[0] + bands2[1], 0, 512, 0, strenghtValuem0);
  let mov2 = map(bands2[2] + bands2[3], 0, 512, 0, strenghtValuem2);
  let mov4 = map(bands2[4] + bands2[5], 0, 255, 0, strenghtValuem4);
  let mov6 = map(bands2[6] + bands2[7] + bands2[8], 0, 255, 0, strenghtValuem6);
  let m = [m0 + mov0, m1, m2 + mov2, m3, m4 + mov4, m5, m6 + mov6, m7];
  //bandValues(mov0,mov2,mov4,mov6,bands2[0] + bands2[1],bands2[2] + bands2[3],bands2[4] + bands2[5],bands2[6] + bands2[7] + bands2[8])
  //logValues();

  // Kamera
  if (rotateCheck.checked) {
    easycam.rotateX(rotateSliderX.value / 100000);
    easycam.rotateY(rotateSliderY.value / 100000);
    easycam.rotateZ(rotateSliderZ.value / 100000);
  }

  // Szene
  background(0);
  
  rotationState = frameCount*0.002%TWO_PI;
  planetX = planetDist * cos(rotationState)+0.000001;  //NaN Hack
  planetY = planetDist * sin(rotationState)+0.000001;
  

  // Lichter
  lichtMode[l]()

  // Planet
  
  push();
  let centerVec = createVector(1,0,0);
  let planetVec = createVector(planetX,planetY,0)
  shapeRot = centerVec.angleBetween(planetVec);
 
  if (planetMode) { 
    if (stopFuncAfter(6000)) {
    rotateShape = lerp(rotateShape,shapeRot,0.03)}
    else {
      rotateShape = shapeRot;
    }
  }
  else {
    rotateShape = lerp(rotateShape,0,0.01)
  }
  //console.log(rotateShape)
  rotateZ(rotateShape);  //rotationState
/*   console.log(rotateShape);
  console.log(shapeRot) */
  sphaere(m, sSize);
  pop();
   
  if (!planetMode) {
    if (spaceCheck.checked) {
      push()
      rotateZ(rotateShape);
      showTrail();
      pop()
    }
  }
   //Sterne
   push()
   translate(planetX, planetY, 0); 
 
     for (p of particles) {
       if (spaceCheck.checked && !planetMode) {
         lerpSpace.y = lerp(lerpSpace.y, spaceSlider.value / 1000, 0.002);   // WarpBremse
       } else {
         lerpSpace.y = lerp(lerpSpace.y, 0, 0.0001);
       };
       if (planetMode) {
         let getAround = createVector(0, 0, 0)
           .sub(p)
           .normalize()
           .mult(planetSize * 2.5);
         p.add(getAround);
         alSterne = map(dist(0, 0, 0, planetX, planetY, 0), 0, planetSize*2, 1, 0.01);
       } else {
         p.add(lerpSpace);
         let space = (width + height) / 2;
         if (p.y > space * 2) {
           p.y = -space * 2;
           p.x = random(-space * 2, space * 2);       
         }
         alSterne = map(dist(0, 0, 0, p.x, p.y, p.z), 0, width + height, 1, 0.1);
       }
       stroke(255, alSterne);
       strokeWeight(2.33);
       point(p.x, p.y, p.z);
     }
   pop()

   //Planet
  push();
  translate(planetX, planetY, 0);
  rotateY(PI) // Drehung um eigene Achse
  //rotateX(PI) //WegenTextur

  let ampMe = amplitude.getLevel();
  let dark = 0;
  let planetCol = 0;
  if (planetMode && planetSize > 1200) {
  pump = ampMe*200;
  dark = map(rotationState,0,TWO_PI,0,200)
  planetCol = map(ampMe, 0, 1, 0, 200);
}
  else {pump = 0;}

  noStroke();
  if (l == 1)specularMaterial(col5, 255, planetCol+55);
  else {ambientMaterial(col5,255,planetCol+55);}
  /*   spektrum(spectrum)
  texture(pg); */
  
  
  
  sphere(planetSize+pump,24,24);

  if (planetMode) {
    planetDist = lerp(planetDist, 3500, 0.005);
    planetSize = lerp(planetSize, 2500, 0.005);
    easycam.setDistanceMax(maxDistCam);
    maxDistCam = lerp(maxDistCam,950,0.005);
  } else {
    planetDist = lerp(planetDist, 0, 0.01);
    planetSize = lerp(planetSize, 0, 0.07);
    easycam.setDistanceMax(maxDistCam);
    maxDistCam = lerp(maxDistCam,3000,0.01);
  }
  pop();
}

function stopFuncAfter(del) {  // Beim change m = millis
  if (del + mil > millis()) {
    return true;
  } else return false;
}

function sphaere(m, sSize) {
  noStroke();
  total = resCheck.checked ? 100 : 50;
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

      shape[i][j] = createVector(x, y, z).mult(60 * sSize);
    }
  }
  specularMaterial(90, 0.96); 

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

let lichtMode = [
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
  col = map(sin(angle + radians(0)), -1, 1, 0, 255);
  let col2 = map(sin(angle + radians(180)), -1, 1, 0, 255);
  let col3 = map(sin(angle + radians(30)), -1, 1, 0, 255);
  let col4 = map(sin(angle + radians(210)), -1, 1, 0, 255);
  col5 = map(sin(angle + radians(240)), -1, 1, 0, 255);

  shininess(25);
  directionalLight(col, 255, 100, -1, 1, 0);
  directionalLight(col2, 255, 100, 1, 1, 0);
  directionalLight(col3, 255, 100, -1, -1, 0);
  directionalLight(col4, 255, 100, 1, -1, 0);
/*   directionalLight(col, 255, 100, -lightVec.y, lightVec.x, lightVec.z);
  directionalLight(col2, 255, 100, lightVec.z, -lightVec.y, -lightVec.x);
  directionalLight(col3, 255, 100, lightVec.z, lightVec.x, -lightVec.y);
  directionalLight(col4, 255, 100, -lightVec.x, lightVec.y, lightVec.z); */
  pointLight(col, 255, 255, dirX, dirY, x2Light);
  pointLight(col2, 255, 255, xLight, yLight, y2Light);
  pointLight(col3, 255, 255, -xLight, -x2Light, -yLight);
  pointLight(col4, 255, 255, -dirX, -y2Light, -dirY);
  let alphaV = 0.96;
  specularMaterial(90, alphaV);
  if (lightCheck.checked) {
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
},
function lichter2() {
  let angle = frameCount * 0.001;
  let angle2 = frameCount * 0.01;
  let radius = map(sin(angle2), -1, 1, 200, 500);
  let dirX = radius * cos(angle + PI);
  let dirY = radius * sin(angle + PI);
  let xLight = radius * cos(angle);
  let yLight = radius * sin(angle);
  let x2Light = radius * cos(angle2);
  let y2Light = radius * sin(angle2);
  col = map(sin(angle + radians(0)), -1, 1, 0, 255);
  let col2 = map(sin(angle + radians(15)), -1, 1, 0, 255);
  let col3 = map(sin(angle + radians(30)), -1, 1, 0, 255);
  let col4 = map(sin(angle + radians(45)), -1, 1, 0, 255);
  col5 = map(sin(angle + radians(180)), -1, 1, 0, 255);

  shininess(25);
/*   directionalLight(255, 0, 0, -1, 1, 0);
  directionalLight(255, 0, 0, 1, 1, 0);
  directionalLight(255, 0, 0, -1, -1, 0);
  directionalLight(255, 0, 255, 1, -1, 0); */
  directionalLight(col4, 32, 100, -lightVec.y, lightVec.x, lightVec.z);
  directionalLight(col4, 64, 100, lightVec.z, -lightVec.y, -lightVec.x);
  directionalLight(col4, 96, 100, lightVec.z, lightVec.x, -lightVec.y);
  directionalLight(col4, 128, 100, -lightVec.x, lightVec.y, lightVec.z);
  pointLight(col, 255, 255, dirX, dirY, x2Light);
  pointLight(col2, 255, 255, xLight, yLight, y2Light);
  pointLight(col3, 255, 255, -xLight, -x2Light, -yLight);
  pointLight(col4, 255, 255, -dirX, -y2Light, -dirY);
  let alphaV = 0.96;
  
  if (lightCheck.checked) {
    //ambientLight(0);
    let center = createVector(0, 0, 0);

    push();
    translate(dirX, dirY, x2Light);
    stroke(col, 255, 255, alphaV );
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
]
function htmlHandler() {
  document.getElementById("m0").innerHTML = "m0=" + m0;
  document.getElementById("m1").innerHTML = "m1=" + m1;
  document.getElementById("m2").innerHTML = "m2=" + m2;
  document.getElementById("m3").innerHTML = "m3=" + m3;
  document.getElementById("m4").innerHTML = "m4=" + m4;
  document.getElementById("m5").innerHTML = "m5=" + m5;
  document.getElementById("m6").innerHTML = "m6=" + m6;
  document.getElementById("m7").innerHTML = "m7=" + m7;
  document.getElementById("sM0").innerHTML = "m0S=" + strenghtValuem0;
  document.getElementById("sM2").innerHTML = "m2S=" + strenghtValuem2;
  document.getElementById("sM4").innerHTML = "m4S=" + strenghtValuem4;
  document.getElementById("sM6").innerHTML = "m6S=" + strenghtValuem6;
  document.getElementById("speed").innerHTML = morphSlider.value / 1000;
  document.getElementById("travelSpeed").innerHTML =
    "Warp " + spaceSlider.value / 1000;
  document.getElementById("smth").innerHTML = smoothValue;
  document.getElementById("x").innerHTML = "X=" + rotateSliderX.value / 1000;
  document.getElementById("y").innerHTML = "Y=" + rotateSliderY.value / 1000;
  document.getElementById("z").innerHTML = "Z=" + rotateSliderZ.value / 1000;
}

function getAudioFile(file) {
  console.log(file);
  mic.stop();
  audio.stop();
  audio = createAudio(file.data);
  audio.play();
  fft.setInput(audio);
  //amplitude = new p5.Amplitude();
  amplitude.setInput(audio);
  audioSourceBtn.innerHTML = "AudioFile";
}

function htmlEvents() {
  m0Slider = document.getElementById("m0Slider"); //createSlider(-21, 21, 0, 0.01);
  m1Slider = document.getElementById("m1Slider"); //createSlider(0, 9, 1);
  m2Slider = document.getElementById("m2Slider"); //createSlider(-21, 21, 0, 0.01);
  m3Slider = document.getElementById("m3Slider"); //createSlider(0, 9, 2);
  m4Slider = document.getElementById("m4Slider"); //createSlider(-21, 21, 0, 0.01);
  m5Slider = document.getElementById("m5Slider"); //createSlider(0, 9, 1);
  m6Slider = document.getElementById("m6Slider"); //createSlider(-21, 21, 0, 0.01);
  m7Slider = document.getElementById("m7Slider"); //createSlider(0, 9, 1);
  smoothSlider = document.getElementById("smoothSlider"); //createSlider(0.5, 1, 0.78, 0.001);
  morphSlider = document.getElementById("morphSlider");
  spaceSlider = document.getElementById("spaceSlider"); //createSlider(0.0001, 0.003, 0.0002, 0.00001);
  rotateSliderX = document.getElementById("rotateSliderX");
  rotateSliderY = document.getElementById("rotateSliderY");
  rotateSliderZ = document.getElementById("rotateSliderZ");
  strenghtSliderm0 = document.getElementById("strenghtSliderm0"); //createSlider(-21, 21, 9, 0.01);
  strenghtSliderm2 = document.getElementById("strenghtSliderm2"); //createSlider(-21, 21, 9, 0.01);
  strenghtSliderm4 = document.getElementById("strenghtSliderm4"); //createSlider(-21, 21, 9, 0.01);
  strenghtSliderm6 = document.getElementById("strenghtSliderm6"); //createSlider(-21, 21, 9, 0.01);
  peakCheck = document.getElementById("peakCheck");
  rotateCheck = document.getElementById("rotateCheck");
  audioSourceBtn = document.getElementById("audioSource");
  saveBtn = document.getElementById("saveBtn");
  loadBtn = document.getElementById("loadBtn");
  resetBtn = document.getElementById("resetBtn");
  lightCheck = document.getElementById("lightCheck");
  resCheck = document.getElementById("resCheck");
  spaceCheck = document.getElementById("spaceCheck");
  morphBtn = document.getElementById("morphCheck");
  serverAdress = document.getElementById("server");
  dropZone = select("#dropZone");
  dropZone.drop(getAudioFile, () => {
    console.log("waiting for file...");
  });
  serverAdress.addEventListener("keydown", (x) => {
    /*   if (!x) { var x = window.event; }
    x.preventDefault();  */
    if (x.keyCode === 13) {
      audioSourceBtn.innerHTML = "CustomServer";
      mic.stop();
      audio.stop();
      audio = createAudio(serverAdress.value); //("https://ice6.somafm.com/vaporwaves-128-aac")//("http://a2r.twenty4seven.cc:8000/puredata.ogg");//("https://ice6.somafm.com/defcon-128-mp3")//("https://ice4.somafm.com/dronezone-128-aac")
      audio.play();
      fft.setInput(audio);
      amplitude = new p5.Amplitude();
      amplitude.setInput(audio);
    }
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
  resetBtn.addEventListener("click", () => {
    m0Slider.value = 0;
    m1Slider.value = 1;
    m2Slider.value = 0;
    m3Slider.value = 1;
    m4Slider.value = 0;
    m5Slider.value = 1;
    m6Slider.value = 0;
    m7Slider.value = 1;
    strenghtSliderm0.value = 0;
    strenghtSliderm2.value = 0;
    strenghtSliderm4.value = 0;
    strenghtSliderm6.value = 0;
    rotateSliderX.value = 0;
    rotateSliderY.value = 0;
    rotateSliderZ.value = 0;
    spaceSlider.value = 0;
    morphCheck.checked = false;
    rotateCheck.checked = false;
    lightCheck.checked = false;
    peakCheck.checked = false;
    resCheck.checked = false;
    spaceCheck.checked = false;
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
  document.getElementById("x").addEventListener("click", () => {
    rotateSliderX.value = 0;
  });
  document.getElementById("y").addEventListener("click", () => {
    rotateSliderY.value = 0;
  });
  document.getElementById("z").addEventListener("click", () => {
    rotateSliderZ.value = 0;
  });
  document.getElementById("travelSpeed").addEventListener("click", () => {
    spaceSlider.value = 0;
  });
}

function sliderLogic() {
  morphSpeed = !morphCheck.checked
    ? morphSpeed
    : (morphSpeed += morphSlider.value / 100000);
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
}
function switchSource() {
  if (sourceIsStream) {
    audioSourceBtn.innerHTML = "Mic/External";
    audio.stop();
    mic = new p5.AudioIn();
    mic.start();
    fft.setInput(mic);
    //amplitude = new p5.Amplitude();
    amplitude.setInput(mic);
    sourceIsStream = !sourceIsStream;
  } else {
    audioSourceBtn.innerHTML = "A2Random";
    mic.stop();
    audio.stop();
    audio = createAudio("http://a2r.twenty4seven.cc:8000/puredata.ogg");
    audio.play();
    fft.setInput(audio);
    //amplitude = new p5.Amplitude();
    amplitude.setInput(audio);
    sourceIsStream = !sourceIsStream;
  }
}

// Audio an in manchen Browsern
function touchStarted() {
  getAudioContext().resume();
}

function setStars() {
  particles.splice(0, particles.length);
  let space = (width + height) / 2;
  for (let i = 0; i < 377; i++) {  
    particles.push(
      createVector(
        random(-space * 2, space * 2),
        random(-space * 2, space * 2),
        random(-space * 2, space * 2)
      )
    );
  }
}

function setPreset() {
  //localStorage.clear();
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
  localStorage.setItem("spaceCheck", spaceCheck.checked);
  localStorage.setItem("travelSpeed", spaceSlider.value);
  localStorage.setItem("rotateCheck", rotateCheck.checked);
  localStorage.setItem("resCheck", resCheck.checked);
  localStorage.setItem("lightCheck", lightCheck.checked);
  localStorage.setItem("peakCheck", peakCheck.checked);
  localStorage.setItem("rotateX", rotateSliderX.value);
  localStorage.setItem("rotateY", rotateSliderY.value);
  localStorage.setItem("rotateZ", rotateSliderZ.value);
  localStorage.setItem("sM0", strenghtSliderm0.value);
  localStorage.setItem("sM2", strenghtSliderm2.value);
  localStorage.setItem("sM4", strenghtSliderm4.value);
  localStorage.setItem("sM6", strenghtSliderm6.value);
  console.log("Gespeichert" + "\n" + localStorage.length);
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
  spaceSlider.value = localStorage.getItem("travelSpeed");
  morphCheck.checked =
    localStorage.getItem("morphCheck") == "true" ? true : false;
  rotateSliderX.value = localStorage.getItem("rotateX");
  rotateSliderY.value = localStorage.getItem("rotateY");
  rotateSliderZ.value = localStorage.getItem("rotateZ");
  rotateCheck.checked =
    localStorage.getItem("rotateCheck") == "true" ? true : false;
  lightCheck.checked =
    localStorage.getItem("lightCheck") == "true" ? true : false;
  peakCheck.checked =
    localStorage.getItem("peakCheck") == "true" ? true : false;
  spaceCheck.checked =
    localStorage.getItem("spaceCheck") == "true" ? true : false;
  resCheck.checked = localStorage.getItem("resCheck") == "true" ? true : false;
  strenghtSliderm0.value = localStorage.getItem("sM0");
  strenghtSliderm2.value = localStorage.getItem("sM2");
  strenghtSliderm4.value = localStorage.getItem("sM4");
  strenghtSliderm6.value = localStorage.getItem("sM6");
  console.log("Geladen" + "\n" + localStorage.length);
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

let sketch = function (p) {
  p.setup = function () {
    var canvasp = p.createCanvas(303, 150);
    canvasp.parent("canvasid")
  }
  p.draw = function() {
    p.background('#262126');
    p.stroke(255);
    p.strokeWeight(1);
    p.noFill();
    let spectrum = fft.analyze();
    p.beginShape();
    for (i = 0; i < spectrum.length; i++) {
      p.vertex(i, map(spectrum[i], 0, 255, p.height, p.height/2));
    }
    p.endShape();
    let waveform = fft.waveform();
    p.strokeWeight(2);
    p.beginShape();
  
    for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length, 0, p.width);
      let y = map(waveform[i], -1, 1, 0, p.height/2);
      p.vertex(x, y);
    }
    p.endShape();
  }
};
let node = document.createElement('div');
new p5(sketch, node);
//window.document.getElementsByTagName('body')[0].appendChild(node);

//Hilfe, Liebe Hoffnung, Dankbar, Dankbarkeit
