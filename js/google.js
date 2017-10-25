/*!
 * Copyright 2016-2017 GrammarSoft ApS <info@grammarsoft.com> at https://grammarsoft.com/
 * All Rights Reserved
 * Linguistic backend by Eckhard Bick <eckhard.bick@gmail.com>
 * Frontend by Tino Didriksen <mail@tinodidriksen.com>
 */
'use strict';
/* globals Defs */
/* globals context */
/* globals getVisibleText */
/* globals ggl_getCursor */
/* globals rects_overlap */

/* exported ggl_replaceInContext */
function ggl_replaceInContext(id, txt, word, rpl) {
	window.postMessage({type: 'gtdp-replace', id, txt, word, rpl}, '*');
}

/* exported ggl_prepareTexts */
function ggl_prepareTexts() {
	let to_send = [];

	let text = '';
	for (let i=0 ; i<context.ggl.elems.length ; ++i) {
		context.ggl.elems[i].normalize();
		let ptxt = getVisibleText(context.ggl.elems[i]);
		ptxt = $.trim(ptxt.replace(/\u200b/g, '').replace(/\u00a0/g, ' ').replace(/  +/g, ' '));
		if (!ptxt) {
			continue;
		}

		let id = i+1;
		context.ggl.elems[i].setAttribute('data-gtid', 's'+id);
		text += '<s' + id + '>\n' + ptxt + '\n</s' + id + '>\n\n';

		if (text.length >= Defs.MAX_RQ_SIZE) {
			to_send.push(text);
			text = '';
		}
	}
	to_send.push(text);

	return to_send;
}

/* exported ggl_getTextOrElement */
function ggl_getTextOrElement() {
	let rv = {e: null, t: null, ggl: null};

	rv.e = $('body').get(0);
	rv.ggl = {elems: [], cursor: ggl_getCursor()};

	let ss = [];
	$('.kix-selection-overlay').each(function() {
		ss.push(this.getBoundingClientRect());
	});

	let ps = $('.kix-paragraphrenderer').get();
	if (!ss.length) {
		// If there are no selections, use all paragraphs
		rv.ggl.elems = ps;
		return rv;
	}

	for (let i=0 ; i<ps.length ; ++i) {
		let found = false;
		for (let k=0 ; k<ss.length ; ++k) {
			if (!rects_overlap(ss[k], ps[i].getBoundingClientRect())) {
				continue;
			}
			rv.ggl.elems.push(ps[i]);
			found = true;
		}
		// If we have found any matches before this failure, we've gone beyond possible range and can just stop searching
		if (!found && rv.ggl.elems.length) {
			break;
		}
	}

	return rv;
}

function ggl_replaceResult(e) {
	if ('preventDefault' in e) {
		e.preventDefault();
	}
	e = e.data;

	if (e.success) {
		if (context && context.replace) {
			context.replace();
			context.replace = null;
		}
	}
	else {
		alert(chrome.i18n.getMessage(e.why));
	}
}

/* exported ggl_handleMessage */
function ggl_handleMessage(e) {
	if (!e.data.hasOwnProperty('type')) {
		return;
	}

	console.log(e.data);

	switch (e.data.type) {
	case 'gtdp-replace-result':
		return ggl_replaceResult(e);
	}
}
