/*!
 * Copyright 2016-2017 GrammarSoft ApS <info@grammarsoft.com> at https://grammarsoft.com/
 * All Rights Reserved
 * Linguistic backend by Eckhard Bick <eckhard.bick@gmail.com>
 * Frontend by Tino Didriksen <mail@tinodidriksen.com>
 */
'use strict';
/* globals getCommonParent */
/* globals escHTML */
/* globals sanitize_result */
/* globals marking_types */
/* globals types_red */
/* globals types_yellow */
/* globals g_conf_defaults */

let g_conf = Object.assign({}, g_conf_defaults);
let context = null;
let cmarking = null;
let floater = null;
let floater_doc = null;

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

function isInDictionary(e) {
	return false;
}

function addToDictionary() {
	let word = cmarking.text();
	if (!isInDictionary(word)) {
		addToDictionary_helper(word);
		if (opt_storage) {
			opt_dictionary.push(word);
			let dict = opt_dictionary.join('\t').replace(/^\s+/g, '').replace(/\s+$/g, '');
			localStorage.setItem('opt_dictionary', dict);
		}
	}

	let p = $(floater);
	let cs = p.find('span.marking-yellow').each(function() {
		cmarking = $(this);
		if (cmarking.text() !== word && cmarking.text().toUpperCase() !== word.toUpperCase()) {
			return;
		}
		markingYellow();
	});
	ga_log('ui', 'dict-add', word);
	log_click({'dict-add': word});
}

function markingPopup(c, exp) {
	let p = $(c).closest('body');
	p.find('span.marking').popover('dispose').removeClass('marking-selected');
	p.find('.popover').remove();

	// If this marking's popup is the open one, just close it
	if (!exp && cmarking && cmarking.get(0) === c) {
		cmarking = null;
		return;
	}
	cmarking = $(c);
	cmarking.focus().addClass('marking-selected');
	//console.log([c.offset(), c.width(), p.width()]);

	let all_upper = is_upper(cmarking.text());
	let first_upper = all_upper || is_upper(cmarking.text().charAt(0));

	let types = cmarking.attr('data-types');
	if (types.indexOf('@lower') !== -1) {
		all_upper = first_upper = false;
	}

	let html = '<div id="popup">';
	let crs = cmarking.attr('data-sugs').split('\t');
	for (let c=0 ; c<crs.length ; ++c) {
		if (crs[c].length === 0) {
			continue;
		}
		let txt = crs[c];
		if (all_upper) {
			txt = txt.toUpperCase();
		}
		else if (first_upper) {
			txt = uc_first(txt);
		}
		html += '<div class="action"><a href="#" class="accept"><span class="icon icon-accept"></span><span>'+escHTML(txt)+'</span></a></div>';
	}
	if (types.indexOf('@nil') !== -1) {
		html += '<div class="action"><a href="#" class="accept"><span class="icon icon-discard"></span><span>Fjern ordet</span></a></div>';
	}
	if (types.indexOf('@insert') !== -1) {
		html += '<div class="action"><a href="#" class="accept"><span class="icon icon-accept"></span><span>Indsæt ordet</span></a></div>';
	}
	if (cmarking.hasClass('marking-yellow')) {
		html += '<div class="action"><a href="#" class="dict"><span class="icon icon-accept"></span><span>Tilføj til ordbogen</span></a></div>';
	}
	if (types.indexOf('@question') !== -1) {
		html += '<div class="action"><a href="#" class="discard"><span class="icon icon-accept"></span><span>Ok</span></a></div>';
	}
	else {
		html += '<div class="action"><a href="#" class="input"><span class="icon icon-accept"></span><span>Ret selv…</span></a></div>';
		html += '<div class="action"><a href="#" class="discard"><span class="icon icon-discard"></span><span>Ignorer</span></a></div>';
	}
	html += '</div>';
	html += '<div id="explanation">';
	let ts = cmarking.attr('data-types').split(/ /g);
	let exps = {};
	let en = exp ? 2 : 1;
	for (let i=0 ; i<ts.length ; ++i) {
		let et = marking_types[ts[i]] ? marking_types[ts[i]][en] : (ts[i] + ' ');
		et = '<p>'+et.replace(/(<\/h\d>)/g, '$1<br><br>').replace(/(<br>\s*)+<br>\s*/g, '</p><p>')+'</p>';
		exps[et] = et.replace(/<p>\s*<\/p>/g, '');
	}
	html += $.map(exps, function(v) { return v; }).join('<hr>');
	if (!exp) {
		html += '<hr><div class="action"><a onclick="window.parent.markingExplain();"><span class="icon icon-explain"></span><span>Udvid forklaringen</span></a></div>';
	}
	html += '</div>';

	cmarking.popover({
		animation: false,
		container: p,
		content: html,
		html: true,
		placement: 'bottom',
	}).on('shown.bs.popover', function() {
		let pop = p.find('div.popover');
		//pop.scrollintoview();
		pop.find('a[target="_blank"]').off().on('click', function() {
			window.open($(this).attr('href'));
		});
		pop.find('a.accept').off().on('click', markingAccept);
		pop.find('a.discard').off().on('click', markingDiscard);
		pop.find('a.dict').off().on('click', addToDictionary);
		//pop.find('a.input').off().on('click', showInput);
	});
	cmarking.popover('show');
}

function markingClick() {
	markingPopup(this, false);
	ga_log('marking', 'click');
}

function markingExplain() {
	markingPopup(cmarking.get(0), true);
	ga_log('marking', 'explain', cmarking.attr('data-types'));
	log_click({'explain': cmarking.attr('data-types')});
}

function createMarking(marking) {
	let col = 'green';
	let types = marking[1].split(/ /g);
	for (let i=0 ; i<types.length ; ++i) {
		if (types_yellow.hasOwnProperty(types[i])) {
			col = 'yellow';
		}
		if (types_red.hasOwnProperty(types[i])) {
			col = 'red';
			break;
		}
	}
	for (let i=0 ; i<types.length ; ++i) {
		if (types[i] === '@green') {
			col = 'green';
		}
	}

	if (g_conf.opt_useDictionary && col === 'yellow' && isInDictionary(marking[0])) {
		if (marking[2].length == 0) {
			console.log(['yellow-discard', marking[0]]);
			return;
		}

		console.log(['yellow-green', marking[0]]);
		col = 'green';
	}

	if (g_conf.opt_onlyConfident && col !== 'red') {
		return;
	}

	let space = 0;
	if (!marking[2] && /@-?comp(-|\t|$)/.test(marking[1])) {
		marking[2] = marking[0];
	}
	if ($.inArray('@comp-', types) !== -1) {
		marking[0] += ' ';
		space = 1;
	}
	else if ($.inArray('@-comp', types) !== -1) {
		marking[0] = ' ' + marking[0];
		space = -1;
	}
	else if ($.inArray('@comp-:-', types) !== -1) {
		marking[0] += ' ';
		marking[2] = marking[2].replace(/(\t|$)/g, '‐$1'); // -$1 puts after words because matching \t|$
		space = 1;
	}

	let alt = '';
	if (g_conf.opt_colorBlind) {
		alt = ' alt';
	}

	let html = '<span class="marking marking-'+col+alt+'" data-types="'+escHTML(marking[1])+'" data-sugs="'+escHTML(marking[2])+'">'+escHTML(marking[0])+'</span>';
	if (space === 0) {
		html = ' '+html;
	}

	return {space, html};
}

function markingDo(rpl) {
	let p = $(floater_doc);
	let markings = p.find('span.marking');
	markings.popover('dispose');
	p.find('.popover').remove();
	$('#dg_input').modal('hide');
	if (!cmarking) {
		return;
	}

	let c = 0;
	for (let i=0 ; i<markings.length ; ++i) {
		if (markings[i] === cmarking.get(0)) {
			c = i;
		}
	}

	cmarking.replaceWith(rpl);
	cmarking = null;

	if (p.find('span.marking').length == 0) {
		$('#btn-correct-all,#btn-wrong-all,#btn-close').addClass('disabled');
	}
	else {
		markings = p.find('span.marking');
		if (c >= markings.length) {
			--c;
		}
		markings.eq(c).click();
	}
}

function markingAccept(ev) {
	if (!cmarking) {
		return false;
	}

	let rpl = '';
	let types = cmarking.attr('data-types');
	let click = {'accept': types, 'w': cmarking.text()};
	if (types.indexOf('@nil') !== -1) {
		rpl = '';
	}
	else if (types.indexOf('@insert') !== -1) {
		rpl = cmarking.text();
	}
	else {
		rpl = $(this).text();
		click.r = rpl;
	}

	ga_log('marking', 'accept', cmarking.attr('data-types'));
	log_click(click);
	markingDo(rpl);

	return false;
}

function markingDiscard(ev) {
	ga_log('marking', 'discard', cmarking.attr('data-types'));
	log_click({'discard': cmarking.attr('data-types'), 'w': cmarking.text()});

	let types = cmarking.attr('data-types');
	if (types.indexOf('@insert') !== -1) {
		markingDo('');
	}
	else {
		markingDo(cmarking.text());
	}
	return false;
}

function markingYellow() {
	let click = {'yellow': cmarking.attr('data-types'), 'w': cmarking.text()};
	if (cmarking.attr('data-sugs')) {
		let s = cmarking.attr('data-sugs').split('\t')[0];
		if (s === cmarking.text() || s.toUpperCase() === cmarking.text().toUpperCase()) {
			click.r = s;
			markingDo(s);
		}
	}
	else {
		markingDo(cmarking.text());
	}
	ga_log('marking', 'yellow', cmarking.attr('data-types'));
	log_click(click);
}

function parseResult(rv) {
	if (!rv.hasOwnProperty('c')) {
		$.featherlight.close();
		console.log(rv);
		return;
	}

	floater = $.featherlight.current().$content.get(0);
	if (floater.hasAttribute('src')) {
		floater.removeAttribute('src');
		floater.srcdoc = '<!DOCTYPE html><html><head><meta charset="UTF-8"><link href="chrome-extension://'+chrome.i18n.getMessage('@@extension_id')+'/vendor/bootstrap.min.css" rel="stylesheet" type="text/css"><link href="chrome-extension://'+chrome.i18n.getMessage('@@extension_id')+'/css/inline.css" rel="stylesheet" type="text/css"></head><body><div id="result"></div></body></html>';
	}

	let rs = '';

	let txt = sanitize_result(rv.c);
	let ps = $.trim(txt.replace(/\n+<\/s>\n+/g, "\n\n")).split(/<\/s\d+>/);
	for (let i=0 ; i<ps.length ; ++i) {
		let cp = $.trim(ps[i]);
		if (!cp) {
			continue;
		}

		let lines = cp.split(/\n/);
		let id = lines[0].replace(/^<s(.+)>$/, '$1');
		rs += '<p id="s'+id+'">';
		let space = 0;

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
				// Strip marking types belonging to higher than current critique level
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
					if (marking_types.hasOwnProperty(ws[k])) {
						nws.push(ws[k]);
					}
					else {
						console.log('Unknown marking: '+ws[k]);
						nws.push('@unknown-marking');
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
					if (g_conf.opt_onlyConfident && !types_red.hasOwnProperty(nws[k])) {
						continue;
					}
					if (g_conf.opt_ignUNames && nws[k] === '@proper') {
						continue;
					}
					if (g_conf.opt_ignUComp && nws[k] === '@new') {
						continue;
					}
					if (g_conf.opt_ignUAbbr && nws[k] === '@abbreviation') {
						continue;
					}
					if (g_conf.opt_ignUOther && nws[k] === '@check!') {
						continue;
					}
					if (g_conf.opt_ignMaj && (nws[k] === '@upper' || nws[k] === '@lower')) {
						continue;
					}
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
				let rv = createMarking(w);
				rs += rv.html;
				space = rv.space;
			}
			else if (w[0] !== ',' || w.length === 1) {
				if (space === 0 && w[0].search(/^[-,.:;?!$*½§£$%&()={}+]$/) === -1) {
					rs += ' ';
				}
				space = 0;
				rs += '<span class="word">'+w[0]+'</span>';
			}
		}
		rs += '</p>';
	}

	setTimeout(() => {
		floater_doc = floater.contentWindow.document;
		floater_doc.getElementById('result').innerHTML += rs;
		$(floater_doc).find('span.marking').off().click(markingClick);
		console.log([floater, floater_doc, rv, rs]);
	}, 100);
}

/* exported checkActiveElement */
function checkActiveElement() {
	if ($.featherlight.current()) {
		$.featherlight.close();
		return;
	}

	chrome.storage.sync.get(g_conf_defaults, (items) => {
		g_conf = items;
		console.log(g_conf);
	});

	context = getTextOrElement();
	console.log(context);
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

	let t = '<s1>\n' + (context.t ? context.t : context.e.textContent) + '\n</s1>';

	$.post('https://retmig.dk/callback.php?a=danproof', {t}).done(parseResult).fail(() => {
		$.featherlight.close();
		console.log(this);
	});
}
