Spine   = require('spine')
$       = Spine.$

Document   = require('models/Document')
Patch      = require('models/Patch')
Annotation = require('models/Annotation')

class List extends Spine.Controller
  className: "list view"
    
  events:
    'click .document': 'select_doc'
    
  constructor: ->
    super
    
    Document.bind("refresh change", @render)
    Annotation.bind("refresh change", @render)
    Patch.bind("refresh change", @render)
    
    @active @change
    
  render: =>
    @documents = Document.all()
    context = {
      list: @documents
    }
    @html require('views/list')(context)

  change: (params) =>
    Document.fetch()
    Patch.fetch()
    Annotation.fetch()
    @render()
    
  select_doc: (event) ->
    id = $(event.currentTarget).attr('id').replace('document-', '')
    Spine.Route.navigate("/detail", id, true)
    
    
module.exports = List