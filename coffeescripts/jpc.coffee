$(document).ready ->
  $(document).bind 'keypress', (event) ->
    code = String event.keyCode
    $('#' + code).trigger 'mousedown'

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


    triggerView: ->
      @view.lightOn()
      window.clearTimeout @timer
      timeOut =  (@buffer.length / @buffer.sampleRate) * 1000
      @timer  = window.setTimeout @view.lightOff, timeOut

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
      @el           = $(@el)
      @audio_player = new AudioPlayer this

    lightOn:  -> @el.addClass 'active'

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
      event.stopImmediatePropagation()

    onchoke: (event, groupId)->
      if @chokeGroup
        @audio_player.stop() if groupId == @chokeGroup

    events:
      'dragover'  : 'stopPropagation'
      'dragover'  : 'stopPropagation'
      'mousedown' : 'triggerSample'
      'drop'      : 'loadSample'
      'choke'     : 'onchoke'


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

  $('#pads button').each (index,element) -> new PadView el: $(element)

