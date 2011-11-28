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
        this.annotations = {};
        this.on_server = false;
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
            var annotations = {};
            for (key in this.annotations)
                annotations[key] = this.annotations[key].export();
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
            this.annotations = {};
            if (data.annotations) {
                for (var key in data.annotations) {
                    this.annotations[key] = new Annotation(data.annotations[key].range, data.annotations[key].data, data.annotations[key].uid);
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
        annotate: function(sel, text) {
            var range;
            if (sel.getRangeAt)
		        range = sel.getRangeAt(0);
        	else { // Safari!
        		range = document.createRange();
        		range.setStart(sel.anchorNode, sel.anchorOffset);
        		range.setEnd(sel.focusNode, sel.focusOffset);
        	}
            var note = new Annotation(range, text);
            note.apply();
            this.annotations[note.uid] = note;
            this.save();
        },
        // Apply Patches & Annotations and return rendered text
        render: function() {
            var text = this.text;
            for (var i=0; i<this.revisions.length; i++)
                text = this.revisions[i].apply(text);
            return text;
        },
        to_html: function() {
            var converter = new Showdown.converter();
            var md = this.render();
            var container = document.createElement('div');
            var html = converter.makeHtml(md);
            container.innerHTML = html;
            return container
        },
        apply_annotations: function() {
            for (var key in this.annotations) {
                this.annotations[key].apply();
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
    
    
    function Annotation(range, data, uid) {
        this.range = range;
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
            if (this.range === undefined)
                return;
            // Get Elements
            var start = this.range.startContainer;
            var end = this.range.endContainer;
            if (start.nodeType == 3)
                start = start.parentNode;
            if (end.nodeType == 3)
                end = end.parentNode;
            this.elems = [];
            this.recurse_elements(start, end);
            // Highlight elements
            for (var i=0; i<this.elems.length; i++) {
                if (i == 0 && i == this.elems.length-1) {
                    var start = this.range.startOffset;
                    var end = this.range.endOffset;
                    var text = "<span>" + this.elems[i].innerHTML.slice(0, start) + "</span>";
                    text += "<span class='highlight'>" + this.elems[i].innerHTML.slice(start, end) + "</span>";
                    text += "<span>" + this.elems[i].innerHTML.slice(end) + "</span>";
                    this.elems[i].innerHTML = text;
                } else if (i == 0) {
                    var start = this.range.startOffset;
                    var text = "<span>" + this.elems[i].innerHTML.slice(0, start) + "</span>";
                    text += "<span class='highlight'>" + this.elems[i].innerHTML.slice(start) + "</span>";
                    this.elems[i].innerHTML = text;
                } else if (i == this.elems.length-1) {
                    var end = this.range.endOffset;
                    var text = "<span class='highlight'>" + this.elems[i].innerHTML.slice(0, end) + "</span>";
                    text += "<span>" + this.elems[i].innerHTML.slice(end) + "</span>";
                    this.elems[i].innerHTML = text;
                } else {
                    var highlight = document.createElement('span')
                    highlight.innerHTML = this.elems[i].innerHTML;
                    $(highlight).addClass('highlight');
                    $(this.elems[i]).empty().append(highlight);
                }
            }
        },
        remove: function() {
            var elem = this.get_element();
            $(elem).removeClass(this.type);
        },
        export: function() {
            return {
                uid: this.uid,
                range: this.range,
                type: this.type,
                data: this.data
            }
        }
    }
    
    return {
        Doc: Doc,
        Patch: Patch
    }
});