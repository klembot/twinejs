# Contributing Code

## Process

In general, the _last_ step in the process of contributing code is to open a PR
on this repository. The reason why is that writing code is time-consuming, and
it's better to get agreement on the implementation approach early instead of
having to make considerable revisions.

## Bugfixes

Please first open an issue on this repo and check the box in the issue form
indicating that you would like to work on a fix. We'll need to come to agreement
on how to fix the issue in discussion on that issue. For minor or obvious bugs,
this discussion should be very straightforward.

Once agreement has been reached, a PR can be opened; please mention the issue
number in the PR's description. It will be assigned to a GitHub project for the
release it will be targeted to, so you can track the progress of a PR toward a
finished release.

## New Features and Enhancements

Please read [Twine's design goals] first.

If you think your idea meshes with these goals, open an issue on this repo and
check the box in the issue form indicating you would like to work on a fix. We
will need to discuss your idea in detail and come to agreement on how it will
work. This process will likely require you to provide mock screenshots and
explain how users will use the feature in detail.

Once we have come to agreement on the UI and implementation approach, a PR can
be opened. Please mention the issue number in the PR's description. As with
bugfixes, PRs are assigned to GitHub projects to track releases.

## 2.3

PRs are no longer being accepted for the 2.3 release branch. Members of the
community who would like to continue to update 2.3 are welcome to do so in a
forked version of the app. (If you decide to do this, please use a different
name than Twine for the app.)

## PR Practices

PRs should always:

- Target the `develop` branch, not `main`.
- Include sufficient unit test coverage. You can see a test coverage report by
  running `npm run test:coverage`. A good guideline to deciding whether test
  coverage is enough is to ask yourself, "Could this feature be re-implemented
  solely by looking at the unit tests?"
  - Unit tests for UI components should cover their behavior. Appearance does
    not need to be unit tested.
  - Unit tests for UI components should always include a baseline accessibility
    test using [jest-axe].
  - Use test components like `<FakeStateProvider>` to test resulting state
    instead of mocking store dispatches.
  - Put tests in a `__tests__` directory, mocks in `__mocks__`.
- Include updates to the documentation if a feature is changing.
- Pass `npm run lint` checks with no warnings or errors.
- Use [prettier] for code formatting. There is a `prettier.config.js` file that
  does a little configuration of the tool.

## Code Practices

- All data changes should take place through stores defined under `src/store`.
  Components should manage as little internal state as possible.
- Conversely, code under `src/store` should never touch UI code directly. The
  only way these two should interact is by a component dispatching actions in
  the relevant store.
- Components under `src/components` should always take values and objects as
  props, as opposed to IDs that they look up in a store. Code in `src/dialogs`
  or `src/routes` may interact with stores.
  - ✅ `<PassageCard passage={{id: 'abc', name: 'Untitled Passage 1', text: 'lorem ipsum'}} />`
  - ❌ `<PassageCard passageId={123} />`
- Components unders `src/components` should be [controlled] unless absolutely
  necessary. This applies to all types of components, not just form fields.
   - ✅ `<TextField value="lorem ipsum" onChange={setValue}>`
   - ❌ `<TextField onChange={setValue}>`
   - ✅ `<PassageCard passage={passage} onDelete={handleDelete} onMove={handleMove} />`
   - ❌ `<PassageCard passage={passage} />`
- Every React component should be assigned a top-level CSS class that is the
  React component name in kebab case. All related CSS rules should use this
  class name for scoping. This ensures that components will not overwrite each
  other's styles.
- Moving business logic out of React components and into `src/util` is almost
  always a good idea.
- Use CSS variables defined in `src/styles` as much as possible.
- Use external libraries instead of reinventing the wheel if possible.
- Add external type definitions to `src/externals.d.ts` as a last resort.
  Modules that come with type definitions, or that have DefinitelyTyped types,
  are strongly preferred.

# Contributing Localizations

Twine's localization strings are stored in [i18next] JSON format. There are a
number of dedicated editors for this format, or you can just use a plain text
editor.

To add a new localization or edit an existing one:

1. Clone the application source code using Git.
2. Create a new branch for your work.
3. Create or edit the appropriate file in `public/locales`. The file should be
   named after the language code you are localizing for. (Check [the
   registry](lang-code-registry) to find the appropriate code).
4. If you are creating a new localization, copy the existing `en-US.json` file
   and replace the English strings there with localized ones in the new file.
5. Commit your changes and create a pull request in GitHub. You should target
   the `develop` branch with your pull request.

Once your PR has been accepted, please join the Twine internationalization
listserv by sending an email to `twine-i18n-join@iftechfoundation.org`. This is
a low-traffic listserv that will be used to notify people who have worked on
localization on Twine when future versions require localization work, e.g. when
new text is added to the application.

[jest-axe]: https://www.npmjs.com/package/jest-axe
[i18next]: https://www.i18next.com/
[lang-code-registry]: https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
[prettier]: https://prettier.io
[controlled]: https://reactjs.org/docs/forms.html#controlled-components
[Twine's design goals]: DESIGN_GOALS.md