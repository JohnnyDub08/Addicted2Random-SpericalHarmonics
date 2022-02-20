var dummy = 0;
window.readFile = function(input) {
    let file = input.files[0];
    let fileReader = new FileReader();
    fileReader.readAsText(file);
    fileReader.onload = function () {
        console.log(fileReader.result);
        let preset = JSON.parse(fileReader.result);
        loadFromFile(preset);
    };
    fileReader.onerror = function () {
        console.error(fileReader.error);
    };
}

window.loadFromFile = function (preset) {
    m0Slider.value = preset.m0Slider;
    m1Slider.value = preset.m1Slider;
    m2Slider.value = preset.m2Slider;
    m3Slider.value = preset.m3Slider;
    m4Slider.value = preset.m4Slider;
    m5Slider.value = preset.m5Slider;
    m6Slider.value = preset.m6Slider;
    m7Slider.value = preset.m7Slider;
    smoothSlider.value = preset.smoothSlider
    smoothSliderM0.value = preset.smoothSliderM0;
    smoothSliderM2.value = preset.smoothSliderM2;
    smoothSliderM4.value = preset.smoothSliderM4;
    smoothSliderM6.value = preset.smoothSliderM6;
    morphSlider.value = preset.morphSlider;
    spaceSlider.value = preset.spaceSlider;
    morphCheck.checked = preset.morphCheck;
    rotateSliderX.value = preset.rotateSliderX;
    rotateSliderY.value = preset.rotateSliderY;
    rotateSliderZ.value = preset.rotateSliderZ;
    rotateCheck.checked = preset.rotateCheck;
    lightCheck.checked = preset.lightCheck;
    peakCheck.checked = preset.peakCheck;
    spaceCheck.checked = preset.spaceCheck.checked;
    resCheck.checked = preset.resCheck.checked;
    strenghtSliderm0.value = preset.strenghtSliderm0;
    strenghtSliderm2.value = preset.strenghtSliderm2;
    strenghtSliderm4.value = preset.strenghtSliderm4;
    strenghtSliderm6.value = preset.strenghtSliderm6;
}

export {dummy};