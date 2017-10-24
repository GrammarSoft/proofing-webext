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
/* globals rects_overlap */

const Keys = {
	backspace: 8,
	home: 36,
	left: 37,
	up: 38,
	right: 39,
	down: 40,
	delete: 46,
};

function ggl_getCursor() {
	let cs = $('.kix-cursor').get();
	for (let i=0 ; i<cs.length ; ++i) {
		if ($.trim(cs[i].textContent).length == 0) {
			return $(cs[i]).find('.kix-cursor-caret').get(0);
		}
	}
	return null;
}

function ggl_cursorToLine_left(line) {
	let cb = context.cursor.getBoundingClientRect();
	let lb = line.getBoundingClientRect();
	if (cb.top > lb.top) {
		console.log(['Left', cb.top, lb.bottom]);
		window.postMessage({type: 'gtdp-key', etype: 'keydown', event: {keyCode: Keys.left}}, '*');
		setTimeout(() => { ggl_cursorToLine_left(line); }, 1);
	}
	else {
		console.log('Left -> Right');
		window.postMessage({type: 'gtdp-key', etype: 'keydown', event: {keyCode: Keys.right}}, '*');
	}
}

function ggl_cursorToLine_right(line) {
	let cb = context.cursor.getBoundingClientRect();
	let lb = line.getBoundingClientRect();
	if (cb.top < lb.bottom) {
		console.log(['Right', cb.top, lb.bottom]);
		window.postMessage({type: 'gtdp-key', etype: 'keydown', event: {keyCode: Keys.right}, repeat: 50}, '*');
		setTimeout(() => { ggl_cursorToLine_right(line); }, 1);
	}
	else {
		console.log('Right -> Left');
		setTimeout(() => { ggl_cursorToLine_left(line); }, 1);
	}
}

function ggl_cursorToLine(line) {
	let cb = context.cursor.getBoundingClientRect();
	let lb = line.getBoundingClientRect();
	if (cb.top < lb.bottom) {
		setTimeout(() => { ggl_cursorToLine_right(line); }, 1);
	}
	else {
		setTimeout(() => { ggl_cursorToLine_left(line); }, 1);
	}
}

/* exported ggl_replaceInContext */
function ggl_replaceInContext(id, txt, word, rpl) {
	if (!context.hasOwnProperty('cursor') || !context.cursor) {
		context.cursor = ggl_getCursor();
	}
	console.log([id, txt, word, rpl]);

	window.postMessage({type: 'gtdp-goto-par', id}, '*');

	let par = $('[data-gtid="'+id+'"]');
	let line = par.find('.kix-lineview').get(0);
	//setTimeout(() => { ggl_cursorToLine(line); }, 100);
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
