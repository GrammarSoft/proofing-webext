'use strict';
/* globals Defs */
/* globals context */
/* globals escHTML */
/* globals getVisibleText */
/* globals rects_overlap */

function ggl_getCursor() {
	let cs = $('.kix-cursor').get();
	for (let i=0 ; i<cs.length ; ++i) {
		if ($.trim(cs[i].textContent).length == 0) {
			return $(cs[i]).find('.kix-cursor-caret').get(0);
		}
	}
	return null;
}

/* exported ggl_prepareTexts */
function ggl_prepareTexts() {
	let to_send = [];

	let text = '';
	for (let i=0 ; i<context.ggl.elems.length ; ++i) {
		context.ggl.elems[i].normalize();
		let ptxt = getVisibleText(context.ggl.elems[i]);
		ptxt = $.trim(ptxt.replace(/  +/g, ' '));
		if (!ptxt) {
			continue;
		}

		let id = i+1;
		context.ggl.elems[i].setAttribute('data-gtid', 's'+id);
		text += '<s' + id + '>\n' + ptxt + '\n</s' + id + '>\n\n';

		if (text.length >= Defs.MAX_RQ_SIZE) {
			to_send.push(text);
			text = '';
		}
	}
	to_send.push(text);

	return to_send;
}

/* exported ggl_getTextOrElement */
function ggl_getTextOrElement() {
	let rv = {e: null, t: null, ggl: null};

	rv.e = $('body').get(0);
	rv.ggl = {elems: [], cursor: ggl_getCursor()};

	let ss = [];
	$('.kix-selection-overlay').each(function() {
		ss.push(this.getBoundingClientRect());
	});

	if (!ss.length) {
		rv.ggl.elems = $('.kix-paragraphrenderer').get();
		return rv;
	}

	// ToDo: Select whole paragraph if any part is selected
	$('.kix-paragraphrenderer').each(function() {
		let tsel = '';
		$(this).find('.kix-wordhtmlgenerator-word-node').each(function() {
			let tline = '';
			for (let i=0 ; i<ss.length ; ++i) {
				// Skip selection if no words in this line were selected
				if (!rects_overlap(ss[i], this.getBoundingClientRect())) {
					continue;
				}

				// Wrap each word in a span that we can further check overlap of
				let span = $(this).find('.goog-inline-block').get(0).outerHTML;
				$(this).find('.goog-inline-block').remove();
				this.innerHTML = this.innerHTML.replace(/<[^<>]+>/g, '').replace(/([^\u200b\s]+)/g, '<span class="gtdp-word">$1</span>') + span;
				//console.log([ss[i], this]);

				$(this).find('.gtdp-word').each(function() {
					// Skip whole word if no letters in this word were selected
					if (!rects_overlap(ss[i], this.getBoundingClientRect())) {
						// Wipe our handle to the word so we know it's not active
						$(this).replaceWith(escHTML(this.textContent));
						return;
					}
					// If any letter was selected, append the whole word
					tline += this.textContent + ' ';
				});
				this.normalize();
			}
			if (tline.length) {
				tsel += tline;
			}
		});

		tsel = $.trim(tsel.replace(/\u200b+/g, '').replace(/\u00a0+/g, ' ').replace(/  +/g, ' ').replace(/\n\n+/g, '\n\n'));
		if (tsel.length === 0) {
			return;
		}
		if (rv.t) {
			rv.t += tsel + '\n\n';
			return;
		}

		let ptxt = $.trim(this.textContent.replace(/\u200b+/g, '').replace(/\u00a0+/g, ' ').replace(/  +/g, ' ').replace(/\n\n+/g, '\n\n'));
		console.log([this, tsel, ptxt]);
		if (tsel === ptxt) {
			$(this).find('.gtdp-word').each(function() {
				$(this).replaceWith(this.textContent);
			});
			this.normalize();
			rv.ggl.elems.push(this);
		}
		else {
			rv.t = '';
			for (let i=0 ; i<rv.ggl.elems.length ; ++i) {
				rv.t += rv.ggl.elems[i].textContent + '\n\n';
			}
			rv.t += tsel + '\n\n';
		}
	});

	return rv;
}
