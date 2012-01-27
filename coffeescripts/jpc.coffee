$(document).ready ->
  $(document).bind 'keypress', (event) ->
    code = String event.keyCode
    $('#' + code).trigger 'mousedown'

  audioContext = new webkitAudioContext

  class AudioPlayer
    constructor: ->

    play: ->
      if @buffer
        @source        = audioContext.createBufferSource()
        @source.buffer = @buffer
        @source.connect audioContext.destination
        @source.noteOn 0

    stop: ->
      if @buffer && @source
        @source.noteOff 0

    load_file: (file) ->
      reader = new FileReader
      self   = this

      reader.onload = (event) =>
        onsuccess = (buffer) -> self.buffer = buffer
        onerror   = -> alert 'Unsupported file format'

        audioContext.decodeAudioData event.target.result, onsuccess, onerror

      reader.readAsArrayBuffer(file)


  class PadView extends Backbone.View
    initialize: ->
      @audio_player = new AudioPlayer

    triggerSample: ->
      @audio_player.stop()
      @audio_player.play()

    loadSample: (event) ->
      target = event.target
      file   = event.originalEvent.dataTransfer.files[0]

      @audio_player.load_file(file)
      event.preventDefault()

    stopPropagation: (event) ->
      event.preventDefault()
      event.stopImmediatePropagation()

    events:
      'dragover'  : 'stopPropagation'
      'dragover'  : 'stopPropagation'
      'mousedown' : 'triggerSample'
      'drop'      : 'loadSample'

  $('#pads button').each (index,element) ->
    new PadView el: element

