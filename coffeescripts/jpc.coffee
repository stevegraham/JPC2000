audioContext = new webkitAudioContext
class AudioPlayer
  constructor: (file) ->
    reader = new FileReader
    self   = this

    reader.onload = (event) =>
      onsuccess        = (buffer) -> self.buffer = buffer
      onerror          = -> alert 'Unsupported file format'

      audioContext.decodeAudioData event.target.result, onsuccess, onerror

    reader.readAsArrayBuffer(file)

  play: ->
    if @buffer
      @source        = audioContext.createBufferSource()
      @source.buffer = @buffer
      @source.connect audioContext.destination
      @source.noteOn 0

  stop: ->
    if @buffer && @source
      @source.noteOff 0

$(document).ready ->
  $('button').bind 'dragover', (event) ->
    event.preventDefault()
    event.stopImmediatePropagation()

  $('button').bind 'dragenter', (event) ->
    event.preventDefault()
    event.stopImmediatePropagation()

  $('button').mousedown (event) ->
    event.preventDefault()

    if event.target.audioPlayer
      event.target.audioPlayer.play()

  $('button').mouseup (event) ->
    event.preventDefault()

    if event.target.audioPlayer
      event.target.audioPlayer.stop()


  $('button').bind 'drop', (event) ->
    event.preventDefault()
    target = event.target
    file   = event.originalEvent.dataTransfer.files[0]

    target.audioPlayer = new AudioPlayer file




