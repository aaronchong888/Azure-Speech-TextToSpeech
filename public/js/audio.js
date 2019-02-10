window.addEventListener('load', init, false);
function init() {
    try { // Fix up for prefixing
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        console.log('Init completed.');
    }
    catch(e) {
        alert('Web Audio API is not supported in this browser!');
    }
}

function playSound(){
    var request = new XMLHttpRequest();
    var target_text = $('#inputText').val();
    var is_neural = $('#checkbox').is(':checked'); 
    console.log(is_neural);
    console.log(typeof is_neural);
    var TARGET_URL = "/generate?text=" + target_text + "&neural=" + is_neural;
    request.open('GET', TARGET_URL, true );
    request.responseType = 'arraybuffer';
    request.onload = function() {
        var context = new AudioContext();
        var audioSource = context.createBufferSource();
        audioSource.connect(context.destination);
        context.decodeAudioData(request.response, function(res) {
            audioSource.buffer = res;
            audioSource.start(0);
        });
    }
    request.send();
}