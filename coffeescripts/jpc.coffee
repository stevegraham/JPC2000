$(document).ready ->
  $(document).bind 'keypress', (event) ->
    code = String event.keyCode
    $('#' + code).trigger 'mousedown'

  class Display
    canvas = document.getElementById 'display'
    ctx    = canvas.getContext "2d"

    $('#display').click (event) ->
      if Display.buffer
        time = event.offsetX * (Display.buffer.duration / canvas.width)

    ctx.strokeStyle = '#1c211a'

    @drawWaveform: (@audio_player) ->
      @clear()
      @buffer        = @audio_player.buffer
      channelData   = @buffer.getChannelData(0)
      frameInterval = Math.floor @buffer.length / canvas.width
      posX          = 0
      i             = 0

      ctx.lineTo canvas.width, 0
      ctx.beginPath()
      ctx.moveTo posX, canvas.height / 2

      while i < @buffer.length
        float = channelData[i]
        i    += frameInterval

        ctx.lineTo ++posX,  (float *40) + (canvas.height /2)
        ctx.lineTo posX,   -(float *40) + (canvas.height /2)

      ctx.stroke()




    @clear: -> ctx.clearRect 0, 0, canvas.width, canvas.height

  class Sequencer
    constructor: ->
      @tracks   = []
      @timers   = []
      @position = 0

      $('#pads button').bind 'mousedown', (event) =>
        if @recording
          timeDelta = new Date().getTime() - @timeStamp
          @current_track.push [timeDelta, event.target]


    record: ->
      @timeStamp     = new Date().getTime()
      @current_track = []
      @tracks.push @current_track

      @play()
      @recording     = true

    play: ->
      if @tracks.length != 0
        @timers = @tracks.reduce (a,b) -> a.concat b
        @timers = @timers.map (pair, index) ->
          func = -> $(pair[1]).trigger 'mousedown'
          window.setTimeout func, pair[0]

        @recording = false

    stop: ->
      @recording = false
      #$('#pads button').unbind 'mousedown'
      @timers.map (timer) -> window.clearTimeout timer
      @timers = []

    undo: -> @tracks.pop()

  audioContext = new webkitAudioContext

  class AudioPlayer
    constructor: (@view)->

    play: ->
      if @buffer
        @source        = audioContext.createBufferSource()
        @source.buffer = @buffer
        @source.connect audioContext.destination
        @source.noteOn 0
        @triggerView()

    stop: ->
      if @buffer && @source
        @source.noteOff 0
        window.clearTimeout @timer
        @view.lightOff


    triggerView: ->
      @view.lightOff()
      @view.lightOn()
      window.clearTimeout @timer
      Display.drawWaveform this
      timeOut =  (@buffer.length / @buffer.sampleRate) * 1000
      @timer  = window.setTimeout @view.lightOff, timeOut

    load_file: (file) ->
      reader = new FileReader
      self   = this

      reader.onload = (event) =>
        onsuccess = (buffer) ->
          self.buffer = buffer
          Display.drawWaveform self

        onerror   = -> alert 'Unsupported file format'

        audioContext.decodeAudioData event.target.result, onsuccess, onerror

      reader.readAsArrayBuffer(file)


  class PadView extends Backbone.View
    initialize: ->
      @el           = $(@el)
      @audio_player = new AudioPlayer this

    lightOn:  -> @el.addClass('active pressed')

    lightOff: => @el.removeClass 'active'

    triggerSample: ->
      chokeGroup.select(this)
      $('#pads button').trigger('choke', @chokeGroup) if @chokeGroup
      @audio_player.stop()
      @audio_player.play()

    loadSample: (event) ->
      target = event.target
      file   = event.originalEvent.dataTransfer.files[0]

      @audio_player.load_file file
      event.preventDefault()

    stopPropagation: (event) ->
      event.preventDefault()

    onchoke: (event, groupId)->
      if @chokeGroup
         @lightOff() && @audio_player.stop() if groupId == @chokeGroup

    resetAnimation: -> @el.removeClass('pressed')

    events:
      'dragover'           : 'stopPropagation'
      'dragover'           : 'stopPropagation'
      'mousedown'          : 'triggerSample'
      'drop'               : 'loadSample'
      'choke'              : 'onchoke'
      'webkitAnimationEnd' : 'resetAnimation'


  class ChokeGroupView extends Backbone.View
    el: '#choke_group'

    initialize: -> @el = $(@el)
    enable:     -> @el.attr('disabled', null)
    disable:    -> @el.attr('disabled', null)

    select: (@selector) ->
      @enable()
      @el.val @selector.chokeGroup


    onchange: (event) ->
      if value = event.target.value
        @selector.chokeGroup = value

    events:
      'change': 'onchange'


  chokeGroup = new ChokeGroupView

  class TransportView extends Backbone.View
    el: '#transport'

    initialize: ->
      @sequencer = new Sequencer

    play:   -> @sequencer.play()

    stop:   -> @sequencer.stop()

    record: -> @sequencer.record()

    undo:   -> @sequencer.undo()

    events:
      'click #record' : 'record'
      'click #play'   : 'play'
      'click #stop'   : 'stop'
      'click #undo'   : 'undo'

    new TransportView

  $('#pads button').each (index,element) -> new PadView el: $(element)

