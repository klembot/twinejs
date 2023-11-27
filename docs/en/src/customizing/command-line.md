# Command-Line Switches

This page only applies to app Twine.

In addition to preferences you set through Twine's user interface, you can
customize app Twine's behavior through command-line switches. These change
Twine's behavior in only the session you launch with these switches. They don't
change preferences you have set using other methods.

## Setting Command-Line Switches

The way you set command-line switches depends on what operating system you use.

### Linux

These are set in the command that launches Twine. If you are launching Twine via
a terminal session, you'd add them to that command. If you are launching it
using a desktop environment like Gnome or KDE, check to documentation for your
desktop environment for directions.

### macOS

There are two ways to accomplish this:

- Launch Twine using the Terminal application and add the switches to the end of
  the command launching Twine. You will need to invoke the Twine executable
  directly, like this:

```
/Applications/Twine.app/Contents/MacOS/Twine --switch --switch2
```

- Create an AppleScript that runs the command for you. See [this StackOverflow
  post](https://superuser.com/a/16777) for details.

### Windows

There are two ways to do this:

- Launch Twine using the Command Prompt or Console application. Add switches to
  the end of the command launching Twine, like this:

```
C:\Program Files\Twine\Twine.exe --switch --switch2
```

- Edit the shortcut that you use to launch Twine, or create a new one. Add
  command-line switches to the end of the _Target_ field of the shortcut dialog,
  following the example above.

Although some applications on Windows use `/` to start command-line switches,
Twine doesn't. It uses `--`, the same as on other operating systems.

## A Reminder About Spaces and Pathnames

Many command line switches used by Twine set pathnames for folders. If a folder
in the path you want to set contains a space, you must put quotation marks
around the entire path, like so:

<code>&#x2011;&#x2011;scratchFolderPath="C:\Users\Jane Doe\twine-scratch"</code>

## Backup Folder Switches

### <code>--backupFolderPath=_[path]_</code>

Example: <code>&#x2011;&#x2011;backupFolderPath=/Users/janedoe/twine-backups/</code>

This sets the full pathname of the backup folder to use. Twine will create this
folder if it doesn't already exist. If Twine isn't able to do this, or isn't
able to read the files in this folder, it will show an error message whenever it
tries to save a backup of your story library.

**Never set your backup folder to a folder that has files created by other
applications in it.** Twine can't distinguish between backups it created and any
other files, and **will delete them permanently** when they become too old.

## Graphics Switches

### <code>--disableHardwareAcceleration=_[true or false]_</code>

Example: <code>&#x2011;&#x2011;disableHardwareAcceleration=true</code>

This disables hardware accelerated graphics in Twine. This should only be needed
if you experience visual glitches in Twine. Disabling hardware acceleration will
likely make Twine less performant in general.

## Story Library Folder Switches

### <code>--storyLibraryFolderPath=_[path]_</code>

Example:
<code>&#x2011;&#x2011;storyLibraryFolderPath=/Users/janedoe/twine-stories/</code>

This sets the full pathname of the story library. For example,
<code>&#x2011;&#x2011;storyLibraryFolderPath=/Users/janedoe/twine-stories</code>.
Twine will create this folder if it doesn't already exist. If Twine isn't able
to do this, or it isn't able to read the files in this folder, it will show a
dialog box where you can choose to either use the default folder instead, or to
quit the app.

## Scratch Folder Switches

You can use a different location as your scratch folder, or change the length of
time Twine keeps files around for in the scratch folder. For example, if your
main storage volume is a solid state drive and you'd like to avoid writing to
it, you can use a different volume.

### <code>--scratchFolderPath=_[path]_</code>

Example: <code>&#x2011;&#x2011;scratchFolderPath=/tmp/twine-scratch</code>

This sets the full pathname of the scratch folder to use. If this folder doesn't
already exist, Twine will try to create it. If Twine is unable to create the
folder at the path you've set, it will show an error message when you play,
test, or proof a story.

**Never set your scratch folder to a folder that has files created by other
applications in it.** Twine can't distinguish between files it created and any
other files, and **will delete them permanently** when they become too old.

### <code>--scratchFileCleanupAge=_[number]_</code>

Example: <code>&#x2011;&#x2011;scratchFileCleanupAge=60</code>

This sets how old a file must be before Twine deletes it from the scratch
folder, in minutes. Twine considers the last time the file was modified, not
when it was created, when deciding whether to keep the file. To have Twine
delete all files from the scratch folder every time you quit it, set
<code>&#x2011;&#x2011;scratchFileCleanupAge=0</code>.
