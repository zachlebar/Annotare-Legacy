window.device = 'desktop';
require(['views', 'util'], function main(views, util) {
    // Map hashbangs to views
    window.annotare = annotare = {};
    annotare.views = views;
    var urls = [
        ['^test$',  annotare.views.test],
        ['^document$', annotare.views.doc],
        ['^edit$', annotare.views.edit],
        ['^history$', annotare.views.history],
        ['^annotate$', annotare.views.note]
    ]
    
    // Modal Object
    function Modal(container, view, index) {
        this.container = container;
        this.view = view;
        this.index = index;
        this.is_open = false;
    }
    Modal.prototype = {
        open: function() {
            if (device == 'iphone') {
                $(this.container).css({
                    'position': 'fixed',
                    'z-index': 9999,
                    'top': '20px',
                    'left': '20px',
                    'right': '20px',
                    'bottom': '20px',
                    'margin': '0'
                });
                if (!this.view.display.disable_close) {
                    var close = document.createElement('div');
                    close.id = "close-button";
                    $(close).css({
                        'z-index': 9999,
                        'position': 'fixed',
                        'top': '5px',
                        'right': '5px'
                    });
                }
            } else {
                var width = Math.min(this.view.display.width, $(window).width());
                var height = Math.min(this.view.display.height, $(window).height());
                $(this.container).css({
                    'width': width,
                    'height': height,
                    'position': 'fixed',
                    'z-index': 9998,
                    'top': '-' + ($(window).height() + height) + 'px',
                    'left': (($(window).width() - width) / 2) + 'px',
                    'margin': '0 0 0 0',
                    '-webkit-transition': 'all 1s ease-in-out',
                    '-moz-transition': 'all 1s ease-in-out',
                    '-o-transition': 'all 1s ease-in-out',
                    '-ms-transition': 'all 1s ease-in-out',
                    'transition': 'all 1s ease-in-out'
                });
                if (!this.view.display.disable_close) {
                    var close = document.createElement('div');
                    close.id = "close-button";
                    $(close).css({
                        'position': 'absolute',
                        'z-index': 9999,
                        'top': (($(window).height() - height) / 2 - 15) + 'px',
                        'right': ((($(window).width() - width) / 2) - 55) + 'px',
                    });
                }
            }
            var mask = document.createElement('div');
            mask.id = "mask-overlay";
            $(mask).css({
                'width': '100%',
                'height': '100%',
                'position': 'fixed',
                'z-index': 9000,
                'top': 0,
                'left': 0,
                'right': 0,
                'bottom': 0,
                'padding': '0 0 0 0',
                'background-color': '#222',
                'opacity': 0,
                'margin': '0 0 0 0',
                'cursor': 'pointer'
            });
            $(this.container).addClass('modal');
            document.body.appendChild(mask);
            document.body.appendChild(this.container);
            if (!this.view.display.disable_close)
                document.body.appendChild(close);
            $(mask).animate({'opacity': 0.75}, 500);
            if (device != 'iphone')
                $(this.container).css({'top': ($(window).height() - this.view.display.height) / 2});
            this.is_open = true;
            if (!this.view.display.disable_close) {
                $(mask).click(function(){ annotare.router.close_modal(); });
                $(close).click(function(){ annotare.router.close_modal(); });
            }
        },
        close: function() {
            $(this.container).css({'top': $(window).height()*1.5, 'opacity': 0});
            var mask = $('#mask-overlay');
            $('#close-button').remove()
            $(mask).animate({'opacity': 0.0}, 500, $.proxy(function(){
                $(mask).remove();
                this.view.unload();
                this.view.restart();
                this.is_open = false;
            }, this));
        }
    }
    
    // Sidebar
    function Sidebar(container, view, index) {
        this.container = container;
        this.view = view;
        this.index = index;
        this.is_open = false;
    }
    Sidebar.prototype = {
        open: function() {
            if (SETTINGS.device == 'iphone') {
                $(this.container).css({
                    'width': '90%',
                    'height': '100%',
                    'position': 'absolute',
                    'z-index': 5000,
                    'top': 0,
                    'left': 0,
                    'right': 0,
                    'bottom': 0,
                    'margin': '0 0 0 0'
                });
            } else {
                $(this.container).css({
                    'width': this.view.display.width,
                    'height': '100%',
                    'position': 'absolute',
                    'z-index': 5000,
                    'top': '0px',
                    'left': '-' + (this.view.width + 20) + 'px',
                    'margin': '0 0 0 0'
                });
            }
            document.body.appendChild(this.container);
            $(this.container).animate({'left': 0}, 500);
            this.is_open = true;
        },
        close: function() {
            $(this.container).animate({'left': '-' + this.view.display.width + 'px'}, 500);
            this.is_open = false;
        }
    }
    
    // Url Router
    function Router(urls, catchall, interval) {
        this.urls = urls;
        this.catchall = catchall || 'default';
        this.old_hash = null;
        this.old_modal = null;
        this.old_args = null;
        this.interval = interval || 500;
        this.modal = null;
    }
    Router.prototype = {
        get_hash: function() {
            // Clean up url
            var url = window.location.hash;
            var args = '';
            if (url.indexOf('#') == 0)
                url = url.slice(1);
            if (url.indexOf('!') == 0)
                url = url.slice(1);
            if (url.indexOf('/') == 0)
                url = url.slice(1);
            if (url.indexOf('?') != -1) {
                args = url.split('?')[1];
                url = url.split('?')[0];
            }
            // Split main view and modal url based on dot_index
            if (url.indexOf('.') != -1) {
                var main = url.split('.')[0];
                var modal = url.split('.')[1];
            } else {
                var main = url;
                var modal = null;
            }
            return {
                url: url,
                main: main,
                modal: modal,
                args: args
            }
        },
        set_hash: function(main, modal, args) {
            url = '#!/' + main
            if (modal)
                url = url + '.' + modal
            if (args)
                url = url + '?' + args;
            window.location.hash = url;
            return url;
        },
        parse_hash: function(dot_index) {
            var dot_index = dot_index || 0;
            var url = this.get_hash().url;
            if (url.indexOf('.') != -1)
                url = url.split('.')[dot_index];
            else if (url.indexOf('.') == -1 && dot_index != 0)
                url = null;
            return url;
        },
        resolve: function(url, urls, dot_index) {
            var urls = urls || this.urls;
            // Grep normal URLs
            for (var i=0; i<urls.length; i++) {
                var regex = new RegExp(urls[i][0]);
                var view  = urls[i][1];
                var match = url.match(regex);
                if (match != null) {
                    return [view, i];
                }
            }
            this.set_hash(this.catchall);
            return this.resolve(this.catchall);
        },
        watch: function() {
            var main = this.parse_hash(0);
            var modal = this.parse_hash(1);
            var args = (window.location.hash.indexOf('?') != -1) ? window.location.hash.split('?')[1] : '';
            
            // Resolve Main View
            if (this.old_hash == undefined) {
                var view = this.resolve(main);
                annotare.router.switch_view(view[0], view[1])
                this.old_hash = main;
            }
            
            if ((modal != this.old_modal || args != this.old_args) && modal != null && modal != undefined) {
                // Resolve Modal View
                var view = this.resolve(modal);
                annotare.router.switch_view(view[0], view[1]);
                this.old_modal = modal;
            } else if (main != this.old_hash || args != this.old_args) {
                // Resolve Fullscreen View
                var view = this.resolve(main);
                annotare.router.switch_view(view[0], view[1])
                this.old_hash = main;
            } else if (modal == null || modal == undefined) {
                annotare.router.close_modal();
            }
            
            this.old_args = args;
            
            // Loop
            setTimeout($.proxy(this.watch, this), this.interval);
            return false;
        },
        open_modal: function(modal_url, args) {
            // Add a modal to the url hash so that the router catches and opens it
            // Clean up url
            var url = this.get_hash();
            // Join Args
            query_string = {};
            $.extend(query_string, this.parse_arguments(url.args), args);
            // Append the modal url (dot_index is 1)
            query_string = util.gen_querystring(query_string);
            return this.set_hash(url.main, modal_url, query_string);
        },
        close_modal: function(remove_hash) {
            if (!this.modal)
                return;
            remove_hash = (remove_hash === undefined) ? true : remove_hash;
            this.modal.close();
            // Nullify
            this.modal = null;
            this.old_modal = null;
            var url = this.get_hash();
            if (remove_hash)
                return this.set_hash(url.main, null, url.args);
            else
                return window.location.hash;
        },
        switch_view: function(view, index) {
            var args = this.parse_arguments(window.location.hash);
            // Modal or full screen?
            if (view.display.format == 'modal' || view.display.format == 'sidebar') {
                var container = view.load(args);
                // Close existing modal
                if (this.modal)
                    this.close_modal(false);
                if (view.display.format == 'modal')
                    this.modal = new Modal(container, view, index);
                else if (view.display.format == 'sidebar')
                    this.modal = new Sidebar(container, view, index);
                this.modal.open();
            } else {
                // Is a modal open?
                if (this.modal) {
                    this.close_modal();
                }
                // Unload & Reset Current View
                if (this.current_view != undefined)
                    this.current_view.unload();
                if (this.current_view_index != undefined)
                    this.urls[this.current_view_index][1] = this.urls[this.current_view_index][1].restart();
                // Set New Layout
                var layout = $('#main').attr('data-layout');
                $('#main').removeClass(layout).addClass(view.display.layout).attr('data-layout', view.display.layout);
                // Load New View
                var container = view.load(args);
                $('#content').append(container);
                this.current_view = view;
                this.current_view_index = index;
            }
            return false;
        },
        parse_arguments: function(hash) {
            // Process Params
            var args = {}
            if (hash.indexOf('?') != -1)
                var arg_string = hash.split('?')[1];
            else
                var arg_string = hash;
            var pairs = arg_string.split('&');
            for (var i=0; i<pairs.length; i++) {
                var pair = pairs[i].split('=');
                if (pair[1] != undefined && pair[1].length > 0)
                    args[pair[0]] = unescape(pair[1]);
            }
            return args;
        }
    }
    
    // Wait for the page to load
    $(document).ready(function(){
        annotare.router = router = new Router(urls, 'document');
        router.watch();
    });
});



