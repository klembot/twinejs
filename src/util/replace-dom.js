export default html => {
	/* Blast JS globals. */

	window.CodeMirror = null;
	window.SVG = null;
	window.Store = null;
	window.StoryFormat = null;
	window.amdDefine = null;
	window.app = null;
	window.jQuery = null;

	/* Rewrite the document. */

	document.open();
	document.write(html);
	document.close();
};
