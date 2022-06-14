# How Twine Manages Story Format Versions

Generally, how Twine manages multiple versions of a story format isn't something
most users need to be concerned with. But it can affect people who are
developing story formats or those using an older version of a story format.

Twine expects story formats to follow [semantic versioning](https://semver.org).
Semantic versioning assigns meanings to a series of three numbers separated by
periods. What this means in the context of a story format is that:

- The first number increases when the story format changes in any way that's not
  compatible with existing stories that use it.
- The second number increases when the story format adds features in a way that
  is compatible with existing stories.
- The third number increases when the story format fixes bugs in a way that is
  compatible with existing stories.

This has two effects that take place every time you start a session with Twine,
either by opening the application or visiting the online version.

- Twine *removes* versions of story formats that it considers outdated. That is,
  if both versions 2.1.0 and 2.0.0 of a format exist, it removes 2.0.0. If
  3.0.0, 2.1.0, and 2.0.0 exist, it removes only 2.0.0.
- Twine *upgrades* stories to the most up-to-date version of a story format that
  does not contain breaking changes. If a story uses version 2.0.0 of a format
  and 2.1.0 exists, it will change the story to use 2.1.0. If it uses 2.0.0 and
  both 3.0.0 and 2.1.0 exist, it will only upgrade the story to version 2.1.0.
  Changing the story from version 2.1.0 to 3.0.0 [must be done
  manually](../editing-stories/changing-story-format.md).

Twine does both of these things to lessen the impact of story format updates, so
that as upgrades are available, you don't need to take any action to be
up-to-date. It's not possible to change or override this behavior.