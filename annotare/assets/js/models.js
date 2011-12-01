/*
 * Data Models for Annotare
*/
define(['util', 'api', 'diff_match_patch', 'JSON', 'showdown', 'md5'], function(util, api, diff_match, JSON, showdown, hash){
    
    function Doc(name) {
        name = name.toLowerCase().replace(/[^\_\ 0-9a-z-]/g, "").replace(/ /g, '_');  // remove non-alphanumerics and replace spaces
        this.name = name;
        this.key = name;
        this.text = "";
        this.revisions = [];
        this.annotations = [];
        this.on_server = false;
        this.nodes = {};
    }
    Doc.prototype = {
        // Load Document from the server
        load: function(success, error) {
            var self = this;
            // Load Base Doc
            this.load_from_cache()
            this.reload_view = success;
            this.reload_view.apply(self, [])
        },
        save: function() {
            this.save_to_cache();
        },
        // Cache Document
        save_to_cache: function() {
            // Revision patches
            var revs = [];
            for (var i=0; i<this.revisions.length; i++)
                revs.push(this.revisions[i].export());
            // Highlights
            var annotations = [];
            for (var i=0; i<this.annotations.length; i++)
                annotations.push(this.annotations[i].export());
            util.cache.set(this.key, {
                name: this.name,
                key: this.key,
                text: this.text,
                revisions: revs,
                annotations: annotations,
                on_server: this.on_server,
            });
        },
        load_from_cache: function() {
            var data = util.cache.get(this.key);
            this.name = data.name;
            this.key = data.key;
            this.text = data.text;
            this.on_server = data.on_server;
            this.revisions = [];
            if (data.revisions) {
                for (var i=0; i<data.revisions.length; i++) {
                    var rev = data.revisions[i];
                    this.revisions.push(new Patch(rev));
                }
            }
            this.annotations = [];
            if (data.annotations) {
                for (var i=0; i<data.annotations.length; i++) {
                    this.annotations.push(new Annotation(data.annotations[i].text, data.annotations[i].data, data.annotations[i].uid));
                }
            }
        },
        // Create New Patch
        new_patch: function(new_text) {
            var old_text = this.render();
            var differ = new diff_match_patch();
            var patch_text = differ.patch_toText(differ.patch_make(old_text, new_text));
            if (patch_text.length > 0) {
                var patch = new Patch({patch: patch_text, time: +(new Date()), name: this.name});
                this.revisions.push(patch);
                this.save_to_cache();
            }
        },
        // Create / Edit an annotation
        annotate: function(sel, data) {
            var selected_text = sel;
            if (sel.toString())
	            selected_text = sel.toString();
            var note = new Annotation(selected_text, data);
            note.apply();
            this.annotations.push(note);
            this.save();
        },
        // Apply Patches & Annotations and return rendered text
        render: function() {
            var text = this.text;
            for (var i=0; i<this.revisions.length; i++)
                text = this.revisions[i].apply(text);
            return text;
        },
        // Apply IDs
        id_elements: function(nodes) {
            for (var i=0; i<nodes.length; i++) {
                var node = nodes[i];
                if (node.nodeType == 1) {
                    var node_hash = hash.hex(node.innerText);
                    node.id = node_hash;
                    this.nodes[node_hash] = node;
                    if (node.childNodes != undefined && node.childNodes.length > 0)
                        this.id_elements(node.childNodes);
                }
            }
        },
        to_html: function() {
            var converter = new Showdown.converter();
            var md = this.render();
            var container = document.createElement('div');
            var html = converter.makeHtml(md);
            container.innerHTML = html;
            this.id_elements(container.childNodes);
            return container
        },
        apply_annotations: function() {
            for (var i=0; i<this.annotations.length; i++) {
                this.annotations[i].apply();
            }
        },
        rollback: function() {
            this.revisions.pop();
            this.save_to_cache();
            this.reload_view();
        }
    }
    
    
    function Patch(args) {
        this.patch = this.differ.patch_fromText(args.patch);
        this.time = args.time;
        this.name = args.name;
    }
    Patch.prototype = {
        differ: new diff_match_patch(),
        apply: function(text) {
            return this.differ.patch_apply(this.patch, text)[0];
        },
        export: function() {
            return {
                patch: this.differ.patch_toText(this.patch),
                time: this.time,
                name: this.name
            }
        }
    }
    
    
    function Annotation(text, data, uid) {
        this.text = text;
        this.uid = uid || +(new Date());
        if (data == undefined) {
            this.type = 'highlight';
            this.data = undefined;
        } else {
            this.type = 'note';
            this.data = data;
        }
    }
    Annotation.prototype = {
        recurse_elements: function(node, end) {
            if (node == null)
                return false;
            
            var name = node.nodeName.toLowerCase();
            if (node.nodeType == 1 && name != 'ul' && name != 'ol')  // lists is a special case
                this.elems.push(node);
            
            if (node == end)
                return true;
            else {
                if (node.childNodes) {
                    for (var i=0; i<node.childNodes.length; i++) {
                        if (this.recurse_elements(node.childNodes[i], end)) {
                            return true;
                        }
                    }
                }
                if (this.recurse_elements(node.nextSibling, end))
                    return true;
            }
        },
        apply: function() {
            var doc = $('#content').html();
            var parts = this.text.split('\n');
            for (var i=0; i<parts.length; i++) {
                var text = parts[i] + "";
                console.log(text);
                console.log(doc.indexOf(text));
                doc = doc.replace(text, '<span class="highlight">' + text + '</span>');
            }
            $('#content').html(doc);
        },
        remove: function() {
            var elem = this.get_element();
            $(elem).removeClass(this.type);
        },
        export: function() {
            return {
                uid: this.uid,
                text: this.text,
                type: this.type,
                data: this.data
            }
        }
    }
    
    
    window.models = {
        Doc: Doc,
        Patch: Patch,
        Annotation: Annotation,
    }
    
    return window.models;
});