# Image Button

This is a button that displays an image above its label. Unlike icon buttons,
these do not have a type (e.g. create or danger). This component also does not
specify a width for the image. You should specify this where you use this
component.

By default, this places a drop shadow around the image you place in the button.
This doesn't work well with images that don't fill their area completely (as in
this story, which uses the Twine logo).

You should specify alt text for the image using the `image-alt` prop. If your
image is purely decorative, you can omit this property. In this case, the
component will use `alt=""` in the image's HTML tag, which makes it effectively
invisible to screen readers.