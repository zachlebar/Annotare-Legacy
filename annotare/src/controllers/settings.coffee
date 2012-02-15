Flakey = require('flakey')
$ = Flakey.$

settings = require('../settings')
Document = require('../models/Document')


class Settings extends Flakey.controllers.Controller
  constructor: (config) ->
    @id = "new-document-view"
    @class_name = "new_document view"

    @actions = {
      'click .save': 'save'
      'click .discard': 'discard'
    }

    super(config)
    @tmpl =  Flakey.templates.get_template('new_document', require('../views/new_document'))

  render: ->
    # Render a template, replacing the 
    # controller's HTML
    @html @tmpl.render({})
    @unbind_actions()
    @bind_actions()
    
    $('#editor').autoResize({
      extraSpace: 100,
      maxHeight: 2000
    })
    $('#name, #editor').blur()
    
    
module.exports = Settings