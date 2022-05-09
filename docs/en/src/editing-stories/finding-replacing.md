# Finding and Replacing Text

Searching for and replacing passage text is done through the _Find and Replace_
dialog, which you can open by choosing _Find and Replace_ from the _Story_ top
toolbar tab.

When you enter text into the _Find_ text field, Twine will highlight the cards
of passages containing that text. You'll also see a numeric count of matching
passages in the corner of the Find and Replace dialog.

To replace text you're searching for, enter the replacement in the _Replace_
field and select _Replace In All Passages_.

## Focusing Searches

The _Include Passage Names_ checkbox controls both whether text matches are
highlighted for passage names, and whether text replacements are done in passage
names.

The _Match Case_ checkbox controls whether text matches are case-sensitive. When
it's on, text must be the exact case of what you enter in the _Find_ field for
it to be considered a match.

The _Use Regular Expressions_ checkbox controls whether Twine uses the
JavaScript regular expression parser to both find and replace text. Regular
expressions are a way to specify text patterns. For example, the regular
expression `.and` matches both 'hand' and 'band'.

Regular expressions have a detailed syntax all their own. [Mozilla Developer
Network](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
has a good introduction to the topic.

If you use regular expressions in your search, the _Replace_ field can also
contain backreferences. For example, if you enter `(.)and` in the _Find_ field
and `$1---` in the _Replace_ field, the text `Sand band` will be replaced to
`S--- b---`.