/*!
 * Copyright 2016-2017 GrammarSoft ApS <info@grammarsoft.com> at https://grammarsoft.com/
 * All Rights Reserved
 * Linguistic backend by Eckhard Bick <eckhard.bick@gmail.com>
 * Frontend by Tino Didriksen <mail@tinodidriksen.com>
 */
'use strict';

function handler(request, sender, sendResponse) {
	if (!request.hasOwnProperty('a') || request.a === 'log') {
		console.log([request, sender, sendResponse]);
	}
	return false;
}

chrome.runtime.onMessage.addListener(handler);
