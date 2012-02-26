Flakey = require('flakey')
$ = Flakey.$

setting_types = require('../settings')

Setting = require('../models/Setting')


class Settings extends Flakey.controllers.Controller
  constructor: (config) ->
    @id = "settings-view"
    @class_name = "settings view"

    @actions = {
      'change .user-setting': 'save'
    }

    super(config)
    @tmpl =  Flakey.templates.get_template('settings', require('../views/settings'))

  render: ->
    context = {
      types: setting_types,
      Setting: Setting
    }
    @html @tmpl.render(context)
    @unbind_actions()
    @bind_actions()
    
  save: (event) =>
    event.preventDefault()
    $('.user-setting').each () ->
      settings = Setting.find({slug: $(this).attr('data-slug')})
      if settings.length == 0
        setting = new Setting {
          slug: $(this).attr('data-slug')
        }
      else
        setting = settings[0]
      
      setting.value = $(this).val()
      setting.save()

    
module.exports = Settings