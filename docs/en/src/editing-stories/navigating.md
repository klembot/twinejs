# Navigating the Story Map

The Story Map screen shows the visual structure of a story. Each passage in it
is represented by a card, and links between them are shown as lines with arrows.

## Scrolling and Zooming

You can scroll around the Story Map screen using all the usual methods you'd use
to scroll around a window: the scrollbars on the side of the window, using
scroll gestures on a trackpad, and so on. If you're using a mouse, you can also
use the right mouse button to grab the view and move it.

In one corner of the Story Map, you'll see three buttons showing squares of
different sizes. These let you zoom in and out of the map, showing different
levels of detail in your passages.

## The Story Start

The story's start passage is drawn in the map with a green rocket icon connected
to it.[^rocket] To change this, select a different passage and choose _Start
Story Here_ from the _Passage_ top toolbar tab. This button is also present in a
passage edit dialog.

## Broken Links

If there is a link in a passage that Twine can't find a passage for, it will
instead show a red line ending in a 'no entry' symbol. [Edit the
passage](editing.md) to correct the problem.

## References

A story format can extend Twine so that it displays _references_. A reference is
a connection between passages, but how exactly they relate is up to the story
format to define. One common example of a reference is when one passage embeds
another inside itself.[^embedding]

If a story format finds references in your passages, they will be displayed as
dashed lines with arrows, rather than solid lines.

References in the story map can be turned off by [disabling story format
extensions](../story-formats/extensions.md).

[^rocket]: The idea behind the icon is that it represents where the story 'lifts
    off.'
[^embedding]: Again, embedding passages is functionality that a story format
    provides, because it governs what happens when a story is played. It isn't
    something Twine does in and of itself.
