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

if (!Array.prototype.unique) {
	Array.prototype.unique = function() {
		let unique = [];
		for (let i=0; i<this.length; ++i) {
			if (unique.indexOf(this[i]) == -1) {
				unique.push(this[i]);
			}
		}
		return unique;
	};
}

/* exported Defs */
const Defs = {
	CAP_ADMIN:	  (1 <<	 0),
	CAP_COMMA:	  (1 <<	 1),
	CAP_DANPROOF: (1 <<	 2),
	CAP_AKUTUTOR: (1 <<	 3),
	CAP_COMMA_TRIAL:	(1 <<  4),
	CAP_DANPROOF_TRIAL: (1 <<  5),
	CAP_AKUTUTOR_TRIAL: (1 <<  6),
	OPT_COMMA_LEVEL_1:	   (1 <<  0),
	OPT_COMMA_LEVEL_2:	   (1 <<  1),
	OPT_COMMA_LEVEL_3:	   (1 <<  2),
	OPT_COMMA_GREEN:	   (1 <<  3),
	OPT_COMMA_MAYBE:	   (1 <<  4),
	OPT_COMMA_COLOR:	   (1 <<  5),
	OPT_DP_ONLY_CONFIDENT: (1 <<  0),
	OPT_DP_IGNORE_NAMES:   (1 <<  1),
	OPT_DP_IGNORE_COMP:	   (1 <<  2),
	OPT_DP_IGNORE_ABBR:	   (1 <<  3),
	OPT_DP_IGNORE_OTHER:   (1 <<  4),
	OPT_DP_IGNORE_MAJ:	   (1 <<  5),
	OPT_DP_COLOR:		   (1 <<  6),
	OPT_DP_USE_DICT:	   (1 <<  7),
	MAX_SESSIONS: 5,
	MAX_RQ_SIZE: 4096,
	'comma-commercial': 'Kommaforslag Erhverv',
	'comma-private': 'Kommaforslag Privat',
	'comma-student': 'Kommaforslag Studerende',
	'danproof-commercial': 'Ret Mig Erhverv',
	'danproof-private': 'Ret Mig Privat',
	'danproof-student': 'Ret Mig Studerende',
	'akututor-clinic': 'Akututor Klinik',
	'akututor-student': 'Akututor Studerende',
};
Defs.OPT_DP_IGNORE_UNKNOWN = Defs.OPT_DP_IGNORE_NAMES|Defs.OPT_DP_IGNORE_COMP|Defs.OPT_DP_IGNORE_ABBR|Defs.OPT_DP_IGNORE_OTHER;

// Upper-case because we compare them to DOM nodeName
/* exported text_nodes */
const text_nodes = {'ADDRESS': true, 'ARTICLE': true, 'ASIDE': true, 'BLOCKQUOTE': true, 'BODY': true, 'CANVAS': true, 'DD': true, 'DIV': true, 'DL': true, 'FIELDSET': true, 'FIGCAPTION': true, 'FIGURE': true, 'FOOTER': true, 'FORM': true, 'H1': true, 'H2': true, 'H3': true, 'H4': true, 'H5': true, 'H6': true, 'HEADER': true, 'HGROUP': true, 'HR': true, 'LI': true, 'MAIN': true, 'NAV': true, 'NOSCRIPT': true, 'OL': true, 'OUTPUT': true, 'P': true, 'PRE': true, 'SECTION': true, 'TABLE': true, 'TD': true, 'TH': true, 'UL': true, 'VIDEO': true};
/* exported tnjq */
const tnjq = Object.keys(text_nodes).join(',');
// While inline, skip these: BR,IMG,MAP,OBJECT,SCRIPT,BUTTON,INPUT,SELECT,TEXTAREA
//* exported itjq */
//const itjq = 'B,BIG,I,SMALL,TT,ABBR,ACRONYM,CITE,CODE,DFN,EM,KBD,STRONG,SAMP,TIME,VAR,A,BDO,Q,SPAN,SUB,SUP,LABEL';

/* exported g_conf_defaults */
const g_conf_defaults = {
	opt_onlyConfident: false,
	opt_ignUNames: false,
	opt_ignUComp: false,
	opt_ignUAbbr: false,
	opt_ignUOther: false,
	opt_ignMaj: false,
	opt_useDictionary: true,
	opt_colorBlind: false,
};

/* exported ga_log */
function ga_log(cat, act, lbl) {
	console.log([cat, act, lbl]);
	return;
	if (!ga || typeof ga === 'undefined') {
		return;
	}
	ga('send', 'event', cat, act, lbl);
}

/* exported send_post */
function send_post(url, data) {
	if (typeof data === 'undefined' || !data) {
		data = {};
	}
	return $.ajax({
		url: url,
		type: 'POST',
		dataType: 'json',
		headers: {HMAC: cookie_hmac['sess_id']},
		data: data,
	});
}

/* exported log_click */
function log_click(data) {
	console.log(data);
	return;
	$.post('./callback.php?a=click', {'data': JSON.stringify(data)});
}

/* exported log_error */
function log_error(data) {
	console.log(data);
	return;
	$.post('./callback.php?a=error', {'data': JSON.stringify(data)});
}

/* exported log_warning */
function log_warning(data) {
	console.log(data);
	return;
	$.post('./callback.php?a=warning', {'data': JSON.stringify(data)});
}

/* exported is_upper */
function is_upper(ch) {
	return (ch === ch.toUpperCase() && ch !== ch.toLowerCase());
}

/* exported uc_first */
function uc_first(str) {
	return str.substr(0, 1).toUpperCase() + str.substr(1);
}

/* exported escHTML */
function escHTML(t) {
	let nt = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
	//console.log([t, nt]);
	return nt;
}

/* exported decHTML */
function decHTML(t) {
	let nt = t.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
	//console.log([t, nt]);
	return nt;
}

/* exported skipNonText */
function skipNonText(ml, i) {
	let did = true;
	while (did) {
		did = false;
		while (/^\s$/.test(ml.charAt(i))) {
			++i;
		}

		// Skip tags
		while (i<ml.length && ml.charAt(i) === '<') {
			while (i<ml.length && ml.charAt(i) !== '>') {
				// Skip attribute values
				while (i<ml.length && ml.charAt(i) === '"') {
					++i;
					while (i<ml.length && ml.charAt(i) !== '"') {
						++i;
					}
					++i;
				}
				while (i<ml.length && ml.charAt(i) === "'") {
					++i;
					while (i<ml.length && ml.charAt(i) !== "'") {
						++i;
					}
					++i;
				}
				if (i<ml.length && ml.charAt(i) !== '>') {
					++i;
				}
			}
			did = true;
			++i;
		}

		// Skip entities
		// ToDo: Test other entities, if any
		while (i<ml.length && ml.charAt(i) === '&') {
			while (i<ml.length && ml.charAt(i) !== ';') {
				++i;
			}
			did = true;
			++i;
		}

		while (/^\s$/.test(ml.charAt(i))) {
			++i;
		}
	}
	return i;
}

/* exported array_unique_json */
function array_unique_json(arr) {
	let rv = [];
	let js = [];
	for (let i=0 ; i<arr.length ; ++i) {
		let json = JSON.stringify(arr[i]);
		if (js.indexOf(json) === -1) {
			js.push(json);
			rv.push(arr[i]);
		}
	}
	return rv;
}

/* exported findInTextNodes */
function findInTextNodes(tns, txt, word) {
	let rv = [];
	let nonl = /[^\d\wa-zA-ZéÉöÖæÆøØåÅ.,]/igu;
	let ns = 0;

	let txts = [txt, word, ''];
	for (let k=0 ; k<txts.length-1 ; ++k) {
		let nsi = 0;
		if (rv.length) {
			nsi = rv[0].i;
		}

		let txt = txts[k];
		let word = txts[k+1];
		let ti = 0;
		for (; txt.length && ns<tns.length ;) {
			let ml = tns[ns].textContent;
			for ( ; nsi<ml.length ; ++nsi) {
				for (let tn=ti ; tn<txt.length && tn<ti+10 ; ++tn) {
					if (txt.charAt(tn) === ml.charAt(nsi) || (txt.charAt(tn) === '\ue000' && nonl.test(ml.charAt(nsi)))) {
						ti = tn;
						// Find identical sequential letters, e.g. 1977
						while (ti < txt.length-1 && txt.charAt(ti) === ml.charAt(nsi)) {
							//console.log([ti, nsi, txt.charAt(ti), ml.charAt(nsi)]);
							++ti;
							++nsi;
						}
						break;
					}
				}
				//console.log([ti, nsi, txt.charAt(ti), ml.charAt(nsi)]);
				if (ti >= txt.length-1) {
					break;
				}
			}

			if (nsi >= ml.length) {
				++ns;
				nsi = 0;
			}
			if (ti >= txt.length-1) {
				break;
			}
		}
		for (; ti < txt.length ; ++ti, ++nsi) {
			let ml = tns[ns].textContent;
			if (ml.charAt(nsi) !== txt.charAt(ti)) {
				break;
			}
			//console.log([ti, txt.length, txt.charAt(ti), txt]);
			if (nsi >= ml.length) {
				++ns;
				nsi = 0;
			}
		}
		console.log([ti, txt.length, txt.charAt(ti), txt]);
		//console.log([txt, word, tns, ns, nsi, ti]);

		let wi = 0;
		for (; word.length && ns<tns.length ;) {
			let did = false;
			let ml = tns[ns].textContent;
			while (nsi < ml.length && wi < word.length) {
				if (/[\s\u200b]/.test(ml.charAt(nsi)) && !/\s/.test(word.charAt(wi))) {
					//console.log([ns, nsi, wi, ml, word]);
					did = true;
					++nsi;
				}
				else if (!/[\s\u200b]/.test(ml.charAt(nsi)) && /\s/.test(word.charAt(wi))) {
					//console.log([ns, nsi, wi, ml, word]);
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
		//console.log([word, tns, ns, nsi, wi]);
		rv.push({n: tns[ns], i: nsi});
	}
	console.log(rv);

	return rv;
}

/* exported replaceInTextNodes */
function replaceInTextNodes(tns, txt, word, rpl) {
	rpl = rpl.padEnd(word.length, '\ue111');

	let nonl = /[^\d\wa-zA-ZéÉöÖæÆøØåÅ.,]/igu;
	let ti = 0;
	let ns = 0;
	let nsi = 0;
	for (; txt.length && ns<tns.length ; ++ns) {
		let ml = tns[ns].textContent;
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
		let ml = tns[ns].textContent;
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
		let ml = tns[ns].textContent;

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

		if (ml !== tns[ns].textContent) {
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

/* exported findTextNodes */
function findTextNodes(nodes) {
	let tns = [], wsx = /\S/;

	if (!$.isArray(nodes)) {
		nodes = [nodes];
	}

	function _findTextNodes(node) {
		if (node.nodeType === Node.TEXT_NODE) {
			if (wsx.test(node.nodeValue)) {
				tns.push(node);
			}
		}
		else {
			for (let i=0 ; i < node.childNodes.length ; ++i) {
				_findTextNodes(node.childNodes[i]);
			}
		}
	}

	for (let i=0 ; i<nodes.length ; ++i) {
		_findTextNodes(nodes[i]);
	}
	return tns;
}

/* exported findVisibleTextNodes */
function findVisibleTextNodes(nodes) {
	let tns = [], wsx = /\S/;
	let wnd = window;

	if (!$.isArray(nodes)) {
		nodes = [nodes];
	}

	function _findVisibleTextNodes(node) {
		if (node.nodeType === Node.TEXT_NODE) {
			let nv = node.nodeValue.replace(/\u200b/g, '');
			if (nv.length) {
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

	for (let i=0 ; i<nodes.length ; ++i) {
		wnd = nodes[i].ownerDocument.defaultView;
		_findVisibleTextNodes(nodes[i]);
	}
	return tns;
}

/* exported getVisibleText */
function getVisibleText(nodes) {
	let txt = '';
	let wnd = window;

	if (!$.isArray(nodes)) {
		nodes = [nodes];
	}

	function _getVisibleText(node) {
		if (node.nodeType === Node.TEXT_NODE) {
			txt += node.nodeValue;
		}
		else if (node.nodeType === Node.ELEMENT_NODE) {
			if (node.nodeName === 'STYLE' || node.nodeName === 'SCRIPT') {
				return;
			}
			let sts = wnd.getComputedStyle(node);
			if (sts.display === 'none' || sts.visibility === 'hidden' || sts.visibility === 'collapse') {
				return;
			}
			if (node.nodeName === 'BR') {
				txt += '\n';
			}
			for (let i=0 ; i < node.childNodes.length ; ++i) {
				_getVisibleText(node.childNodes[i]);
			}
		}
	}

	for (let i=0 ; i<nodes.length ; ++i) {
		wnd = nodes[i].ownerDocument.defaultView;
		_getVisibleText(nodes[i]);
	}
	return txt.replace(/ +/g, ' ');
}

/* exported getVisibleStyledText */
function getVisibleStyledText(pnode) {
	let txt = '';
	let wnd = pnode.ownerDocument.defaultView;
	let ni = 0;

	function _getVisibleStyledText(node) {
		if (node.nodeType === Node.TEXT_NODE) {
			if (node.parentNode != pnode) {
				let nn = node.parentNode.nodeName.toLowerCase();
				++ni;
				txt += '<STYLE:'+nn+':'+ni+'>';
				txt += node.nodeValue;
				txt += '</STYLE:'+nn+':'+ni+'>';
			}
			else {
				txt += node.nodeValue;
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
			if (node.nodeName === 'BR') {
				txt += '\n';
			}
			for (let i=0 ; i < node.childNodes.length ; ++i) {
				_getVisibleStyledText(node.childNodes[i]);
			}
		}
	}

	_getVisibleStyledText(pnode);
	return txt;
}

/* exported sanitize_result */
function sanitize_result(txt) {
	// Swap markers that the backend has mangled due to sentence-ending parentheticals
	for (let i=0 ; i<Defs.MAX_RQ_SIZE ; ++i) {
		let t1 = '</s'+i+'>';
		let t2 = '<s'+(i+1)+'>';
		let s1 = txt.indexOf(t1);
		let s2 = txt.indexOf(t2);
		if (s1 !== -1 && s2 !== -1 && s2 < s1) {
			txt = txt.replace(new RegExp('('+t2+')((.|\\s)*?'+t1+')', 'g'), '$2\n\n$1\n');
			console.log('Swapped markers '+i+' with '+(i+1));
		}
	}

	// Remove empty sentences
	txt = txt.replace(/<s\d+>[\s\n]*<\/s\d+>/g, '');

	// Remove noise before sentences
	txt = txt.replace(/^[^]*?(<s\d+>)/, '$1');

	// Remove noise between sentences
	txt = txt.replace(/(\n<\/s\d+>)[^]*?(<s\d+>\n)/g, '$1\n\n$2');
	return txt;
}

/* exported getCommonParent */
function getCommonParent(a, b) {
	let ps = [a];
	while (a.parentNode && a.parentNode !== ps[ps.length-1]) {
		ps.push(a.parentNode);
		a = a.parentNode;
	}

	console.log(ps);

	do {
		for (let i=0 ; i<ps.length ; ++i) {
			if (b === ps[i]) {
				return b;
			}
		}
		b = b.parentNode;
	} while (b);

	return null;
}

/* exported getNontextParent */
function getNontextParent(n) {
	while (n.nodeType === Node.TEXT_NODE) {
		n = n.parentNode;
	}
	return n;
}
