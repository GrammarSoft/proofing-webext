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
