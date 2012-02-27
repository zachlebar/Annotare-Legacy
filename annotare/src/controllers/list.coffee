Flakey = require('flakey')
$ = Flakey.$

Document = require('../models/Document')


class List extends Flakey.controllers.Controller
  constructor: (config) ->
    @id = "list-view"
    @class_name = "list view"

    @actions = {
      'click .document': 'select_doc'
      'keyup #search-box': 'search'
    }

    super(config)
    @tmpl =  Flakey.templates.get_template('list', require('../views/list'))
    
  render: (documents) =>
    if not documents? or documents.constructor != Array
      documents = Document.all()
    
    context = {
      list: documents
    }
    @html @tmpl.render(context)
    @unbind_actions()
    @bind_actions()
    
  select_doc: (event) ->
    id = $(event.currentTarget).attr('id').replace('document-', '')
    window.location.hash = "#/detail?" + Flakey.util.querystring.build({id: id})
    
  search: (event) =>
    event.preventDefault()
    query = $('#search-box').val()
    docs = Document.search(query)
    @render(docs)
    $('#search-box').val(query).focus()
    
    
module.exports = List