/*
 * Data Models for Annotare
*/
define(['util', 'api', 'diff_match_patch', 'JSON', 'showdown'], function(util, api, diff_match, JSON, showdown){
    
    function Doc(name) {
        this.name = name;
        this.key = name;
        this.text = "";
        this.revisions = [];
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
            var revs = [];
            for (var i=0; i<this.revisions.length; i++) {
                revs.push(this.revisions[i].export());
            }
            util.cache.set(this.key, {
                name: this.name,
                key: this.key,
                text: this.text,
                revisions: revs,
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
        new_highlight: function(range) {
            var highlight = new Highlight({range: range, time: +(new Date()), name: this.name});
            var old_text = this.render();
            var new_text = highlight.apply(old_text);
            this.new_patch(new_text);
            this.reload_view(this, []);
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
            return converter.makeHtml(this.render());
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
    
    
    function Highlight(args) {
        this.time = args.time;
        this.name = args.name;
        if (args.range) {
            this.range = args.range;
            this.process();
        } else {
            this.parts = args.parts;
        }
    }
    Highlight.prototype = {
        differ: new diff_match_patch(),
        get_next_node: function(node, skipChildren, endNode){
            //if there are child nodes and we didn't come from a child node
            if (endNode.data == node.innerHTML)
                return null;
            if (node.firstChild && !skipChildren)
                return node.firstChild;
            if (!node.parentNode)
                return null;
            return node.nextSibling || this.get_next_node(node.parentNode, skipChildren, endNode); 
        },
        get_nodes_in_range: function(range) {
            var startNode = range.startContainer.childNodes[range.startOffset] || range.startContainer;//it's a text node
            var endNode = range.endContainer.childNodes[range.endOffset] || range.endContainer;
            
            if (startNode.innerHTML == undefined)
                startNode = startNode.parentNode;
            
            if (startNode.data == endNode.data && startNode.childNodes.length === 0) {
                if (range.endOffset - range.startOffset > 0) {
                    return [startNode];
                }
            };

            var nodes = [];
            do {
                if (!startNode.data)
                    nodes.push(startNode);
            } while (startNode = this.get_next_node(startNode, true, endNode));
            return nodes;
        },
        process: function() {
            var elements = this.get_nodes_in_range(this.range);
            var parts = [];
            for (var i=0; i<elements.length; i++) {
                var element = elements[i];
                var text = element.innerHTML;
                // Discard Text Nodes
                if (text != undefined) {
                    if (elements.length == 1) {
                        // One element
                        text = text.slice(this.range.startOffset, this.range.endOffset);
                    } else if (i == 0) {
                        // First
                        text = text.slice(this.range.startOffset);
                    } else if (i == elements.length-1) {
                        // Last
                        text = text.slice(0, this.range.endOffset);
                    }
                    text = text.strip();
                    parts.push(text);
                }
            }
            this.parts = parts;
        },
        apply: function(text) {
            console.log(this.parts);
            var container = $('#' + this.name)[0];
            //var range = document.createRange();
            //range.setStart(container.firstChild);
            //range.setEnd(container.lastChild);
            //var elements = this.get_nodes_in_range(range);
            var differ = new diff_match_patch();
            for (var i=0; i<this.parts.length; i++) {
                var part = this.parts[i];
                // Replace the string
                text = text.replace(part, '*' + part + '*')
            }
            return text;
        },
        export: function() {
            return {
                parts: this.parts,
                time: this.time,
                name: this.name
            }
        }
    }
    
    return {
        Doc: Doc,
        Patch: Patch
    }
});