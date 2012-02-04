Spine = require('spine')
Relation = require('lib/relation')

class Annotation extends Spine.Model
  @configure 'Annotation', 'text', 'type', 'attachment'
  
  # Persist
  #@extend @Local
  @extend Spine.Model.Ajax
  
  @url: "/api/annotation"
  
  @belongsTo 'document', 'models/Document'
  
  apply: (html) =>
    parts = @text.split('\n')
    for text in parts
      if @type == "note"
        note = '<span id="note-' + @id + '" class="' + @type + '">' + text + '<span id="note-detail-' + @id + '" class="note-detail">' + @attachment + '</span></span>';
      else
        note = '<span id="note-' + @id + '" class="' + @type + '">' + text + '</span>'
      html = html.replace(text, note);
    return html
  
module.exports = Annotation