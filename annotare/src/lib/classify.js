var Classify = {}; 

Classify.name = function() {
	return alert("I'm Classy!");
}

Classify.converter = function(text) {
	text = "Classified! " + text;
	return text;
}

module.export = Classify;
