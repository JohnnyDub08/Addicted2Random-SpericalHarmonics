import { sidebar } from "./sidebar.js";
import { spectrum, fft } from "../sketch.js"
'use strict';
let sketch = function (p) {
    p.setup = function () {
      var canvasp = p.createCanvas(312, 117)
      canvasp.parent('canvasid')
    }
    p.draw = function () {
      if (sidebar) {
        //let spectrum = fft.analyze(512)
        //p.background('#262126')
        p.clear();
        p.noFill()
        p.strokeWeight(1)
        p.beginShape()
        for (let i = 0; i < spectrum.length; i++) {
          //let x = map(log(i), 0, log(spectrum.length)/1.1, 0, p.width);
          p.vertex(i, map(spectrum[i], 0, 255, p.height, p.height / 2 + 7))
        }
        p.endShape()
        let waveform = fft.waveform(512)
        p.strokeWeight(1.2)
        p.stroke(255)
        p.noFill()
        p.beginShape()
  
        for (let i = 0; i < waveform.length; i++) {   // Mit WaveForm Figur modulieren!!! 
          let x = map(i, 0, waveform.length, 0, p.width)
          let y = map(waveform[i], -1, 1, 0, p.height / 2)
          p.vertex(x, y)
        }
        p.endShape()
      }
    }
  }
  
  let node = document.createElement('div')
  new p5(sketch, node)

  export {sketch};