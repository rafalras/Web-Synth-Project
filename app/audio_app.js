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
	var $filter_freq = 0;
	/*Setting up AudioContext*/
	var AudioContext = (window.AudioContext || window.webkitAudioContext);
	var audioCtx = new AudioContext();
	var tuna = new Tuna(audioCtx);
	/*Creating oscillator*/
	var oscillator = audioCtx.createOscillator();
	var oscillator1 = audioCtx.createOscillator();
	oscillator1.detune.value = 100;
	oscillator.type = 'sawtooth';
	oscillator1.type = 'triangle';
	oscillator.start();
	oscillator1.start();

	function change_type(type) {
		oscillator.type = type;
	};

	function change_type1(type) {
		oscillator1.type = type;
	}
	$("input[name='basic_wave']").click(function (event) {
		var $wave_type = 'sawtooth';
		$wave_type = this.value;
		change_type($wave_type);
	});
	$("input[name='basic_wave1']").click(function (event) {
		var $wave_type = 'triangle'
		$wave_type = this.value;
		change_type($wave_type);
	});
	/*			POTENTIOMETERS */
	$("#slider").roundSlider({
		sliderType: "min-range"
		, handleShape: "dot"
		, value: 0.065
		, mouseScrollAction: true
		, handleSize: "+10"
		, endAngle: "+300"
		, startAngle: 299
		, width: 9
		, radius: 40
		, min: '0.002'
		, max: '1'
		, step: "0.001"
		, drag: function (args) {
			$filter_freq = args.value;
			console.log($filter_freq);
		}
		, //    change: function (args) {
		//        $filter_freq = args.value;
		//			console.log($filter_freq);
		//    }
	});
	console.log('FILTER FREQ: ', $filter_freq)
		/*Setting oscilator frequency by events*/
	function osc_frequency(note, $transposition) {
		var $frequency = 440 * Math.pow(2, (note + $transposition - 69) / 12);
		var $frequency1 = 440 * Math.pow(2, (note - 12 - 69) / 12);
		oscillator.frequency.value = $frequency;
		oscillator1.frequency.value = $frequency1;
		return $frequency;
	};
	/*					Effects rack				*/
	/*Filter*/
	var filter = new tuna.MoogFilter({
		cutoff: 0.82, //0 to 1
		resonance: 3.5, //0 to 4
		bufferSize: 1024 //256 to 16384
	});

	function filter_cutoff(num) {
		filter.cutoff = num;
	};
	$(document).on('input', '#filter_freq', function () {
		var cut_off = this.value;
		$('#cut_off').text(cut_off);
		filter_cutoff(cut_off);
	});

	function filter_resonance(num) {
		filter.resonance = num;
	};
	$(document).on('input', '#filter_reso', function () {
		var reson_freq = this.value;
		$('#resonance').text(reson_freq);
		filter_resonance(reson_freq);
	});
	/*Reverb*/
	var reverb = new tuna.Convolver({
		highCut: 22050, //20 to 22050
		lowCut: 150, //20 to 22050
		dryLevel: 1, //0 to 1+
		wetLevel: 1, //0 to 1+
		level: 1, //0 to 1 output
		impulse: "https://drive.google.com/uc?export=download&id=0BzQEQgyBPokdNy1qTmlHTnplVU0", //the path to your impulse response
		bypass: 0
	});

	function rev_wet_lev(num) {
		reverb.wetLevel = num;
	};
	$(document).on('input', '#rev_wet_lev', function () {
		var wet_lev = this.value;
		$('#reverb_wet_lev').text(wet_lev);
		rev_wet_lev(wet_lev);
	});

	function rev_filter(num) {
		reverb.lowCut = num;
		$filter_freq = num;
	};
	$(document).on('input', '#rev_low_cut', function () {
		var rev_filter_freq = this.value;
		$('#rev_filter').text(rev_filter_freq);
		rev_filter(rev_filter_freq);
	});
	/*Delay*/
	var delay = new tuna.Delay({
		feedback: 0.2, //0 to 1
		delayTime: 150, //1 to 10000 milliseconds
		wetLevel: 1, //0 to 1
		dryLevel: 1, //0 to 1
		cutoff: 400, //low-pass cutoff frequency 20 to 22000
		bypass: 0
	});

	function delay_time(num) {
		delay.delayTime = num;
	};
	$(document).on('input', '#delay_time', function () {
		var del_time = this.value;
		$('#del_time').text(del_time);
		delay_time(del_time);
	});

	function delay_feedback(num) {
		delay.feedback = num;
	};
	$(document).on('input', '#delay_feedback', function () {
		var del_feed = this.value;
		$('#del_feedback').text(del_feed);
		delay_feedback(del_feed);
	});
	/*Phaser effect */
	//console.log("phaser speed: ", ($('#phaser_speed').value / 100))
	var phaser = new tuna.Phaser({
		//rate
		depth: 0.3, //0 to 1
		feedback: 0.6, //0 to 1+
		stereoPhase: 90, //0 to 180
		baseModulationFrequency: 500, //500 to 1500
		bypass: 0
	});
	var phaser1 = new tuna.Phaser({
		//rate
		depth: 0.3, //0 to 1
		feedback: 0.6, //0 to 1
		stereoPhase: 90, //0 to 180
		baseModulationFrequency: 800, //500 to 1500
		bypass: 0
	});

	function phaser_speed(num) {
		phaser.rate = num;
		phaser1.rate = num;
	};
	$(document).on('input', '#phaser_speed', function () {
		var speed = this.value;
		$('#phase_rate').text(speed);
		phaser_speed(speed);
	});

	function phaser_depth(num) {
		phaser.depth = num;
		phaser1.depth = num;
	};
	$(document).on('input', '#phaser_depth', function () {
		var depth = this.value;
		$('#phase_dep').text(depth);
		phaser_depth(depth);
	});
	/*	Amplifier	*/
	var gainNode = audioCtx.createGain();
	gainNode.gain.value = 0.5;

	function amp_gain(num) {
		gainNode.gain.value = num;
	};
	$(document).on('input', '#amp_gain', function () {
		var gain = this.value;
		$('#volume').text(gain);
		amp_gain(gain);
	});
	/*	Connection between modules*/
	var speakers = audioCtx.destination;
	filter.connect(delay);
	reverb.connect(delay);
	delay.connect(phaser);
	phaser.connect(phaser1);
	phaser1.connect(gainNode);
	gainNode.connect(speakers);
	/*				TONE CONTROL				*/
	/*Mouse events*/
	$('.set').find('li').on('mousedown', function () {
		var $temp = 0;
		$temp = $(this).data('note');
		osc_frequency($temp - 24, $transposition);
		oscillator.connect(filter.input);
		oscillator1.connect(filter.input);
		//console.log($frequency); Frequency check
		console.log(oscillator.frequency.value);
	});
	$('.set').find('li').on('mouseup', function () {
		oscillator.disconnect(filter.input);
		oscillator1.disconnect(filter.input);
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
			var $temp_key_id = $key_element.data('note') - 24;
			console.log($temp_key_id);
			osc_frequency($temp_key_id, $transposition);
			console.log(osc_frequency($temp_key_id, $transposition));
			console.log('counter: ', kbd_counter);
			oscillator.connect(filter.input);
			oscillator1.connect(filter.input);
			set_active_class($key_element.data('key'));
		});
		$(document).on('keyup', null, $keys_array[$i], function () {
			kbd_counter--;
			console.log('counter: ', kbd_counter);
			if (kbd_counter == 0) {
				oscillator.disconnect(filter.input);
				oscillator1.disconnect(filter.input);
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
			var midi_key_id = data[1] - 24;
			console.log(data[1]);
			console.log("MIDI KEY ID: ", midi_key_id);
			osc_frequency(midi_key_id, $transposition);
			$midi_counter++;
			//			oscillator.start();
			//			oscillator.connect(gainNode);
			oscillator.connect(filter.input);
			oscillator1.connect(filter.input);
			set_active_class(data[1]);
			console.log($midi_counter);
		}
		else if (data[0] == 128) {
			console.log(data);
			console.log("key id: ", data[1]);
			console.log("NOte OFF: ", data[1]);
			remove_active_class(data[1]);
			$midi_counter--;
			if ($midi_counter == 0) {
				//				oscillator.stop();
				//				oscillator.disconnect(gainNode);
				oscillator.disconnect(filter.input);
				oscillator1.disconnect(filter.input);
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