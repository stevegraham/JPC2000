(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  $(document).ready(function() {
    var AudioPlayer, Display, PadView, ParamsView, Sequencer, TransportView, audioContext, params;
    $(document).bind('keypress', function(event) {
      var code;
      code = String(event.keyCode);
      return $('#' + code).trigger('mousedown');
    });
    Display = (function() {
      var canvas, ctx, el, selectionComplete;

      function Display() {}

      canvas = document.getElementById('display');

      ctx = canvas.getContext("2d");

      el = $('#display');

      ctx.globalCompositeOperation = 'destination-over';

      ctx.strokeStyle = '#1c211a';

      selectionComplete = function(event) {
        if (Display.audio_player) return Display.mouseOrigin = false;
      };

      el.mousedown(function(event) {
        return Display.mouseOrigin = event.offsetX;
      });

      el.mouseup(selectionComplete);

      el.mouseout(selectionComplete);

      el.mousemove(function(event) {
        var player;
        if ((player = Display.audio_player) && Display.mouseOrigin) {
          player.startAt = Display.mouseOrigin * (player.buffer.duration / canvas.width);
          player.endAt = event.offsetX * (player.buffer.duration / canvas.width);
          return Display.draw(player);
        }
      });

      Display.drawSelection = function(start, end) {
        var convert,
          _this = this;
        convert = function(time) {
          return (time / (_this.audio_player.buffer.duration / canvas.width)) - 15;
        };
        ctx.save();
        ctx.fillStyle = '#9FA697';
        ctx.fillRect(convert(start), 0, convert(end) - convert(start), canvas.height);
        return ctx.restore();
      };

      Display.draw = function(audio_player) {
        this.audio_player = audio_player;
        this.clear();
        this.drawWaveform();
        return this.drawSelection(this.audio_player.startAt, this.audio_player.endAt);
      };

      Display.drawWaveform = function() {
        var buffer, channelData, float, frameInterval, i, posX;
        buffer = this.audio_player.buffer;
        channelData = buffer.getChannelData(0);
        frameInterval = Math.floor(buffer.length / canvas.width);
        posX = 0;
        i = 0;
        ctx.lineTo(canvas.width, 0);
        ctx.beginPath();
        ctx.moveTo(posX, canvas.height / 2);
        while (i < buffer.length) {
          float = channelData[i];
          i += frameInterval;
          ctx.lineTo(++posX, (float * 40) + (canvas.height / 2));
          ctx.lineTo(posX, -(float * 40) + (canvas.height / 2));
        }
        return ctx.stroke();
      };

      Display.clear = function() {
        return ctx.clearRect(0, 0, canvas.width, canvas.height);
      };

      return Display;

    })();
    Sequencer = (function() {

      function Sequencer() {
        var _this = this;
        this.tracks = [];
        this.timers = [];
        this.position = 0;
        $('#pads button').bind('mousedown', function(event) {
          var timeDelta;
          if (_this.recording) {
            timeDelta = new Date().getTime() - _this.timeStamp;
            return _this.current_track.push([timeDelta, event.target]);
          }
        });
      }

      Sequencer.prototype.record = function() {
        this.timeStamp = new Date().getTime();
        this.current_track = [];
        this.tracks.push(this.current_track);
        this.play();
        return this.recording = true;
      };

      Sequencer.prototype.play = function() {
        if (this.tracks.length !== 0) {
          this.timers = this.tracks.reduce(function(a, b) {
            return a.concat(b);
          });
          this.timers = this.timers.map(function(pair, index) {
            var func;
            func = function() {
              return $(pair[1]).trigger('mousedown');
            };
            return window.setTimeout(func, pair[0]);
          });
          return this.recording = false;
        }
      };

      Sequencer.prototype.stop = function() {
        this.recording = false;
        this.timers.map(function(timer) {
          return window.clearTimeout(timer);
        });
        return this.timers = [];
      };

      Sequencer.prototype.undo = function() {
        return this.tracks.pop();
      };

      return Sequencer;

    })();
    audioContext = new webkitAudioContext;
    AudioPlayer = (function() {

      function AudioPlayer(view) {
        this.view = view;
      }

      AudioPlayer.prototype.play = function() {
        if (this.buffer) {
          this.source = audioContext.createBufferSource();
          this.source.buffer = this.buffer;
          this.source.connect(audioContext.destination);
          this.source.playbackRate.value = this.playbackRate;
          this.source.noteGrainOn(0, this.startAt || 0, (this.endAt - this.startAt) || this.buffer.duration);
          return this.triggerView();
        }
      };

      AudioPlayer.prototype.stop = function() {
        if (this.buffer && this.source) {
          this.source.noteOff(0);
          window.clearTimeout(this.timer);
          return this.view.lightOff;
        }
      };

      AudioPlayer.prototype.getPlaybackRate = function() {
        if (this.source) return this.source.playbackRate.value;
      };

      AudioPlayer.prototype.setPlaybackRate = function(rate) {
        if (this.source) {
          this.playbackRate = rate;
          return this.source.playbackRate.value = rate;
        }
      };

      AudioPlayer.prototype.triggerView = function() {
        var timeOut;
        this.view.lightOff();
        this.view.lightOn();
        window.clearTimeout(this.timer);
        Display.draw(this);
        timeOut = (this.buffer.length / this.buffer.sampleRate) * 1000;
        return this.timer = window.setTimeout(this.view.lightOff, timeOut);
      };

      AudioPlayer.prototype.load_file = function(file) {
        var reader, self,
          _this = this;
        reader = new FileReader;
        self = this;
        reader.onload = function(event) {
          var onerror, onsuccess;
          onsuccess = function(buffer) {
            self.buffer = buffer;
            return Display.draw(self);
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
        this.lightOff = __bind(this.lightOff, this);
        PadView.__super__.constructor.apply(this, arguments);
      }

      PadView.prototype.initialize = function() {
        this.el = $(this.el);
        return this.audio_player = new AudioPlayer(this);
      };

      PadView.prototype.lightOn = function() {
        return this.el.addClass('active pressed');
      };

      PadView.prototype.lightOff = function() {
        return this.el.removeClass('active');
      };

      PadView.prototype.triggerSample = function() {
        params.select(this);
        if (this.chokeGroup) $('#pads button').trigger('choke', this.chokeGroup);
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
        return event.preventDefault();
      };

      PadView.prototype.onchoke = function(event, groupId) {
        if (this.chokeGroup) {
          if (groupId === this.chokeGroup) {
            return this.lightOff() && this.audio_player.stop();
          }
        }
      };

      PadView.prototype.resetAnimation = function() {
        return this.el.removeClass('pressed');
      };

      PadView.prototype.events = {
        'dragover': 'stopPropagation',
        'dragover': 'stopPropagation',
        'mousedown': 'triggerSample',
        'drop': 'loadSample',
        'choke': 'onchoke',
        'webkitAnimationEnd': 'resetAnimation'
      };

      return PadView;

    })(Backbone.View);
    ParamsView = (function(_super) {

      __extends(ParamsView, _super);

      function ParamsView() {
        ParamsView.__super__.constructor.apply(this, arguments);
      }

      ParamsView.prototype.el = '#params';

      ParamsView.prototype.initialize = function() {
        return this.pitch = $('#pitch');
      };

      ParamsView.prototype.enable = function() {
        return $('#params input').attr('disabled', null);
      };

      ParamsView.prototype.select = function(selector) {
        this.selector = selector;
        this.enable();
        $('#params input[type=radio]').removeAttr('checked');
        $('#params input[type=radio][value=' + this.selector.chokeGroup + ']').attr('checked', 'checked');
        return this.pitch.val(this.selector.audio_player.getPlaybackRate());
      };

      ParamsView.prototype.onchangeChoke = function(event) {
        var value;
        if (value = event.target.value) return this.selector.chokeGroup = value;
      };

      ParamsView.prototype.onchangePitch = function(event) {
        return this.selector.audio_player.setPlaybackRate(event.target.value);
      };

      ParamsView.prototype.events = {
        'change input[type=radio]': 'onchangeChoke',
        'change #pitch': 'onchangePitch'
      };

      return ParamsView;

    })(Backbone.View);
    params = new ParamsView;
    TransportView = (function(_super) {

      __extends(TransportView, _super);

      function TransportView() {
        TransportView.__super__.constructor.apply(this, arguments);
      }

      TransportView.prototype.el = '#transport';

      TransportView.prototype.initialize = function() {
        return this.sequencer = new Sequencer;
      };

      TransportView.prototype.play = function() {
        return this.sequencer.play();
      };

      TransportView.prototype.stop = function() {
        return this.sequencer.stop();
      };

      TransportView.prototype.record = function() {
        return this.sequencer.record();
      };

      TransportView.prototype.undo = function() {
        return this.sequencer.undo();
      };

      TransportView.prototype.events = {
        'click #record': 'record',
        'click #play': 'play',
        'click #stop': 'stop',
        'click #undo': 'undo'
      };

      new TransportView;

      return TransportView;

    })(Backbone.View);
    return $('#pads button').each(function(index, element) {
      return new PadView({
        el: $(element)
      });
    });
  });

}).call(this);
