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

function noop() {
}

function dispatchKeyEvent(e) {
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
	e.preventDefault();
	e = e.data;

	if (!e.hasOwnProperty('repeat')) {
		e.repeat = 1;
	}

	if (!ehs.hasOwnProperty(e.etype)) {
		console.log('No such event handler: ' + e.etype);
		return;
	}

	if (e.event.hasOwnProperty('key') && !e.event.hasOwnProperty('charCode')) {
		for (let i=0 ; i<e.event.key.length ; ++i) {
			e.event.which = e.event.charCode = e.event.key.charCodeAt(i);
			dispatchKeyEvent(e);
		}
		return;
	}

	dispatchKeyEvent(e);
}

function handleGotoPar(e) {
	e.preventDefault();
	e = e.data;

	let ps = document.getElementsByClassName('kix-paragraphrenderer');
	for (let i=0 ; i<ps.length ; ++i) {
	}
}

function handleMessage(e) {
	if (!e.data.hasOwnProperty('type')) {
		return;
	}

	switch (e.data.type) {
	case 'gtdp-key':
		return handleKey(e);
	case 'gtdp-goto-par':
		return handleGotoPar(e);
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
