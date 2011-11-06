define(['util'], function(util) {
    
    // Retreive doc from server in Markdown format
    function get_markdown(name, success, error) {
        if (util.cache.exists(name)) {
            // Get orig from cache
            var data = util.cache.get(name);
            // Apply Text Patches
            var key = name + "-patches";
            if (util.cache.exists(key)) {
                differ = new diff_match_patch();
                var patches = util.cache.get(key);
                for (var i=0; i<patches.length; i++) {
                    console.log(patches[i]);
                    data = differ.patch_apply(patches[i].patch, data)[0];
                }
            }
            // Call success with newly patches text
            success(data);
        } else {
            $.ajax({
                url: '/document/' + name + '.md',
                type: 'GET',
                success: function(data){
                    util.cache.set(name, data);
                    // Apply Text Patches
                    var key = name + "-patches";
                    if (util.cache.exists(key)) {
                        differ = new diff_match_patch();
                        var patches = util.cache.get(key);
                        for (var i=0; i<patches.length; i++) {
                            console.log(patches[i]);
                            data = differ.patch_apply(patches[i].patch, data)[0];
                        }
                    }
                    success(data);
                },
                error: error
            });
        }
    }
    
    var api = {
        get_markdown: get_markdown
    };
    return api
});