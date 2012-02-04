Flakey = require('flakey')
$ = Flakey.$

NewDocument = require('./new_document')
List = require('./list')
Detail = require('./detail')
Edit = require('./edit')

  
class Main extends Flakey.controllers.Stack
  constructor: (config) ->
    @id = 'main-stack'
    @class_name = 'stack'
    @controllers = {
      new_document: NewDocument
      list: List
      detail: Detail
      edit: Edit
    }

    @routes = {
      '^/new$': 'new_document'
      '^/list$': 'list'
      '^/detail$': 'detail'
      '^/edit': 'edit'
    }
    @default = '/list'

    super(config)

module.exports = Main