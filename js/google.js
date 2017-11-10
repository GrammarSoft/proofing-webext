/*!
 * Copyright 2016-2017 GrammarSoft ApS <info@grammarsoft.com> at https://grammarsoft.com/
 * Linguistic backend by Eckhard Bick <eckhard.bick@gmail.com>
 * Frontend by Tino Didriksen <mail@tinodidriksen.com>
 *
 * This project is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This project is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this project.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';

/* globals array_unique_json */
/* globals checkActiveElement */
/* globals cmarking */
/* globals context */
/* globals DOMRect */
/* globals escHTML */
/* globals findInTextNodes */
/* globals findVisibleTextNodes */
/* globals getVisibleText */
/* globals ggl_cursor:true */
/* globals ggl_getCursor */
/* globals ggl_loaded:true */
/* globals markingClick */
/* globals murmurHash3 */
/* globals rects_overlaps */

/* exported ggl_loaded */

let ggl_parId = 0;

/* exported ggl_replaceInContext */
function ggl_replaceInContext(id, txt, word, rpl) {
	window.postMessage({type: 'gtdp-replace', id, txt, word, rpl}, '*');
}

/* exported ggl_layoutMarking */
function ggl_layoutMarking(sid) {
	// ToDo: Detect manual/remote changes in the document and reflow markings
	if (typeof sid !== 'string') {
		sid = sid.getAttribute('id');
	}
	let mark = $('.'+sid);
	let id = mark.attr('data-id');
	let txt = mark.attr('data-txt');
	let word = mark.attr('data-word');

	mark = mark.get(0).outerHTML;
	let spans = '';

	let app = $('.kix-appview-editor').get(0);
	let par = $('.kix-paragraphrenderer[data-gtid="'+id+'"]');
	let tns = findVisibleTextNodes(par.get(0));

	let rv = findInTextNodes(tns, txt, word);
	let sel = document.createRange();
	sel.setStart(rv[0].n, rv[0].i);
	sel.setEnd(rv[1].n, rv[1].i);

	let rects = array_unique_json(sel.getClientRects());
	console.log(rects);
	let nr = [];
	for (let i=0 ; i<rects.length ; ++i) {
		let r = rects[i];
		let last = null;
		if (nr.length ===0 || r.top !== nr[nr.length-1].top) {
			last = new DOMRect();
			last.x = r.x;
			last.y = r.y;
			last.height = Math.max(last.height, r.height);
			nr.push(last);
		}
		else {
			last = nr[nr.length-1];
		}
		last.width += r.width;
	}
	for (let i=0 ; i<nr.length ; ++i) {
		let r = nr[i];
		let top = r.top;
		top -= app.getBoundingClientRect().top;
		top += app.scrollTop;
		top -= 1;

		let left = r.left;
		left -= 1;

		let width = r.width;
		width += 2;

		let height = r.height;
		height += 2;

		let off = window.getComputedStyle($('.kix-zoomdocumentplugin-outer').get(0));
		top -= parseInt(off.top);
		left -= parseInt(off.left);

		spans += mark.replace(/style="[^"]*"/g, `style="top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px;"`);
	}

	if (mark !== spans) {
		let ms = $('.'+sid);
		while (ms.length > 1) {
			ms.last().remove();
			ms = $('.'+sid);
		}
		ms.replaceWith(spans);
		$('.'+sid).off().click(markingClick);
		return true;
	}

	return false;
}

/* exported ggl_createMarking */
function ggl_createMarking(id, txt, word, mark) {
	let sid = 'm'+murmurHash3.x86.hash128(txt+word);
	txt = escHTML(txt);
	word = escHTML(word);
	mark = mark.replace('<span ', `<span id="${sid}" data-id="s${id}" data-txt="${txt}" data-word="${word}" style="" `);
	mark = mark.replace('class="', `class="${sid} `);
	mark = mark.replace(/>[^<]+</g, '>&nbsp;<');
	$('#gtdp-markings').append(mark);
	ggl_layoutMarking(sid);
}

/* exported ggl_prepareTexts */
function ggl_prepareTexts() {
	let to_send = [];
	context.ggl.elems = context.ggl.elems.unique();

	for (let i=0 ; i<context.ggl.elems.length ; ++i) {
		context.ggl.elems[i].normalize();
		let ptxt = getVisibleText(context.ggl.elems[i]);
		ptxt = $.trim(ptxt.replace(/\u200b/g, '').replace(/\u00a0/g, ' ').replace(/  +/g, ' ').replace(Const.Bullets, ' '));
		if (!ptxt) {
			continue;
		}

		let id = 0;
		if (context.ggl.elems[i].hasAttribute('data-gtid')) {
			id = parseInt(context.ggl.elems[i].getAttribute('data-gtid').substr(1));
		}
		else {
			id = ++ggl_parId;
			context.ggl.elems[i].setAttribute('data-gtid', 's'+id);
		}

		to_send.push({
			i: id,
			t: ptxt,
		});
	}

	return to_send;
}

/* exported ggl_getTextOrElement */
function ggl_getTextOrElement(mode) {
	let rv = {e: null, t: null, ggl: null};

	rv.e = $('body').get(0);
	rv.ggl = {elems: [], cursor: ggl_getCursor()};

	let ss = [];
	if (mode === 'smart' || mode === 'selected') {
		$('.kix-selection-overlay').each(function() {
			// Only pick our own selections - not other users'
			if (window.getComputedStyle(this).opacity >= 0.15) {
				ss.push(this.getBoundingClientRect());
			}
		});
	}
	if (!ss.length && mode === 'smart') {
		mode = 'cursor';
	}
	if (mode === 'cursor') {
		if (ggl_cursor) {
			ss.push(ggl_cursor);
		}
		else {
			ss.push(rv.ggl.cursor.getBoundingClientRect());
		}
	}

	let ps = $('.kix-paragraphrenderer').get();
	if (!ss.length) {
		// If there are no selections, use all paragraphs
		rv.ggl.elems = ps;
		return rv;
	}

	// ToDo: Handle paragraphs that span page breaks
	for (let i=0 ; i<ps.length ; ++i) {
		let found = false;
		for (let k=0 ; k<ss.length ; ++k) {
			if (!rects_overlaps(ss[k], ps[i].getBoundingClientRect())) {
				continue;
			}
			if (rv.ggl.elems.length === 0 || rv.ggl.elems[rv.ggl.elems.length-1] != ps[i]) {
				rv.ggl.elems.push(ps[i]);
			}
			found = true;
		}
		// If we have found any matches before this failure, we've gone beyond possible range and can just stop searching
		if (!found && rv.ggl.elems.length) {
			// If we're in cursor mode, append all remaining paragraphs
			if (mode === 'cursor') {
				for (++i ; i<ps.length ; ++i) {
					rv.ggl.elems.push(ps[i]);
				}
			}
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
		// Move markings that may have gotten out of place due to the replacement action
		let cmr = cmarking.get(0).getBoundingClientRect();
		let ms = $('span.marking').get();
		let seen = false;
		for (let i=0 ; i<ms.length ; ++i) {
			// Skip the point of change
			if (ms[i] === cmarking.get(0)) {
				seen = true;
				continue;
			}
			// Marks on lines above the point of change won't have moved
			if (ms[i].getBoundingClientRect().bottom < cmr.top) {
				continue;
			}
			// If this mark did not need moving, and we're past the point of change, we know no later marks will need moving
			if (!ggl_layoutMarking(ms[i]) && seen) {
				break;
			}
		}

		if (context && context.replace) {
			context.replace();
			context.replace = null;
		}
	}
	else {
		alert(chrome.i18n.getMessage(e.why));
	}
}

function ggl_checkLoaded(e) {
	if ('preventDefault' in e) {
		e.preventDefault();
	}
	e = e.data;

	ggl_loaded = true;
	checkActiveElement(e.mode);
	ggl_cursor = null;
}

/* exported ggl_handleMessage */
function ggl_handleMessage(e) {
	if (!e.data.hasOwnProperty('type')) {
		return;
	}

	switch (e.data.type) {
	case 'gtdp-replace-result':
		return ggl_replaceResult(e);
	case 'gtdp-check-loaded':
		return ggl_checkLoaded(e);
	}
}

/* exported ggl_handleKeys */
function ggl_handleKeys(e) {
	/*
	On every key(press|down), check that the current paragraph matches the hash, and if not wipe the hash
	Every 3 seconds, re-hash the paragraphs that there are cursors in and re-check them if the hash has changed
	Every 3 seconds, check paragraphs without hashes
	*/
}
