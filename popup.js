'use strict';

document.addEventListener('DOMContentLoaded', () => {
	chrome.runtime.sendMessage({document});

	chrome.tabs.executeScript({
		code: 'checkActiveElement();'
	});
});
