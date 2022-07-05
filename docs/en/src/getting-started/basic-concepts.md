# Basic Concepts

## Stories and Passages

Twine calls the things you make with it _stories_. But of course Twine can be
used to create more than just fiction, or even prose, with Twine. People have
used Twine to make:

- Nonfiction essays
- Role-playing games
- Poetry
- Visual novels
- Procedurally-generated text
- Interactive graphic novels
- Dialogue trees for games
- Complete nonsense

But Twine needs a word for these things, and 'story' made the most sense when
Twine was first created more than a decade ago. This reference will call these
things 'stories,' but you can substitute 'game' or 'poem' or 'nonsense' and
every sentence you read will be just as true.

This reference also calls the people experiencing your work 'players,' but this
isn't official terminology by any means. You can call them 'readers' or
'interactors' or just 'people.'

A story is made up of one or more _passages_. A passage is a piece of content
that players will experience at one moment in time as they navigate through a
story. Some people call them
_[lexia](https://www.brown.edu/Departments/Italian_Studies/dweb/literature/hypertext.php)_
or _nodes_. A story usually is made up of many passages, but it could
technically contain just one--though you'd probably be better off using a
traditional writing app or Web development tool instead in that case.

A story always has one _start passage_. This is the passage that will be
displayed first when someone begins playing it.[^start]

## The Story Library

The collection of stories stored in Twine is called the _story library_, or just
_library_ for short.

If you're using browser Twine, the library is stored invisibly in your browser's
storage. However, if you're using app Twine, you'll find your library in a
folder named Twine in your documents folder. Or use the _Show Story Library_
menu item in the _View_ menu of Twine's main menu bar (not the top toolbar).

Your library belongs to just you, regardless of whether you're using app or
browser Twine. You can't share it directly with other people, but you can
[import stories](../story-library/creating.md), [export
stories](../story-library/exporting.md), and [archive your entire
library](../story-library/exporting.md).

There is no limit on the number of stories in your library. You're only limited
by the storage capacity of where your stories are saved. In browser Twine, this
varies by the browser you are using, but 5 megabytes of storage is typical.

## Story Formats

Twine is a tool for editing interactive narratives. It isn't a tool for
_playing_ interactive narratives. When you share a story with players, it exists
as an HTML file that can be opened in any web browser, and doesn't require
players to install Twine themselves. Twine helps to edit a story, but what
happens once players actually open it in a web browser is the job of _story
formats_.

Story formats handle displaying your story onscreen: displaying text and images,
playing sound and video. They provide additional ways for players to interact
with your story, like buttons or drop-down menus. And they offer the ability to
add conditional logic, variables, and other kinds of programming to your story.

Story formats are like game engines or small programming languages. There is no
one best story format to use, just as there is no one best pencil or paintbrush.
Like any creative tool, each is suited for some kinds of things and a poor fit
for others.

Twine includes four story formats when you download it, and it is possible to
[add other story formats](../story-formats/adding.md) that people in the
community have made. 

- [**Chapbook**](https://klembot.github.io/chapbook/) is the youngest story
  format. It's designed to be easy to learn and to make many common tasks people
  have when creating with Twine as simple as possible.

- [**Harlowe**](https://twine2.neocities.org) is the default story format for
  Twine. It offers a lightweight but versatile programming language. As the
  default, it also has a large community of authors who use it.

- [**Snowman**](https://videlais.github.io/snowman/2/) is a minimal story format
  designed for people who are familiar with web development technologies like
  CSS and JavaScript, and prioritize customization.

- [**SugarCube**](https://www.motoslave.net/sugarcube/2/) is the oldest story
  format of these, and as a result, has the largest community and resources to
  draw on. It offers extensive customization possibilities.

Changing the story format you use can be a time-consuming process because they
vary so much in their approach. Because of this, the number of story formats to
choose from can be daunting. Try browsing through examples on the [Twine
Cookbook](https://twinery.org/cookbook) to see what makes the most sense for
you.

## Proofing Formats

Twine also has special kinds of story formats called _proofing formats_. A
proofing format is different than a story format in that it's meant to help you
proofread your stories before you share it with a larger audience.

Twine comes with one proofing format, called Paperthin, but others with more
features exist in the Twine community.

[^start]: In Twine version 1, this passage had to be called "Start" (including
    the capital S). Current versions of Twine allow setting the start passage to
    any one in a story, regardless of name.