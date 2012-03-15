var Classify = {}; 

Classify.converter = function() {

	this.logger = function(text) {
		new_text = "Classified! " + text;
		return new_text;
	}

}

module.exports = Classify;
