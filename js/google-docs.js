'use strict';

// Event handlers
let ehs = {keypress: [], keydown: []};

let iframe = document.getElementsByClassName('docs-texteventtarget-iframe');
if (iframe && iframe.length) {
	let cd = iframe[0].contentDocument;
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
						ehs[eh].push(cp[eh][i]);
					}
				};
			}
		}
	}
}

console.log(ehs);
