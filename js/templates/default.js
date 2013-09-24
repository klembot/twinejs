// This bootstraps the default template for output, since I'm not sure how 
// else to load it from a file.

define(['defaulttemplatesrc', 'models/template'], function (source, Template)
{
	return new Template({ source: source });
});
