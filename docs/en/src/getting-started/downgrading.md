# Using an Older Version of Twine

Switching from a newer version of Twine to an older one can be done, though you
may experience odd behavior in the transition. Old versions of Twine of course
aren't aware of any new capabilities that the newer version has added.

Twine follows [semantic versioning](https://semver.org). This means that the
first version number of Twine only changes when a backwards-incompatible change
is made, either to how it saves stories or how it interacts with story format
extensions. This means that going from (using hypothetical versions for the sake
of argument) Twine 15.0.0 to Twine 14.3.6 will likely be tricky, but going from
Twine 14.3.6 to Twine 14.2.0 will not be.

What exactly you experience will depend on the particulars of the versions you
are moving between. **You may lose data in the transition.** Switching from a
newer version of Twine to an older one, generally speaking, is not well-tested.

## Before You Switch Versions

Regardless of whether you are using browser Twine or app Twine, you should [save
an archive](../story-library/exporting.md) of your work. This will ensure that
even if the absolute worst happens, you have a safe copy of your work.

## Using an Older Browser Twine

Each version of Twine since 2.0 is available by visiting
`https://twinery.org/[version number]` in your browser. For example, you can use
Twine 2.1.1 by going to `https://twinery.org/2.1.1`.

## Using an Older App Twine

Older releases are available on the [Twine GitHub
repository](https://github.com/klembot/twinejs/releases).

## After Switching Versions

If you are using a built-in story format (Chapbook, Harlowe, Snowman, or
SugarCube), then you will almost certainly need to either install a newer
version of the story format separately, or change the story format your work
uses.

You may also need to [reset your preferences](../troubleshooting/wont-start.md).
Although the instructions linked are for the most recent version of Twine, they
will probably work with most older versions of Twine as well.