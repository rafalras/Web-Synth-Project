$(function () {
	console.log('audio loaded: ok');

	
	/* Check if browser supports MIDI acess*/
	
	
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({
        sysex: false  
    }).then(onMIDISuccess, onMIDIFailure);
} else {
    alert("No MIDI support. Run app in another browser (Chrome)");
}

// Checking if we have estabilishjed a connection
function onMIDISuccess(midiAccess) {
    // Successfull response
    console.log('MIDI Access Object', midiAccess);
	
	var midi = midiAccess;  // This is RAW MIDI data
	
	var inputs = midi.inputs.values();
	
	for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
		input.value.onmidimessage = onMIDIMessage;
		
	};
}

function onMIDIFailure(e) {
    // Failed response
    console.log("You have no acces to Midi devices or your browser do not support MIDI" + e);
}
	
	/*Listening on MIDI device*/
	
function onMIDIMessage(message) {
	
    data = message.data;// this gives us our [command/channel, note, velocity] data.
	
	
   console.log(data); // MIDI data [144, 63, 73]
}
	
	
	
});