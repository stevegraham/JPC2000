(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  $(document).ready(function() {
    var AudioPlayer, ChokeGroupView, PadView, audioContext, chokeGroup;
    $(document).bind('keypress', function(event) {
      var code;
      code = String(event.keyCode);
      return $('#' + code).trigger('mousedown');
    });
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
          this.source.noteOn(0);
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

      AudioPlayer.prototype.triggerView = function() {
        var timeOut;
        this.view.lightOff();
        this.view.lightOn();
        window.clearTimeout(this.timer);
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
        chokeGroup.select(this);
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
        event.preventDefault();
        return event.stopImmediatePropagation();
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
    ChokeGroupView = (function(_super) {

      __extends(ChokeGroupView, _super);

      function ChokeGroupView() {
        ChokeGroupView.__super__.constructor.apply(this, arguments);
      }

      ChokeGroupView.prototype.el = '#choke_group';

      ChokeGroupView.prototype.initialize = function() {
        return this.el = $(this.el);
      };

      ChokeGroupView.prototype.enable = function() {
        return this.el.attr('disabled', null);
      };

      ChokeGroupView.prototype.disable = function() {
        return this.el.attr('disabled', null);
      };

      ChokeGroupView.prototype.select = function(selector) {
        this.selector = selector;
        this.enable();
        return this.el.val(this.selector.chokeGroup);
      };

      ChokeGroupView.prototype.onchange = function(event) {
        var value;
        if (value = event.target.value) return this.selector.chokeGroup = value;
      };

      ChokeGroupView.prototype.events = {
        'change': 'onchange'
      };

      return ChokeGroupView;

    })(Backbone.View);
    chokeGroup = new ChokeGroupView;
    return $('#pads button').each(function(index, element) {
      return new PadView({
        el: $(element)
      });
    });
  });

}).call(this);
