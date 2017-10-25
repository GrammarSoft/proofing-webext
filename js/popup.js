/*!
 * Copyright 2016-2017 GrammarSoft ApS <info@grammarsoft.com> at https://grammarsoft.com/
 * All Rights Reserved
 * Linguistic backend by Eckhard Bick <eckhard.bick@gmail.com>
 * Frontend by Tino Didriksen <mail@tinodidriksen.com>
 */
'use strict';

function checkAll() {
	chrome.tabs.executeScript({
		code: 'checkAll();',
	});
}

function checkCursor() {
	chrome.tabs.executeScript({
		code: 'checkCursor();',
	});
}

function checkSmart() {
	chrome.tabs.executeScript({
		code: 'checkSmart();',
	});
}

function checkSelected() {
	chrome.tabs.executeScript({
		code: 'checkSelected();',
	});
}

document.addEventListener('DOMContentLoaded', () => {
	$('[data-i18n]').each(function() {
		if (this.hasAttribute('data-i18n')) {
			this.textContent = chrome.i18n.getMessage(this.getAttribute('data-i18n'));
		}
	});

	$('#btn-check-all').off().click(checkAll);
	$('#btn-check-smart').off().click(checkSmart);
	$('#btn-check-cursor').off().click(checkCursor);
	$('#btn-check-selected').off().click(checkSelected);

	//chrome.runtime.sendMessage({document});
});
