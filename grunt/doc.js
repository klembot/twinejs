module.exports = function(grunt) {
  // Groc generates documentation under doc/.

  grunt.config.merge({
    groc: {
      default: {
        src: ['src/**/*.js', 'README.md'],
        dest: 'doc/',
      },
    },
  });

  // Doc runs all documentation-related tasks.

  grunt.registerTask('doc', ['groc']);
};
