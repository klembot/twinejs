export function replaceDom(html: string) {
	// Blast JS globals.

	delete (window as any).CodeMirror;
	delete (window as any).SVG;
	delete (window as any).Store;
	delete (window as any).StoryFormat;
	delete (window as any).amdDefine;
	delete (window as any).app;
	delete (window as any).jQuery;

	// Rewrite the document.

	document.open();
	document.write(html);
	document.close();
}
