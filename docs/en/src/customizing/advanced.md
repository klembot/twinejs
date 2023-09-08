# Advanced Customization

## CSS

App Twine allows advanced customization its interface by creating a special
file, `user.css`, in your Twine folder. You'll need to create this file outside
of Twine using a text editor.

If `user.css` exists, then app Twine will add the contents of it to the UI as
CSS rules, potentially overriding the default styling. CSS allows changing the
appearance of the application--using different fonts, for example, or
colors--but does not allow changing Twine's functionality or adding new
features.

Here's a sample `user.css` that replaces the graph paper background of the story
map with a plain gray color:

```css
.passage-map {
  background: hsl(0, 0%, 75%) !important;
}

[data-app-theme="dark"] .passage-map {
  background: hsl(0, 0%, 30%) !important;
}
```

`user.css` is only available in app Twine. If you'd like to customize browser
Twine using CSS, browser extensions like
[Stylus](https://github.com/openstyles/stylus/wiki) might help.

Some important things to keep in mind working with `user.css`:

- **The structure of Twine's UI can and will change on every release, even for
  patch-level version changes.** Because these changes are often numerous, they
  will not be part of release notes.
- The file must named exactly `user.css`--all lowercase. `User.css` will not
  work.
- Changes to `user.css` will take effect the next time you start Twine.
- To determine what [CSS
  selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) to
  use, you can either use developer tools in browser Twine--the DOM structure is
  identical between browser Twine and app Twine--or open developer tools in
  Twine itself by going to _Troubleshooting_ under the _Help_ menu, then
  choosing _Show Debug Console_.
- You can use the in-app debug console to test your CSS rules. The rules you set
  in `user.css` will be listed as _injected stylesheet_ in the developer
  console.
- `user.css` must be at the same folder level as your `Stories` and `Backups`
  folders, directly below the `Twine` folder.
- If there's a problem loading `user.css`, Twine will load as normal and not
  apply any customizations. If any of your CSS rules are incorrectly written,
  they will be ignored. Twine will not show a warning in any of these cases.
- In order for `user.css` to [win
  specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity),
  you might need to add `!important` to the end of your declarations.
