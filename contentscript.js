'use strict';

function getCommonParent(a, b) {
	let ps = [a];
	while (a.parentNode && a.parentNode !== ps[ps.length-1]) {
		ps.push(a.parentNode);
		a = a.parentNode;
	}

	console.log(ps);

	do {
		for (let i=0 ; i<ps.length ; ++i) {
			if (b === ps[i]) {
				return b;
			}
		}
		b = b.parentNode;
	} while (b);

	return null;
}

function getTextOrElement() {
	let rv = {e: null, t: null};
	let s = window.getSelection();
	let e = document.activeElement;
	let w = window;

	if (!e || e.tagName === 'BODY') {
		return rv;
	}

	if (e.tagName === 'IFRAME' && e.contentWindow) {
		w = e.contentWindow;
		if (w.document.activeElement) {
			e = w.document.activeElement;
		}
		if (w.document.getSelection() && w.document.getSelection().toString() !== '') {
			s = w.document.getSelection();
		}
	}

	rv.e = e;

	if (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA') {
		// If there is a partial selection, return that instead
		if (e.selectionStart !== e.selectionEnd && (e.selectionStart !== 0 || e.selectionEnd !== e.value.length)) {
			rv.t = e.value.substring(e.selectionStart, e.selectionEnd);
		}
		return rv;
	}

	if (s && s.toString() !== '') {
		console.log(s);
		// If all text in the node is selected, return the node instead
		let cp = getCommonParent(s.anchorNode, s.focusNode);
		if (cp && $.trim(cp.textContent) === $.trim(s.toString())) {
			rv.e = cp;
		}
		else {
			rv.t = s.toString();
		}
	}

	return rv;
}

/* exported checkActiveElement */
function checkActiveElement() {
	let e = getTextOrElement();
	console.log(e);
}
