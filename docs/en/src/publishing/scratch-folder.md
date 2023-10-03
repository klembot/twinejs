# The Scratch Folder

This page only applies to app Twine.

When you choose to test, play, or proof a Twine story, app Twine creates a file
and opens it in your web browser. This file is created in your _scratch folder_.
By default, this is a folder named `Scratch` inside your Twine folder.

When you quit app Twine, it cleans up your scratch folder, deleting files that
are more than three days old. (This delay is so that you can continue to view
your work after quitting Twine, and in an emergency, [potentially recover your
work](../troubleshooting/backups.md).) However, you can delete files in the
scratch folder on your own. Files in the scratch folder are only meant to be
used for viewing your work in a browser. Twine will never put anything in the
scratch folder that isn't meant to be short-lived.

## Customizing Scratch Folder Behavior

You can set app Twine to use a different location as your scratch folder, or
change the length of time Twine keeps files around for in the scratch folder.
For example, if your main storage volume is a solid state drive and you'd like
to avoid writing to it, you can set app Twine to use a different volume.

Doing so requires that you set command line switches for Twine. How you do this
depends on what operating system you use:

- If you use MacOS, you will have to [either launch Twine from Terminal, or
  create an script to laucnh Twine](https://superuser.com/q/16750).
- If you use Windows, you can [edit the Twine
  shortcut](https://support.microsoft.com/en-us/office/command-line-switches-for-microsoft-office-products-079164cd-4ef5-4178-b235-441737deb3a6).
  The instructions linked are for Microsoft Office, but will also work for
  Twine.
- If you use Linux, you can add these switches to the command that launches
  Twine, similar to other Linux applications.

There are two switches:

### <code>--scratchFolderPath=_[path]_</code>

This sets the full pathname of the scratch folder to use, for example:
<code>&#x2011;&#x2011;scratchFolderName=/tmp/twine</code> or
<code>&#x2011;&#x2011;scratchFolderName=/Users/janedoe/twine-scratch</code>. If
there are spaces in your pathname, make sure to put quotation marks around this
value, e.g. <code>&#x2011;&#x2011;scratchFolderName="C:\Users\Jane
Doe\twine-scratch"</code>. If this folder doesn't already exist, Twine will try
to create it. If Twine is unable to create the folder at the path you've set, it
will show an error message when you play, test, or proof a story.

**Never set your scratch folder to a folder that has files created by other
applications in it.** Twine can't distinguish between files it created and any
other files, and **will delete them permanently** when they become too old.

### <code>--scratchFileCleanupAge=_[number]_</code>

This sets how old a file must be before Twine deletes it from the scratch
folder, in minutes. Twine considers the last time the file was modified, not
when it was created, when deciding whether to keep the file. To have Twine
delete all files from the scratch folder every time you quit it, set
<code>&#x2011;&#x2011;scratchFileCleanupAge=0</code>.
