twinejs
-------

by Chris Klimas, Leon Arnott, Daithi O Crualaoich, Ingrid Cheung, Thomas
Michael Edwards, Micah Fitch, Juhana Leinonen, and Ross Smith

### SYNOPSIS

This is a port of Twine to a local browser-based app. See
[twinery.org](http://twinery.org) for more info.

The story formats in minified format under `storyformats/` exist in separate
repositories:

* [Harlowe](https://bitbucket.org/_L_/harlowe)
* [Snowman](https://bitbucket.org/klembot/snowman-2)
* [Paperthin](https://bitbucket.org/klembot/paperthin)

### INSTALL

Run `npm install` at the top level of the directory to install all goodies.

You'll also need [Grunt](http://gruntjs.com) to continue. Run `npm install -g grunt-cli`
(you will need to have administrator privileges to achieve this task).

### BUILDING

Run `grunt` to perform a basic build under `build/standalone`; `grunt dev` will
perform the same tasks whenever you make changes to the source code. `grunt nw`
will create executable app versions of Twine from this directory and place them
under `build/nwjs/`. `grunt build:cdn` will build a version of Twine that makes
as much use of CDN resources as possible, and place it under `build/cdn`.

To create downloadable versions of Twine, run `grunt package`. These will be
placed in the `dist/` directory. An additional file named `2.json` is created
under `dist/`. This contains information relevant to the autoupdater process, and
is currently posted to http://twinery.org/latestversion/2.json.

In order to build Windows apps on OS X or Linux, you will need to have
[Wine](https://www.winehq.org/) and [makensis](http://nsis.sourceforge.net/) installed.

### TESTING

Run `grunt test` to run through Selenium-based tests (for now, these only run on
Firefox). To quit a test run as soon as any error is encountered, run `grunt
test --bail`. To run a subset of tests, run `grunt test --grep=mysearch`. Only
tests whose name match the argument you pass will be run.

### LOCALIZATION

Would you like to help localize Twine for another language? Awesome! You don't
need to know JavaScript to do so. Here's how it works:

1. Download
[template.pot](https://bitbucket.org/klembot/twinejs/raw/4b64592fd47dd6678d9d0ebb0f07067f1bfaeabb/locale/po/template.pot)
from the repository.

2. Use a translation application like [Poedit](http://poedit.net/) to create a
.po file with the source text translated. If you are using Poedit, get started
by choosing **New from POT/PO File** from the **File** menu. Make sure to name
your po file according to the [IETF locale naming
convention](https://en.wikipedia.org/wiki/IETF_language_tag) -- Poedit can help
suggest that as well. For example, a generic French translation should be named
`fr.po`, while an Australian English one would be named `en-au.po`.

3. Finally, two other things are needed: an SVG-formatted image of the flag
that should be associated with your language, and what native speakers call the
language you are localizing to (e.g. Fran&ccedil;ais for French speakers).
[Wikimedia
Commons](https://commons.wikimedia.org/wiki/Category:SVG_flags_by_country) is
your best bet for nice-looking SVG flags. Obviously, whatever image you provide
must either be in the public domain or otherwise OK to use in Twine without any
compensation.

4. If you're comfortable using Mercurial, then you can open a pull request to
have your localization added. Please place it in the `src/locale/po` directory. If
you aren't, you can instead open a bug tracker issue and attach your PO file,
flag image, and language name and we'll take it from there.