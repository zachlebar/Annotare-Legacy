Flakey = require('flakey')

class Annotation extends Flakey.models.Model
  @model_name: 'Annotation'
  @fields: ['text', 'type', 'attachment', 'document']
  
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