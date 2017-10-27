/*!
 * Copyright 2016-2017 GrammarSoft ApS <info@grammarsoft.com> at https://grammarsoft.com/
 * All Rights Reserved
 * Linguistic backend by Eckhard Bick <eckhard.bick@gmail.com>
 * Frontend by Tino Didriksen <mail@tinodidriksen.com>
 */
'use strict';

/* exported ggl_getCursor */
function ggl_getCursor() {
	let cs = document.getElementsByClassName('kix-cursor');
	for (let i=0 ; i<cs.length ; ++i) {
		if (cs[i].textContent.length === 0) {
			return cs[i].getElementsByClassName('kix-cursor-caret')[0];
		}
	}
	return null;
}

/* exported rects_overlaps */
// If this was <= and >= then it would test merely touching, but we want actual overlap
function rects_overlaps(ra, rb) {
	return ra.left < rb.right && ra.right > rb.left && ra.top < rb.bottom && ra.bottom > rb.top;
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
/* exported escapeRegExp */
function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/* exported escapeRegExpTokens */
function escapeRegExpTokens(txt) {
	let ts = txt.split(/\s+/g);
	for (let i=0 ; i<ts.length ; ++i) {
		ts[i] = escapeRegExp(ts[i]);
	}
	return ts.join('\\s+');
}

/* exported simplifyString */
function simplifyString(txt) {
	txt = txt.replace(/\u200b/g, '').replace(/\u00a0/g, ' ');
	// Strip combining characters
	txt = txt.replace(/[\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]+/g, '');
	// Reduce surrogate pairs to single character
	txt = txt.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '-');
	return txt;
}
