/*!
 * Copyright 2016-2017 GrammarSoft ApS <info@grammarsoft.com> at https://grammarsoft.com/
 * All Rights Reserved
 * Linguistic backend by Eckhard Bick <eckhard.bick@gmail.com>
 * Frontend by Tino Didriksen <mail@tinodidriksen.com>
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
	chrome.runtime.sendMessage({document});

	chrome.tabs.executeScript({
		code: 'checkActiveElement();',
	});
});