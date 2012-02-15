Flakey = window.Flakey = require('flakey')
$ = window.$ = Flakey.$

Annotare = require('./controllers/annotare')


class App extends Flakey.controllers.Controller
  constructor: ->
    super
    @annotare = new Annotare
    @append @annotare


$(document).ready () ->
  settings = {
    container: $('#application')
    base_model_endpoint: '/api'
  }
  Flakey.init(settings)
  
  # Sync models
  Flakey.models.backend_controller.sync('Document')
  Flakey.models.backend_controller.sync('Annotation')
  Flakey.models.backend_controller.sync('Setting')
  
  annotare = window.Annotare = new Annotare()
  annotare.make_active()


module.exports = App