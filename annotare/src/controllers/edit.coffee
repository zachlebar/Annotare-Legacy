Flakey = require('flakey')
$ = Flakey.$

autoresize = require('../lib/autoresize')
ui = require('../lib/uikit')
settings = require('../settings')
Document = require('../models/Document')


class Edit extends Flakey.controllers.Controller
  constructor: (config) ->
    @id = "edit-view"
    @class_name = "edit_document view"
    
    @actions = {
      'click .save': 'save'
      'click .discard': 'discard'
      'click .delete': 'delete_note'
      'keyup #editor': 'autosave'
    }
    
    super(config)
    @tmpl =  Flakey.templates.get_template('edit', require('../views/edit'))
    
  autosave: (event) =>
    event.preventDefault()
    localStorage[@autosave_key()] = $('#editor').val()
    
  autosave_key: () ->
    return "autosave-draft-#{@id}";
  
  render: () =>
    if not @query_params.id
      return
      
    @doc = Document.get(@query_params.id)

    context = {
      doc: @doc
    }
    @html @tmpl.render(context)
    
    # Restore Draft?
    if localStorage[@autosave_key()]? and localStorage[@autosave_key()].length > 0
      ui.confirm('Restore?', 'An unsaved draft of this note was found. Would you like to restore it to the editor?').show (ok) =>
        if ok
          $('#editor').val(localStorage[@autosave_key()])
    
    # Make sure actions work
    @unbind_actions()
    @bind_actions()
    
    # Enable auto resizer
    $('#editor').autoResize({
      extraSpace: 100,
      maxHeight: 9000
    }).blur()
  
  save: (event) =>
    event.preventDefault()
    @doc.base_text = $('#editor').val()
    @doc.save()
    ui.info('Everything\'s Shiny Capt\'n!', "\"#{ @doc.name }\" was successfully saved.").hide(settings.growl_hide_after).effect(settings.growl_effect)
    window.location.hash = "#/detail?" + Flakey.util.querystring.build(@query_params)
  
  discard: (event) =>
    event.preventDefault()
    ui.confirm('There be Monsters!', 'Careful there Captain; are you sure you want to discard all changes to this document?').show (ok) =>
      if ok
        delete localStorage[@autosave_key()]
        window.location.hash = "#/list"
        
  delete_note: (event) =>
    event.preventDefault()
    ui.confirm('There be Monsters!', 'Are you sure you want to delete this annotation?').show (ok) =>
      if ok
        id = $(event.target).parent().attr('data-id')
        @doc.delete_annotation(id)
        $(event.target).parent().slideUp()


module.exports = Edit