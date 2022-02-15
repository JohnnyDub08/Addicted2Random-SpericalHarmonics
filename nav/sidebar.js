import sweep from "./anim.js";

'use strict';
export var sidebar = false; // Für Audio Visual P5 an aus
let bar = 0;
window.openNav = function () {
  let widthRight = "333px";
  switch (bar) {
    case 0:
      sweep();
      document.getElementById("leftSidebar").style.width = widthRight;
      document.getElementById("arrow").style.marginLeft = widthRight;
      document.getElementById("leftSidebar").style.opacity = "85%";
      document.getElementById("arrow").innerHTML = "<-";
      sidebar = true;
      bar++;
      break;
    default:
      document.getElementById("leftSidebar").style.width = "0";
      document.getElementById("arrow").style.marginLeft = "0px";
      document.getElementById("leftSidebar").style.opacity = "33%";
      document.getElementById("arrow").innerHTML = "->";
      sidebar = false;
      bar = 0;
  }
}