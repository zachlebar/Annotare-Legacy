var Classify = {}; 

Classify.converter = function() {

	this.addClasses = function(html) {
		var html_array = html.split("\n");

		for(i=0; i < html_array.length; i++) {
			var el;

			if (html_array[i] != "") {
				var el = html_array[i];
				if (el.match(/^<([^<]+?)>@(\w+)\s/g)) {
					var newel = el.replace(/^<([^<]+?)>@(\w+)\s/g, "<$1 class='$2'>");
					html_array[i] = newel;
				}
			}
		}
		
		var newhtml = html_array.join("\n");
		
		return newhtml;
	}

}

module.exports = Classify;
