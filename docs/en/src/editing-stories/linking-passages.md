# Linking Passages

Because links are a fundamental part of Twine stories, the way they are written
is shared across all story formats. In short, you create a link by placing two
square brackets around text in a passage.

- Writing `[[A passage]]` makes a link to a passage named "A passage".

- Writing `[[A label->A passage]]` also makes a link to a passage named "A
  passage", but the text that is displayed onscreen is "A label".

- You can also reverse the arrow direction and write `[[A passage<-A label]]`,
  which has the same exact effect as the previous example.

Passage links are case-sensitive. That is, a link to a passage named "A passage"
will be treated differently from a link to a passage named "A PASSAGE".

Passage links are represented with a solid line ending in an arrow in the story
map. A passage that links to itself shows a circular arrow. Story formats can
extend Twine to add [references](../getting-started/basic-concepts.md). You
should check your story format's documentation to find out how they work. You
can also [disable story format extensions](../story-formats/extensions.md) to
prevent these lines from being drawn.

When you create a new link while writing in the passage edit dialog, Twine will
automatically create a passage for you with the correct name after a short
delay, if it doesn't already exist in your story.

Twine also tries to detect when you're starting to write a link and opens a list
of possible completions. To accept a passage name in the completion list, click
or tap it. If the suggestions don't include what you want, or if you're creating
a link to a new passage, keep typing and the completions list will disappear.

## Renaming Links

If you change your mind about a passage name, you don't need to manually edit
links in other passages. When you [rename a passage](renaming.md), Twine will update
links to passages for you. It won't, however, update any references to a passage
that use story format-specific functionality, like code.

## Image-Based Links

It's possible to use more than plain text as the trigger for a link, but how
this works is dependent on the story format you are using. It's often possible,
for example, to enter an HTML `<img>` tag in the label part of a link. But this
may or may not be supported by the story format you are using.