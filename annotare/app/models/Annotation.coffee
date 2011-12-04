Spine = require('spine')
Relation = require('lib/relation')

class Annotation extends Spine.Model
  @configure 'Annotation', 'text', 'type', 'attachment'
  
  # Persist with Local Storage
  @extend @Local
  
  @belongsTo 'document', 'models/Document'
  
  apply: (html) =>
    parts = @text.split('\n')
    for text in parts
      html = html.replace(text, '<span class="highlight">' + text + '</span>');
    return html
  
module.exports = Annotation