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
			console.log(onMIDIMessage());
		};
	}

	function onMIDIFailure(e) {
		// Failed response
		console.log("You have no access to Midi devices or your browser do not support MIDI" + e);
	}
	/*					AUDIO CREATION							*/
	/*Audio variables*/
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
	function osc_frequency(note) {
		var $frequency = 440 * Math.pow(2, ($temp - 69) / 12);
		oscillator.frequency.value = $frequency;
	};
	/*Browser keyboard event*/
	$('.set').find('li').on('mousedown', function () {
		var $temp = 0;
		$temp = $(this).data('note');
		var $frequency = 440 * Math.pow(2, ($temp - 69) / 12);
		oscillator.frequency.value = $frequency;
		oscillator.connect(gainNode);
		//console.log($frequency); Frequency check
	});
	$('.set').find('li').on('mouseup', function () {
		oscillator.disconnect(gainNode);
	});
	/*Listening on MIDI device*/
	function onMIDIMessage(message) {
		data = message.data; // this gives us our [command/channel, note, velocity] data.
		switch (data[0]) {
		case 144:
			console.log("Note ON: ", data[1], "Note ID: ", data[2], "Velocity value: ", data[3]);
			console.log(data);
			break;
			osc_frequency(data[2]);
		case 128:
			console.log(data);
			console.log("NOte OFF: ", data[1]);
			break;
		}
		console.log("midi message: ", message); // Array of general MIDI data 
		//console.log("MIDI message: ", data); // MIDI data [144, 63, 73], which contains 
	};
});