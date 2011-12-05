Spine   = require('spine')
$       = Spine.$

Document   = require('models/Document')
Patch      = require('models/Patch')
Annotation = require('models/Annotation')

apprise = require('lib/apprise-1.5.full')


class Detail extends Spine.Controller
  className: 'detail view'
    
  events:
    'click .edit': 'edit'
    'click .highlighter': 'highlight'
    'click .annotate': 'annotate'

  constructor: ->
    super
    
    Document.bind("refresh change", @render)
    Annotation.bind("refresh change", @render)
    Patch.bind("refresh change", @render)
    
    @active @change

  render: =>
    if not @doc_id
      return
      
    # Render Document
    @doc = Document.find(@doc_id)
    context = {
      doc: @doc
    }
    @html require('views/detail')(context)
    
  change: (params) =>
    @doc_id = params.id
    Document.fetch()
    Patch.fetch()
    Annotation.fetch()
    @render()
    
  edit: (event) =>
    Spine.Route.navigate("/edit", @doc_id, true)
    
  highlight: (event) =>
    selection = undefined
    if window.getSelection
      selection = window.getSelection()
    else if document.selection
      selection = document.selection.createRange()
    selection = selection.toString()
    if selection.length == 0
      apprise('Please select some text first')
    else
      # Save and Render highlight
      html = $("#" + @doc.slug).html()
      html = @doc.annotate(selection, html)
      $("#" + @doc.slug).html(html)
    
  annotate: (event) =>
    selection = undefined
    if window.getSelection
      selection = window.getSelection()
    else if document.selection
      selection = document.selection.createRange()
    selection = selection.toString()
    if selection.length == 0
      apprise('Please select some text first')
    else
      # Save and Render highlight
      html = $("#" + @doc.slug).html()
      # Note modal
      options = {
        input: true,
        animate: true
      }
      apprise('Please enter a note', options, (note) =>
        if note
          html = @doc.annotate(selection, html, note)
          $("#" + @doc.slug).html(html)
      )
    
    
module.exports = Detail