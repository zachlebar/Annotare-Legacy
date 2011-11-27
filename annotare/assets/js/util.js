define(['JSON', 'diff_match_patch'], function(JSON, dif){
    var cache = {
        set: function(key, obj) {
            var ser = JSON.stringify(obj)
            localStorage['annotare-' + key] = ser;
            $.ajax({
                url: '/json/' + key,
                type: 'POST',
                processData: false,
                data: ser,
                success: annotare.server.online,
                error: annotare.server.offline
            });
        },
        get: function(key) {
            $.ajax({
                url: '/json/' + key,
                type: 'GET',
                async: false,
                dataType: 'text',
                success: function(data) {
                    localStorage['annotare-' + key] = data;
                    annotare.server.online();
                    console.log('updated ' + key);
                },
                error: annotare.server.offline
            });
            var ser = localStorage['annotare-' + key];
            return JSON.parse(ser);
        },
        exists: function(key) {
            var exists = (localStorage['annotare-' + key] != undefined);
            $.ajax({
                url: '/json/exists/' + key,
                type: 'GET',
                async: false,
                dataType: 'json',
                success: function(data) {
                    exists = true;
                    annotare.server.online();
                },
                error: annotare.server.offline
            });
            return exists;
        },
        update_all: function() {
            // Cache all available documents from the server
            var self = this;
            $.getJSON('/json/list/', function(data){
                annotare.server.online();
                for (var i=0; i<data.length; i++) {
                    self.get(data[i]);
                }
            }, annotare.server.offline);
        }
    }
    
    function get_selected_text() {
        return window.getSelection ? window.getSelection().getRangeAt(0) : document.selection.createRange().text;
    }
    
    function fuzzy_string_search(T, P) {
        //T = T.split(" ");
        //P = P.split(" ");

        var j = 0;
        var i = 0;

        var differ = new diff_match_patch();

        function distance(a, b) {
            //a = a.join(" ");
            //b = b.join(" ");
            var diff = differ.diff_main(a, b);
            differ.diff_cleanupEfficiency(diff);
            return differ.diff_levenshtein(diff);
        }

        function E(i, j) {
            var dis = {};
            i++
            j++
            // Up
            for (var a=0; a<=j; a++) {
                var string = T.slice(0, a);
                for (var b=0; b<=i; b++) {
                    var pattern = P.slice(0, b);
                    dis[distance(pattern, string)] = string;
                }
            }
            // Down
            for (var a=j; a>=0; a--) {
                var string = T.slice(a, j);
                for (var b=i; b>=0; b--) {
                    var pattern = P.slice(b, i);
                    dis[distance(pattern, string)] = string;
                }
            }
            var keys = Object.keys(dis);
            var min = Math.min.apply(this, keys);
            return dis[min];
        }

        var options = [];

        for (var j=0; j<T.length; j++) {
            for (var i=0; i<P.length; i++) {
                var best = E(i, j);
                if (best)
                    options.push(best);
            }
        }

        var best = "";
        var best_dis = Infinity;
        for (var i=0; i<options.length; i++) {
            var dis = distance(P, options[i]);
            if (dis < best_dis) {
                best = options[i];
                best_dis = dis;
            }
        }
        
        //T = T.join(" ");
        //P = P.join(" ");
        //best = best.join(" ");
        
        return {
            pattern: P,
            match: best,
            index: T.indexOf(best),
            //length: match.length
        }
    }
    
    function gen_querystring(obj) {
        var qs = "";
        for (key in obj) {
            var value = obj[key] + '';
            value = escape(value);
            qs += key + "=" + value + "&";
        }
        return qs
    }
    
    
    $('input, textarea').live('focus', function(){
        var placeholder = $(this).attr('data-placeholder');
        if ($(this).val() == placeholder) {
            $(this).val('').removeClass('placeholder');
        }
    });
    $('input, textarea').live('blur', function(){
        var placeholder = $(this).attr('data-placeholder');
        if ($(this).val() == placeholder || $(this).val().length == 0) {
            $(this).val(placeholder).addClass('placeholder');
        }
    });
    $('input, textarea').live('submit', function(){
        var placeholder = $(this).attr('data-placeholder');
        if ($(this).val() == placeholder) {
            $(this).val('').removeClass('placeholder');
        }
    });
    
    window.thhgttg = "Far out in the uncharted backwaters of the unfashionable end of the Western Spiral arm of the \
Galaxy lies a small unregarded yellow sun. \n\nOrbiting this at a distance of roughly ninety-eight million miles is an utterly \
insignificant little blue-green planet whose ape-descended life forms are so amazingly primitive that they still think digital \
watches are a pretty neat idea. \n\nThis planet has — or rather had — a problem, which was this: most of the people living on it \
were unhappy for pretty much all of the time. Many solutions were suggested for this problem, but most of these were largely \
concerned with the movement of small green pieces of paper, which was odd because on the whole it wasn't the small green pieces \
of paper that were unhappy...";
    
    
    return {
        cache: cache,
        get_selected_text: get_selected_text,
        fuzzy_string_search: fuzzy_string_search,
        gen_querystring: gen_querystring
    }
});