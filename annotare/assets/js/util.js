define(['JSON'], function(JSON){
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
    
    return {
        cache: cache,
        get_selected_text: get_selected_text
    }
});