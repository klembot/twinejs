twinejs
-------

by Chris Klimas, Leon Arnott, Daithi O Crualaoich, Ingrid Cheung, Micah Fitch, Juhana Leinonen, and Ross Smith

### SYNOPSIS

This is a port of Twine to a local browser-based app. See
[twinery.org](http://twinery.org) for more info.

### INSTALL

Run `npm install` at the top level of the directory to install all goodies.

You need [Grunt](http://gruntjs.com) to continue. Run `npm install -g grunt-cli`
(you need to have root privileges to achieve this task)

### BUILDING

Run `grunt` to perform a basic build, including creating documentation in doc/;
`grunt watch` will perform the same tasks whenever you make changes to the
source code. `grunt release` will minify everything to as few files as possible
into dist/.
