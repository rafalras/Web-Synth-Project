$(function () {
	/*					SETTING MIDI CONNECTION 				*/
	console.log('audio loaded: ok');
	console.log('web js loaded: ok');
	/* Check if browser supports MIDI acess*/
	if (navigator.requestMIDIAccess) {
		navigator.requestMIDIAccess({
			sysex: false
		}).then(onMIDISuccess, onMIDIFailure);
	}
	else {
		alert("No MIDI support. Run app in another browser (Chrome)");
	}
	// Checking if we have estabilished a connection
	function onMIDISuccess(midiAccess) {
		// Successfull response
		console.log('MIDI Access Object', midiAccess);
		var midi = midiAccess; // This is RAW MIDI data
		var inputs = midi.inputs.values(); // Iterator
		for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
			console.log(input.value);
			input.value.onmidimessage = onMIDIMessage;
			//console.log(onMIDIMessage());
		};
	}

	function onMIDIFailure(e) {
		// Failed response
		console.log("You have no access to Midi devices or your browser do not support MIDI" + e);
		// zrobić stronę/ style do body, aby zakryc/przyciemnić zawartość/ 
	}
	/*					AUDIO CREATION							*/
	/*Audio variables*/
	var $transposition = 0;
	$("input[name='basic_wave']").click(function (event) {
		var $wave_type = 'sine;'
		$wave_type = this.value;
		change_type($wave_type);
	});
	/*Setting up AudioContext*/
	var AudioContext = (window.AudioContext || window.webkitAudioContext);
	var audioCtx = new AudioContext();
	var tuna = new Tuna(audioCtx); 
	/*Creating oscillator*/
	var oscillator = audioCtx.createOscillator();

	function change_type(type) {
		oscillator.type = type;
	}
	oscillator.start();
	/*Setting oscilator frequency by events*/
	function osc_frequency(note, $transposition) {
		var $frequency = 440 * Math.pow(2, (note + $transposition - 69) / 12);
		oscillator.frequency.value = $frequency;
		return $frequency;
	};
	/*					Effects rack				*/
	/*Filter*/
	var filter = new tuna.MoogFilter({
		cutoff: 0.065, //0 to 1
		resonance: 3.5, //0 to 4
		bufferSize: 4096 //256 to 16384
	});
	/*Reverb*/
//	var reverb = new tuna.Convolver({
//		highCut: 22050, //20 to 22050
//		lowCut: 20, //20 to 22050
//		dryLevel: 1, //0 to 1+
//		wetLevel: 1, //0 to 1+
//		level: 1, //0 to 1+, adjusts total output of both wet and dry
//		impulse: "http://127.0.0.1:8887/convolution_files/02-7%20Plate%20Reverbs-00.wav", //the path to your impulse response
//		bypass: 0
//	});
	/*Delay*/
	var delay = new tuna.Delay({
		feedback: 0.45, //0 to 1+
		delayTime: 150, //1 to 10000 milliseconds
		wetLevel: 1, //0 to 1+
		dryLevel: 1, //0 to 1+
		cutoff: 2000, //cutoff frequency of the built in lowpass-filter. 20 to 22050
		bypass: 0
	});
	/*Phaser effect */
	var phaser = new tuna.Phaser({
		rate: 0.5, //0.01 to 8 is a decent range, but higher values are possible
		depth: 1, //0 to 1
		feedback: 0.8, //0 to 1+
		stereoPhase: 30, //0 to 180
		baseModulationFrequency: 700, //500 to 1500
		bypass: 0
	});
	/*Connection between modules*/
	var gainNode = audioCtx.createGain();
	gainNode.gain.value = 0.7;
	var speakers = audioCtx.destination;
	filter.connect(delay);
	//reverb.connect(delay);
	delay.connect(phaser);
	phaser.connect(gainNode);
	gainNode.connect(speakers);
	
	
	
	
	
	
	/*				TONE CONTROL				*/
	/*Mouse events*/
	$('.set').find('li').on('mousedown', function () {
		var $temp = 0;
		$temp = $(this).data('note');
		osc_frequency($temp, $transposition);
		oscillator.connect(filter.input);
		//console.log($frequency); Frequency check
		console.log(oscillator.frequency.value);
	});
	$('.set').find('li').on('mouseup', function () {
		oscillator.disconnect(filter.input);
	});
	/*Hardware keyboard events*/
	function set_active_class(key_id) {
		
		var $temp_element = $('[data-key=' + key_id + ']');
		var $temp_element1 = $('[data-note=' + key_id + ']');
		if ($temp_element.hasClass('white')) {
			$temp_element.addClass('white_active');
		}
		else {
			$temp_element.addClass('black_active');
		};
		if ($temp_element1.hasClass('white')) {
			$temp_element1.addClass('white_active');
		}
		else {
			$temp_element1.addClass('black_active');
		}
	};

	function remove_active_class(key_id) {
		var $temp_element = $('[data-key=' + key_id + ']');
		var $temp_element1 = $('[data-note=' + key_id + ']');
		$temp_element.removeClass('white_active').removeClass('black_active');
		$temp_element1.removeClass('white_active').removeClass('black_active');
	};
	/*Hardware keyboard listening events*/
	var kbd_counter = 0;
	var $keys_array = ['q', '2', 'w', '3', 'e', 'r', '5', 't', '6', 'y', '7', 'u'];
	for (let $i = 0; $i < $keys_array.length; $i++) {
		$(document).on('keydown', null, $keys_array[$i], function () {
			var $key_element = $('[data-key=' + $keys_array[$i] + ']');
			if (!$key_element.hasClass('white_active') && !$key_element.hasClass('black_active')) {
				kbd_counter++;
			};
			var $temp_key_id = $key_element.data('note');
			osc_frequency($temp_key_id, $transposition);
			console.log(osc_frequency($temp_key_id, $transposition));
			console.log('counter: ', kbd_counter);
			oscillator.connect(filter.input);
			set_active_class($key_element.data('key'));
		});
		$(document).on('keyup', null, $keys_array[$i], function () {
			kbd_counter--;
			console.log('counter: ', kbd_counter);
			if (kbd_counter == 0) {
				oscillator.disconnect(filter.input);
			};
			remove_active_class($('[data-key=' + $keys_array[$i] + ']').data('key'));
		});
	};
	/*Listening MIDI devices*/
		var $midi_counter = 0;
	function onMIDIMessage(message) {
		var data = message.data; // this gives us our [command/channel, note, velocity] data.
		if (data[0] == 144) {
			console.log("Note ON: ", data[0], "Note ID: ", data[1], "Velocity value: ", data[2]);
			console.log("key id: ", data[1]);
			osc_frequency(data[1], $transposition);
			oscillator.connect(filter.input);
			$midi_counter++;
			set_active_class(data[1]);
				console.log($midi_counter);
		}else if (data[0] == 128) {
			console.log(data);
			console.log("key id: ", data[1]);
			console.log("NOte OFF: ", data[1]);
			remove_active_class(data[1]);
			$midi_counter--;
			if ($midi_counter == 0) {
				oscillator.disconnect(filter.input);
			}
				console.log($midi_counter);
		}
//		
	};
});
/*BACKGROUND VISUALISATION*/
//var analyser = audioContext.createAnalyser();
//var oscilloscope = new Oscilloscope(audioContext, analyser, 100%, 100%);
//gainNode.connect(oscilloscope.analyser);
/*
To do:
-zrobienie menu wyboru urządzenia;
-alert dla urządzeń poniżej danej rozdzielczości;
-zrobić slidery;
-[wizualizacje w tle];



*/