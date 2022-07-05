# Using Images and Multimedia

Twine doesn't have facilities for managing images, sound, or video that you
might want to include in your stories. To do this, you'll need to [publish your
story to a file](../publishing/publishing.md) and place that file in a folder
with those multimedia files. The exact way to display or play multimedia in your
story depends on the story format you're using, but in many cases you will need
to use a [relative
URL](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_is_a_URL#absolute_urls_vs_relative_urls)
to reference these external files.

- If an image named `orange.jpeg` is in the same folder as your published story
  file, the relative URL of the file is just its name, `orange.jpeg`.
- If an image named `pear.png` is in a folder named `images` at the same level
  as your published story file, the relative URL of the file is
  `images/pear.png`.

Unfortunately, you'll have to re-publish your story each time you want to
preview it with the multimedia files.

It is possible to use [Base64
encoding](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs)
to embed multimedia directly into a Twine story, but this isn't recommended as
it is difficult to work with and will make your stories much larger in size.