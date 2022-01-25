'use strict';
var sidebar = false; // Für Audio Visual P5 an aus
let bar = 0;
function openNav() {
  let widthRight = "333px";
  switch (bar) {
    case 0:
      document.getElementById("leftSidebar").style.width = widthRight;
      document.getElementById("arrow").style.marginLeft = widthRight;
      document.getElementById("leftSidebar").style.opacity = "85%";
      document.getElementById("arrow").innerHTML = "<-";
      document.getElementById("arrow").style.opacity = "100%";
      sidebar = true;
      bar++;
      break;
    default:
      document.getElementById("leftSidebar").style.width = "0";
      document.getElementById("arrow").style.marginLeft = "0";
      document.getElementById("leftSidebar").style.opacity = "0%";
      document.getElementById("arrow").innerHTML = "->";
      document.getElementById("arrow").style.opacity = "33%";
      sidebar = false;
      bar = 0;
  }
}