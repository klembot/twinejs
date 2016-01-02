// This sets the correct format for a build number, and ensures it
// doesn't change during a single grunt run.

var grunt = require('grunt');
var buildNumber;

module.exports = function() {
  if (buildNumber === undefined) {
    buildNumber = grunt.template.date(new Date(), 'yyyymmddhhMM');
  }

  return buildNumber;
};
