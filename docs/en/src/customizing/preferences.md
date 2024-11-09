# Setting Preferences

To customize Twine's preferences, choose _Preferences_ from the _Twine_ top
toolbar tab. This tab is available throughout Twine. A dialog will appear that
lets you change settings. These changes will take effect as soon as you make
them, and Twine will remember them between sessions.

## Changing Twine's Language

To change the language Twine's user interface, select it from the _Language_
menu in the preferences dialog.

## Changing Twine's Theme

To change Twine's theme, select an option from the _Theme_ menu. The _Dark_ and
_Light_ settings cause Twine to always use that theme, while the _System_ choice
uses the theme that matches your system's theme setting, if Twine can determine
it. If Twine can't determine whether your system is using a dark or light theme,
it will default to a light theme.

## Changing Dialogs

The _Dialog Width_ menu controls the width of dialogs. The placement of dialogs
onscreen (e.g. switching them from the right side of the window) cannot be
changed.

## Changing Edit Dialogs

The _Blinking Cursor in Editors_ checkbox controls whether the cursor blinks in
[passage edit dialogs](../editing-stories/editing-passages.md), the [story
JavaScript edit dialog](../editing-stories/js-and-css.md), and the [story
stylesheet edit dialog](../editing-stories/js-and-css.md). This preference only
controls the cursor in the large text fields of these dialogs. Twine uses your
system setting for cursor blinking in one-line text fields.

The _Use Enhanced Editors_ checkbox controls whether Twine uses an enhanced
editor control in edit dialogs. Unfortunately, this control can cause problems
for assistive technology like screen readers, so disabling this may help in that
case. Disabling this has a few side effects:

- The _Blinking Cursor in Editors_ checkbox will become disabled, and whether
  the cursor blinks in editors will use use your system setting.
- Some toolbar buttons in dialogs will be hidden, because they use functionality
  present in the enhanced editor control.
- Story format toolbars will not be shown in passage editing dialogs, because
  they also use functionality in the enhanced editor control

You can change the font and size used in passage edit dialogs and the stylesheet
and JavaScript edit dialogs using the controls below the _Blinking Cursor in
Editors_ checkbox. (The _Code Editor_ preferences apply to both the stylesheet
and JavaScript edit dialogs.)

- The _System_ font setting uses the same font that your computer uses in the
  rest of its user interface.
- The _Monospaced_ font setting uses common monospace fonts across operating
  systems.
- The _Custom_ font setting allows you to specify any font that's installed in
  your computer. You _must_ spell this font name exactly right, including any
  spaces or other symbols in the font name. Capitalization doesn't matter when
  setting a custom font.
