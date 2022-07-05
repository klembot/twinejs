# If Twine Won't Start

If Twine shows an error message when first starting and immediately quits, it's
most likely because it is having trouble loading either your preferences or
stories. Twine tries its best to repair problems it finds in saved files at
startup, but sometimes it's not successful.

There are a few steps you can take that may fix this problem:

1. Reset your preferences.
2. If you are using app Twine, remove all files from your story library folder.
   Add them back in one-by-one, launching Twine each time. If Twine won't start
   when you add back a story, that story is the source of the problem.
3. Reinstall Twine.

## Resetting Preferences in Browser Twine

To reset your preferences, you'll need to [edit your browser local
storage](local-storage.md). Delete all local storage keys that begin with
`twine-prefs`. **Don't delete any other local storage keys.** Your stories are
also stored in local storage, so altering those parts of local storage can cause
you to lose them.

Once you've deleted all preference-related keys, reload Twine. Twine will
restore your preferences to their defaults and try to continue loading.

## Resetting Preferences in App Twine

Your preferences are stored in a file named `prefs.json`. Its location depends
on what operating system you're using.
 
- On Linux, it's in `~/.config/Twine`.
- On macOS, it's in `/Users/yourusername/Library/Application Support/Twine`. The
  Library folder is normally hidden in the Finder. You can use the _Go to
  Folder..._ menu item to go there, however.
- On Windows, it's probably in `C:\Users\yourusername\AppData\Roaming\Twine`.
  The AppData folder is also normally hidden, but you can go to it by typing
  `%AppData%` into the location bar of an Explorer window.

To reset your preferences, delete the `prefs.json` file and re-open Twine. It
will restore preferences to defaults and try to continue loading.