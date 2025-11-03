# Editing Passages

To edit a passage, select it and choose _Edit_ from the Passage top toolbar tab.
If you're using a mouse, you can also double-click a passage to edit it. This
will open a dialog where you can make changes to the passage.

Most of the passage edit dialog is taken up by a text area where you can enter
text that the player will see when playing your story. To be more precise, the
text you enter will be rendered by the story format when your story is played.
For instance, you might enter code into your passage to set variables or
conditionally display some text.

The font and size of the text can be customized in [Twine's
preferences](../preferences). This doesn't change what the passage looks like
when played; it just lets you make the text editor more comfortable to use.

Story formats can extend Twine to add syntax formatting to the passage text
editor. For example, links might appear in a blue color. You'll need to consult
the documentation for your story format as to what these colors mean. You can
also disable syntax coloring by [disabling story format
extensions](../story-formats/extensions.md).

Twine automatically saves your changes to a passage after you stop typing for a
moment.

## Leading and Trailing Space in Passage Names

If a passage has leading or trailing spaces in its name (like " Hello" or
"Goodbye "), then Twine will show placeholder symbols in the passage edit dialog
name that look like ␣. These symbols are shown so that you can distinguish
between passages that have these spaces and those that don't. In other words,
Twine treats a passage named "Hello" and one named "Hello " as two unrelated
passages. (And usually, you will want to give your passages names that don't
differ by just spaces.)

These symbols are only visible in Twine, not when your story is played.

## Editing Multiple Passages

If you edit a passage while another is open for editing, the new edit dialog
will appear on top of the existing one. Twine will keep up to five passage edit
dialogs open below the most recent one. If you open more than that, Twine will
close the oldest passage edit dialog for you.

Click or tap a passage edit dialog in the background to bring it to the front,
or select the close button in the dialog to close it.

If you have more than three passage edit dialogs open, Twine will overlap the
oldest to save screen space. Point or tap on the overlapped dialogs to reveal
them, and move your mouse away or tap elsewhere to restore them to their
previous state.

## Automatically-Created Links

As you enter text in a passage, Twine will detect when you've added new links.
If the destination passage doesn't already exist, it will create an empty
passage for you. Deleting the link will delete this empty passage.

Twine won't delete an empty passage while editing if any of the criteria below
are true:

- It is linked to from another passage
- It has any tags
- It has a different size than the default
- It is the story start

## Text Formatting, Code, Images, Sound, Video... Basically Everything Cool

You should consult the documentation of the story format you are using for how
to include things like text formatting, code, or multimedia in your passages.
All these things are possible, but the way you handle each one varies by story
format.

## The Passage Toolbar

At the top of the passage edit dialog is a toolbar that lets you make changes to
other aspects of passage than its text.

- _Undo_ and _Redo_ undo and redo changes you've made in the text editor only.
  Other kinds of changes can be undone using the [top toolbar undo and redo
  buttons](undoing.md).
- _Tag_ [adds tags to a passage](tagging.md).
- _Size_ changes the size of the passage's card in the map. A story format
  could change how your passage is displayed based on its size, but usually,
  this doesn't have any effect on the experience of playing the story.
- _Rename_ changes the name of the passage.
- _Start Story Here_ makes this passage the start passage for the story. If this
  button is disabled, it's because the passage is already the start passage.

## Story Format Toolbars

Story formats can extend Twine's passage edit dialog to include a toolbar with
functionality specific to the format. You should check the documentation for
your story format for details on how it works.

If something goes wrong with a story format toolbar, Twine will hide it so that
you can continue editing. Closing the dialog and re-opening it should bring back
the format toolbar--assuming the problem was a transitory one.

Story format toolbars can be turned off permanently by [disabling story format
extensions](../story-formats/extensions.md).
