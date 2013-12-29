/**
 Actually an instance of the Template class that plucks the source to
 the runtime template out of the DOM, from a element with class `.runtimeTemplate`.
 
 @class RuntimeTemplate
 @extends Template
**/

RuntimeTemplate = new Template(
{
	source: $('.runtimeTemplate').text().replace(/\ue000/g, '<').replace(/\ue001/g, '>')
});
