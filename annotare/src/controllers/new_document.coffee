Flakey = require('flakey')
$ = Flakey.$

autoresize = require('../lib/autoresize')
ui = require('../lib/uikit')
Classify = require('../lib/classify')
Document = require('../models/Document')


class NewDocument extends Flakey.controllers.Controller
	constructor: (config) ->
		@id = "new-document-view"
		@class_name = "new_document view"

		@actions = {
			'click .save': 'save'
			'click .discard': 'discard'
			'keyup #new-doc-editor': 'autosave'
		}

		super(config)
		@tmpl =  Flakey.templates.get_template('new_document', require('../views/new_document'))

	autosave: (event) =>
		event.preventDefault()
		localStorage[@autosave_key()] = $('#new-doc-editor').val()
    
	autosave_key: () ->
		return "autosave-draft-new-doc"

    
	auto_resize: () ->
		$('#new-doc-editor').autoResize({
			extraSpace: 100,
			maxHeight: 9000
		})

	render: ->
		# Render a template, replacing the 
		# controller's HTML
		@html @tmpl.render({
			title: @query_params.title
		})
		@unbind_actions()
		@bind_actions()
    
		$('#new-doc-editor').autoResize({
			extraSpace: 100,
			maxHeight: 9000
		})
		$('#new-doc-editor').blur()
    
	save: (params) =>
		text = $('#new-doc-editor').val()
		if text.length > 0
			doc = new Document {
				base_text: text
			}
      
		html = doc.render()
		class_converter = new Classify.converter
		doc.name = class_converter.extractClass(html, "title")
		doc.slug = class_converter.extractClass(html, "slug")
		if !doc.slug
			doc.generate_slug()

		dupes = Document.find({slug: doc.slug})
		if dupes.length > 0
			ui.info('A document with that name already exists!').hide(5000).effect('slide')
					
			window.location.hash = "#/new"
			if localStorage[@autosave_key()]? and localStorage[@autosave_key()].length > 0
				$('#new-doc-editor').val(localStorage[@autosave_key()])
				@auto_resize()

		else
			doc.save()
      
			if localStorage[@autosave_key()]? and localStorage[@autosave_key()].length > 0
				delete localStorage[@autosave_key()]
			
			ui.info('Everything\'s Shiny Capt\'n!', "\"#{ doc.name }\" was successfully saved.").hide(5000).effect('slide')
			window.location.hash = "#/detail?" + Flakey.util.querystring.build({slug: doc.slug})
    
	discard: (params) =>
		ui.confirm('There be Monsters!', 'Careful there Captain; are you sure you want to discard this document?').show(ok) ->
		if ok
			window.location.hash = "#/list"
    
    
module.exports = NewDocument
