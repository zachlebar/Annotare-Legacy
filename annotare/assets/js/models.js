/*
 * Data Models for Annotare
*/
define(['util', 'api', 'diff_match_patch', 'JSON', 'showdown', 'md5'], function(util, api, diff_match, JSON, showdown, hash){
    
    function Doc(name) {
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
                    this.annotations[key] = new Annotation(data.annotations[key].hash, data.annotations[key].timestamp, data.annotations[key].data);
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
        // Create New Highlight
        toggle_highlight: function(elem) {
            var highlight = new Annotation(elem.id, +(new Date()));
            highlight.apply();
            this.annotations[highlight.hash] = highlight;
            this.save();
        },
        // Apply Patches & Annotations and return rendered text
        render: function() {
            var text = this.text;
            for (var i=0; i<this.revisions.length; i++) {
                text = this.revisions[i].apply(text);
            }
            return text;
        },
        to_html: function() {
            var converter = new Showdown.converter();
            var md = this.render();
            var container = document.createElement('div');
            var html = converter.makeHtml(md);
            container.innerHTML = html;
            // Split elements into highlightable setences
            var process_highlightable_text = function() {
                var tag_name = this.tagName.toLowerCase();
                if (tag_name == 'ul' || tag_name == 'ol' || tag_name == 'dl') {
                    // Lists are a special case :(
                    $(this).children('li, dt, dd').each(process_highlightable_text);
                } else {
                    // All other elements
                    if (this.innerHTML.indexOf('.') != -1 || this.innerHTML.indexOf('!') != -1 || this.innerHTML.indexOf('?') != -1) {
                        var para = this.innerHTML.split(/(\. )|(\! )|(\? )/);
                        if (para.length == 1)
                            para = this.innerHTML.split(/(\.)|(\!)|(\?)/);
                        this.innerHTML = "";
                        for (var i=0; i<para.length; i++) {
                            if (para[i] != undefined && para[i].length > 2) {
                                var punct = para[i+1] || para[i+2] || '';
                                this.innerHTML += "<span class='highlightable' id='" + hash.hex(para[i]) + "'>" + para[i] + punct + "</span>";
                            }
                        }
                    } else {
                        var para = this.innerHTML;
                        if (para.length > 0) {
                            this.innerHTML = "<span class='highlightable' id='" + hash.hex(para) + "'>" + para + "</span>";
                        }
                    }
                }
            }
            $(container).children().each(process_highlightable_text);
            return container
        },
        apply_annotations: function(elem) {
            for (var key in this.annotations) {
                this.annotations[key].apply(elem);
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
    
    
    function Annotation(hash, timestamp, data) {
        this.hash = hash;
        this.timestamp = timestamp;
        if (data == undefined) {
            this.type = 'highlight';
            this.data = undefined;
        } else {
            this.type = 'note';
            this.data = data;
        }
    }
    Annotation.prototype = {
        differ: new diff_match_patch(),
        get_all_ids: function(elem, ids) {
            var ids = ids || [];
            var self = this;
            $(elem).children().each(function() {
                console.log(this);
                ids.push(this.id);
                ids = self.get_all_ids(this, ids);
            });
            return ids
        },
        get_element: function(container) {
            var ids = this.get_all_ids(container);
            console.log(ids);
            // Exact match?
            if (ids.indexOf(this.hash) != -1) {
                var elem = document.getElementById(ids[ids.indexOf(this.hash)]);
            }
            this.elem = elem;
            return this.elem;
        },
        apply: function(container) {
            var elem = this.get_element(container);
            console.log(elem);
            console.log('apply');
            $(elem).addClass('highlight');
        },
        remove: function() {
            var elem = this.get_element();
            $(elem).removeClass('highlight');
        },
        export: function() {
            return {
                hash: this.hash,
                timestamp: this.timestamp,
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