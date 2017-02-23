$(function () {
	console.log('layout js loaded: ok');
$("#slider").roundSlider({
    sliderType: "min-range",
    handleShape: "dot",
    value: 56,
    mouseScrollAction: true,
    handleSize: "+10",
    endAngle: "+300",
    startAngle: 299,
    width: 9,
    radius: 40,

    drag: function (args) {
        // handle the drag event here
    },
    change: function (args) {
        // handle the change event here
    }
});
});