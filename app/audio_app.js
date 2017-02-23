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
	function set_active_class(num) {
		var $elements_arr = $('.set').find('li');
		for (var $i = 0; $i < $elements_arr.length; $i++) {
			if ($elements_arr[$i].data('note') === num && $elements_arr[$i].hasClass('white')) {
				//				$elements_arr[$i].addClass;
			}
			else if ($elements_arr[$i].data('note') === num && $elements_arr[$i].hasClass('black')) {}
		}
	};

	function remove_active_class() {};
	for (let $i = 0; $i < $keys_array.length; $i++) {
		$(document).on('keydown', null, $keys_array[$i], function () {
			var $temp_key_id = $('[data-key=' + $keys_array[$i] + ']').data('note');
			//console.log($temp_key_id);
			osc_frequency($temp_key_id, $transposition);
			console.log($('[data-key=' + $keys_array[$i] + ']').data('key'));
			console.log($('[data-key=' + $keys_array[$i] + ']').data('note'));
		});
		$(document).on('keyup', null, $keys_array[$i], function () {
			var $frequency = 0;
			oscillator.frequency.value = $frequency;
			//console.log('up');
		});
	};
	/*Listening MIDI devices*/
	function onMIDIMessage(message) {
		var data = message.data; // this gives us our [command/channel, note, velocity] data.
		switch (data[0]) {
		case 144:
			console.log("Note ON: ", data[0], "Note ID: ", data[1], "Velocity value: ", data[2]);
			console.log(data);
			osc_frequency(data[1]);
			oscillator.connect(gainNode);
			break;
		case 128:
			console.log(data);
			console.log("NOte OFF: ", data[1]);
			oscillator.disconnect(gainNode);
			break;
		}
		//		console.log("midi message: ", message); // Array of general MIDI data 
		//		console.log("MIDI message: ", data); // MIDI data [144, 63, 73], which contains 
	};
});
/*
To do:
-Odpowiedni warunek an rozłaczenie oscylatora;
-zrobienie menu wyboru urządzenia;
-alert dla urządzeń poniżej danej rozdzielczości;
-(dodac klasy do nacisnietego klawisza)
-eventy na klawiatury komputerowe!
- zrobić slidery;
-[wizualizacje w tle];



*/