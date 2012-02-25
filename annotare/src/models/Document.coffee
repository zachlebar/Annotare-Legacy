Flakey = require('flakey')

Showdown = require('../lib/showdown')
Annotation = require('./Annotation')

class Document extends Flakey.models.Model
  @model_name: 'Document'
  @fields: ['id', 'name', 'slug', 'base_text', 'annotations']
  
  # Create a new highlght in this document
  annotate: (selection, html, attachment) =>
	  if attachment == undefined
	    type = 'highlight'
	  else
	    type = 'note'
    
    note = new Annotation {
      text: selection,
      type: type,
      attachment: attachment
      document: @id
    }
    note.save()
    
    if not @annotations or @annotations.constructor != Array
      @annotations = []
      
    @annotations.push note.id
    
    @save()
    return note.apply(html)
    
  delete: ()->
    for note_id in @annotations
      note = Annotation.get(note_id)
      note.delete()
    super()
    
  delete_annotation: (id) ->
    index = @annotations.indexOf(id)
    if index != -1
      @annotations.splice(index, 1)
      @save()
    
  # Draw annotations on document
  draw_annotations: (html, annotations = @annotations) =>
    if not annotations or annotations.constructor != Array
      annotations = []
    
    for note_id in annotations
      note = Annotation.get(note_id)
      if note?
        html = note.apply(html)
    return html
  
  # Generate the doc slug based on the name
  generate_slug: =>
    slug = @name
    slug = slug.toLowerCase().replace(/[^\_\ 0-9a-z-]/g, "").replace(/[ ]/g, '_')
    @slug = slug
    return slug
    
  # get notes
  get_notes: =>
    if not @annotations or @annotations.constructor != Array
      @annotations = []
    notes = []
    for id in @annotations
      note = Annotation.get(id)
      if note?
        notes.push(note)
    return notes
    
  # Render document into HTML
  render: =>
    converter = new Showdown.converter()
    html = converter.makeHtml(@base_text)
    return html
  
module.exports = Document