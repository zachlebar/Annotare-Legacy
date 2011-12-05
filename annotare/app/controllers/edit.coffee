Spine   = require('spine')
$       = Spine.$

autoresize = require('lib/autoresize')

Document    = require('models/Document')
Patch      = require('models/Patch')
Annotation = require('models/Annotation')


class Edit extends Spine.Controller
  className: 'edit_document view'

  events:
    'click .save': 'save'
    'click .discard': 'discard'

  constructor: ->
    super
    
    @active @change

  render: ->
    if not @doc_id
      return
      
    @doc = Document.find(@doc_id)

    context = {
      doc: @doc
    }
    @html require('views/edit')(context)
    $('#editor').autoResize({
      extraSpace: 100,
      maxHeight: 2000
    }).blur()

  change: (params) =>
    @doc_id = params.id
    Document.fetch()
    Patch.fetch()
    Annotation.fetch()
    @render()
    
  save: (params) =>
    text = $('#editor').val()
    @doc.revise(text)
    Spine.Route.navigate("/detail", @doc.id, true)
    
  discard: (params) =>
    if confirm "Are you sure you want to discard all unsaved changes?"
      Spine.Route.navigate("/list", true)
    
    
module.exports = Edit