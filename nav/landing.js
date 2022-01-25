'use strict';
let box1, box2, text1, text2;
let htmlText1 = 'Addicted';
let htmlText2 = ' 2Random';

let temp;
let temp2;
let temp3 = [];
let temp4 = [];
window.addEventListener('load', (event) => { setTimeout(() => init(), 1000) });
function init() {
  text1 = document.getElementById("txt1");
  text2 = document.getElementById("txt2");
  box1 = document.getElementById("box1");
  box2 = document.getElementById("box2");
  window.requestAnimationFrame(textGlitch);
}

function customIterator() {
  let n = 45;
  return {
    next: function () {
      n *= 1.02;
      return { value: n, done: false };
    }
  };
}
let n = customIterator();

let j = 0;
function textGlitch(timeStamp) {
  //console.log(timeStamp)
  if (timeStamp < 4200) {
    if (j < 8) {
      temp = (j % Math.floor(Math.random() * 2) == 0) ? htmlText1.charAt(j % htmlText1.length).toUpperCase() : htmlText1.charAt(j % htmlText1.length).toLowerCase();
      temp3.push(temp)
      text1.innerHTML = temp3.join('').toString();
      text2.innerHTML = " ";
      j++;
    }
    else if (j < 16) {
      temp2 = (j % Math.floor(Math.random() * 2) == 0) ? htmlText2.charAt(j % htmlText2.length).toUpperCase() : htmlText2.charAt(j % htmlText2.length).toLowerCase();
      temp4.push(temp2)
      text2.innerHTML = temp4.join('').toString();
      j++;
    } else if (j < 24) {
      text1.innerHTML = temp3.slice(j - 15).join('').toUpperCase();
      j++;
    }
    else {
      text2.innerHTML = temp4.slice(j - 23).join('').toUpperCase();
      j++;
    }

    let ran01 = Math.random() * 70 + 10;
    let ran02 = Math.random() * 70 + 10;

    text1.style.fontSize = Math.floor(ran01).toString() + "px";
    text2.style.fontSize = Math.floor(ran02).toString() + "px";
    text1.style.width = Math.floor(ran02 * 0.5).toString() + "%";
    text2.style.width = Math.floor(ran01 * 0.5).toString() + "%";

    if (j < 33) {
      let filterFreq = map(ran01, 10, 80, 33, 2500);
      let filterWidth = map(ran02, 10, 80, 50, 90);
      filter.set(filterFreq, filterWidth);
      soundFx.rate(Math.random() * 3.33 + 0.33);
      soundFx.amp(5);
      soundFx.play();
    }

    setTimeout(() => window.requestAnimationFrame(textGlitch), n.next().value);
  } else {
    text1.innerHTML = temp3.join('');
    text1.style.fontSize = "5rem";
    text1.style.width = "50%";
    text2.innerHTML = temp4.join('');
    text2.style.fontSize = "5rem";
    text2.style.width = "50%";

    filter.set(1200, 10);
    filter.disconnect()
    reverb.process(soundFx, 2, 1.0);
    reverb.set(5, 1.00)
    soundFx.connect();
    soundFx.rate(0.5);
    soundFx.play();
  }
}
setTimeout(() => startSide(), 5500);
function startSide() {

  box1.style.width = "0%";
  box1.style.height = "0%";
  box2.style.width = "0%";
  box2.style.height = "0%";
}
