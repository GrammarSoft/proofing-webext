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

/* globals ggl_getCursor */
/* globals rects_overlaps */
/* globals escapeRegExpTokens */

// Event handlers
let ehs = {keypress: [], keydown: []};
let iframe = null;

const KeyCode = {
	backspace: 8,
	end: 35,
	home: 36,
	left: 37,
	up: 38,
	right: 39,
	down: 40,
	delete: 46,
};

function noop() {
}

function dispatchKeyEvent(e) {
	if (!e.hasOwnProperty('repeat')) {
		e.repeat = 1;
	}

	let event = {
		// Event members
		type: e.etype, target: iframe.contentDocument, currentTarget: iframe.contentDocument, eventPhase: 0, cancelBubble: true, bubbles: false, cancelable: true, defaultPrevented: true, composed: false, isTrusted: true, timeStamp: 0, preventDefault: noop, stopPropagation: noop,
		// UIEvent members
		view: iframe.contentWindow, detail: 0,
		// KeyboardEvent members
		key: '', code: '', location: 0, ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, repeat: false, isComposing: false,
	};
	for (let p in e.event) {
		event[p] = e.event[p];
	}

	//console.log(event);

	for (let i=0 ; i<e.repeat ; ++i) {
		for (let k=0 ; k<ehs[e.etype].length ; ++k) {
			ehs[e.etype][k].C(event);
		}
	}
}

function dispatchUndo(n) {
	if (typeof n === 'undefined') {
		n = 1;
	}
	console.log(`Undoing ${n} times`);
	for (let i=0 ; i<n ; ++i) {
		dispatchKeyEvent({etype: 'keydown', event: {which: 90, charCode: 90, key: 'z', ctrlKey: true}});
	}
}

function handleKey(e) {
	if ('preventDefault' in e) {
		e.preventDefault();
	}
	e = e.data;

	if (!e.hasOwnProperty('repeat')) {
		e.repeat = 1;
	}

	if (!ehs.hasOwnProperty(e.etype)) {
		console.log('No such event handler: ' + e.etype);
		return;
	}

	if (e.event.hasOwnProperty('key') && !e.event.hasOwnProperty('charCode')) {
		if (e.event.key.length === 1) {
			e.event.which = e.event.charCode = e.event.key.charCodeAt(0);
			dispatchKeyEvent(e);
			return;
		}

		let repeat = e.repeat;
		e.repeat = 1;
		for (let r=0 ; r<repeat ; ++r) {
			for (let i=0 ; i<e.event.key.length ; ++i) {
				e.event.which = e.event.charCode = e.event.key.charCodeAt(i);
				dispatchKeyEvent(e);
			}
		}
		return;
	}

	dispatchKeyEvent(e);
}

function handleCheckLoad(e) {
	if ('preventDefault' in e) {
		e.preventDefault();
	}
	e = e.data;
	e.type = 'gtdp-check-loaded';

	// Scroll all the way down
	dispatchKeyEvent({etype: 'keydown', event: {keyCode: KeyCode.end, ctrlKey: true}});

	setTimeout(() => {
		// Scroll all the way up
		dispatchKeyEvent({etype: 'keydown', event: {keyCode: KeyCode.home, ctrlKey: true}});
		setTimeout(() => {
			window.postMessage(e, '*');
		}, 250);
	}, 250);
}

function handleReplace(e) {
	if ('preventDefault' in e) {
		e.preventDefault();
	}
	e = e.data;

	let mark = document.getElementById(e.id);
	let id = mark.getAttribute('data-id');

	let par = null;
	let ps = document.getElementsByClassName('kix-paragraphrenderer');
	for (let i=0 ; i<ps.length ; ++i) {
		if (ps[i].hasAttribute('data-gtid') && ps[i].getAttribute('data-gtid') === id) {
			par = ps[i];
			break;
		}
	}

	if (!par) {
		console.log('No such par: ' + id);
		window.postMessage({type: 'gtdp-replace-result', success: false, why: 'errReplacePar'}, '*');
		return;
	}

	let tc = par.textContent.replace(/\u200b/g, '').replace(Const.Bullets, '');

	// Move the cursor to the target paragraph
	let cur = ggl_getCursor();
	let curp = cur.getBoundingClientRect();
	let tgtp = mark.getBoundingClientRect();

	// Binary search
	let repeat = 256;
	if (rects_overlaps(curp, tgtp)) {
		repeat = 32;
	}

	// ToDo: Make this a plain while() loop?
	for (let i=0 ; i<10240 ; ++i) {
		if (curp.top - tgtp.top < -2) {
			console.log(`Down ${repeat} to the right`);
			dispatchKeyEvent({etype: 'keydown', event: {keyCode: KeyCode.down}, repeat});

			curp = cur.getBoundingClientRect();
			if (curp.top - tgtp.top > 2) {
				repeat /= 2;
			}
		}
		else if (curp.top - tgtp.top > 2) {
			console.log(`Up ${repeat} to the left`);
			dispatchKeyEvent({etype: 'keydown', event: {keyCode: KeyCode.up}, repeat});

			curp = cur.getBoundingClientRect();
			if (curp.top - tgtp.top < -2) {
				repeat /= 2;
			}
		}
		else if (curp.left - tgtp.left < -2) {
			console.log(`Forward ${repeat} to the right`);
			dispatchKeyEvent({etype: 'keydown', event: {keyCode: KeyCode.right}, repeat});

			curp = cur.getBoundingClientRect();
			if (curp.left - tgtp.left > 2 || curp.top - tgtp.top > 2) {
				repeat /= 2;
			}
		}
		else if (curp.left - tgtp.left > 2) {
			console.log(`Back ${repeat} to the left`);
			dispatchKeyEvent({etype: 'keydown', event: {keyCode: KeyCode.left}, repeat});

			curp = cur.getBoundingClientRect();
			if (curp.left - tgtp.left < -2 || curp.top - tgtp.top < -2) {
				repeat /= 2;
			}
		}

		repeat = Math.floor(Math.max(repeat, 1));
	}

	// Determine whether and where to work
	// ToDo: Test surrogate pairs and combining marks in {txt, word, rpl}
	let expected = '';
	let rx = new RegExp('^('+e.txt.replace(Const.NonLetter, '.*?')+'\\s*)'+escapeRegExpTokens(e.word));
	let m = rx.exec(tc);
	if (m) {
		//console.log([rx, m]);
		expected = tc.replace(m[0], m[1] + e.rpl).replace(/\s+/ug, ' ');
	}
	else {
		console.log('Could not locate prefix and/or word in paragraph');
		window.postMessage({type: 'gtdp-replace-result', success: false, why: 'errReplaceTxt'}, '*');
		return;
	}

	// Perform the actual replacement
	let undo = 0;
	let wi = 0;
	for (; wi < e.word.length && wi < e.rpl.length ; ++wi) {
		let event = {key: e.rpl.charAt(wi)};
		event.which = event.charCode = event.key.charCodeAt(0);
		console.log(`Replacing ${event.key}`);
		// In order to preserve formatting, behold this mess:
		dispatchKeyEvent({etype: 'keydown', event: {keyCode: KeyCode.right}});
		dispatchKeyEvent({etype: 'keypress', event});
		dispatchKeyEvent({etype: 'keydown', event: {keyCode: KeyCode.left}});
		dispatchKeyEvent({etype: 'keydown', event: {keyCode: KeyCode.backspace}});
		dispatchKeyEvent({etype: 'keydown', event: {keyCode: KeyCode.right}});
		undo += 2;
	}
	// Insert leftover characters
	if (wi < e.rpl.length) {
		for (; wi < e.rpl.length ; ++wi) {
			let event = {key: e.rpl.charAt(wi)};
			event.which = event.charCode = event.key.charCodeAt(0);
			console.log(`Inserting ${event.key}`);
			dispatchKeyEvent({etype: 'keypress', event});
		}
		// Inserting multiple characters is a single undo action
		++undo;
	}
	// Erase superfluous characters
	if (wi < e.word.length) {
		let we = e.word.length - wi;
		console.log(`Erasing ${we} letters`);
		for (let i=0 ; i< we ; ++i) {
			dispatchKeyEvent({etype: 'keydown', event: {keyCode: KeyCode.delete}});
		}
		// Erasing multiple characters is a single undo action
		++undo;
	}

	tc = par.textContent.replace(/\u200b/ug, '').replace(Const.Bullets, '').replace(/\s+/ug, ' ');
	if (tc !== expected) {
		console.log([tc, expected]);
		dispatchUndo(undo);
		window.postMessage({type: 'gtdp-replace-result', success: false, why: 'errReplaceMismatch'}, '*');
		return;
	}

	dispatchKeyEvent({etype: 'keydown', event: {keyCode: KeyCode.down}, repeat});

	let ms = document.getElementsByClassName('marking');
	for (let i=0 ; i<ms.length ; ++i) {
		if (ms[i].getAttribute('data-id') === id) {
			let txt = ms[i].getAttribute('data-txt');
			rx.lastIndex = 0;
			let m = rx.exec(txt);
			if (m) {
				txt = txt.replace(m[0], m[1] + e.rpl);
				ms[i].setAttribute('data-txt', txt);
				console.log(ms[i]);
			}
		}
	}
	window.postMessage({type: 'gtdp-replace-result', success: true}, '*');
}

function handleMessage(e) {
	if (!e.data.hasOwnProperty('type')) {
		return;
	}

	switch (e.data.type) {
	case 'gtdp-key':
		return handleKey(e);
	case 'gtdp-check-load':
		return handleCheckLoad(e);
	case 'gtdp-replace':
		return handleReplace(e);
	}
}

setTimeout(() => {
	iframe = document.getElementsByClassName('docs-texteventtarget-iframe');
	if (!iframe || !iframe.length) {
		console.log('Not Google Docs');
		return;
	}

	iframe = iframe[0];
	let cd = iframe.contentDocument;
	for (let p in cd) {
		if (p.indexOf('closure') === 0) {
			let cl = cd[p];
			// The closure itself has a level of indirection to the actual event handlers
			for (let p in cl) {
				let cp = cl[p];
				for (let eh in ehs) {
					if (!cp.hasOwnProperty(eh)) {
						continue;
					}
					for (let i=0 ; i<cp[eh].length ; ++i) {
						if (cp[eh][i].src !== cd) {
							console.log('Not usable EH');
							continue;
						}
						ehs[eh].push(cp[eh][i]);
					}
				}
			}
		}
	}

	window.addEventListener('message', handleMessage);
}, 250);
