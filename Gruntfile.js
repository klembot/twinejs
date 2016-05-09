module.exports = function (grunt)
{
	require('jit-grunt')(grunt, {
		'nwjs': 'grunt-nw-builder'	
	});
	grunt.initConfig({});
	grunt.loadTasks('grunt/');
};
