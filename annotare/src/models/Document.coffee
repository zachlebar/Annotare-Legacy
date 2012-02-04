Flakey = require('flakey')

Showdown = require('../lib/showdown')
Annotation = require('./Annotation')

class Document extends Flakey.models.Model
  @model_name: 'Document'
  @fields: ['name', 'slug', 'base_text', 'annotations']
  
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
    return note.apply(html);
    
  # Draw annotations on document
  draw_annotations: (html) =>
    if not @annotations or @annotations.constructor != Array
      @annotations = []
    
    for note in @annotations
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
    for note in @annotations
      if note.type == "note"
        notes.push(note)
    return notes
    
  # Render document into HTML
  render: =>
    converter = new Showdown.converter()
    html = converter.makeHtml(@base_text)
    return html
  
module.exports = Document