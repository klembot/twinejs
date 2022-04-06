# Extending Twine

## Introduction

As of version 2.4, story formats can extend Twine's user interface in specific
ways:

- A format may add a CodeMirror syntax highlighting mode to the passage editor.
- A format may add custom CodeMirror commands and a toolbar which triggers them,
  which also appears above the passage editor.
- A format may add a _reference parser_, which causes connections to appear
  between passages.

This document explains these capabilities and how a story format author
can use them.

- Creating a standalone extension for Twine is not possible. Extensions can only
  be bundled with a story format.
- Users can choose to disable Twine extensions for a story format. For this
  reason (and also because users might use other compilers and editors with a
  story format), Twine extensions should never be essential for use of a story
  format.
- Although extensions are part of a story format file, they will not affect the
  size of stories compiled with that format.

This document does its best to document the behavior of Twine regarding
extensions as completely as it can. However, it may contain mistakes or be
incomplete in places. If your extension makes use of behavior, intentional or
not, that exists in Twine that isn't documented here, then it may break in
future versions of Twine with no warning.

Before continuing, please read the [Twine 2 story format specs][format-specs].
These explain the basics of how Twine 2 story formats work.

## Hydration

Story formats are encoded in JSONP format:

```javascript
window.storyFormat({name: 'My Story Format', version: '1.0.0', source: '...'});
```

JSONP is itself a thin wrapper over JSON, which does not permit executable code
to be encoded. Instead, Twine 2.4 and later uses a `hydrate` property that
allows for a format to add JavaScript functions or other data types not allowed
by JSON after being loaded. Below is an example of a simple `hydrate` property:

```javascript
window.storyFormat({
	name: 'My StoryFormat',
	version: '1.0.0',
	hydrate: "this.hydratedProperty = () => console.log('Hello Twine');"
});
```

When Twine loads this format, it creates a JavaScript function from the source
of the `hydrate` property, then executes it, binding `this` to an empty
JavaScript object. The hydrate property can add whatever properties it would
like, which will be merged with the story format properties specified in JSONP.
In the example above, a function called `hydratedProperty` would be added to the
story format object.

- The `hydrate` property may not contain any asynchronous code. It may add
  properties that are themselves asynchronous functions, but the `hydrate`
  property itself must be synchronous.
- Check the `browserslist` property of [package.json](package.json) to see what
  version of JavaScript Twine supports.
- Only use `hydrate` to add properties that can't be represented in JSONP.
- The `hydrate` property must not contain any side effects, because it may be
  called repeatedly by Twine. It should not change the DOM, affect the global
  JavaScript scope, or otherwise do anything but define properties on `this`.
- Any properties added through `hydrate` must not conflict with properties
  specified in JSONP. Twine will ignore these and use what is in the JSONP.

You almost certainly will want to use tools to create the `hydrate` property,
similar to how you would compile the `source` property of your format. [An
example repo](story-format-starter) is available demonstrating how to do this
with Webpack 5. The [`--context` option of
Rollup](https://www.rollupjs.org/guide/en/#context) can also be used to bundle
code.

For clarity's sake, code examples in this document show story formats after they
have been hydrated.

## Versioning

The way extensions work in Twine may change in future versions (and probably
will). So that story format authors don't need to publish multiple versions as
Twine changes, Twine's editor extensions are stored under a version specifier:

```javascript
window.storyFormat({
	name: 'My Story Format',
	version: '1.0.0',
	editorExtensions: {
		twine: {
			'^2.4.0-alpha1': {
				anExtensionProperty: 'red'
			},
			'^3.0.0': {
				anExtensionProperty: 'blue'
			}
		}
	}
});
```

In this story format, Twine 2.4.0-alpha1 and later would see
`anExtensionProperty` of `"red"`, but Twine 3.0 (as an example--at time of
writing, this version doesn't exist) would see it as `"blue"`.

- Twine follows [semantic versioning].
- Twine uses the `satisfies()` function of the [semver NPM package] to decide if
  a specifier matches the current Twine version. You may use any specifier that
  this function understands.
- You should never have overlapping version specifiers in your extensions. If
  multiple object keys satisfy the version of Twine, then Twine will issue a
  warning and use the first it finds that matched. From a practical standpoint,
  this means that its behavior is dependent on the browser or platform it's
  running on, and cannot be predicted.
- If no object keys satisfy the version of Twine, then no extensions will be
  used.
- Only the object keys for a specific story format version will be used. If only
  version 2.0.0 of a story format contains extensions but the user is using
  version 1.0.0, no extensions will be used.

## CodeMirror Syntax Highlighting

Twine uses [CodeMirror] in its passage editor, which allows modes to be defined
which apply formatting to source code. A story format can define its own mode
to, for example, highlight special instructions that the story format accepts.

A mode is defined using a hydrated function:

```javascript
window.storyFormat({
	name: 'My Story Format',
	version: '1.0.0',
	editorExtensions: {
		twine: {
			'^2.4.0-alpha1': {
				codeMirror: {
					mode() {
						return {
							startState() {
								return {};
							},
							token(stream, state) {
								stream.skipToEnd();
								return 'keyword';
							}
						};
					}
				}
			}
		}
	}
});
```

This example would mark the entire passage text as a `keyword` token.

- See [CodeMirror's syntax mode documentation] for details on what the `mode`
  function should return, and how to parse passage text. The function specified
  here will be used as the second argument to `CodeMirror.defineMode()`.
- Specifically, as the documentation notes, your CodeMirror mode must not modify
  the global scope in any way.
- Twine manages the name of your syntax mode and sets the passage editor's
  CodeMirror instance accordingly. You must not rely on the name of the syntax
  mode being formatted in a particular way. This is to prevent one story format
  from interfering with another's functioning.
- You must use CodeMirror's built-in tokens. Twine contains styling for these
  tokens that will adapt to the user-selected theme (e.g. light or dark). It
  doesn't appear that CodeMirror contains documentation for what these are apart
  from [its own CSS](codemirror-css), unfortunately. The section commented
  `DEFAULT THEME` lists available ones.
- A future version of Twine might allow custom tokens and appearance.
- A story format mode has no access to the story that the passage belongs to. It
  must parse the text on its own terms.

## CodeMirror Commands and Toolbar

An editor toolbar can be specified by a format, which will appear between the
built-in one and the passage text. A toolbar must specify custom CodeMirror
commands that are triggered by buttons in the toolbar.

- A format can only have one toolbar.
- A toolbar can only use CodeMirror commands defined by the format. These
  commands can consist of any code, however, which in turn may call other
  CodeMirror commands or otherwise do whatever it likes.

## CodeMirror Toolbar

A CodeMirror toolbar is specified through a hydrated function:

```javascript
window.storyFormat({
	name: 'My Story Format',
	version: '1.0.0',
	editorExtensions: {
		twine: {
			'^2.4.0-alpha1': {
				codeMirror: {
					toolbar(editor, environment) {
						return [
							{
								type: 'button',
								command: 'customCommand',
								icon: 'data:image/svg+xml,...',
								label: 'Custom Command'
							},
							{
								type: 'menu',
								icon: 'data:image/svg+xml,...',
								label: 'Menu',
								items: [
									{
										type: 'button',
										command: 'customCommand2',
										disabled: true,
										icon: 'data:image/svg+xml,...',
										label: 'Custom Commmand 2'
									},
									{
										type: 'separator'
									},
									{
										type: 'button',
										command: 'customCommand3',
										icon: 'data:image/svg+xml,...',
										label: 'Custom Command 3'
									}
								]
							}
						];
					}
				}
			}
		}
	}
});
```

The `toolbar` function receives two arguments from Twine:

- `editor` is the CodeMirror editor instance the toolbar is attached to. This is
  provided so that the toolbar can enable or disable items appropriately--for
  example, based on whether the user has selected any text. See [the CodeMirror
  API documentation](https://codemirror.net/doc/manual.html#api) for methods and
  properties available on this object. As the documentation indicates, you may
  use methods that start with either `doc` or `cm`; for example,
  `editor.getSelection()`.
- `environment` is an object with information related to Twine itself:

  - `environment.appTheme` is either the string `dark` or `light`, depending on
    the current app theme used. If the user has chosen to have the Twine app
    theme match the system theme, then this will reflect the current system
    theme. This property is provided so that the toolbar can vary its icons
    based on the app theme.
  - `environment.foregroundColor` is a string value with a CSS color of the
    toolbar's foreground color. This is the foreground color used for Twine's
    built-in icons, and can be used to ensure the toolbar icons match that
    color. Doing so is optional. (There is no `environment.backgroundColor`
    property--just use `transparent`.)
  - `environment.locale` is a string value containing the user-set locale. If
    the user has chosen to have the Twine app use the system locale, this value
    will reflect that as well. This property is provided so that the toolbar can
    localize button and menu labels.

It must follow these rules:

- The toolbar function must be side-effect free. Twine will call it repeatedly
  while the user is working. It should only return what the toolbar should be
  given the state passed to it. It must never change the CodeMirror editor
  passed to it. Changes should occur in toolbar commands instead (described
  below).
- Changing `environment` properties has no effect.
- Do not change the order of toolbar items returned based on
  `environment.locale` (e.g. reverse the order for right-to-left locales). Twine
  will handle this for you.
- Avoid changing the contents of the toolbar based on CodeMirror state. Instead,
  enable and disable items.
- If you would like to use a built-in CodeMirror command in your toolbar, write
  a custom command that calls `editor.execCommand()`.
- The toolbar function must return an array of objects. The `type` property on
  the object describes what kind of item to display. This property is required
  on all items.

### type: 'button'

This displays a button which runs a CodeMirror command. Other properties:

| Property Name | Type    | Required           | Description                                                                                                            |
| ------------- | ------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `command`     | string  | yes                | The name of the CodeMirror command to run when                                                                         |
| `disabled`    | boolean | no                 | If true, then the button is disabled. By default, buttons are enabled.                                                 |
| `icon`        | string  | depends on context | Used as the `src` attribute for the <img> tag used in the button. Using a `data:` URL is recommended but not required. |
| `iconOnly`    | boolean | no                 | Only shows the icon. **The label property is still required.** It is used for assistive technology.                    |
| `label`       | string  | yes                | The label text to display. This cannot contain HTML.                                                                   |

The `icon` property is required if this toolbar item is not inside a menu.
Inside of a menu, the `icon` property is forbidden.

### type: 'menu'

This displays a drop-down menu. Other properties:

| Property Name | Type    | Required | Description                                                                                                            |
| ------------- | ------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `disabled`    | boolean | no       | If true, then the button is disabled. By default, menus are enabled.                                                   |
| `icon`        | string  | yes      | Used as the `src` attribute for the <img> tag used in the button. Using a `data:` URL is recommended but not required. |
| `iconOnly`    | boolean | no       | Only shows the icon. **The label property is still required.** It is used for assistive technology.                    |
| `items`       | array   | yes      | Items in this menu.                                                                                                    |
| `label`       | string  | yes      | The label text to display. This cannot contain HTML.                                                                   |

The `items` property must only contain objects with type `button` or `separator`.

### type: 'separator'

This displays a separator line in a menu. This type of item has no other
properties, and is only allowed in the `items` property of a menu item.

## CodeMirror Commands

The commands used by a CodeMirror toolbar are specified through hydrated functions:

```javascript
window.storyFormat({
  "name": "My Story Format",
  "version": "1.0.0",
  "editorExtensions": {
    "twine": {
      "^2.4.0-alpha1": {
        "codeMirror": {
          "commands": {
            customCommand1(editor) {
              editor.getDoc().replaceSelection('Example text');
            },
            customCommand2(editor) {
              const doc = editor.getDoc();

              doc.replaceSelection(doc.getSelection().toUpperCase());
            }
          }
        }
    }
  }
});
```

- When invoking a command from a story format toolbar, the name of the command
  must match exactly, including case.
- Twine namespaces your commands (and their connections to the toolbar) so that
  commands specified by one story format do not interfere with another story
  format's, or the commands of a different version of that story format. You
  must not rely on the name assigned to your commands by Twine, as this
  namespacing may change in future versions. A possible way for story format
  commands to reference each other using the `hydrate` property is:

```javascript
function customCommand1(editor) {
	editor.getDoc().replaceSelection('Example text');
}

function customCommand2(editor) {
	const doc = editor.getDoc();

	doc.replaceSelection(doc.getSelection().toUpperCase());
	customCommand1(editor);
}

this.codeMirror = {
	commands: {customCommand1, customCommand2}
};
```

## Parsing References

A story format can define _references_ in a story. References are secondary
connections between two passages. Unlike links:

- References to nonexistent passages do not show a broken link line in the story
  map.
- New passages are not automatically created for users when they add a new
  reference in passage text.
- Renaming a passage does not affect passage text that contains a reference to
  that passage. (e.g. doing a find/replace for text)
- References are drawn in Twine using a dotted line, though this appearance may
  change in future versions.
- Twine does not parse any references in itself. References are reserved for
  story format use.

In order to use references, a story format must define a parser through a hydrated function:

```javascript
window.storyFormat({
  "name": "My Story Format",
  "version": "1.0.0",
  "editorExtensions": {
    "twine": {
      "^2.4.0-alpha1": {
        "references": {
          parsePassageText(text) {
            return text.split(/\s/);
          }
        }
    }
  }
});
```

The `parsePassageText` function must:

- Be synchronous.
- Return an array of strings, each string being the name of a passage being referred to in this text.
- Return an empty array if there are no references in the text.
- Avoid returning duplicate results; e.g. if some text contains multiple
  references to the same passage, only one array item for that passage should be
  returned. Including duplicates will not cause an error in Twine, but it will
  slow it down.
- Have no side effects. It will be called repeatedly by Twine.

## All Together

Below is an example of a hydrated story format demonstrating all editor extensions available.

```javascript
window.storyFormat({
	name: 'My Story Format',
	version: '1.0.0',
	editorExtensions: {
		twine: {
			'^2.4.0-alpha1': {
				codeMirror: {
					commands: {
						upperCase(editor) {
							const doc = editor.getDoc();

							doc.replaceSelection(doc.getSelection().toUpperCase());
						}
					},
					mode() {
						return {
							startState() {
								return {};
							},
							token(stream, state) {
								stream.skipToEnd();
								return 'keyword';
							}
						};
					},
					toolbar(editor, environment) {
						return [
							{
								type: 'button',
								command: 'upperCase',
								icon: 'data:image/svg+xml,...',
								label: 'Uppercase Text'
							}
						];
					}
				},
				references: {
					parsePassageText(text) {
						return text.match(/--.*?--/g);
					}
				}
			}
		}
	}
});
```

This specifies:

- A CodeMirror mode which marks the entire passage as a keyword.
- A toolbar with a single command, "Uppercase Text".
- A reference parser that treats all text surrounded by two dashes (`--`) as a
  reference.

[format-specs]: https://github.com/iftechfoundation/twine-specs
[semver npm package]: https://docs.npmjs.com/cli/v6/using-npm/semver
[semantic versioning]: https://semver.org
[codemirror]: https://codemirror.net
[codemirror's syntax mode documentation]: https://codemirror.net/doc/manual.html#modeapi
[codemirror-css]: https://github.com/codemirror/CodeMirror/blob/master/lib/codemirror.css
[story-format-starter]: https://github.com/klembot/twine-2-story-format-starter
