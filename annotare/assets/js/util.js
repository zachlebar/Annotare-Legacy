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
                success: function(data) {
                    console.log('Saved.');
                },
                error: function(data) {
                    console.log('Error code: ' + data.status);
                }
            });
        },
        get: function(key) {
            $.ajax({
                url: '/json/' + key,
                type: 'GET',
                async: false,
                dataType: 'text',
                success: function(data) {
                    localStorage['annotare-' + key] = data
                },
                error: function(data) {
                    console.log('Error code: ' + data.status);
                }
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
                }
            });
            return exists;
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
    
    return {
        cache: cache,
        get_selected_text: get_selected_text,
        fuzzy_string_search: fuzzy_string_search,
        gen_querystring: gen_querystring
    }
});