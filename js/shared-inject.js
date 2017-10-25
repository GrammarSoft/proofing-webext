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

/* exported rects_overlap */
function rects_overlap(ra, rb) {
	return ra.left <= rb.right && ra.right >= rb.left && ra.top <= rb.bottom && ra.bottom >= rb.top;
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
