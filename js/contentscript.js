'use strict';
/* globals getCommonParent */
/* globals escHTML */
/* globals sanitize_result */
/* globals error_types */
/* globals types_red */
/* globals types_yellow */

function getTextOrElement() {
	let rv = {e: null, t: null};
	let s = window.getSelection();
	let e = document.activeElement;
	let w = window;

	if (e && e.tagName !== 'BODY') {
		if (e.tagName === 'IFRAME' && e.contentWindow) {
			w = e.contentWindow;
			if (w.document.activeElement) {
				e = w.document.activeElement;
			}
			if (w.document.getSelection() && w.document.getSelection().toString() !== '') {
				s = w.document.getSelection();
			}
		}

		rv.e = e;

		if (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA') {
			// If there is a partial selection, return that instead
			if (e.selectionStart !== e.selectionEnd && (e.selectionStart !== 0 || e.selectionEnd !== e.value.length)) {
				rv.t = e.value.substring(e.selectionStart, e.selectionEnd);
			}
			return rv;
		}
	}

	if (s && s.toString() !== '') {
		console.log(s);

		let sel = [s.focusNode, s.anchorNode];
		if (s.focusNode.compareDocumentPosition(s.anchorNode) & (Node.DOCUMENT_POSITION_FOLLOWING|Node.DOCUMENT_POSITION_CONTAINED_BY)) {
			console.log('Swapping selection nodes');
			sel = [s.anchorNode, s.focusNode];
		}
		rv.e = sel[0];

		while (rv.e.nodeType === Node.TEXT_NODE) {
			rv.e = rv.e.parentNode;
		}

		// If all text in the node is selected, return the node instead
		let cp = getCommonParent(s.anchorNode, s.focusNode);
		if (cp && $.trim(cp.textContent) === $.trim(s.toString())) {
			rv.e = cp;
		}
		else {
			rv.t = s.toString();
		}
	}

	return rv;
}

function parseResult(rv) {
	if (!rv.hasOwnProperty('c')) {
		$.featherlight.close();
		console.log(rv);
		return;
	}

	let txt = sanitize_result(rv.c);

	let ps = $.trim(txt.replace(/\n+<\/s>\n+/g, "\n\n")).split(/<\/s\d+>/);
	for (let i=0 ; i<ps.length ; ++i) {
		let cp = $.trim(ps[i]);
		if (!cp) {
			continue;
		}

		let lines = cp.split(/\n/);
		let id = lines[0].replace(/^<s(.+)>$/, '$1');
		let txt = '';

		for (let j=1 ; j<lines.length ; ++j) {
			// Ignore duplicate opening tags
			if (/^<s\d+>$/.test(lines[j])) {
				continue;
			}

			let w = lines[j].split(/\t/);
			w[0] = $.trim(w[0].replace(/(\S)=/g, '$1 '));

			if (w[0] === '') {
				continue;
			}

			if (w.length > 1) {
				// Strip error types belonging to higher than current critique level
				let ws = w[1].split(/ /g);
				let nws = [];
				let crs = [];
				let had_r = false;
				for (let k=0 ; k<ws.length ; ++k) {
					if (ws[k].indexOf('<R:') === 0) {
						let n = ws[k].substr(3);
						n = n.substr(0, n.length-1).replace(/(\S)=/g, '$1 ');
						if (n === w[0]) {
							console.log(n);
							continue;
						}
						crs.unshift(n);
						had_r = true;
						continue;
					}
					if (ws[k].indexOf('<AFR:') === 0) {
						let n = ws[k].substr(5);
						n = n.substr(0, n.length-1).replace(/(\S)=/g, '$1 ');
						if (n === w[0]) {
							console.log(n);
							continue;
						}
						crs.push(n);
						continue;
					}
					if (error_types.hasOwnProperty(ws[k])) {
						nws.push(ws[k]);
					}
					else {
						console.log('Unknown error: '+ws[k]);
						nws.push('@unknown-error');
					}
				}
				// Remove @sentsplit from last token
				if (j == lines.length-1 && nws.length == 1 && nws[0] === '@sentsplit') {
					crs = [];
					nws = [];
				}
				// Only show addfejl suggestions if there were real suggestions
				if (!had_r) {
					crs = [];
				}

				ws = [];
				for (let k=0 ; k<nws.length ; ++k) {
					if (nws[k] === '@green') {
						ws.push(nws[k]);
						continue;
					}
					/*
					if (opt_onlyConfident && !types_red.hasOwnProperty(nws[k])) {
						continue;
					}
					if (opt_ignUNames && nws[k] === '@proper') {
						continue;
					}
					if (opt_ignUComp && nws[k] === '@new') {
						continue;
					}
					if (opt_ignUAbbr && nws[k] === '@abbreviation') {
						continue;
					}
					if (opt_ignUOther && nws[k] === '@check!') {
						continue;
					}
					if (opt_ignMaj && (nws[k] === '@upper' || nws[k] === '@lower')) {
						continue;
					}
					//*/
					ws.push(nws[k]);
				}
				nws = ws;
				if (nws.length == 0) {
					crs = [];
				}

				if (crs.length) {
					// Only show addfejl suggestions if the real suggestion icase-matches one of them
					let use_adf = false;
					for (let c=1 ; c<crs.length ; ++c) {
						if (crs[0].toUpperCase() == crs[c].toUpperCase()) {
							use_adf = true;
							break;
						}
					}
					if (!use_adf) {
						crs = [crs[0]];
					}
					crs = crs.unique();
					w[2] = crs.join('\t');
					//console.log(crs);
				}
				if (nws.length) {
					w[1] = nws.join(' ');
					if (!w[2] || w[2].length === 0) {
						w[2] = '';
					}
				}
				else {
					w.pop();
				}
			}

			if (w.length > 1) {
				console.log([id, txt, w]);
				//errorCreateInline(id, txt, w);
			}
			if (w[0] !== ',' || w.length === 1) {
				if (w[0].search(/^[-,.:;?!$*½§£$%&()={}+]$/) === -1) {
					txt += ' ';
				}
				txt += w[0];
			}
		}
	}

	const p = $.featherlight.current().$content.get(0);
	p.removeAttribute('src');
	p.srcdoc = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body></body></html>';
	setTimeout(() => {
		p.contentWindow.document.getElementsByTagName('BODY')[0].innerHTML = '<pre>'+escHTML(rv.c)+'</pre>';
	}, 100);
	console.log([p, rv]);
}

/* exported checkActiveElement */
function checkActiveElement() {
	let e = getTextOrElement();
	console.log(e);
	//return;

	$.featherlight({
		iframe: 'about:blank',
		iframeWidth: 800,
		iframeHeight: 600,
		iframeMinWidth: 800,
		iframeMinHeight: 600,
		iframeMaxWidth: '80%',
		iframeMaxHeight: '80%',
		namespace: 'gt-popup',
	});

	let t = '<s1>\n' + (e.t ? e.t : e.e.textContent) + '\n</s1>';

	$.post('https://retmig.dk/callback.php?a=danproof', {t}).done(parseResult).fail(() => {
		$.featherlight.close();
		console.log(this);
	});
}
