Spine   = require('spine')
$       = Spine.$

autoresize = require('lib/autoresize')

Document    = require('models/Document')
Patch      = require('models/Patch')
Annotation = require('models/Annotation')


class NewDocument extends Spine.Controller
  className: 'new_document view'

  events:
    'click .save': 'save'
    'click .discard': 'discard'

  constructor: ->
    super
    
    @active @change

  render: ->
    # Render a template, replacing the 
    # controller's HTML
    @html require('views/new_document')
    $('#editor').autoResize({
      extraSpace: 100,
      maxHeight: 2000
    })
    $('#name, #editor').blur()

  change: (params) =>
    @render()
    
  save: (params) =>
    name = $('#name').val()
    text = $('#editor').val()
    if name.length > 0 and text.length > 0
      doc = new Document(name: name, base_text: text)
      doc.generate_slug()
      doc.save()
      Spine.Route.navigate("/detail", doc.id, true)
    
  discard: (params) =>
    if confirm "Are you sure you want to discard all unsaved changes?"
      Spine.Route.navigate("/list", true)
    
    
module.exports = NewDocument