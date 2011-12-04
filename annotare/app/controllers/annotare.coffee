Spine   = require('spine')
$       = Spine.$

NewDocument = require('controllers/new_document')
List = require('controllers/list')
Detail = require('controllers/detail')
Edit = require('controllers/edit')

    
class Main extends Spine.Stack
  controllers:
    new_document: NewDocument
    list: List
    detail: Detail
    edit: Edit
    
  routes:
    '/new': 'new_document'
    '/list': 'list'
    '/detail/:id': 'detail'
    '/edit/:id': 'edit'
    
  default: 'list'

module.exports = Main