# Icon Button

This is a button that displays a text label, an icon, or both. If you are only
displaying an icon, you _must_ add an ARIA label.

Beware that you cannot use the `.prevent` or `.stop` modifiers on the `click`
event as you would a native DOM button. Instead, use the `preventClickDefault`
or `stopClickPropagation` props.