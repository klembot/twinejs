# Contributing code

Sorry, the 2.4 branch is still not quite ready for code contributions yet! Stay
tuned.

# Contributing localizations

Twine's localization strings are stored in [i18next] JSON format. There are a
number of dedicated editors for this format, or you can just use a plain text
editor.

To add a new localization or edit an existing one:

1. Clone the application source code using Git.
2. Create a new branch for your work.
3. Create or edit the appropriate file in `public/locales`. The file should be
   named after the language code you are localizing for. (Check [the registry](lang-code-registry) to find the appropriate code).
4. If you are creating a new localization, copy the existing `en-US.json` file
   and replace the English strings there with localized ones in the new file.
5. Commit your changes and create a pull request in GitHub. You should target
   the `develop` branch with your pull request.

[i18next]: https://www.i18next.com/
[lang-code-registry]: https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry