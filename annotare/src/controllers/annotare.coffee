Flakey = require('flakey')
$ = Flakey.$

Setting = require('../models/Setting')
default_settings = require('../settings')
default_settings = default_settings['default_settings']


class Main extends Flakey.controllers.Stack
  constructor: (config) ->
    NewDocument = require('./new_document')
    List = require('./list')
    Detail = require('./detail')
    Edit = require('./edit')
    History = require('./history')
    Settings = require('./settings')
    
    @id = 'main-stack'
    @class_name = 'stack'
    @controllers = {
      new_document: NewDocument
      list: List
      detail: Detail
      edit: Edit
      history: History
      settings: Settings
    }

    @routes = {
      '^/new$': 'new_document'
      '^/list$': 'list'
      '^/detail$': 'detail'
      '^/edit$': 'edit'
      '^/history$': 'history'
      '^/settings$': 'settings'
    }
    @default = '/list'

    super(config)
    
    # Theme Setting
    theme = Setting.find({slug: 'theme'})
    theme = theme[0]
    if theme? and theme.value?
      document.body.className = theme.value
    else
      document.body.className = default_settings['Theme']

module.exports = Main