(function() {
  var AudioPlayer;

  AudioPlayer = (function() {

    function AudioPlayer(file) {
      var reader, self;
      reader = new FileReader;
      self = this;
      reader.onload = function(event) {
        var audioContext;
        audioContext = new webkitAudioContext;
        return audioContext.decodeAudioData(event.target.result, function(buffer) {
          var source;
          source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          return self.source = source;
        });
      };
      reader.readAsArrayBuffer(file);
    }

    AudioPlayer.prototype.play = function() {
      return this.source.noteOn(0);
    };

    return AudioPlayer;

  })();

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
      if (event.target.audioPlayer) {
        console.log(event.target.audioPlayer);
        return event.target.audioPlayer.play();
      }
    });
    $('button').mouseup(function(event) {
      event.preventDefault();
      if (event.target.source) {
        true;
        return event.target.audioContext.currentTime = 0;
      }
    });
    return $('button').bind('drop', function(event) {
      var file, target;
      event.preventDefault();
      target = event.target;
      file = event.originalEvent.dataTransfer.files[0];
      return target.audioPlayer = new AudioPlayer(file);
    });
  });

}).call(this);
