(function() {

  $(document).ready(function() {
    $('button').bind('dragover', function(event) {
      event.preventDefault();
      return event.stopImmediatePropagation();
    });
    $('button').bind('dragenter', function(event) {
      event.preventDefault();
      return event.stopImmediatePropagation();
    });
    $('button').mousedown(function(event) {
      event.preventDefault();
      if (event.target.source) return event.target.source.noteOn(0);
    });
    $('button').mouseup(function(event) {
      event.preventDefault();
      if (event.target.source) {
        true;
        return event.target.audioContext.currentTime = 0;
      }
    });
    return $('button').bind('drop', function(event) {
      var file, reader, target;
      event.preventDefault();
      target = event.target;
      file = event.originalEvent.dataTransfer.files[0];
      reader = new FileReader();
      reader.onerror = function(error) {
        return alert('fuck!');
      };
      reader.onload = function(event) {
        var audioContext;
        audioContext = new webkitAudioContext;
        return audioContext.decodeAudioData(event.target.result, function(buffer) {
          var source;
          source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          target.source = source;
          return target.audioContext = audioContext;
        });
      };
      return reader.readAsArrayBuffer(file);
    });
  });

}).call(this);
