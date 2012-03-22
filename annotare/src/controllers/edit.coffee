Flakey = require('flakey')
$ = Flakey.$

autoresize = require('../lib/autoresize')
ui = require('../lib/uikit')
Classify = require('../lib/classify')
Document = require('../models/Document')


class Edit extends Flakey.controllers.Controller
	constructor: (config) ->
		@id = "edit-view"
		@class_name = "edit_document view"
    
		@actions = {
			'click .save': 'save'
			'click .discard': 'discard'
			'click .delete': 'delete_note'
			'keyup #edit-editor': 'autosave'
		}
    
		super(config)
		@tmpl =  Flakey.templates.get_template('edit', require('../views/edit'))
    
	autosave: (event) =>
		event.preventDefault()
		localStorage[@autosave_key()] = $('#edit-editor').val()
    
	autosave_key: () ->
		return "autosave-draft-#{@doc.id}";
  
	render: () =>
		if not @query_params.id
			return
      
		@doc = Document.get(@query_params.id)

		context = {
			doc: @doc
		}
		@html @tmpl.render(context)
    
		# Restore Draft?
		if localStorage[@autosave_key()]? and localStorage[@autosave_key()].length > 0
			ui.confirm('Restore?', 'An unsaved draft of this note was found. Would you like to restore it to the editor?').show (ok) =>
				if ok
					$('#edit-editor').val(localStorage[@autosave_key()])
					@auto_resize()
				else
					delete localStorage[@autosave_key()]
    
		# Make sure actions work
		@unbind_actions()
		@bind_actions()

		@auto_resize()
    
	
	auto_resize: () ->
		$('#edit-editor').autoResize({
			extraSpace: 100,
			maxHeight: 9000
		})
  
	save: (event) =>
		event.preventDefault()
		@doc.base_text = $('#edit-editor').val()
		tmp_html = @doc.render()
		class_converter = new Classify.converter
		@doc.name = class_converter.extractClass(tmp_html, "title")
		@doc.save()

		if localStorage[@autosave_key()]? and localStorage[@autosave_key()].length > 0
			delete localStorage[@autosave_key()]

		ui.info('Everything\'s Shiny Capt\'n!', "\"#{ @doc.name }\" was successfully saved.").hide(5000).effect('slide')
		window.location.hash = "#/detail?" + Flakey.util.querystring.build(@query_params)
 
	discard: (event) =>
		event.preventDefault()
		ui.confirm('There be Monsters!', 'Careful there Captain; are you sure you want to discard all changes to this document?').show (ok) =>
		if ok
			window.location.hash = "#/list"
        
	delete_note: (event) =>
		event.preventDefault()
		ui.confirm('There be Monsters!', 'Are you sure you want to delete this annotation?').show (ok) =>
			if ok
				id = $(event.target).parent().attr('data-id')
				@doc.delete_annotation(id)
				$(event.target).parent().slideUp()

module.exports = Edit
