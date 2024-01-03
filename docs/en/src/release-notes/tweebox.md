# About Tweebox

Tweebox was a predecessor to Twine that worked similarly to Tweego, extwee, and
other command-line tools, but used a graphical interface instead. It also
included a command-line version called `twee`. These release notes are archived
here for historical reasons.

---

# Tweebox 2.1.1

Release Date: February 17, 2009

## Changes

I just put up Tweebox 2.1.1 for Windows, which is a bugfix release. If you ran
into problems with 2.1, please give this a shot. An OS X version is also
forthcoming.

If you do have Tweebox 2.1 already installed, please uninstall it before running
the 2.1.1 installer. I haven't quite figured out how to configure the installer
package I'm using for Windows to do updates.

Downloads, as always, are here: `http://gimcrackd.com/etc/src/`

---

# Tweebox 2.1.0 / Twee 1.5

Release Date: January 11, 2009

## Changes

### Sugarcane template

I posted about this some time ago, while I was working on it. It's a new
template that shows only one passage at a time, per the request of many, many
people. You can see an example of a story in this template here:
`http://gimcrackd.com/etc/src/examplesugarcane.html`


### Proofing your text

Tweebox now has an option to generate a proofing copy of your story -- e.g. all
your passages in RTF format. This makes it easy to give your work to a
proofreader to look over; Tweebox now converts your source code to a more
readable format. There's also a command-line tool to do this named toward.


### Windows installer

The Windows version now has a proper installer/uninstaller.

You can download the new version here: `http://gimcrackd.com/etc/src/`

I haven't posted an OS X version of Tweebox 2.1 because I don't have access to a
Mac right now. If you use a Mac and are comfortable installing wxPython
(`http://www.wxpython.org/download.php`), please drop me an email.

---

# Tweebox 2.0.0

Release Date: June 21, 2008

## Changes

A new version of Tweebox has been long overdue, and since I haven't heard too
many bug reports about the last pre-release I posted, I went ahead and released
Tweebox 2.0. As I guess I mentioned a while back, it is now a desktop
application that has both Windows and OS X flavors. It works more or less the
same as the old Tweebox, only better (hopefully). 

---

# Tweebox 1.2.0

Release Date: January 6, 2008

## Changes

* Both Tweebox and twee now use Jonah 2, which features a new look, the ability
  for users to rewind a story to a previous decision point, and intelligent
  bookmarking. See `http://code.google.com/p/twee/wiki/Jonah2Changes` for a full
  explanation of changes.

* twee now runs on Python, which means no extra software is required for use on
  Unix-based systems (e.g. OS X, Linux).

I've also revised and expanded the online help to cover common questions people
have posted to the group:

`http://gimcrackd.com/etc/doc/`

Finally, if you are interested in extending Jonah, the API documentation has
found a permanent home at:

`http://gimcrackd.com/etc/api/`

---

# Tweebox 1.1.0

Release Date: January 15, 2007

Create your own interactive stories with Tweebox, the same tool used to produce
the stories on this Web site. Write with your favorite word processor; build and
test with a simple desktop application. It's easy and fun.

## No Code Required

Tweebox uses a few simple notations to indicate how a story is structured. Two
colons set off a new section of a story, and double brackets link them together.
If you've ever edited a story on Wikipedia or another wiki, you're way ahead of
the game. You don't need any programming skills to put together a story. (Check
out an example source file and its playable version in the Jonah and Sugarcane
formats.)

## Free As In Free

Stories you create with Tweebox can be used however you'd like. Because the
final output is a single, small Web page, you can easily email a story to
friends, post it on your Web site, or even distribute it on a CD-ROM. (You could
use a floppy disk just as easily — stories take up that little space.) You can
also use your stories for commercial purposes without restriction.

Tweebox is free to download and use, and you can share it with anyone you like.
You can even modify the Tweebox compiler, provided you release your own version
under the GNU Public License.

## Changes

* Simpler, prettier graphical interface. All your project settings are on one
  page - no more tabs!

* The online help has been updated to be easier to navigate.

* Jonah has been compressed even more, so its starting code size is now 40k.

* Jonah also has two new macros: remember, which stores values acrosspage loads,
  and silently, which lets you run many macros without having extraneous line
  breaks appear in your source code.

If you use Internet Explorer and haven't upgraded yet, I'd highly recommend it.

---

# Tweebox 1.0.0

Release Date: December 7, 2006

Tweecode contains three tools: `twee`, creates HTML from Twee markup; `untwee`,
creates Twee from HTML; and `tiddlywiki.php`, 

The original code in Tweebox, `twee`, `untwee`, and `tiddlywiki.php`, are
licensed under the GNU General Public License. The file `zip.php` comes from the
phpMyAdmin project, and is used under the terms of the GPL. There are header
files included with the Twee download that are derived from Jeremy Ruston's
TiddlyWiki code, and as such fall under the BSD license. And finally, the
default readme that comes with the iPod content that Twee produces is covered
under the Creative Commons Attribution-ShareAlike 2.5 License.

---

# Twee 1.0.0

Release Date: March 28, 2006

## Description

Twee is a simple markup language for TiddlyWiki. It was invented when Chris
Klimas accidentally spilled water on his laptop's trackpad, which knocked it out
of commission temporarily. He wanted to continue to work on his TiddlyWiki and
invented a markup language and command-line tool for this purpose.

Borrowing from TiddlyWiki, each section is named a *tiddler*. To create these in
the Twee markup language, two colons are needed. This is followed by the name of
the section and any tags in single opening and closing square brackets.

An example of Twee looks like the following:

```
:: Title [oneTag otherTag]

This is the title!
```

There are four required tiddlers:

* SiteTitle
* SiteSubtitle
* DefaultTiddlers
* MainMenu

To create a usable HTML file, the tool `twee` is used to convert the markup
language into a playable text.
