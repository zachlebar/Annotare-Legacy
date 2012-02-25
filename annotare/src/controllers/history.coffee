Flakey = require('flakey')
$ = Flakey.$

ui = require('../lib/uikit')
Showdown = require('../lib/showdown')
Document = require('../models/Document')


class History extends Flakey.controllers.Controller
  constructor: (config) ->
    @id = "history-view"
    @class_name = "history view"
    
    @actions = {
      'change #version-input': 'update'
      'click #rollback': 'rollback'
    }
    
    super(config)
    @tmpl =  Flakey.templates.get_template('history', require('../views/history'))
    Flakey.events.register('model_document_updated', @render)
  
  render: () =>
    if not @query_params.id
      return
    doc = Document.get(@query_params.id)
    max_version = doc.versions.length - 1;
    
    latest = (doc.versions.length - 1)
    time = doc.versions[latest].time
        
    # Render Document
    context = {
      doc: doc
      time: new Date(time)
      max_version: max_version
    }
    @html @tmpl.render(context)
    @unbind_actions()
    @bind_actions()
    
  rollback: (event) =>
    event.preventDefault()
    
    version_index = $('#version-input').val()
    doc = Document.get(@query_params.id)
    time = new Date(doc.versions[version_index].time)
    
    ui.confirm('Be careful!', "Are you sure you want to rollback to the version saved at #{time.toLocaleString()}").show (ok) =>
      if ok
        doc.rollback(doc.versions[version_index].version_id)
  
  update: (event) =>
    version_index = $('#version-input').val()
    doc = Document.get(@query_params.id)
    time = new Date(doc.versions[version_index].time)
    rev = doc.evolve(doc.versions[version_index].version_id)
    
    converter = new Showdown.converter()
    html = converter.makeHtml(rev.base_text)
        
    $('#history-time').html(time.toLocaleString())
    $('#history-content').html(doc.draw_annotations(html, rev.annotations))
    
    
module.exports = History