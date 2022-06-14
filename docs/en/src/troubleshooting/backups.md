# Backups

The best way to prevent losing work in Twine is to back up your work regularly.

## In App Twine

App Twine makes a backup copy of your work every time you start the application,
and every 20 minutes while you are working. It creates a folder called Backups
next to the story library folder. That is, if your story library folder is in
Home › Documents › Twine › Stories, your backups are in Home › Documents › Twine
› Backups.

You can also keep backups of your own by copying your story library folder, or
individual stories, to another location.

## In Browser Twine

You must keep backups yourself using the
[Archive](../story-library/exporting.md) feature.

## What If I Forgot to Keep Backups And Thing Went Wrong?

You may not be completely out of luck.

In addition to automatic backups, app Twine saves a version of your story to
temporary storage every time you test or play it inside the app. You might be
able to recover it from there.

The easiest way to locate these temp files is to look in your browser history.
Entries that start with `file:///` are most likely what you're looking for. But
you can also look in your temporary folder directly.

- In Linux, look in either `/tmp` or `/var/tmp`.
- In macOS, run this command in the [Terminal
  app](https://support.apple.com/guide/terminal/welcome/mac): `open $TMPDIR`
- In Windows, enter `%Temp%` into the location bar of an Explorer window.

In these directories, look for files ending in `.html`. They will not have your
story name in their title, though. Instead, they have a long string of random
characters, like `7fd8be91-a6d1-459a-a955-b8628ee8e2c4.html`. The only way to be
sure is to open the files in a browser or check their creation date--it will
match when the story was played or tested.