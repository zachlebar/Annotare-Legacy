Flakey = require('flakey')

Annotare = require('controllers/annotare')

Document = require('models/Document')
Patch = require('models/Patch')
Annotation = require('models/Annotation')


class App extends Flakey.Controller
  constructor: ->
    super
    @contacts = new Annotare
    @append @contacts
    
    Document.fetch()
    Patch.fetch()
    Annotation.fetch()
    
    Spine.Route.setup()
    
    # Placeholders
    $('input, textarea').live('focus', ->
      placeholder = $(this).attr('data-placeholder')
      if $(this).val() == placeholder
        $(this).val('').removeClass('placeholder')
    ).live('blur', ->
      placeholder = $(this).attr('data-placeholder')
      if $(this).val() == placeholder || $(this).val().length == 0
        $(this).val(placeholder).addClass('placeholder')
    ).live('submit', ->
      placeholder = $(this).attr('data-placeholder')
      if $(this).val() == placeholder
        $(this).val('').removeClass('placeholder')
    )


module.exports = App