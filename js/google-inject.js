/*!
 * Copyright 2016-2017 GrammarSoft ApS <info@grammarsoft.com> at https://grammarsoft.com/
 * All Rights Reserved
 * Linguistic backend by Eckhard Bick <eckhard.bick@gmail.com>
 * Frontend by Tino Didriksen <mail@tinodidriksen.com>
 */
'use strict';

// Event handlers
let ehs = {keypress: [], keydown: []};
let iframe = null;

const KeyCode = {
	backspace: 8,
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

function handleKeyMessage(e) {
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

function handleReplace(e) {
	if ('preventDefault' in e) {
		e.preventDefault();
	}
	e = e.data;

	let par = null;
	let ps = document.getElementsByClassName('kix-paragraphrenderer');
	for (let i=0 ; i<ps.length ; ++i) {
		if (ps[i].hasAttribute('data-gtid') && ps[i].getAttribute('data-gtid') === e.id) {
			par = ps[i];
			break;
		}
	}

	if (!par) {
		console.log('No such par: ' + e.id);
		return;
	}

	let innerHTML = par.innerHTML;

	// Insert a target node where we want the cursor to go
	let tns = findVisibleTextNodes(par);
	replaceInTextNodes(tns, e.txt, e.word, '\ue112'.repeat(e.word.length));
	for (let i=0 ; i<tns.length ; ++i) {
		tns[i].textContent = '\u200b' + tns[i].textContent.replace(/ /g, '\u200b \u200b') + '\u200b';
	}

	par.innerHTML = par.innerHTML.replace('\ue112', '<span id="gtdp-cursor">\ue112</span>');

	// Move the cursor to the target word
	let cur = ggl_getCursor();
	let tgt = document.getElementById('gtdp-cursor');
	let curp = cur.getBoundingClientRect();
	let tgtp = tgt.getBoundingClientRect();

	// Binary search
	let repeat = 1024;
	// ToDo: Make this a plain while() loop
	for (let i=0 ; i<512 && !rects_overlap(curp, tgtp) ; ++i) {
		if (curp.bottom < tgtp.top) {
			console.log(`Down ${repeat} to the right`);
			dispatchKeyEvent({etype: 'keydown', event: {keyCode: KeyCode.right}, repeat});

			curp = cur.getBoundingClientRect();
			if (curp.top > tgtp.bottom) {
				repeat /= 2;
			}
		}
		else if (curp.top > tgtp.bottom) {
			console.log(`Up ${repeat} to the left`);
			dispatchKeyEvent({etype: 'keydown', event: {keyCode: KeyCode.left}, repeat});

			curp = cur.getBoundingClientRect();
			if (curp.bottom < tgtp.top) {
				repeat /= 2;
			}
		}
		else if (curp.left < tgtp.left) {
			console.log(`Forward ${repeat} to the right`);
			dispatchKeyEvent({etype: 'keydown', event: {keyCode: KeyCode.right}, repeat});

			curp = cur.getBoundingClientRect();
			if (curp.right > tgtp.right || curp.top > tgtp.bottom) {
				repeat /= 2;
			}
		}
		else if (curp.right > tgtp.right) {
			console.log(`Back ${repeat} to the left`);
			dispatchKeyEvent({etype: 'keydown', event: {keyCode: KeyCode.left}, repeat});

			curp = cur.getBoundingClientRect();
			if (curp.left < tgtp.left || curp.bottom < tgtp.top) {
				repeat /= 2;
			}
		}

		repeat = Math.max(repeat, 1);
	}
	// Make sure we're at the start of the word
	while (curp.left > tgtp.left) {
		console.log('Single step to the left');
		dispatchKeyEvent({etype: 'keydown', event: {keyCode: KeyCode.left}});
		curp = cur.getBoundingClientRect();
	}

	par.innerHTML = innerHTML;

	/*
	setTimeout(() => {
		let wi = 0;
		for (; wi < e.word.length && wi < e.rpl.length ; ++wi) {
			let event = {key: e.rpl.charAt(wi)};
			event.which = event.charCode = event.key.charCodeAt(wi);
			console.log(`Inserting ${event.key}`);
			dispatchKeyEvent({etype: 'keypress', event});
		}
	}, 1);
	//*/
	/*
	if (wi === word.length || wi === rpl.length) {
		if (wi < rpl.length) {
			ml = ml.substring(0, nsi) + rpl.substring(wi) + ml.substring(nsi);
		}
		if (wi < word.length) {
			ml = ml.substring(0, nsi) + ml.substring(nsi + (word.length - wi));
		}
		done = true;
	}
	//*/
}

function handleMessage(e) {
	if (!e.data.hasOwnProperty('type')) {
		return;
	}

	switch (e.data.type) {
	case 'gtdp-key':
		return handleKey(e);
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
