# Design Goals

This documents the design goals (and non-goals) Twine has. They're intended to
guide discussion around feature suggestions and future development. Twine, like
any piece of software, isn't perfect, and so it may not entirely live up to the
goals stated here.

Each of the goals has a set of bullet points that discuss their implications in
practice, but they shouldn't be considered a complete list.

## Easy to Learn

It takes around 5-10 minutes to explain how to use Twine to make a story with
basic links. This simplicity is key to Twine's success. A core part of Twine's
audience are people who have had no previous programming experience and may not
even be particularly knowledgable about computers.

- Twine avoids features that are complicated to explain to a new user. These
  features are often better-suited to tools aimed at more advanced users, like
  [extwee] and [tweego]. Twine doesn't exclude use by advanced users, but it
  prioritizes beginners.
- Twine prefers providing users with sensible defaults that can be changed later
  instead of blocking actions and asking for decisions. For example, creating a
  new passage creates it with a placeholder name instead of showing a modal
  dialog asking the user to provide a name, when the user may not know what they
  want to call it yet.
- Twine avoids using [modes], allowing users to work on multiple tasks in
  parallel, or to start a task and come back to it later.
- Actions in Twine are undoable, allowing users to easily reverse mistakes.
- Twine's user interface explains itself to users, and strives to be
  discoverable.
  - It re-uses interface patterns users are likely to already be familiar with
    when possible.
  - It includes explanatory links like "What is a story format?"
  - It avoids technical jargon.
  - Features are not placed in contextual menus or available through keyboard
    shortcuts only, where only a user who has read documentation might know about
    them.
  - It uses icon-only buttons extremely sparingly. The intent of a button
    labeled with text is almost always clearer than one that only has an icon.
- [The Twine Reference][twine-ref] comprehensively covers Twine's features.
  (It's not a tutorial or how-to guide to writing with Twine, though--other
  community resources serve that purpose.)

## Accessible

There are several dimensions in which Twine strives to be accessible. The
dimensions listed here are equally important.

Twine is accessible to users with disabilities.

- User interface development is guided by [WCAG guidelines]. In particular:
  - Twine is usable for users who use screen readers like JAWS, NVDA, or
    VoiceOver.
  - As much of Twine as possible is usable by a someone who only uses a
    keyboard. Many users only use a keyboard or assistive technology that
    emulates a keyboard.
- Twine is covered by unit tests that check for basic accessibility problems.
  These unit tests are not comprehensive but serve as a baseline.

Twine is accessible to users regardless of the language they speak.

- No language or locale receives preferential treatment by Twine.
  - Twine tries to detect the language the user's computer is set to, instead of
    defaulting to US English on first startup.
- All language in Twine is localized.
- Twine properly handles input for users who use right-to-left languages.

Twine is accessible to users who interact with their computer with touchscreen
input, as well as those who use mouse and keyboard.

- Interaction targets like buttons and text fields are sized and spaced so that
  they can be used comfortably on a touchscreen.
- Interactions triggered by pointing a cursor at something in Twine are avoided,
  because these don't have an equivalent on most touchscreens. If they do exist,
  alternatives that are usable on touchscreens also exist.

## Web Native

Twine's home is the web. Although many dedicated Twine users use it in its
desktop app version (abbreivated here as "app Twine"), there is a significant
population of users who use the online version (abbreviated "browser Twine").

It's difficult to estimate an exact number of browser Twine users because, out
of respect for users' privacy, Twine does not include tracking like Google
Analytics. But in one month in 2022, there were more than 100,000 requests for
browser Twine at https://twinery.org/2 in server logs. (This number excludes
known crawlers like Google, as well as requests for all of the assets that the
online editor loads.) A request is more-or-less a single editing session in
browser Twine, so most likely a single person using Twine in a month will
generate multiple requests. Regardless, the point here is that a significant
number of users regularly use browser Twine.

Staying web native has also meant that adapting Twine for multiple platforms has
been relatively easy thanks to projects like [Electron], and it ensures that
Twine will be usable for years if not decades to come.

- App Twine and browser Twine users have, as much as possible, identical
  experiences.
- App Twine users have identical experiences regardless of what operating system
  they use.
- Browser Twine supports as many modern browsers as is feasible, and users of
  browser Twine should have identical experiences regardless of which browser
  they use.
  - The major exception is Safari, which has imposed [restrictions on local
    storage](safari-localstorage) which are admirable in their goal of
    protecting user privacy, but have dire implications for Twine users, who can
    easily lose all of their work if they aren't careful. If it becomes possible
    to use browser Twine in Safari safely, it would be worthwhile to make this happen.
- The load time--which loosely equates to the download size--of Twine matters
  and new dependencies should be carefully considered before being adopted.

[extwee]: https://github.com/videlais/extwee
[tweego]: https://www.motoslave.net/tweego/
[modes]: https://en.wikipedia.org/wiki/Mode_(user_interface)
[wcag guidelines]: https://www.w3.org/WAI/standards-guidelines/wcag/
[twine-ref]: https://twinery.org/reference/en/
[electron]: https://www.electronjs.org
[safari-localstorage]: https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
