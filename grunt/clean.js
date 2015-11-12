module.exports = function (grunt)
{
	// clean deletes everything under build/ and dist/.

	grunt.config.merge({
		clean: ['build/', 'dist/']
	});
};
