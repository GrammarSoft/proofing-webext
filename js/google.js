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

/* globals Defs */
/* globals context */
/* globals checkActiveElement */
/* globals getVisibleText */
/* globals ggl_getCursor */
/* globals ggl_loaded:true */
/* globals ggl_cursor:true */
/* globals rects_overlaps */

/* exported ggl_loaded */

/* exported ggl_replaceInContext */
function ggl_replaceInContext(id, txt, word, rpl) {
	window.postMessage({type: 'gtdp-replace', id, txt, word, rpl}, '*');
}

/* exported ggl_prepareTexts */
function ggl_prepareTexts() {
	let to_send = [];

	for (let i=0 ; i<context.ggl.elems.length ; ++i) {
		if (context.ggl.elems[i].hasAttribute('data-gtid')) {
			continue;
		}
		context.ggl.elems[i].normalize();
		let ptxt = getVisibleText(context.ggl.elems[i]);
		ptxt = $.trim(ptxt.replace(/\u200b/g, '').replace(/\u00a0/g, ' ').replace(/  +/g, ' '));
		if (!ptxt) {
			continue;
		}

		let id = i+1;
		context.ggl.elems[i].setAttribute('data-gtid', 's'+id);

		to_send.push({
			i: id,
			h: 'h-'+murmurHash3.x86.hash128(ptxt) + '-' + ptxt.length,
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
			ss.push(this.getBoundingClientRect());
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
