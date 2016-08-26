// This maps numeric zoom settings (that are in our model) to nice adjectives
// that we use in our CSS. Because this is used by both the container view and
// the toolbar, it's in a separate module to avoid a circular dependency.

module.exports = {
	big: 1,
	medium: 0.6,
	small: 0.25
};
