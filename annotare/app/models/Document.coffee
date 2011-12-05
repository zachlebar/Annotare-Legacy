Spine = require('spine')
Relation = require('lib/relation')
Showdown = require('lib/showdown')
diff_match_patch = require('lib/diff_match_patch')

Annotation = require('models/Annotation')
Patch = require('models/Patch')

class Document extends Spine.Model
  @configure 'Document', 'name', 'slug', 'base_text'
  
  @hasMany 'annotations', 'models/Annotation'
  @hasMany 'patches', 'models/Patch'
  
  # Persist
  #@extend @Local
  @extend Spine.Model.Ajax
  
  @url: "/api/document"
  
  # Generate the doc slug based on the name
  generate_slug: =>
    slug = @name
    slug = slug.toLowerCase().replace(/[^\_\ 0-9a-z-]/g, "").replace(/[ ]/g, '_')
    @slug = slug
    return slug
    
  # get notes
  get_notes: =>
    notes = []
    for note in @annotations().all()
      if note.type == "note"
        notes.push(note)
    return notes
  
  # Save a document revision by calculating and saving 
  # a diff between new_text and the current text.  
  revise: (new_text) =>
    old_text = @apply_patches()
    differ = new diff_match_patch()
    patch_text = differ.patch_toText(differ.patch_make(old_text, new_text))
    if patch_text.length > 0
      patch = @patches().create({patch: patch_text, time: +(new Date())})
      patch.save()
      @save()
      
  # Create a new highlght in this document
  annotate: (selection, html, attachment) =>
	  if attachment == undefined
	    type = 'highlight'
	  else
	    type = 'note'
    
    note = @annotations().create({text: selection, type: type, attachment: attachment})
    note.save()
    @save()
    return note.apply(html);
    
  # Apply all saved patches to base_text, to render the final Markdown text
  apply_patches: =>
    text = @base_text
    for patch in @patches().all()
      text = patch.apply(text)
    return text
    
  # Draw annotations on document
  draw_annotations: (html) =>
    for note in @annotations().all()
      html = note.apply(html)
    return html
    
  # Render document into HTML
  render: =>
    converter = new Showdown.converter()
    html = converter.makeHtml(@apply_patches())
    return html
  
module.exports = Document