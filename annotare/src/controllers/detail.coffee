Flakey = require('flakey')
$ = Flakey.$

apprise = require('../lib/apprise-1.5.full')
Document = require('../models/Document')


class Detail extends Flakey.controllers.Controller
  constructor: (config) ->
    @id = "detail-view"
    @class_name = "detail view"
    
    @actions = {
      'click .edit': 'edit'
      'click .highlighter': 'highlight'
      'click .annotate': 'annotate'
    }
    
    super(config)
    @tmpl =  Flakey.templates.get_template('detail', require('../views/detail'))
  
  render: () =>
    if not @query_params.id
      return
      
    # Render Document
    @doc = Document.get(@query_params.id)
    context = {
      doc: @doc
    }
    @html @tmpl.render(context)
    @unbind_actions()
    @bind_actions()
    
  edit: (event) =>
    window.location.hash = "#/edit?" + Flakey.util.querystring.build(@query_params)
    
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