twinejs
-------

by Chris Klimas, Leon Arnott, Daithi O Crualaoich, Ingrid Cheung, Thomas
Michael Edwards, Micah Fitch, Juhana Leinonen, and Ross Smith

### SYNOPSIS

This is a port of Twine to a local browser-based app. See
[twinery.org](http://twinery.org) for more info.

The story formats in minified format under storyformats/ exist in separate
repositories:
* [Harlowe](https://bitbucket.org/_L_/harlowe)
* [Snowman](https://bitbucket.org/klembot/snowman-2)
* [Paperthin](https://bitbucket.org/klembot/paperthin)

### INSTALL

Run `npm install` at the top level of the directory to install all goodies.

You'll need [Gulp](http://gulpjs.com) to continue. Run `npm install -g gulp`
(you will need to have administrator privileges to achieve this task).

### BUILDING

Run `gulp` to perform a basic build, including creating documentation in doc/;
`gulp watch` will perform the same tasks whenever you make changes to the
source code. `gulp release` will minify everything to as few files as possible
into dist/web (full HTML version), dist/web-cdn (HTML version, using CDN
resources), and dist/nwjs (native app versions). If you'd like to build only one
type of release, run `gulp release:web`, `gulp release:web-cdn`, or `gulp
release:nw`.

When running any `release` task, a file named `2.json` is created under
release/. This contains information relevant to the autoupdater process, and
is currently posted to http://twinery.org/latestversion/2.json.

Downloads are built using the `gulp package` command, and results appear in
dist/download/.

In order to build Windows apps on OS X or Linux, you will need to have
[Wine](https://www.winehq.org/) and [makensis](http://nsis.sourceforge.net/) installed.

### TESTING

This uses [Selenium IDE](http://docs.seleniumhq.org/projects/ide/) for
automated browser testing. Unfortunately, Selenium IDE does not like running on
the file:// protocol because of JavaScript security restrictions. To facilitate
testing, run `gulp server`, which will spin up a basic web server on port
8000.
