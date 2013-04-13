// This bootstraps the default template for output, since I'm not sure how 
// else to load it from a file.

window.defaultTemplate = new Template({
	source:
	'<!DOCTYPE html><html><head><title>{{STORY_TITLE}}</title></head><body>{{STORY_DATA}}</body></html>'
});
