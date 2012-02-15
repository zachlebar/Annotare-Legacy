Flakey = require('flakey')

class Setting extends Flakey.models.Model
  @model_name: 'Setting'
  @fields: ['id', 'slug', 'value']
  
  
module.exports = Setting