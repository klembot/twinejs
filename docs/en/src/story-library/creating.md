# Creating, Copying and Importing Stories

## Creating a New Story

To create a new story, use the _New_ button under the _Story_ top toolbar tab.
Twine will ask you what you'd like to call your story, but this is just a
starting point. It can be changed at any time. The only limitation is that you
can't have two stories with the same name in your library.

Once you've chosen a name for a new story, Twine will take you to the Story Map
screen to let you begin editing it.

To change the name of a story once it's created, select it in the Story Library
screen and choose _Rename_ from the _Story_ top toolbar tab.

## Copying a Story

To make a copy of an existing story, select it and choose _Duplicate_ from the
_Story_ top toolbar tab. Twine will create a copy for you with a unique name.

## Importing Stories

Twine can import stories in progress, published stories, exported archives, and
Twee source code. It cannot, however, import stories from Twine 1.

To import stories or archives, the process is the same:

1. Choose _Import_ from the _Library_ top toolbar tab.
2. In the dialog that appears, choose the file corresponding to your story
   or archive. If the file you want to import is disabled in the file dialog,
   it's because it's in a format that can't be used by Twine.
3. If the stories in the file you selected don't have the same name as any story
   already in your library, Twine will import them immediately.
4. Otherwise, the dialog will show the story or stories Twine found in your
   file. Select the ones you want to import; stories that won't overwrite
   existing stories in your library are checked off for you by default. The
   dialog'll warn you if a story you're importing has the same name as one
   already in your library. **If you do choose to import it, it will overwrite
   your existing story completely.**
5. Use the _Import Selected Files_ button in the dialog to import the files
   you've selected.

If you change your mind about importing midway through the process, close the
dialog or choose a different file to restart the process.

## Twee Import Limitations

Twine will use the story and passage metadata present in Twee source code, such
as passage position or story name. If this metadata is not present, Twine will
try to substitute reasonable defaults, but it will not handle all cases
perfectly. In particular:

- If Twee source code does not include passage positions, Twine will place
  passages in a grid pattern.
- If a Twee file does not specify what story format and version it uses, Twine
  will set it to [the default story format](../story-formats/default.html).
