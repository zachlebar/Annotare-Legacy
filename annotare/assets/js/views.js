define(['api', 'showdown', 'diff_match_patch', 'util'], function(api, showdown, diff, util) {
    /* 
     * Subclass this to make views
     * Overwrite load and unload methods
    */
    function View() {
        this.name = "Sample";
        this.display = {
            format: 'fullscreen'
        };
    }
    View.prototype = {
        load: function() {
            this.container = document.createElement('div');
            this.container.id = 'test_view';
            this.container.appendChild(document.createTextNode('Sample View Loaded'));
            return this.container;
        },
        unload: function() {
            $(this.container).remove();
        },
        restart: function() {
            var n = new View();
            return n;
        }
    }
    
    /*
     * Document View
     * Fetch a document from the server and display it
    */
    function DocumentView() {
        this.name = "Document"
    }
    DocumentView.prototype = new View();
    DocumentView.prototype.load = function() {
        var container = this.container = document.createElement('div');
        this.container.id = 'document';
        // Get Doc
        var name = annotare.router.parse_arguments(window.location.hash).name;
        if (name) {
            this.container.appendChild(document.createTextNode('Loading Document...'));
            api.get_markdown(name, function(data) {
                // Convert Doc
                var converter = new Showdown.converter();
                var html = converter.makeHtml(data);
                // Toolbar
                container.innerHTML = "";
                var toolbar = document.createElement('div');
                toolbar.id = 'tool-bar';
                var edit = document.createElement('a');
                edit.href = '#edit?name=' + name;
                edit.innerHTML = 'Edit Document';
                toolbar.appendChild(edit);
                var history = document.createElement('a');
                history.href = '#document.history?name=' + name;
                history.innerHTML = 'View History';
                toolbar.appendChild(history);
                container.appendChild(toolbar);
                // Display Document
                container.innerHTML += html;
            }, function(data){
                container.innerHTML = "Error Loading Document. Status Code: " + data.status;
            });
        } else {
            this.container.appendChild(document.createTextNode('Error. Document name not specified.'));
        }
        return this.container;
    }
    DocumentView.prototype.unload = function() {
        $(this.container).remove();
    }
    DocumentView.prototype.restart = function() {
        return new DocumentView();
    }
    
    /*
     * Document View
     * Fetch a document from the server and display it
    */
    function EditView() {
        this.name = "Edit"
    }
    EditView.prototype = new View();
    EditView.prototype.load = function() {
        var container = this.container = document.createElement('div');
        this.container.id = 'edit';
        // Get Doc
        var name = annotare.router.parse_arguments(window.location.hash).name;
        if (name) {
            this.container.appendChild(document.createTextNode('Loading Document...'));
            api.get_markdown(name, function(data){
                // Toolbar
                container.innerHTML = "";
                var toolbar = document.createElement('div');
                toolbar.id = 'tool-bar';
                var discard = document.createElement('a');
                discard.href = '#document?name=' + name;
                discard.innerHTML = 'Discard Changes';
                toolbar.appendChild(discard);
                $(discard).click(function(event){
                    if (!confirm('Are you sure you want to discard all unsaved changes?'))
                        event.preventDefault();
                });
                var save = document.createElement('a');
                save.href = '#document?name=' + name;
                save.innerHTML = 'Save and Close';
                toolbar.appendChild(save);
                $(save).click(function(){
                    differ = new diff_match_patch();
                    var new_text = $(editor).val();
                    var patch = {
                        patch: differ.patch_toText(differ.patch_make(data, new_text)),
                        time: +(new Date())
                    }
                    // Save Patch
                    if (patch.patch.length > 0) {
                        var key = name + "-patches";
                        if (util.cache.exists(key)) {
                            var patches = util.cache.get(key);
                            patches.push(patch);
                            util.cache.set(key, patches);
                        } else {
                            util.cache.set(key, [patch]);
                        }
                    }
                });
                container.appendChild(toolbar);
                // Editor
                var editor = document.createElement('textarea');
                editor.innerHTML = data;
                var differ = new diff_match_patch();
                container.appendChild(editor);
            }, function(data){
                container.innerHTML = "Error Loading Document. Status Code: " + data.status;
            });
        } else {
            this.container.appendChild(document.createTextNode('Error. Document name not specified.'));
        }
        return this.container;
    }
    EditView.prototype.unload = function() {
        $(this.container).remove();
    }
    EditView.prototype.restart = function() {
        return new EditView();
    }
    
    /*
     * Generic Modal Form View
     * Provides methods for displaying and submiting a modal form
     * Text Areas, File Uploads not supported
    */
    function HistoryView() {
        this.name = "History"
        this.display = {
            format: 'modal',
            width: 600,
            height: 450
        }
    }
    HistoryView.prototype = new View();
    HistoryView.prototype.load = function() {
        var container = this.container = document.createElement('div');
        this.container.id = 'history';
        var name = annotare.router.parse_arguments(window.location.hash).name;
        if (name) {
            this.container.innerHTML = "<h2>Change Log</h2>"
            var patches = util.cache.get(name + '-patches');
            var list = document.createElement('ul');
            for (var i=patches.length-1; i>=0; i--) {
                var patch = patches[i];
                var item = document.createElement('li');
                item.innerHTML = (new Date(patch.time)).toString() + "<pre><code>" + patch.patch + "</code></pre>";
                item.title = (new Date(patch.time)).toString();
                list.appendChild(item);
            }
            this.container.appendChild(list);
        } else {
            this.container.appendChild(document.createTextNode('Error. Document name not specified.'));
        }
        return this.container;
    }
    HistoryView.prototype.unload = function() {
        $(this.container).remove();
    }
    HistoryView.prototype.restart = function() {
        return new HistoryView();
    }
    
    
    /*
     * Generic Modal Form View
     * Provides methods for displaying and submiting a modal form
     * Text Areas, File Uploads not supported
    */
    function ModalForm(form, width, height, container_id, name) {
        // Form Data
        this.form = form;
        this.action = this.form.action || '/';
        this.method = this.form.method || 'POST';
        this.title = this.form.title || 'Title';
        this.desc = this.form.desc || null;
        this.submit_name = this.form.submit_name || 'Submit';
        this.fields = this.form.fields || [
            {label: 'Sample Field', type: 'text'},
            {label: 'Email Address', type: 'text'}
        ];
        // Create a container element and select it
        this.container_id = container_id;
        // Make sure this view is a modal, not full screen, on the desktop
        // On mobile, everything is full screen, but its still technically overlayed
        this.name = name || "Generic Form";
        this.display = {
            format: 'modal',
            disable_close: true,
            width: width || 320,
            height: height || 320
        };
    }
    ModalForm.prototype = new View();
    ModalForm.prototype.load = function() {
        this.container = document.createElement('div');
        this.container.id = this.container_id || 'form';
        $(this.container).addClass('details-pane');
        $(this.container).css({'overflow':'auto'});
        // Title
        var title = document.createElement('h2');
        title.innerHTML = this.title;
        this.container.appendChild(title);
        $(title).css({'margin': 0});
        // Description
        if (this.desc) {
            var desc = document.createElement('p');
            desc.innerHTML = this.desc;
            this.container.appendChild(desc);
            $(desc).css({'margin-bottom': 0});
        }
        // Setup form
        this.form = document.createElement('form');
        this.container.appendChild(this.form);
        $(this.form).attr('method', this.method);
        $(this.form).attr('action', this.action);
        // Add CSRF Token to form
        this.form.innerHTML += window.user.csrf_token;
        // Setup fields
        for (var i=0; i<this.fields.length; i++) {
            var field = this.fields[i];
            this.form.innerHTML += this.generate_label(field) + this.generate_field(field);
        }
        // Submit Button
        this.form.innerHTML += '<input class="button wide" type="submit" value="' + this.submit_name + '" />';
        // Return container
        return this.container
    }
    ModalForm.prototype.unload = function() {
        $(this.container).remove(); 
    }
    ModalForm.prototype.restart = function() {
        return new ModalForm(this.form, this.display.width, this.display.height, this.container_id);
    }
    ModalForm.prototype.prepare_field = function(field) {
        // Sanity Checks and field defaults
        if (!field.label)
            field.label = 'Sample Input';
        if (!field.type)
            field.type = 'text';
        if (!field.name)
            field.name = (function(){
                var name = field.label;
                name = name.replace(' ', '_');
                name = name.toLowerCase();
                return name;
            })();
        if (!field.id)
            field.id = 'id_' + field.name;
        if (!field.value)
            field.value = '';
        return field;
    }
    ModalForm.prototype.generate_field = function(field) {
        field = this.prepare_field(field);
        return '<input type="' + field.type + '" name="' + field.name + '" id="' + field.id + '" value="' + field.value + '" />';
    }
    ModalForm.prototype.generate_label = function(field) {
        if (field.type == 'hidden')
            return '';
        field = this.prepare_field(field);
        return '<label for="' + field.id + '">' + field.label + '</label>';
    }

    var views = {
        test: new View(),
        doc: new DocumentView(),
        edit: new EditView(),
        history: new HistoryView()
    };
    return views
});