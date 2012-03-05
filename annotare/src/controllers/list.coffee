Flakey = require('flakey')
$ = Flakey.$

Document = require('../models/Document')


class List extends Flakey.controllers.Controller
  constructor: (config) ->
    @id = "list-view"
    @class_name = "list view"

    @actions = {
      'click .document': 'select_doc'
      'click .new_document': 'new_document'
      'keyup #search-box': 'search'
    }

    super(config)
    @tmpl =  Flakey.templates.get_template('list', require('../views/list'))
    
  render: () =>
    if @query_params.q? and @query_params.q.length > 0
      documents = Document.search(@query_params.q)
    else
      documents = Document.all()
    
    context = {
      list: documents,
      query: @query_params.q
    }
    @html @tmpl.render(context)
    @unbind_actions()
    @bind_actions()
    $('#search-box').val(@query_params.q).focus()
    
  new_document: (event) =>
    event.preventDefault()
    window.location.hash = "#/new?" + (if @query_params.q? then Flakey.util.querystring.build({title: @query_params.q}) else "")
    
  select_doc: (event) ->
    id = $(event.currentTarget).attr('id').replace('document-', '')
    window.location.hash = "#/detail?" + Flakey.util.querystring.build({id: id})
    
  search: (event) =>
    event.preventDefault()
    Flakey.util.querystring.update({q: $('#search-box').val()}, true)
    
    
module.exports = List