import anime from '../js/anime.js';

let elements = document.querySelectorAll('.button');
let elements2 = document.querySelectorAll('.row');
let elements3 = document.querySelectorAll('.buttons');
let elements4 = document.querySelectorAll('.schrift');
let elements5 = document.querySelectorAll('.el');

export default function sweep() {
    anime({
        targets: [elements5, elements, elements2, elements3, elements4],
        translateX: [-233, 0],
        rotate: [90, 0],
        //delay: anime.stagger(50, { grid: [42, 2], easing: 'easeOutInElastic', from: 'center' })
    });
}