# Installing Twine

There are two ways to use Twine: in a web browser or by installing it onto a
computer. Most people prefer to use it in installed form, but the browser
version exists for people in settings which make it difficult to install
software, like a classroom.

This documentation calls the version of Twine you use directly in a browser
"browser Twine" for short, and the version of Twine you install onto a computer
"app Twine."

If you're using a tablet computer, the only way to use Twine is through a web
browser. Twine doesn't have an Android or iOS application.

Twine might work, vaguely, on a phone or other device of that size, but it's
designed to be used on a larger screen. Because you'll most likely do a lot of
typing in Twine, a physical keyboard is ideal, but you probably can use an
onscreen one in a pinch.

## Using a Web Browser

Go to [https://twinery.org](https://twinery.org) and follow the _Use Online_
link to get started.

When you're using browser Twine, it will save your work to that browser and
computer[^local-storage]. If you have multiple profiles in your browser, then
your work is linked to that profile.

**It's critical to understand that if you clear your browser's storage or delete
your browser profile, you will lose all of your work in Twine.** The exact way
this is done varies by browser--for example, in Google Chrome, there is a _Clear
Browsing Data_ option in the _Tools_ menu--but generally speaking, these
features will say things like "clearing your browsing history" or "clearing web
site data."

Keeping backups regularly is a must if you use browser Twine. See [Archiving and
Exporting Stories](../story-library/exporting.md) for how to do this.

### iOS Browsers

**If you want to use Twine on iOS, you must [add it your Home
Screen](https://support.apple.com/guide/iphone/bookmark-favorite-webpages-iph42ab2f3a7/ios#iph4f9a47bbc).**
If you don't do this, all of your work in Twine will be lost if a week ever
passes without you using Twine.

This sounds like an urban myth or a ploy to get people to put Twine on their
Home Screens, but it's unfortunately true. Apple places severe restrictions on
how browsers work on iOS in the name of protecting users's privacy.

The policy it enforces that [if a week passes where you do not visit a web site,
Safari will erase all of its
storage](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/).
This means that if you do not use Twine for a week, everything you create in it
will be lost.

The one exception to this policy is if you add a web site to your Home Screen.
Sites that are added as Home Screen shortcuts will not have their storage
deleted.

**It doesn't matter if you use Chrome, Firefox, or another browser app in iOS.**
The same restrictions apply because (as of this writing, anyway) Apple does not
allow alternate browser engines on the iOS platform. Although these browsers
might look or act differently than the built-in Safari app, underneath they
still use Apple's Safari engine.

### Safari on macOS

**Do not use Twine in the Safari browser on macOS.** The same problems noted in
the iOS section above are true of Safari on macOS, except unfortunately there is
no way to work around them.

Twine will show a warning about this if you do try to use it on Safari. This
warning can't be hidden because the potential for losing all your work is so
disastrous.

## Installing On Your Computer

Go to [https://twinery.org](https://twinery.org) and use the download option for
your platform (Linux, macOS, or Windows).

- On Linux, the downloaded archive will expand to a freestanding directory
  containing the Twine application. You can place this directory wherever you
  like. You might find it easier to install Twine using your distribution's
  package manager, if it has a package for Twine.
- On macOS, the downloaded archive will expand to an application that should be
  copied to your Applications folder.
- On Windows, the downloaded file is an installer application that will put
  Twine in your Program Files folder and add it to the Start Menu.

[^local-storage]: To be specific, the browser version of Twine uses your
    browser's local storage. This is detailed more in [Viewing Local Storage
    Directly](../troubleshooting/local-storage.md). Local storage is similar to
    browser cookies, which you might be more familiar with, but cookies are
    limited to 4 KB of storage, whereas local storage can hold megabytes of data
    (the exact number is dependent on the browser).