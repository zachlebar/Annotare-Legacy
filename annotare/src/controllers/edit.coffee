Flakey = require('flakey')
$ = Flakey.$

autoresize = require('../lib/autoresize')

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
      maxHeight: 10000
    }).blur()
  
  save: () =>
    @doc.base_text = $('#editor').val()
    @doc.save()
    window.location.hash = "#/detail?" + Flakey.util.querystring.build(@query_params)
  
  discard: (params) =>
    if confirm "Are you sure you want to discard all unsaved changes?"
      window.location.hash = "#/list"


module.exports = Edit