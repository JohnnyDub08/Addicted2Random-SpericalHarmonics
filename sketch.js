'use strict';

let cnv, mic, audio, fft, spectrum, peakDetect, amplitude, filter;
let easycam;
let shape = [];
let rotateShape = 0;
let total = 50;
let sterne;
let lerpSpace; // SternOffset
let planet;
let m0Slider, m0, m1Slider, m1, m2Slider, m2, m3Slider, m3, m4Slider, m4, m5Slider,
  m5, m6Slider, m6, m7Slider, m7, smoothSlider, smoothValue, smoothSliderM0, smoothValueM0,
  smoothSliderM2, smoothValueM2, smoothSliderM4, smoothValueM4, smoothSliderM6, smoothValueM6,
  strenghtSliderm0, strenghtValuem0, strenghtSliderm2, strenghtValuem2,
  strenghtSliderm4, strenghtValuem4, strenghtSliderm6, strenghtValuem6,
  peakCheck, rotateCheck, spaceCheck, resCheck, audioSourceBtn, saveBtn, loadBtn, distSlider,
  lightCheck, morphBtn, resetBtn, morphSlider, spaceSlider, rotateSliderX,
  rotateSliderY, rotateSliderZ, dropZone, serverAdress;
let sourceIsStream = true;
let sSize = 0.2;
let offSet = 50;
let morphSpeed = 0;
let streamAdress;
let ampHistory = []; // Lautstärke Analyse
let planetMode = false;
let maxDistCam = 3000;

let shapeRot = 0 // Rotation um Planeten
let mil //millis()
let col = 0
let col5 = 0 // Globale Farben

let lightVec  // Licht
let lightVecTemp
let l = 0 // LichtArray
let ls = 0 // LichtShowArray
let scheinW = false
let planetAmp = false
let tex;
let deepField;

// Kamera Stuff
let autoCam = false;
let state2;

// SoundStuff
let reverb;
let mov0 = 0;
let mov2 = 0;
let mov4 = 0;
let mov6 = 0;

// Dev Debug Helfer
let planetCheckBox, lichtCheckBox, scheinWCheckBox, lightShowCheckBox, planetAmpCheckBox, autoCamCheckBox

// Counter
let peakCounter1, peakCounter2;

// Landing SoundEffekt
let soundFx;

function preload() {
  soundFormats('mp3', 'ogg');
  soundFx = loadSound('audio/sFx');
  tex = [
    loadImage('textures/moon0.jpeg'),
    loadImage('textures/moon1.jpeg'),
    loadImage('textures/moon2.jpeg'),
    loadImage('textures/moon3.jpeg'),
    loadImage('textures/moon4.jpeg'),
    loadImage('textures/moon5.jpeg'),
    loadImage('textures/moon6.jpeg'),
    loadImage('textures/moon7.jpeg'),
    loadImage('textures/moon8.jpeg'),
    loadImage('textures/moon9.jpeg'),
    loadImage('textures/moon10.png'),
    loadImage('textures/moon11.png'),
    loadImage('textures/moon12.png'),
    loadImage('textures/moon13.png'),
    loadImage('textures/moon14.png'),
    loadImage('textures/moon15.png')
  ]
  deepField = loadImage("textures/Nebula.png");
}

function centerCanvas() {
  let x = (windowWidth - width) / 2
  let y = (windowHeight - height) / 2
  cnv.position(x, y)
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
  centerCanvas()
  if (!planetMode) sterne.setStars()

  easycam = createEasyCam(this._renderer, { distance: 600, center: [0, 0, 0] })
  easycam.setDistanceMin(300)
  easycam.setDistanceMax(3000)
  easycam.setRotation([0, -0.5, 0, 0], 6000)
  easycam.setDistance(2000, 3000)
  let eyeZ = height / 2 / tan(PI / 6)
  perspective(PI / 3, width / height, eyeZ / 10, eyeZ * 200) // Frustum Far Clip eyeZ*50

  planetCheckBox.position(width - 150, 30)
  lichtCheckBox.position(width - 150, 60)
  scheinWCheckBox.position(width - 150, 90)
  lightShowCheckBox.position(width - 150, 120)
  planetAmpCheckBox.position(width - 150, 150)
  autoCamCheckBox.position(width - 150, 180)
}

function loaded() {
  //console.log(audio)
  setTimeout(() => audio.play(), 4500);
}
function setup() {
  setAttributes("antialias", true);
  setAttributes('alpha', false);
  cnv = createCanvas(windowWidth, windowHeight, WEBGL)
  cnv.style('z-index', -1)
  colorMode(HSB)
  centerCanvas()

  // Audio Analyse
  audio = createAudio('https://ice2.somafm.com/defcon-128-aac', loaded); //("http://a2r.twenty4seven.cc:8000/puredata.ogg"); 

  fft = new p5.FFT()
  mic = new p5.AudioIn()
  filter = new p5.Filter('bandpass')
  filter.amp(3)
  soundFx.disconnect();
  soundFx.connect(filter)
  amplitude = new p5.Amplitude()
  peakDetect = new p5.PeakDetect(45, 100, 0.86, 45)
  fft.setInput(audio);
  amplitude.setInput(audio);
  amplitude.smooth(0.7)

  // get GUI/Slider ids
  htmlEvents()

  // simple Kamera ohne Rechtsklick
  let state = {
    distance: 900,
    center: [0, 0, 0],
    rotation: [0.5, -0.5, 0, 0]
  }

  easycam = new Dw.EasyCam(this._renderer, state)
  // RightClick aus
  document.oncontextmenu = function () {
    return false
  }
  //easycam = createEasyCam(this._renderer, { distance: 600, center: [0, 0, 0] });
  easycam.setDistanceMin(300)
  easycam.setDistanceMax(3000)
  easycam.setRotation([-1, -0.5, 0.5, -0.5], 10000)
  easycam.setDistance(1000, 10000)

  let eyeZ = height / 2 / tan(PI / 6)
  perspective(PI / 3, width / height, eyeZ / 10, eyeZ * 200) // Frustum Far Clip eyeZ*50

  document.getElementById('spaceCheck').checked = true

  //Sterne
  lerpSpace = createVector(0, 0, 0) // LightShow
  lightVec = createVector(1, -1, 1)
  lightVecTemp = createVector(0, 0, 0)

  // Audio Effekte
  reverb = new p5.Reverb();   //reverb.drywet(0.33);
  reverb.process(filter, 2, 1.0);
  reverb.amp(1)
  //reverb.set(7,0.00) 

  // PlanetDebug
  planetCheckBox = createCheckbox('planetMode', false)
  planetCheckBox.position(width - 150, 30)
  planetCheckBox.changed(changePlanetMode)
  lichtCheckBox = createCheckbox('Licht', false)
  lichtCheckBox.position(width - 150, 60)
  lichtCheckBox.changed(changeLichtMode)
  scheinWCheckBox = createCheckbox('ScheinW', false)
  scheinWCheckBox.position(width - 150, 90)
  scheinWCheckBox.changed(() => {
    scheinW = !scheinW
  })
  lightShowCheckBox = createCheckbox('LightShow', false)
  lightShowCheckBox.position(width - 150, 120)
  lightShowCheckBox.changed(changeLightShow)
  planetAmpCheckBox = createCheckbox('planetTex', false)
  planetAmpCheckBox.position(width - 150, 150)
  planetAmpCheckBox.changed(() => {
    planetAmp = !planetAmp
  })
  autoCamCheckBox = createCheckbox('AutoCam', false)
  autoCamCheckBox.position(width - 150, 180)
  autoCamCheckBox.changed(() => {
    autoCam = !autoCam
  })
  saveBtn = createButton('Save')
  saveBtn.position(width - 150, 210)
  saveBtn.mousePressed(saveFile);
  distSlider = createSlider(0, 1000);
  distSlider.position(width - 150, 260);

  planet = new Planet(floor(random(3000, 8000)));
  sterne = new Stars(377)
  sterne.setStars()

  //console.log(mic.getSources());
  //mic.start();

  peakCounter1 = new PeakCounter();
  peakCounter2 = new PeakCounter();
}

function draw() {
  //console.log(getFrameRate())
  // Disco Mode auf Peak legen
  //l = floor(frameCount*0.02 % 2);
  sliderLogic();
  htmlHandler();

  // Audio Spektrum
  spectrum = fft.analyze() // .analyze muss laufen
  fft.smooth(smoothValue)
  amplitude.smooth(0.5)

  // "RaumKlang"
  /*   let verbAmount = map(easycam.getDistance(),300,3000,0,1);
    let verbAmp = map(easycam.getDistance(),300,3000,1,3);
    reverb.drywet(verbAmount);
    reverb.amp(verbAmp)  */

  // Peaks
  peakDetect.update(fft)

  if (peakCheck.checked && peakDetect.isDetected) {
    sSize = lerp(sSize, 1.5, 0.5)
  } else {
    sSize = lerp(sSize, 1, 0.1)
  }

  /*   let oBands = fft.getOctaveBands(1, 33);
    let bands = fft.logAverages(oBands); */
  //console.log(bands)
  /*   mov0 = lerp(mov0, map(bands[0] + bands[1], 0, 512, 0, strenghtValuem0), smoothValueM0);
    mov2 = lerp(mov2, map(bands[2] + bands[3], 0, 512, 0, strenghtValuem2), smoothValueM2);
    mov4 = lerp(mov4, map(bands[4] + bands[5], 0, 255, 0, strenghtValuem4), smoothValueM4);
    mov6 = lerp(mov6, map(bands[6] + bands[7] + bands[8], 0, 385, 0, strenghtValuem6), smoothValueM6); */

  //Bänder
  let bass = [20, 250];
  let lowMid = [250, 800];
  let mid = [800, 5000];
  let treble = [5000, 14000];

  mov0 = lerp(mov0, map(fft.getEnergy(bass[0], bass[1]), 0, 255, 0, strenghtValuem0), smoothValueM0);
  mov2 = lerp(mov2, map(fft.getEnergy(lowMid[0], lowMid[1]), 0, 255, 0, strenghtValuem2), smoothValueM2);
  mov4 = lerp(mov4, map(fft.getEnergy(mid[0], mid[1]), 0, 255, 0, strenghtValuem4), smoothValueM4);
  mov6 = lerp(mov6, map(fft.getEnergy(treble[0], treble[1]), 0, 255, 0, strenghtValuem6), smoothValueM6);
  let m = [m0 + mov0, m1, m2 + mov2, m3, m4 + mov4, m5, m6 + mov6, m7];

  /*     mov0 = lerp(mov0, map(fft.getEnergy("bass"), 0, 255, 0, strenghtValuem0), smoothValueM0);
      mov2 = lerp(mov2, map(fft.getEnergy("lowMid"), 0, 255, 0, strenghtValuem2), smoothValueM2);
      mov4 = lerp(mov4, map(fft.getEnergy("mid"), 0, 255, 0, strenghtValuem4), smoothValueM4);
      mov6 = lerp(mov6, map(fft.getEnergy("highMid"), 0, 255, 0, strenghtValuem6), smoothValueM6);
      let m = [m0 + mov0, m1, m2 + mov2, m3, m4 + mov4, m5, m6 + mov6, m7]; */

  // Kamera
  if (rotateCheck.checked) {
    easycam.rotateX(rotateSliderX.value / 100000)
    easycam.rotateY(rotateSliderY.value / 100000)
    easycam.rotateZ(rotateSliderZ.value / 100000)
  }

  if (autoCam) {
    let count8 = peakCounter1.countMe(12);
    if (count8) {
      //console.log("Camera Neu")
      if (!planetMode)
        state2 = {
          distance: random(400, 1500), center: [0, 0, 0], rotation: [random(-1, 1), random(-1, 1), random(-1, 1), random(-1, 1)]
        }
      else {
        state2 = {
          distance: random(400, planet.dist - planet.size), center: [0, 0, 0], rotation: [random(-1, 1), random(-1, 1), random(-1, 1), random(-1, 1)]
        }
      }
      easycam.setState(state2, 3333);
    }
  }

  // Szene
  background(0)

  // Lichter
  lichtMode[l]()
  lightShows[ls]()

  // Figur
  push()
  let centerVec = createVector(1, 0, 0)
  let planetVec = createVector(planet.planetX, planet.planetY, 0);
  shapeRot = centerVec.angleBetween(planetVec)
  //console.log(easycam.getPosition())
  if (isNaN(shapeRot)) {  // Hack wegen verschwinden der Figur
    shapeRot = 1;
  }

  // Drehung zum Planeten
  if (planetMode) {
    if (stopFuncAfter(3000)) {
      rotateShape = lerp(rotateShape, shapeRot, 0.03)
    } else {
      rotateShape = shapeRot
    }
  } else {
    rotateShape = lerp(rotateShape, 0, 0.01)
  }

  rotateZ(rotateShape) //rotationState

  sphaere(m, sSize)
  pop()

  if (!planetMode) {
    if (spaceCheck.checked) {
      push()
      rotateZ(rotateShape)
      showTrail()
      pop()
    }
  }

  /*   texture(deepField);
    //noStroke();
    //noLights();
    //fill(col5, 100, 100)
    sphere(90000) */

  //Sterne
  sterne.show()

  //Planet
  planet.show()


}

function sphaere(m, sSize) {
  noStroke()
  total = resCheck.checked ? 100 : 50
  /*  stroke(255)
  strokeWeight(0.5) */

  for (let i = 0; i < total + 1; i++) {
    shape[i] = []
    let phi = map(i, 0, total, 0, PI)
    for (let j = 0; j < total + 1; j++) {
      let theta = map(j, 0, total, 0, TWO_PI)
      let r = 0

      r += pow(sin(m[0] * phi), m[1])
      r += pow(cos(m[2] * phi), m[3])
      r += pow(sin(m[4] * theta), m[5])
      r += pow(cos(m[6] * theta), m[7])

      let x = r * sin(phi) * cos(theta)
      let y = r * cos(phi)
      let z = r * sin(phi) * sin(theta)

      shape[i][j] = createVector(x, y, z).mult(60 * sSize)
    }
  }
  specularMaterial(190, 0.96)

  for (let i = 0; i < total; i++) {
    let v1, v2
    beginShape(TRIANGLE_STRIP)
    /*     noFill();
        strokeWeight(0.7)   // WireframeMode?
        stroke(255) */
    for (let j = 0; j < total + 1; j++) {
      v1 = shape[i][j % total]
      normal(v1)
      vertex(v1.x, v1.y, v1.z)
      v2 = shape[i + 1][j % total]
      vertex(v2.x, v2.y, v2.z)
    }
    endShape()
  }
}

function changePlanetMode() {
  mil = millis()
  planetMode = !planetMode

  if (!planetMode) {
    sterne.setStars()
    spaceSlider.value = 50000
  } else {
    planet = new Planet(random(1500, 15000));
    sterne.setStarsPlanet()
  }
  if (planetMode) {
    easycam.setRotation([-0.5, 0, -0.5, 0], 6000)
    rotateSliderX.value = 1000000 / planet.size
    rotateCheck.checked = true
    easycam.setDistance(950, 3000)
    spaceCheck.checked = true
  } else {
    easycam.setDistance(1500, 3000)
    easycam.setRotation([-0.5, 1, -1, 0], 3000)
  }
}

function changeLichtMode() {
  l++
  l %= 2
  //console.log(l);
}

function changeLightShow() {
  ls++
  ls %= 2
  mil = millis()
}

function showTrail() {
  ampHistory.push(amplitude.getLevel())

  let maxArray = 50
  let dis = 50 + spaceSlider.value / 1000
  let offSet = 450

  noStroke()
  specularMaterial(100, 0.3)

  beginShape() //TRIANGLE_FAN

  vertex(1, offSet - 200, 0)
  vertex(0, offSet - 200, 1)
  vertex(-1, offSet - 200, 0)
  vertex(0, offSet - 200, -1)
  for (let i = 0; i < ampHistory.length; i++) {
    let amp = floor(
      map(ampHistory[i], 0, 1, 1, (10 * spaceSlider.value) / 1000) // Hier map2 function!
    )
    /*     let al = map(i, 0, ampHistory.length, 1, 1);
    specularMaterial(100,al) */
    normal(0, offSet + maxArray * dis - i * dis, amp)
    vertex(0, offSet + maxArray * dis - i * dis, amp)
    normal(amp, offSet + maxArray * dis - i * dis, 0)
    vertex(amp, offSet + maxArray * dis - i * dis, 0)
    normal(0, offSet + maxArray * dis - i * dis, -amp)
    vertex(0, offSet + maxArray * dis - i * dis, -amp)
    normal(-amp, offSet + maxArray * dis - i * dis, 0)
    vertex(-amp, offSet + maxArray * dis - i * dis, 0)
  }
  //vertex(0, offSet + maxArray * dis, 0);
  endShape()
  if (ampHistory.length > maxArray) {
    ampHistory.splice(0, 1)
  }
}

let lightShows = [
  function lightShow() {
    if (peakDetect.isDetected) {
      lightVecTemp = createVector(
        random(-10, 10) / 10,
        random(-10, 10) / 10,
        random(-10, 10) / 10
      )
    }
    //Lichtsucher
    lightVec.x = lerp(lightVec.x, lightVecTemp.x, 0.1)
    lightVec.y = lerp(lightVec.y, lightVecTemp.y, 0.1)
    lightVec.z = lerp(lightVec.z, lightVecTemp.z, 0.1)
  },
  function lightShow2() {
    let x = cos(frameCount * 0.1)
    let y = sin(frameCount * 0.025)
    let z = sin(frameCount * 0.05)
    if (stopFuncAfter(1000)) {
      lightVec.x = lerp(lightVec.x, x, 0.2)
      lightVec.y = lerp(lightVec.y, y, 0.2)
      lightVec.z = lerp(lightVec.z, z, 0.2)
    } else {
      //LichtKreise
      lightVec.x = x
      lightVec.y = y
      lightVec.z = z
    }
  }
]

function stopFuncAfter(del) {
  // Beim change m = millis
  if (del + mil > millis()) {
    return true
  } else return false
}

function waitFuncFor(del) {
  // Beim change m = millis
  if (del + mil < millis()) {
    return true
  } else return false
}

let lichtMode = [
  function lichter() {
    let angle = frameCount * 0.001
    let angle2 = frameCount * 0.01
    let radius = map(sin(angle2), -1, 1, 200, 500)
    let dirX = radius * cos(angle + PI)
    let dirY = radius * sin(angle + PI)
    let xLight = radius * cos(angle)
    let yLight = radius * sin(angle)
    let x2Light = radius * cos(angle2)
    let y2Light = radius * sin(angle2)
    col = map(sin(angle + radians(0)), -1, 1, 0, 255)
    let col2 = map(sin(angle + radians(180)), -1, 1, 0, 255)
    let col3 = map(sin(angle + radians(30)), -1, 1, 0, 255)
    let col4 = map(sin(angle + radians(210)), -1, 1, 0, 255)
    col5 = map(sin(angle + radians(240)), -1, 1, 0, 255)

    shininess(25)

    directionalLight(col, 255, 100, -1, 1, 0);
    directionalLight(col2, 255, 100, 1, 1, 0);
    directionalLight(col3, 255, 100, -1, -1, 0);
    directionalLight(col4, 255, 100, 1, -1, 0);
    pointLight(col, 255, 255, dirX, dirY, x2Light)
    pointLight(col2, 255, 255, xLight, yLight, y2Light)
    pointLight(col3, 255, 255, -xLight, -x2Light, -yLight)
    pointLight(col4, 255, 255, -dirX, -y2Light, -dirY)
    let alphaV = 0.96
    specularMaterial(90, alphaV)
    if (lightCheck.checked) {
      //ambientLight(0);
      let center = createVector(0, 0, 0)

      push()
      translate(dirX, dirY, x2Light)
      stroke(col, 255, 255, alphaV)
      strokeWeight(5)
      point(0, 0, 0)
      pop()
      stroke(col, 255, 255, alphaV)
      line(center.x, center.y, center.z, dirX, dirY, x2Light)
      push()
      translate(xLight, yLight, y2Light)
      stroke(col2, 255, 255, alphaV)
      strokeWeight(5)
      point(0, 0, 0)
      pop()
      stroke(col2, 255, 255, alphaV)
      line(center.x, center.y, center.z, xLight, yLight, y2Light)
      push()
      translate(-xLight, -x2Light, -yLight)
      stroke(col3, 255, 255, alphaV)
      strokeWeight(5)
      point(0, 0, 0)
      pop()
      stroke(col3, 255, 255, alphaV)
      line(center.x, center.y, center.z, -xLight, -x2Light, -yLight)
      push()
      translate(-dirX, -y2Light, -dirY)
      stroke(col4, 255, 255, alphaV)
      strokeWeight(5)
      point(0, 0, 0)
      pop()
      stroke(col4, 255, 255, alphaV)
      line(center.x, center.y, center.z, -dirX, -y2Light, -dirY)
    }
  },
  function lichter2() {
    let angle = frameCount * 0.001
    let angle2 = frameCount * 0.01
    let radius = map(sin(angle2), -1, 1, 200, 500)
    let dirX = radius * cos(angle + PI)
    let dirY = radius * sin(angle + PI)
    let xLight = radius * cos(angle)
    let yLight = radius * sin(angle)
    let x2Light = radius * cos(angle2)
    let y2Light = radius * sin(angle2)
    col = map(sin(angle + radians(0)), -1, 1, 0, 255)
    let col2 = map(sin(angle + radians(15)), -1, 1, 0, 255)
    let col3 = map(sin(angle + radians(30)), -1, 1, 0, 255)
    let col4 = map(sin(angle + radians(45)), -1, 1, 0, 255)
    col5 = map(sin(angle + radians(240)), -1, 1, 0, 255)

    shininess(25)
    /*   directionalLight(255, 0, 0, -1, 1, 0);
  directionalLight(255, 0, 0, 1, 1, 0);
  directionalLight(255, 0, 0, -1, -1, 0);
  directionalLight(255, 0, 255, 1, -1, 0); */
    if (scheinW) {
      directionalLight(col4, 32, 100, -lightVec.y, lightVec.x, lightVec.z)
      directionalLight(col4, 64, 100, lightVec.z, -lightVec.y, -lightVec.x)
      directionalLight(col4, 96, 100, lightVec.z, lightVec.x, -lightVec.y)
      directionalLight(col4, 128, 100, -lightVec.x, lightVec.y, lightVec.z)
    }
    pointLight(col, 255, 255, dirX, dirY, x2Light)
    pointLight(col2, 255, 255, xLight, yLight, y2Light)
    pointLight(col3, 255, 255, -xLight, -x2Light, -yLight)
    pointLight(col4, 255, 255, -dirX, -y2Light, -dirY)
    let alphaV = 0.96

    if (lightCheck.checked) {
      //ambientLight(0);
      let center = createVector(0, 0, 0)

      push()
      translate(dirX, dirY, x2Light)
      stroke(col, 255, 255, alphaV)
      strokeWeight(5)
      point(0, 0, 0)
      pop()
      stroke(col, 255, 255, alphaV)
      line(center.x, center.y, center.z, dirX, dirY, x2Light)
      push()
      translate(xLight, yLight, y2Light)
      stroke(col2, 255, 255, alphaV)
      strokeWeight(5)
      point(0, 0, 0)
      pop()
      stroke(col2, 255, 255, alphaV)
      line(center.x, center.y, center.z, xLight, yLight, y2Light)
      push()
      translate(-xLight, -x2Light, -yLight)
      stroke(col3, 255, 255, alphaV)
      strokeWeight(5)
      point(0, 0, 0)
      pop()
      stroke(col3, 255, 255, alphaV)
      line(center.x, center.y, center.z, -xLight, -x2Light, -yLight)
      push()
      translate(-dirX, -y2Light, -dirY)
      stroke(col4, 255, 255, alphaV)
      strokeWeight(5)
      point(0, 0, 0)
      pop()
      stroke(col4, 255, 255, alphaV)
      line(center.x, center.y, center.z, -dirX, -y2Light, -dirY)
    }
  }
]

function htmlHandler() {
  document.getElementById('m0').innerHTML = 'm0=' + m0
  document.getElementById('m1').innerHTML = 'm1=' + m1
  document.getElementById('m2').innerHTML = 'm2=' + m2
  document.getElementById('m3').innerHTML = 'm3=' + m3
  document.getElementById('m4').innerHTML = 'm4=' + m4
  document.getElementById('m5').innerHTML = 'm5=' + m5
  document.getElementById('m6').innerHTML = 'm6=' + m6
  document.getElementById('m7').innerHTML = 'm7=' + m7
  document.getElementById('sM0').innerHTML = 'm0S=' + strenghtValuem0
  document.getElementById('sM2').innerHTML = 'm2S=' + strenghtValuem2
  document.getElementById('sM4').innerHTML = 'm4S=' + strenghtValuem4
  document.getElementById('sM6').innerHTML = 'm6S=' + strenghtValuem6
  document.getElementById('speed').innerHTML = morphSlider.value / 1000
  document.getElementById('travelSpeed').innerHTML =
    'Warp' + floor(spaceSlider.value / 1000)
  document.getElementById('smth').innerHTML = "All" + smoothValue
  document.getElementById('smthM0').innerHTML = "m0=" + smoothSliderM0.value / 100;
  document.getElementById('smthM2').innerHTML = "m2=" + smoothSliderM2.value / 100;
  document.getElementById('smthM4').innerHTML = "m4=" + smoothSliderM4.value / 100;
  document.getElementById('smthM6').innerHTML = "m6=" + smoothSliderM6.value / 100;
  document.getElementById('x').innerHTML = 'X=' + rotateSliderX.value / 1000
  document.getElementById('y').innerHTML = 'Y=' + rotateSliderY.value / 1000
  document.getElementById('z').innerHTML = 'Z=' + rotateSliderZ.value / 1000
}

function getAudioFile(file) {
  console.log(file)
  mic.stop()
  audio.stop()
  audio = createAudio(file.data)
  audio.play()
  fft.setInput(audio)
  //amplitude = new p5.Amplitude();
  //amplitude.setInput(audio)
  audioSourceBtn.innerHTML = file.name;
}

function htmlEvents() {
  m0Slider = document.getElementById('m0Slider') //createSlider(-21, 21, 0, 0.01);
  m1Slider = document.getElementById('m1Slider') //createSlider(0, 9, 1);
  m2Slider = document.getElementById('m2Slider') //createSlider(-21, 21, 0, 0.01);
  m3Slider = document.getElementById('m3Slider') //createSlider(0, 9, 2);
  m4Slider = document.getElementById('m4Slider') //createSlider(-21, 21, 0, 0.01);
  m5Slider = document.getElementById('m5Slider') //createSlider(0, 9, 1);
  m6Slider = document.getElementById('m6Slider') //createSlider(-21, 21, 0, 0.01);
  m7Slider = document.getElementById('m7Slider') //createSlider(0, 9, 1);
  smoothSlider = document.getElementById('smoothSlider') //createSlider(0.5, 1, 0.78, 0.001);
  smoothSliderM0 = document.getElementById('smoothSliderM0') //createSlider(0.5, 1, 0.78, 0.001);
  smoothSliderM2 = document.getElementById('smoothSliderM2') //createSlider(0.5, 1, 0.78, 0.001);
  smoothSliderM4 = document.getElementById('smoothSliderM4') //createSlider(0.5, 1, 0.78, 0.001);
  smoothSliderM6 = document.getElementById('smoothSliderM6') //createSlider(0.5, 1, 0.78, 0.001);
  morphSlider = document.getElementById('morphSlider')
  spaceSlider = document.getElementById('spaceSlider') //createSlider(0.0001, 0.003, 0.0002, 0.00001);
  rotateSliderX = document.getElementById('rotateSliderX')
  rotateSliderY = document.getElementById('rotateSliderY')
  rotateSliderZ = document.getElementById('rotateSliderZ')
  strenghtSliderm0 = document.getElementById('strenghtSliderm0') //createSlider(-21, 21, 9, 0.01);
  strenghtSliderm2 = document.getElementById('strenghtSliderm2') //createSlider(-21, 21, 9, 0.01);
  strenghtSliderm4 = document.getElementById('strenghtSliderm4') //createSlider(-21, 21, 9, 0.01);
  strenghtSliderm6 = document.getElementById('strenghtSliderm6') //createSlider(-21, 21, 9, 0.01);
  peakCheck = document.getElementById('peakCheck')
  rotateCheck = document.getElementById('rotateCheck')
  audioSourceBtn = document.getElementById('audioSource')
  saveBtn = document.getElementById('saveBtn')
  loadBtn = document.getElementById('loadBtn')
  resetBtn = document.getElementById('resetBtn')
  lightCheck = document.getElementById('lightCheck')
  resCheck = document.getElementById('resCheck')
  spaceCheck = document.getElementById('spaceCheck')
  morphBtn = document.getElementById('morphCheck')
  serverAdress = document.getElementById('server')
  dropZone = select('#dropZone')
  dropZone.drop(getAudioFile, () => {
    console.log('waiting for file...')
  })
  serverAdress.addEventListener('keydown', x => {
    /*   if (!x) { var x = window.event; }
    x.preventDefault();  */
    if (x.keyCode === 13) {
      audioSourceBtn.innerHTML = 'CustomServer'
      mic.stop()
      audio.stop()
      audio = createAudio(serverAdress.value) //("https://ice6.somafm.com/vaporwaves-128-aac")//("http://a2r.twenty4seven.cc:8000/puredata.ogg");//("https://ice6.somafm.com/defcon-128-mp3")//("https://ice4.somafm.com/dronezone-128-aac")
      audio.play()
      fft.setInput(audio)
      //amplitude = new p5.Amplitude();
      amplitude.setInput(audio)
    }
  })
  audioSourceBtn.addEventListener('click', () => {
    switchSource()
  })
  saveBtn.addEventListener('click', () => {
    setPreset()
  })
  loadBtn.addEventListener('click', () => {
    getPreset()
  })
  resetBtn.addEventListener('click', () => {
    m0Slider.value = 0
    m1Slider.value = 1
    m2Slider.value = 0
    m3Slider.value = 1
    m4Slider.value = 0
    m5Slider.value = 1
    m6Slider.value = 0
    m7Slider.value = 1
    strenghtSliderm0.value = 0
    strenghtSliderm2.value = 0
    strenghtSliderm4.value = 0
    strenghtSliderm6.value = 0
    smoothSlider.value = 80;
    smoothSliderM0.value = 0
    smoothSliderM2.value = 0
    smoothSliderM4.value = 0
    smoothSliderM6.value = 0
    rotateSliderX.value = 0
    rotateSliderY.value = 0
    rotateSliderZ.value = 0
    spaceSlider.value = 0
    morphCheck.checked = false
    rotateCheck.checked = false
    lightCheck.checked = false
    peakCheck.checked = false
    resCheck.checked = false
    spaceCheck.checked = false
  })
  document.getElementById('m0').addEventListener('click', () => {
    m0Slider.value = 0
  })
  document.getElementById('m1').addEventListener('click', () => {
    m1Slider.value = 0
  })
  document.getElementById('m2').addEventListener('click', () => {
    m2Slider.value = 0
  })
  document.getElementById('m3').addEventListener('click', () => {
    m3Slider.value = 0
  })
  document.getElementById('m4').addEventListener('click', () => {
    m4Slider.value = 0
  })
  document.getElementById('m5').addEventListener('click', () => {
    m5Slider.value = 0
  })
  document.getElementById('m6').addEventListener('click', () => {
    m6Slider.value = 0
  })
  document.getElementById('m7').addEventListener('click', () => {
    m7Slider.value = 0
  })
  document.getElementById('sM0').addEventListener('click', () => {
    strenghtSliderm0.value = 0
  })
  document.getElementById('sM2').addEventListener('click', () => {
    strenghtSliderm2.value = 0
  })
  document.getElementById('sM4').addEventListener('click', () => {
    strenghtSliderm4.value = 0
  })
  document.getElementById('sM6').addEventListener('click', () => {
    strenghtSliderm6.value = 0
  })
  document.getElementById('smthM0').addEventListener('click', () => {
    smoothSliderM0.value = 0
  })
  document.getElementById('smthM2').addEventListener('click', () => {
    smoothSliderM2.value = 0
  })
  document.getElementById('smthM4').addEventListener('click', () => {
    smoothSliderM4.value = 0
  })
  document.getElementById('smthM6').addEventListener('click', () => {
    smoothSliderM6.value = 0
  })
  document.getElementById('x').addEventListener('click', () => {
    rotateSliderX.value = 0
  })
  document.getElementById('y').addEventListener('click', () => {
    rotateSliderY.value = 0
  })
  document.getElementById('z').addEventListener('click', () => {
    rotateSliderZ.value = 0
  })
  document.getElementById('travelSpeed').addEventListener('click', () => {
    spaceSlider.value = 0
  })
}

function sliderLogic() {
  morphSpeed = !morphCheck.checked
    ? morphSpeed
    : (morphSpeed += morphSlider.value / 100000)
  m0 = !morphCheck.checked
    ? m0Slider.value / 100
    : floor(map(sin(morphSpeed), -1, 1, 0, m0Slider.value / 100) * 1000) / 1000
  m1 = m1Slider.value
  m2 = !morphCheck.checked
    ? m2Slider.value / 100
    : floor(
      map(sin(morphSpeed + PI / 2), -1, 1, 0, m2Slider.value / 100) * 1000
    ) / 1000
  m3 = m3Slider.value
  m4 = !morphCheck.checked
    ? m4Slider.value / 100
    : floor(map(sin(morphSpeed + PI), -1, 1, 0, m4Slider.value / 100) * 1000) /
    1000
  m5 = m5Slider.value
  m6 = !morphCheck.checked
    ? m6Slider.value / 100
    : floor(
      map(sin(morphSpeed + TWO_PI - PI / 2), -1, 1, 0, m6Slider.value / 100) *
      1000
    ) / 1000
  m7 = m7Slider.value
  smoothValue = smoothSlider.value / 100
  smoothValueM0 = map(smoothSliderM0.value, 1, 100, 1, 0);
  smoothValueM2 = map(smoothSliderM2.value, 1, 100, 1, 0);
  smoothValueM4 = map(smoothSliderM4.value, 1, 100, 1, 0);
  smoothValueM6 = map(smoothSliderM6.value, 1, 100, 1, 0);
  strenghtValuem0 = strenghtSliderm0.value / 100
  strenghtValuem2 = strenghtSliderm2.value / 100
  strenghtValuem4 = strenghtSliderm4.value / 100
  strenghtValuem6 = strenghtSliderm6.value / 100
}

function switchSource() {
  if (sourceIsStream) {
    audioSourceBtn.innerHTML = 'Mic/External'
    audio.stop()
    mic = new p5.AudioIn()
    mic.start()
    fft.setInput(mic)
    //reverb.process(mic, 3, 0.0);
    //amplitude = new p5.Amplitude();
    amplitude.setInput(mic)
    sourceIsStream = !sourceIsStream
  } else {
    audioSourceBtn.innerHTML = 'A2Random'
    mic.stop()
    audio.stop()
    audio = createAudio('http://a2r.twenty4seven.cc:8000/puredata.ogg')
    audio.play()
    fft.setInput(audio)
    //reverb.process(audio, 3, 0.0);
    //amplitude = new p5.Amplitude();
    amplitude.setInput(audio)
    sourceIsStream = !sourceIsStream
  }
}

function setPreset() {
  //localStorage.clear();
  localStorage.setItem('m0', m0Slider.value)
  localStorage.setItem('m1', m1Slider.value)
  localStorage.setItem('m2', m2Slider.value)
  localStorage.setItem('m3', m3Slider.value)
  localStorage.setItem('m4', m4Slider.value)
  localStorage.setItem('m5', m5Slider.value)
  localStorage.setItem('m6', m6Slider.value)
  localStorage.setItem('m7', m7Slider.value)
  localStorage.setItem('smooth', smoothSlider.value)
  localStorage.setItem('smoothM0', smoothSliderM0.value)
  localStorage.setItem('smoothM2', smoothSliderM2.value)
  localStorage.setItem('smoothM4', smoothSliderM4.value)
  localStorage.setItem('smoothM6', smoothSliderM6.value)
  localStorage.setItem('morphCheck', morphCheck.checked)
  localStorage.setItem('morph', morphSlider.value)
  localStorage.setItem('spaceCheck', spaceCheck.checked)
  localStorage.setItem('travelSpeed', spaceSlider.value)
  localStorage.setItem('rotateCheck', rotateCheck.checked)
  localStorage.setItem('resCheck', resCheck.checked)
  localStorage.setItem('lightCheck', lightCheck.checked)
  localStorage.setItem('peakCheck', peakCheck.checked)
  localStorage.setItem('rotateX', rotateSliderX.value)
  localStorage.setItem('rotateY', rotateSliderY.value)
  localStorage.setItem('rotateZ', rotateSliderZ.value)
  localStorage.setItem('sM0', strenghtSliderm0.value)
  localStorage.setItem('sM2', strenghtSliderm2.value)
  localStorage.setItem('sM4', strenghtSliderm4.value)
  localStorage.setItem('sM6', strenghtSliderm6.value)
  console.log('Gespeichert' + '\n' + localStorage.length)

}

function getPreset() {
  m0Slider.value = localStorage.getItem('m0')
  m1Slider.value = localStorage.getItem('m1')
  m2Slider.value = localStorage.getItem('m2')
  m3Slider.value = localStorage.getItem('m3')
  m4Slider.value = localStorage.getItem('m4')
  m5Slider.value = localStorage.getItem('m5')
  m6Slider.value = localStorage.getItem('m6')
  m7Slider.value = localStorage.getItem('m7')
  smoothSlider.value = localStorage.getItem('smooth')
  smoothSliderM0.value = localStorage.getItem('smoothM0')
  smoothSliderM2.value = localStorage.getItem('smoothM2')
  smoothSliderM4.value = localStorage.getItem('smoothM4')
  smoothSliderM6.value = localStorage.getItem('smoothM6')
  morphSlider.value = localStorage.getItem('morph')
  spaceSlider.value = localStorage.getItem('travelSpeed')
  morphCheck.checked =
    localStorage.getItem('morphCheck') == 'true' ? true : false
  rotateSliderX.value = localStorage.getItem('rotateX')
  rotateSliderY.value = localStorage.getItem('rotateY')
  rotateSliderZ.value = localStorage.getItem('rotateZ')
  rotateCheck.checked =
    localStorage.getItem('rotateCheck') == 'true' ? true : false
  lightCheck.checked =
    localStorage.getItem('lightCheck') == 'true' ? true : false
  peakCheck.checked = localStorage.getItem('peakCheck') == 'true' ? true : false
  spaceCheck.checked =
    localStorage.getItem('spaceCheck') == 'true' ? true : false
  resCheck.checked = localStorage.getItem('resCheck') == 'true' ? true : false
  strenghtSliderm0.value = localStorage.getItem('sM0')
  strenghtSliderm2.value = localStorage.getItem('sM2')
  strenghtSliderm4.value = localStorage.getItem('sM4')
  strenghtSliderm6.value = localStorage.getItem('sM6')
  console.log('Geladen' + '\n' + localStorage.length)
}

function logValues() {
  console.log(
    ' m0: ' + m0 + ' strength: ' + strenghtValuem0,
    '\n',
    'm1: ' + m1,
    '\n',
    'm2: ' + m2 + ' strength: ' + strenghtValuem2,
    '\n',
    'm3: ' + m3,
    '\n',
    'm4: ' + m4 + ' strength: ' + strenghtValuem4,
    '\n',
    'm5: ' + m5,
    '\n',
    'm6: ' + m6 + ' strength: ' + strenghtValuem6,
    '\n',
    'm7: ' + m7,
    '\n'
  )
}

function rampUp(value, t) {
  value = lerp(value, 1, t);
  return value;
}

class Stars {
  constructor(amount) {
    this.amount = amount
    this.particles = []
    this.lerpSpace = createVector(0, 0, 0)
    this.alSterne = 0
    this.tempParticles = this.particlesPlanetTemp(this.amount);
  }
  setStars() {
    this.particles.splice(0, this.particles.length)
    let space = (width + height);   // /2
    for (let i = 0; i < this.amount; i++) {
      this.particles.push(
        createVector(
          random(-space * 2, space * 2),
          random(-space * 2, space * 2),
          random(-space * 2, space * 2)
        )
      )
    }
  }
  setStarsPlanet() {
    this.particles.splice(0, this.particles.length)
    let space = planet.size / 4
    for (let i = 0; i < this.amount; i++) {
      this.particles.push(
        createVector(random(-space, space), random(-space, space), random(-space, space)
        )
      )
    }
    for (let i = 0; i < this.particles.length; i++) {
      let getAround = createVector(0, 0, 0)
        .sub(this.particles[i])
        .normalize()
        .mult(planet.size * random(1.3, 1.618))
      this.particles[i].add(getAround)
    }
  }
  show() {
    push()
    translate(planet.planetX, planet.planetY, 0) // Sterne werden mit dem Planet verschoben

    if (planetMode && peakCounter2.countMe(8)) {
      this.tempParticles = this.particlesPlanetTemp(this.amount);   // Neue SternPosition     
    }
    let i = 0;
    for (let p of this.particles) {
      if (planetMode) {
        // Transparenz
        this.alSterne = map(dist(-planet.planetX, -planet.planetY, 0, p.x, p.y, p.z), 0, planet.size * 2, 1, 0)
        let sW = map2(amplitude.getLevel(), 0, 1, 1, 200, 2, 2)
        strokeWeight(1 + sW)

        // Warte mit Sternanimation
        let interpolBool = (floor(this.particles[0].x) !== floor(this.tempParticles[0].x));  // Interpolation nötig?
        if (waitFuncFor(10000) && interpolBool) {
          p.x = lerp(p.x, this.tempParticles[i].x, rampUp(0.01, 0.03));   // Hier BUG Scheisse nochmal!!!!!!!!
          p.y = lerp(p.y, this.tempParticles[i].y, rampUp(0.01, 0.03));
          p.z = lerp(p.z, this.tempParticles[i].z, rampUp(0.01, 0.03));
          i++;
        }

      } else {
        // WarpBremse
        if (spaceCheck.checked) {
          p.add(this.lerpSpace)
          this.lerpSpace.y = lerp(this.lerpSpace.y, spaceSlider.value / 1000, 0.002)
          // SternArray Reset Y Achse
          let space = (width + height);
          if (p.y > space * 2) {
            p.y = -space * 2; p.x = random(-space * 2, space * 2)
          }
        } else {
          p.add(this.lerpSpace)
          this.lerpSpace.y = lerp(this.lerpSpace.y, 0, 0.0001) // Interpolation der Bremsung
        }
        // Transparenz
        this.alSterne = map(dist(0, 0, 0, p.x, p.y, p.z), 0, (width + height) * 2, 1, 0
        )
        strokeWeight(3.33)
      }
      stroke(255, this.alSterne)
      point(p.x, p.y, p.z)
    }
    pop()
  }
  particlesPlanetTemp(amount) {
    let particlesTemp = []
    let space = planet.size / 4
    for (let i = 0; i < amount; i++) {
      particlesTemp.push(
        createVector(random(-space, space), random(-space, space), random(-space, space)
        )
      )
    }
    for (let i = 0; i < particlesTemp.length; i++) {
      let getAround = createVector(0, 0, 0)
        .sub(particlesTemp[i])
        .normalize()
        .mult(planet.size * random(1.3, 1.618))
      particlesTemp[i].add(getAround)
    }
    return particlesTemp;
  }
}

class Planet {
  constructor(size) {
    this.size = size
    this.dist = size + size * 0.2
    this.maxCam = size * 0.5
    this.planetSize = 1
    this.planetDist = 1
    this.maxDistCam = 3000
    this.planetX = 0
    this.planetY = 0
    this.rotationState = 1;
    this.rings = floor(random(0, 12))
    this.hasMoon = (random(16) > 5) ? true : false;
    this.moonX = random(3, 8);
    this.moonY = random(3, 8);
    this.moonZ = random(3, 8);
    this.moonSize = this.size * random(0.1, 0.33)
    this.moonSpeed = random(0.005, 0.01);
    this.moonTex = floor(random(tex.length))
  }

  show() {
    if (planetMode) {
      this.planetDist = lerp(this.planetDist + distSlider.value(), this.dist, 0.03)
      this.planetSize = lerp(this.planetSize, this.size, 0.01)
      this.maxDistCam = lerp(this.maxDistCam, this.maxCam, 0.01)
      easycam.setDistanceMax(this.maxDistCam)
    } else {
      this.planetDist = lerp(this.planetDist, 0, 0.05)   
      this.planetSize = lerp(this.planetSize, 0, 0.1)
      this.maxDistCam = lerp(this.maxDistCam, 3000, 0.01)
      easycam.setDistanceMax(this.maxDistCam)
    }

    this.rotationState = (frameCount / (planet.size * 0.1)) % TWO_PI; //(frameCount / (planet.size * 0.1)) % TWO_PI
    this.planetX = this.planetDist * cos(this.rotationState) + 0.0000000001 //NaN Hack
    this.planetY = this.planetDist * sin(this.rotationState) + 0.0000000001

    push()
    translate(this.planetX, this.planetY, 0)
    //rotateY(frameCount * 0.0001) // Drehung um eigene Achse
    //rotateZ(frameCount * 0.001); //WegenTextur

    let dark = 0;
    let planetCol = map2(this.rotationState, 0, TWO_PI, 50, 200, 2, 2);

    let pump = map2(amplitude.getLevel(), 0, 1, 1, 1.3, 1, 0)
    if (planetMode && this.planetDist >= this.planetSize) {
      
      dark = map(this.rotationState, 0, TWO_PI, 0, 200)
      planetCol = map2(amplitude.getLevel(), 0, 1, 50, 150, 3, 2)
    } else {
      pump = 1
    }
    if (planetMode) {
      push()
      rotateX(PI / 2)
      stroke(col, 255, 255)
      let ringDistance = planet.size * 0.618;
      let wave = fft.waveform(); // analyze the waveform for circleWave
      for (let i = 3; i < this.rings; i++) {
        strokeWeight((i / 3 + 3) * (amplitude.getLevel() + 1))
        noFill()
        this.circleWave(0, 0, this.planetSize + i * ringDistance, i * ringDistance / 3, wave)
      }
      pop()
      if (this.hasMoon) {
        push()
        let speed = frameCount * this.moonSpeed;
        let x = (planet.size * this.moonX) * cos(speed)
        let y = (planet.size * this.moonY) * sin(speed)
        let z = (planet.size * this.moonZ) * map(cos(speed), -PI, PI, -PI / 9, PI / 9)
        rotateX(PI / 2)
        translate(x, y, z)  //x - planet.size
        rotateX(-PI / 2)
        rotateY(-speed)

        noLights()
        //ambientLight(127);
        lichtMode[0]()
        pointLight(255, 0, 255, -1, 0.5, 0)
        texture(tex[this.moonTex])
        //specularMaterial(255)
        let moonPump = map2(amplitude.getLevel(), 0, 1, 1, 9, 2, 0)
        noStroke();
        sphere(this.moonSize * moonPump)
        pop()
      }
    }
    noStroke()
    fill(255)
    if (l == 1) specularMaterial(col5, 255, planetCol)
    else {
      ambientMaterial(col5, 255, planetCol)
    }
    if (planetAmp) {
      noLights()
      //ambientLight(255);
      let textures = floor((frameCount * 0.01) % 3)
      texture(tex[textures])
    }
    sphere(this.planetSize * pump, 24, 24)
    pop()
  }
  circleWave(x, y, size, strength, fftwave) {
    push()
    translate(x, y);
    angleMode(DEGREES)
    for (let j = -1; j <= 1; j += 2) {
      beginShape();
      for (let i = 0; i <= 180; i++) {
        let index = floor(map(i, 0, 180, 0, fftwave.length - 1));
        let r = map(fftwave[index], -1, 1, size - strength, size + strength);
        let x = r * sin(i) * j;
        let y = r * cos(i);
        vertex(x, y);
      }
      endShape();
    }
    angleMode(RADIANS)
    pop()
  }
}

class PeakCounter {
  constructor() {
    this.count = 0;
  }
  countMe(peaks) {
    if (peakDetect.isDetected) {
      this.count++;
      if (this.count % peaks == 0) {
        this.count = 0;
        return true;
      }
    }
    return false;
  }
}

// Audiostart an in manchen Browsern, Handys etc
function touchStarted() {
  getAudioContext().resume()
}
//Hilfe, Liebe, Hoffnung, Dankbar, Dankbarkeit