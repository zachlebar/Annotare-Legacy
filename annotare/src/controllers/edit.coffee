Flakey = require('flakey')
$ = Flakey.$

autoresize = require('../lib/autoresize')
ui = require('../lib/uikit')
settings = require('../settings')
Document    = require('../models/Document')

class Edit extends Flakey.controllers.Controller
  constructor: (config) ->
    @id = "edit-view"
    @class_name = "edit_document view"
    
    @actions = {
      'click .save': 'save'
      'click .discard': 'discard'
    }
    
    super(config)
    @tmpl =  Flakey.templates.get_template('edit', require('../views/edit'))
  
  render: () ->
    if not @query_params.id
      return
      
    @doc = Document.get(@query_params.id)

    context = {
      doc: @doc
    }
    @html @tmpl.render(context)
    @unbind_actions()
    @bind_actions()
    
    $('#editor').autoResize({
      extraSpace: 100,
      maxHeight: 9000
    })
  
  save: (event) =>
    event.preventDefault()
    @doc.base_text = $('#editor').val()
    @doc.save()
    ui.info('Everything\'s Shiny Capt\'n!', "\"#{ @doc.name }\" was successfully saved.").hide(settings.growl_hide_after).effect(settings.growl_effect)
    window.location.hash = "#/detail?" + Flakey.util.querystring.build(@query_params)
  
  discard: (event) =>
    event.preventDefault()
    ui.confirm('There be Monsters!', 'Careful there Captain; are you sure you want to discard all changes to this document?').show (ok) ->
      if ok
        window.location.hash = "#/list"


module.exports = Edit