$(document).ready ->
  $('button').bind 'dragover', (event) ->
    event.preventDefault()
    event.stopImmediatePropagation()

  $('button').bind 'dragenter', (event) ->
    event.preventDefault()
    event.stopImmediatePropagation()

  $('button').mousedown (event) ->
    event.preventDefault()
    if event.target.source
      event.target.source.noteOn 0

  $('button').mouseup (event) ->
    event.preventDefault()
    if event.target.source
      true
      event.target.audioContext.currentTime = 0



  $('button').bind 'drop', (event) ->
    event.preventDefault()

    target = event.target
    file   = event.originalEvent.dataTransfer.files[0]
    reader = new FileReader()

    reader.onerror = (error) -> alert 'fuck!'
    reader.onload = (event) ->
      audioContext = new webkitAudioContext
      audioContext.decodeAudioData event.target.result, (buffer) ->
        source        = audioContext.createBufferSource()
        source.buffer = buffer

        source.connect audioContext.destination

        target.source       = source
        target.audioContext = audioContext


    reader.readAsArrayBuffer(file)





