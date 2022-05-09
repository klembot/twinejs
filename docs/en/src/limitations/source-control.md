# Working With Source Control

Because story files are HTML files, they can be tracked using source control
software like [Git](https://git-scm.com). If you do track story files in source
control, quit Twine before taking any actions that will cause the story files in
your library to change, like pulling from a remote or merging branches.

Twine compresses the HTML of story files, which can make reading diffs of
stories difficult. Converting your stories to the plain-text Twee format before
checking them into a source code repository can help with this. Command-line
tools like [Tweego](https://www.motoslave.net/tweego/),
[Extwee](https://github.com/videlais/extwee), and
[twine-utils](https://www.npmjs.com/package/twine-utils) can do this for you.