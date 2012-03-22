Flakey = require('flakey')
$ = Flakey.$

autoresize = require('../lib/autoresize')
ui = require('../lib/uikit')
Classify = require('../lib/classify')
Document = require('../models/Document')


class NewDocument extends Flakey.controllers.Controller
  constructor: (config) ->
    @id = "new-document-view"
    @class_name = "new_document view"

    @actions = {
      'click .save': 'save'
      'click .discard': 'discard'
    }

    super(config)
    @tmpl =  Flakey.templates.get_template('new_document', require('../views/new_document'))

  render: ->
    # Render a template, replacing the 
    # controller's HTML
    @html @tmpl.render({
      title: @query_params.title
    })
    @unbind_actions()
    @bind_actions()
    
    $('#new-doc-editor').autoResize({
      extraSpace: 100,
      maxHeight: 2000
    })
    # $('#name, #editor').blur()
    $('#new-doc-editor').blur()
    
  save: (params) =>
    text = $('#new-doc-editor').val()
    if text.length > 0
      doc = new Document {
        base_text: text
      }
      
      html = doc.render()
      class_converter = new Classify.converter
      doc.name = class_converter.extractClass(html, "title")      

      doc.save()
      doc.generate_slug()
      
      ui.info('Everything\'s Shiny Capt\'n!', "\"#{ doc.name }\" was successfully saved.").hide(5000).effect('slide')
      window.location.hash = "#/detail?" + Flakey.util.querystring.build({id: doc.id})
    
  discard: (params) =>
    ui.confirm('There be Monsters!', 'Careful there Captain; are you sure you want to discard this document?').show (ok) ->
      if ok
        window.location.hash = "#/list"
    
    
module.exports = NewDocument
