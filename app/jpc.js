(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  $(document).ready(function() {
    var AudioPlayer, PadView, audioContext;
    $(document).bind('keypress', function(event) {
      var code;
      code = String(event.keyCode);
      return $('#' + code).trigger('mousedown');
    });
    audioContext = new webkitAudioContext;
    AudioPlayer = (function() {

      function AudioPlayer() {}

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

      AudioPlayer.prototype.load_file = function(file) {
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
        return reader.readAsArrayBuffer(file);
      };

      return AudioPlayer;

    })();
    PadView = (function(_super) {

      __extends(PadView, _super);

      function PadView() {
        PadView.__super__.constructor.apply(this, arguments);
      }

      PadView.prototype.initialize = function() {
        return this.audio_player = new AudioPlayer;
      };

      PadView.prototype.triggerSample = function() {
        this.audio_player.stop();
        return this.audio_player.play();
      };

      PadView.prototype.loadSample = function(event) {
        var file, target;
        target = event.target;
        file = event.originalEvent.dataTransfer.files[0];
        this.audio_player.load_file(file);
        return event.preventDefault();
      };

      PadView.prototype.stopPropagation = function(event) {
        event.preventDefault();
        return event.stopImmediatePropagation();
      };

      PadView.prototype.events = {
        'dragover': 'stopPropagation',
        'dragover': 'stopPropagation',
        'mousedown': 'triggerSample',
        'drop': 'loadSample'
      };

      return PadView;

    })(Backbone.View);
    return $('#pads button').each(function(index, element) {
      return new PadView({
        el: element
      });
    });
  });

}).call(this);
