var Classify = {}; 

Classify.converter = function() {

	this.addClasses = function(html) {
		var html_array = html.split("\n");

		for(i=0; i < html_array.length; i++) {
			var el;

			if (html_array[i] != "") {
				var el = html_array[i];
				if (el.match(/^<([^<]+?)>@(\w+)\s/g)) {
					var newel = el.replace(/^<([^<]+?)>@(\w+)\s/g, '<$1 class="$2">');
					html_array[i] = newel;
				}
			}
		}
		
		var newhtml = html_array.join("\n");
		
		return newhtml;
	}

	this.extractClass = function(html, css_class) {
		var html_array = html.split("\n");
		
		for(i=0; i < html_array.length; i++) {
			var el;

			if (html_array[i] != "") {
				var el = html_array[i];
				var regex = new RegExp('^<\\w+?\\sclass="' + css_class + '">', 'gm');
				if (el.match(regex)) {
					var newregex = new RegExp('^<\\w+?\\sclass="' + css_class + '">(.+)<\/\\w+>$', 'gm');
					var class_text = el.replace(newregex, "$1");
					
					return class_text;
				}
			}
		}
	}	

}

module.exports = Classify;
