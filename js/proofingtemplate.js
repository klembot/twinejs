/**
 Actually an instance of the Template class that plucks the source to
 the runtime template out of the DOM, from a element with class `.proofingTemplate`.
 
 @class Proofingemplate
 @extends Template
**/

ProofingTemplate = new Template(
{
	source: $('.proofingTemplate').text().replace(/\ue000/g, '<').replace(/\ue001/g, '>')
});
