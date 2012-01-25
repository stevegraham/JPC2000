class AudioPlayer
  constructor: (file) ->
    reader = new FileReader
    self   = this

    reader.onload = (event) ->
      audioContext    = new webkitAudioContext
      audioContext.decodeAudioData event.target.result, (buffer) ->
        source        = audioContext.createBufferSource()
        source.buffer = buffer

        source.connect audioContext.destination
        self.source   = source

    reader.readAsArrayBuffer(file)

  play: ->
    this.source.noteOn 0

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
      console.log event.target.audioPlayer
      event.target.audioPlayer.play()

  $('button').mouseup (event) ->
    event.preventDefault()
    if event.target.source
      true
      event.target.audioContext.currentTime = 0



  $('button').bind 'drop', (event) ->
    event.preventDefault()
    target = event.target
    file   = event.originalEvent.dataTransfer.files[0]

    target.audioPlayer = new AudioPlayer file




