'use strict';
let saveFile = () => {
    let data = {
        m0Slider: m0Slider.value,
        m1Slider: m1Slider.value,
        m2Slider: m2Slider.value,
        m3Slider: m3Slider.value,
        m4Slider: m4Slider.value,
        m5Slider: m5Slider.value,
        m6Slider: m6Slider.value,
        m7Slider: m7Slider.value,
        smoothSlider: smoothSlider.value,
        smoothSliderM0: smoothSliderM0.value,
        smoothSliderM2: smoothSliderM2.value,
        smoothSliderM4: smoothSliderM4.value,
        smoothSliderM6: smoothSliderM6.value,
        morphSlider: morphSlider.value,
        spaceSlider: spaceSlider.value,
        morphCheck: morphCheck.checked,
        rotateSliderX: rotateSliderX.value,
        rotateSliderY: rotateSliderY.value,
        rotateSliderZ: rotateSliderZ.value,
        rotateCheck: rotateCheck.checked,
        lightCheck: lightCheck.checked,
        peakCheck: peakCheck.checked,
        spaceCheck: spaceCheck.checked,
        resCheck: resCheck.checked,
        strenghtSliderm0: strenghtSliderm0.value,
        strenghtSliderm2: strenghtSliderm2.value,
        strenghtSliderm4: strenghtSliderm4.value,
        strenghtSliderm6: strenghtSliderm6.value
    }
    let dataString = JSON.stringify(data);   // Unstring => JSON.parse(data);
    // Convert the text to BLOB.
    const textToBLOB = new Blob([dataString], { type: 'text/plain' });
    const sFileName = 'preset.txt';	   // The file to save the data.

    let newLink = document.createElement("a");
    newLink.download = sFileName;

    if (window.webkitURL != null) {
        newLink.href = window.webkitURL.createObjectURL(textToBLOB);
    }
    else {
        newLink.href = window.URL.createObjectURL(textToBLOB);
        newLink.style.display = "none";
        document.body.appendChild(newLink);
    }

    newLink.click();
}