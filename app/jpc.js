(function() {
  var AudioPlayer, audioContext;

  audioContext = new webkitAudioContext;

  AudioPlayer = (function() {

    function AudioPlayer(file) {
      var reader, self,
        _this = this;
      reader = new FileReader;
      self = this;
      reader.onload = function(event) {
        var onerror, onsuccess;
        onsuccess = function(buffer) {
          return self.buffer = buffer;
        };
        onerror = function() {
          return alert('Unsupported file format');
        };
        return audioContext.decodeAudioData(event.target.result, onsuccess, onerror);
      };
      reader.readAsArrayBuffer(file);
    }

    AudioPlayer.prototype.play = function() {
      if (this.buffer) {
        this.source = audioContext.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.connect(audioContext.destination);
        return this.source.noteOn(0);
      }
    };

    AudioPlayer.prototype.stop = function() {
      if (this.buffer && this.source) return this.source.noteOff(0);
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
        event.target.audioPlayer.stop();
        return event.target.audioPlayer.play();
      }
    });
    $('button').mouseup(function(event) {});
    return $('button').bind('drop', function(event) {
      var file, target;
      event.preventDefault();
      target = event.target;
      file = event.originalEvent.dataTransfer.files[0];
      return target.audioPlayer = new AudioPlayer(file);
    });
  });

}).call(this);
