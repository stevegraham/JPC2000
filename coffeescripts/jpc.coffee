$(document).ready ->
  $(document).bind 'keypress', (event) ->
    code = String event.keyCode
    $('#' + code).trigger 'mousedown'

  class Display
    canvas = document.getElementById 'display'
    ctx    = canvas.getContext "2d"
    el     = $('#display')

    ctx.globalCompositeOperation = 'destination-over'
    ctx.strokeStyle              = '#1c211a'
    ctx.font                     = "7pt Monaco"

    ctx.fillText "1. Drag & drop MP3 files onto the pads. Tapping a pad makes it active", 0, 10
    ctx.fillText "2. Optionally click & drag on the waveform to play a portion of the audio file", 0, 25
    ctx.fillText "3. Click on the choke group LEDs to assign the active pad to a choke group", 0, 40
    ctx.fillText "4. Use the pitch fader on the left to control the playback speed of the active pad", 0, 55
    ctx.fillText "5. Record yourself. Subsequent recordings are laid over the previous pass", 0, 70

    selectionComplete = (event) ->
      if Display.audio_player
        Display.mouseOrigin = false

    el.mousedown (event) -> Display.mouseOrigin = event.offsetX

    el.mouseup   selectionComplete

    el.mouseout  selectionComplete

    el.mousemove (event) ->
      if (player = Display.audio_player) && Display.mouseOrigin
        player.startAt = Display.mouseOrigin * (player.buffer.duration / canvas.width)
        player.endAt   = event.offsetX * (player.buffer.duration / canvas.width)
        Display.draw player

    @drawSelection: (start, end) ->
      convert = (time) => (time / (@audio_player.buffer.duration / canvas.width)) - 15
      ctx.save()
      ctx.fillStyle = '#9FA697'
      ctx.fillRect convert(start), 0, convert(end) - convert(start), canvas.height
      ctx.restore()

    @draw: (@audio_player) ->
      @clear()
      @drawWaveform()
      @drawSelection @audio_player.startAt, @audio_player.endAt

    @drawWaveform: ->
      buffer        = @audio_player.buffer
      channelData   = buffer.getChannelData(0)
      frameInterval = Math.floor buffer.length / canvas.width
      posX          = 0
      i             = 0

      ctx.lineTo canvas.width, 0
      ctx.beginPath()
      ctx.moveTo posX, canvas.height / 2

      while i < buffer.length
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
        @source.playbackRate.value = @playbackRate
        @source.noteGrainOn 0, @startAt || 0, (@endAt - @startAt) || @buffer.duration
        @triggerView()

    stop: ->
      if @buffer && @source
        @source.noteOff 0
        window.clearTimeout @timer
        @view.lightOff

    getPlaybackRate: -> @source.playbackRate.value if @source

    setPlaybackRate: (rate) ->
      if @source
        @playbackRate = rate
        @source.playbackRate.value = rate

    computedDuration: -> (((@endAt - @startAt) || @buffer.duration) / @getPlaybackRate()) * 1000

    triggerView: ->
      @view.lightOff()
      @view.lightOn()
      window.clearTimeout @timer
      Display.draw this
      timeOut = @computedDuration()
      @timer  = window.setTimeout @view.lightOff, timeOut

    load_file: (file) ->
      reader = new FileReader
      self   = this

      reader.onload = (event) =>
        onsuccess = (buffer) ->
          self.buffer = buffer
          Display.draw self

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
      params.select this
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

  class ParamsView extends Backbone.View
    el: '#params'

    initialize: ->
      @pitch = $('#pitch')

    enable:     -> $('#params input').attr('disabled', null)

    select: (@selector) ->
      @enable()
      $('#params input[type=radio]').removeAttr('checked')
      $('#params input[type=radio][value=' + @selector.chokeGroup + ']').attr('checked', 'checked')
      @pitch.val @selector.audio_player.getPlaybackRate()

    onchangeChoke: (event) ->
      if value = event.target.value
        @selector.chokeGroup = value

    onchangePitch: (event) ->
      @selector.audio_player.setPlaybackRate event.target.value

    events:
      'change input[type=radio]' : 'onchangeChoke'
      'change #pitch'            : 'onchangePitch'

  params = new ParamsView

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

