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
	/*Setting AudioContext*/
	var AudioContext = (window.AudioContext || window.webkitAudioContext);
	var audioCtx = new AudioContext();
	/*Setting oscilator*/
	var oscillator = audioCtx.createOscillator();
	oscillator.type = 'square';
	oscillator.start();
	/*Setting temporary/debugging connection to audio destination*/
	var gainNode = audioCtx.createGain();
	var finish = audioCtx.destination;
	gainNode.gain.value = 0.5;
	gainNode.connect(finish);
	/*Setting oscilator frequency by events*/
	function osc_frequency(note, $transposition) {
		var $frequency = 440 * Math.pow(2, (note + $transposition - 69) / 12);
		oscillator.frequency.value = $frequency;
	};
	/*Browser keyboard mouse event*/
	$('.set').find('li').on('mousedown', function () {
		var $temp = 0;
		$temp = $(this).data('note');
		osc_frequency($temp, $transposition);
		oscillator.connect(gainNode);
		//console.log($frequency); Frequency check
		console.log(oscillator.frequency.value);
	});
	$('.set').find('li').on('mouseup', function () {
		oscillator.disconnect(gainNode);
	});
	/*hardware keyboard events*/
	var $keys_array = ['q', '2', 'w', '3', 'e', 'r', '5', 't', '6', 'y', '7', 'u'];

	function set_active_class(key_id) {
		var $temp_element = $('[data-key=' + key_id + ']');
		if ($temp_element.hasClass('white')) {
			$temp_element.addClass('white_active');
		}
		else {
			$temp_element.addClass('black_active');
		}
	};

	function remove_active_class(key_id) {
		var $temp_element = $('[data-key=' + key_id + ']');
		$temp_element.removeClass('white_active').removeClass('black_active');
	};
	var kbd_counter = 0;
	for (let $i = 0; $i < $keys_array.length; $i++) {
		$(document).on('keydown', null, $keys_array[$i], function () {
			var $key_element = $('[data-key=' + $keys_array[$i] + ']');
			if (!$key_element.hasClass('white_active') && !$key_element.hasClass('black_active')) {
				kbd_counter++;
			}
			var $temp_key_id = $key_element.data('note');
			osc_frequency($temp_key_id, $transposition);
			console.log('counter: ', kbd_counter);
			oscillator.connect(gainNode);
			set_active_class($key_element.data('key'));
			//			console.log('Button: ', $('[data-key=' + $keys_array[$i] + ']').data('key'));
			//			console.log('MIDI id: ', $('[data-key=' + $keys_array[$i] + ']').data('note'));
		});
		$(document).on('keyup', null, $keys_array[$i], function () {
			kbd_counter--;
			console.log('counter: ', kbd_counter);
			if (kbd_counter == 0) {
				oscillator.disconnect(gainNode);
			}
			//			var $frequency = 0;
			//			oscillator.frequency.value = $frequency;
			remove_active_class($('[data-key=' + $keys_array[$i] + ']').data('key'));
		});
	};
	/*Listening MIDI devices*/
	function onMIDIMessage(message) {
		var data = message.data; // this gives us our [command/channel, note, velocity] data.
		var midi_counter = 0;
		switch (data[0]) {
		case 144:
			console.log("Note ON: ", data[0], "Note ID: ", data[1], "Velocity value: ", data[2]);
			console.log(data);
			osc_frequency(data[1]);
			oscillator.connect(gainNode);
			midi_counter++;
			break;
		case 128:
			console.log(data);
			console.log("NOte OFF: ", data[1]);
			midi_counter--;
			if (midi_counter == 0) {
				oscillator.disconnect(gainNode);
			}
			break;
		}
		//		console.log("midi message: ", message); // Array of general MIDI data 
		//		console.log("MIDI message: ", data); // MIDI data [144, 63, 73], which contains 
	};
});
/*
To do:
-zrobienie menu wyboru urządzenia;
-alert dla urządzeń poniżej danej rozdzielczości;
-zrobić slidery;
-[wizualizacje w tle];



*/