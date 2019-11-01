# Local Storage Quota

This displays how much browser local storage space is available. Because there
is no API to determine this directly, this instead calculates this by trying to
store increasingly large amounts of data in local storage until that fails, then
cleaning up after itself.

This calculation should not occur while other operations in local storage are
taking place, and does not update automatically. This component offers a refresh
button instead.

Because it's unclear what local storage limits Electron imposes, if any (see
[issue 8337]), it is very important that this component is never mounted in an
Electron context. Otherwise, it's possible that it will eat disk space.

[issue 8337]: https://github.com/electron/electron/issues/8337