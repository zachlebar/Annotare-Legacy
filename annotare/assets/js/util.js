define(['JSON'], function(JSON){
    var cache = {
        set: function(key, obj) {
            var ser = JSON.stringify(obj)
            localStorage['annotare-' + key] = ser;
        },
        get: function(key) {
            var ser = localStorage['annotare-' + key];
            return JSON.parse(ser);
        },
        exists: function(key) {
            return (localStorage['annotare-' + key] != undefined)
        }
    }
    return {
        cache: cache
    }
});