'use strict';

function getTextOrElement() {
	let rv = null;
	let selection = window.getSelection();

    if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
		if (document.activeElement && document.activeElement.contentWindow && document.activeElement.contentWindow.document.getSelection() && document.activeElement.contentWindow.document.getSelection().toString() !== '') {
			selection = document.activeElement.contentWindow.document.getSelection();
		}
    }

    if (selection && selection.toString() !== '') {
    	rv = selection.toString();
    }

	return rv;
}

function checkActiveElement() {
	let e = getTextOrElement();
	console.log(e);
}
