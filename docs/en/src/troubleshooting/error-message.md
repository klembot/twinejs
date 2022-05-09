# If An Error Message Appears While Editing

## When Twine Can't Save Changes

Twine saves changes to your stories automatically. If it isn't able to save a
change, it will show an alert dialog to warn you. If you see this warning, don't
panic. Try making another small change to your story, like moving a passage
slightly or typing a letter into a passage edit dialog. This will cause Twine to
try to save your changes again. If another alert dialog doesn't appear, then you
can continue working safely--whatever went wrong was most likely a transitory
problem, and Twine was able to save your most recent change.

If you repeatedly see alert dialogs saying Twine wasn't able to save your work,
stop working. Try publishing your story to a file using the _Build_ top toolbar
tab. If this is successful and has up-to-date content in it, restart Twine
(either by quitting the application and re-opening it, or reloading Twine in
your browser) and [re-import the published story](../story-library/creating.md).

One common reason why saving a story fails in app Twine is that permissions are
not correct on your story library folder, or individual story files.

- Check that you are able to add a new file to this folder, like a plain text
  file. Try opening this file outside of Twine, editing it, and saving changes.
- You might have accidentally opened a story file in another application which
  has locked the story file for its own use. Opening story files in web browsers
  shouldn't cause this problem, though.

## When Twine Thinks Another Application Has Changed Your Story

App Twine keeps track of the last time it saved changes to your story. If it
detects the file has changed since that time, it shows a warning dialog letting
you know. (This warning will never appear in browser Twine.) This warning can
happen if:

- You have your story file open in another application and made changes to it
  externally.
- You copy a story file into your story library folder while Twine is open,
  overwriting an existing one.
- Some other application, like backup or cloud sync software, changed your story
  file in the background while you were editing. If you see this warning
  repeatedly, this is the most likely cause.

Twine offers two options in this situation.

- Save the changes you made in Twine, overwriting the file in your story library
  folder. If you don't know why this warning appeared, this is the safest choice
  to make, and will allow you to continue editing in Twine. If you're concerned
  you might accidentally overwrite something you need, make a backup copy of the
  story file outside your story library folder before choosing this option.
- Keep the file as it is and relaunch Twine. This will cause any pending
  change that hasn't been saved to be lost, but the change is likely to be very
  small, since Twine saves changes as you work.