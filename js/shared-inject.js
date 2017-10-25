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
	return ra.left < rb.right && ra.right > rb.left && ra.top < rb.bottom && ra.bottom > rb.top;
}

/* exported replaceInTextNodes */
function replaceInTextNodes(tns, txt, word, rpl) {
	rpl = rpl.padEnd(word.length, '\ue111');

	let nonl = /[^\d\wa-zA-ZéÉöÖæÆøØåÅ.,]/ig;
	let ti = 0;
	let ns = 0;
	let nsi = 0;
	for (; txt.length && ns<tns.length ; ++ns) {
		let ml = tns[ns].textContent.replace(/\u200b/g, '');
		let i = 0;
		for ( ; i<ml.length ; ++i) {
			for (let tn=ti ; tn<txt.length && tn<ti+10 ; ++tn) {
				if (txt.charAt(tn) === ml.charAt(i) || (txt.charAt(tn) === '\ue000' && nonl.test(ml.charAt(i)))) {
					ti = tn;
					// Find identical sequential letters, e.g. 1977
					while (ti < txt.length-1 && txt.charAt(ti) === ml.charAt(i)) {
						//console.log([ti, i, txt.charAt(ti), ml.charAt(i)]);
						++ti;
						++i;
					}
					break;
				}
			}
			//console.log([ti, i, txt.charAt(ti), ml.charAt(i)]);
			if (ti >= txt.length-1) {
				break;
			}
		}

		if (ti >= txt.length-1) {
			nsi = i + 1;
			if (nsi >= ml.length) {
				++ns;
				nsi = 0;
			}
			break;
		}
	}
	console.log([txt, word, rpl, tns, ns, nsi, ti]);

	let wi = 0;
	for (; ns<tns.length ;) {
		let did = false;
		let ml = tns[ns].textContent.replace(/\u200b/g, '');
		while (nsi < ml.length && wi < word.length) {
			if (/\s/.test(ml.charAt(nsi)) && !/\s/.test(word.charAt(wi))) {
				did = true;
				++nsi;
			}
			else if (!/\s/.test(ml.charAt(nsi)) && /\s/.test(word.charAt(wi))) {
				did = true;
				++wi;
			}
			else {
				break;
			}
		}
		if (nsi >= ml.length) {
			++ns;
			nsi = 0;
		}
		if (!did) {
			break;
		}
	}
	console.log([word, rpl, tns, ns, nsi, wi]);

	for (; ns<tns.length ; ++ns) {
		let done = false;
		let ml = tns[ns].textContent.replace(/\u200b/g, '');

		for (; nsi < ml.length && wi < word.length && wi < rpl.length ; ++nsi, ++wi) {
			ml = ml.substring(0, nsi) + rpl.charAt(wi) + ml.substring(nsi+1);
		}
		if (wi === word.length || wi === rpl.length) {
			if (wi < rpl.length) {
				ml = ml.substring(0, nsi) + rpl.substring(wi) + ml.substring(nsi);
			}
			if (wi < word.length) {
				ml = ml.substring(0, nsi) + ml.substring(nsi + (word.length - wi));
			}
			done = true;
		}

		if (ml !== tns[ns].textContent.replace(/\u200b/g, '')) {
			ml = ml.replace(/\ue111/g, '');
			if (ml.length === 0) {
				ml = '_';
			}
			tns[ns].textContent = ml;
		}
		nsi = 0;

		if (done) {
			break;
		}
	}
}

/* exported findVisibleTextNodes */
function findVisibleTextNodes(node) {
	let tns = [], wsx = /\S/;
	let wnd = window;

	function _findVisibleTextNodes(node) {
		if (node.nodeType === Node.TEXT_NODE) {
			if (wsx.test(node.nodeValue)) {
				tns.push(node);
			}
		}
		else if (node.nodeType === Node.ELEMENT_NODE) {
			if (node.nodeName === 'STYLE' || node.nodeName === 'SCRIPT') {
				return;
			}
			let sts = wnd.getComputedStyle(node);
			if (sts.display === 'none' || sts.visibility === 'hidden' || sts.visibility === 'collapse') {
				return;
			}
			for (let i=0 ; i < node.childNodes.length ; ++i) {
				_findVisibleTextNodes(node.childNodes[i]);
			}
		}
	}

	wnd = node.ownerDocument.defaultView;
	_findVisibleTextNodes(node);

	return tns;
}
