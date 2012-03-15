var Classify = {}; 

Classify.converter = function() {

	this.addClasses = function(html) {
		console.log(html);

		//for(i=0; i < jhtml.length; i++) {
		//	var el = jhtml[i];
		//	console.log(
		//}
	}

	this.logger = function(text) {
		new_text = "Classified! " + text;
		return new_text;
	}

}

module.exports = Classify;
