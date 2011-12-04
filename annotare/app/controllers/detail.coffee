Spine   = require('spine')
$       = Spine.$

Document   = require('models/Document')
Patch      = require('models/Patch')
Annotation = require('models/Annotation')


class Detail extends Spine.Controller
  className: 'detail view'
    
  events:
    'click .edit': 'edit'
    'click .highlighter': 'highlight'

  constructor: ->
    super
    
    Document.bind("refresh change", @render)
    
    @active @change

  render: =>
    if not @doc_id
      return

    @doc = Document.find(@doc_id)
    context = {
      doc: @doc
    }
    @html require('views/detail')(context)
    
  change: (params) =>
    @doc_id = params.id
    Document.fetch()
    
  edit: (event) =>
    Spine.Route.navigate("/edit", @doc_id, true)
    
  highlight: (event) =>
    selection = undefined
    if window.getSelection
      selection = window.getSelection()
    else if document.selection
      selection = document.selection.createRange()
    selection = selection.toString()
    # Save and Render highlight
    html = $("#" + @doc.slug).html()
    html = @doc.annotate(selection, html)
    $("#" + @doc.slug).html(html)
    
    
module.exports = Detail