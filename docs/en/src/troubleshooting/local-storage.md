# Viewing Local Storage Directly

This section only applies to browser Twine. It doesn't apply to the app version.

When things go wrong, it can be useful to get directly at the data Twine has
stored in your browser. This data includes your stories, preferences, and
installed story formats. You can view this data and even edit it using the
developer tools built into most browsers.

The exact way to do it depends on the browser--here are instructions for some
common ones:

- [Mozilla Firefox](https://firefox-source-docs.mozilla.org/devtools-user/storage_inspector/local_storage_session_storage/index.html)
- [Google Chrome](https://developer.chrome.com/docs/devtools/storage/localstorage/)
- [Safari](https://support.apple.com/guide/safari-developer/storage-tab-dev43453fff5/mac)

Be careful when working with local storage, however. Just looking at what's in
local storage, or copying and pasting out of it can't cause any harm. But adding
even one stray extra character can cause Twine to be unable to read the data.