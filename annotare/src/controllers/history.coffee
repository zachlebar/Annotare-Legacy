Flakey = require('flakey')
$ = Flakey.$

Showdown = require('../lib/showdown')
apprise = require('../lib/apprise-1.5.full')
Document = require('../models/Document')


class History extends Flakey.controllers.Controller
  constructor: (config) ->
    @id = "history-view"
    @class_name = "history view"
    
    @actions = {
      'change #version-input': 'update'
    }
    
    super(config)
    @tmpl =  Flakey.templates.get_template('history', require('../views/history'))
  
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
  
  update: (event) =>
    version_index = $('#version-input').val()
    
    doc = Document.get(@query_params.id)    
    time = new Date(doc.versions[version_index].time)
    rev = doc.evolve(doc.versions[version_index].version_id)
    
    converter = new Showdown.converter()
    html = converter.makeHtml(rev.base_text)
    
    $('#history-time').html(time.toLocaleString())
    $('#history-content').html(html)
    
    
module.exports = History