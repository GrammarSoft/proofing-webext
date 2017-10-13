/*!
 * Copyright 2016-2017 GrammarSoft ApS <info@grammarsoft.com> at https://grammarsoft.com/
 * All Rights Reserved
 * Linguistic backend by Eckhard Bick <eckhard.bick@gmail.com>
 * Frontend by Tino Didriksen <mail@tinodidriksen.com>
 */
'use strict';

Array.prototype.unique = function() {
	let unique = [];
	for (let i=0; i<this.length; ++i) {
		if (unique.indexOf(this[i]) == -1) {
			unique.push(this[i]);
		}
	}
	return unique;
};

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
/* exported itjq */
const itjq = 'B,BIG,I,SMALL,TT,ABBR,ACRONYM,CITE,CODE,DFN,EM,KBD,STRONG,SAMP,TIME,VAR,A,BDO,Q,SPAN,SUB,SUP,LABEL';

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

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
/* exported escapeRegExp */
function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
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
