# If Twine Lost Your Story

## If All Stories Are Gone

If you are using browser Twine with Safari, one possible explanation is that,
unfortunately, [your browser may have erased your
work](../getting-started/installing.md) if you haven't used Twine in a week.

You may have also accidentally deleted your stories by clearing your browser
history or removing a profile from your browser.

To see what is left, [open your browser local storage](./local-storage.md). Any
stories will be listed with keys that start with `twine-stories`. Individual
passages will be listed with keys that start with `twine-passages`. You may be
able to recreate your work using this information.

Unfortunately, if you don't see anything in local storage, you will need to
restore your work from [a backup](backups.md).

If app Twine doesn't show any stories, check the contents of your story library
folder. If you see files there that Twine isn't showing, then there's something
wrong with the files that is making Twine think that they are not story files.
Try opening them in a plain text editor; if the problem is obvious, you might be
able to edit them directly, or you might be able to recreate the story using
this file. The underlying structure of these files is [documented
here](https://github.com/iftechfoundation/twine-specs/blob/master/twine-2-htmloutput-spec.md).

## If Only Some Stories Are Gone

This is most likely caused by Twine having trouble with some aspect of your
story, for example if the HTML structure of your story file became damaged. If
you see the file in your story library folder, try opening it in a plain text
editor. As above, you might be able to edit the files directly and repair them,
or recreate your story using them as a guide.