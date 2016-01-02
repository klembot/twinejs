module.exports = function(grunt) {
  // Clean deletes everything under build/ and dist/.

  grunt.config.merge({
    clean: ['build/', 'dist/'],
  });
};
