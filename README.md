**You are reading the README of the `develop` branch, which is currently being
refactored and revised. Much functionality of Twine 2.3.x needs to be restored
on this branch, and what is here is still buggy.**

## twinejs

by Chris Klimas, Leon Arnott, Daithi O Crualaoich, Ingrid Cheung, Thomas Michael
Edwards, Micah Fitch, Juhana Leinonen, Michael Savich, and Ross Smith

### SYNOPSIS

This is a port of Twine to a browser and Electron app. See
[twinery.org](https://twinery.org) for more info.

The story formats in minified format under `story-formats/` exist in separate
repositories:

-   [Harlowe](https://bitbucket.org/_L_/harlowe)
-   [Paperthin](https://github.com/klembot/paperthin)
-   [Snowman](https://github.com/klembot/snowman)
-   [SugarCube](https://bitbucket.org/tmedwards/sugarcube)

### INSTALL

Run `npm install` at the top level of the directory to install all goodies.

### BUILDING

Run `npm start` to begin serving a development version of Twine to
http://localhost:8080. This server will automatically update with changes you
make.

To create a release, run `npm run build`. Finished files will be found under
`dist/`. In order to build Windows apps on OS X or Linux, you will need to have
[Wine](https://www.winehq.org/) and [makensis](http://nsis.sourceforge.net/)
installed. A file named `2.json` is created under `dist/` which contains
information relevant to the autoupdater process, and is currently posted to
https://twinery.org/latestversion/2.json.

To run the app in an Electron context, run `npm run electron`. `npm run electron-dev` is a bit faster as it skips minification.

`npm run lint` and `npm test` will lint and test the source code respectively.

`npm run pot` will create a POT template file for localization at
`src/locale/po/template.pot`. See Localization below for more information.

`npm run clean` will delete existing files in `build/` and `dist/`.

### LOCALIZATION

Would you like to help localize Twine for another language? Awesome! You don't
need to know JavaScript to do so. Here's how it works:

1. Download
   [template.pot](https://github.com/klembot/twinejs/blob/master/src/locale/po/template.pot)
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

4. If you're comfortable using Git, then you can open a pull request to have
   your localization added. Please place it in the `src/locale/po` directory. If
   you aren't, you can instead open a bug tracker issue and attach your PO file,
   flag image, and language name and we'll take it from there.
