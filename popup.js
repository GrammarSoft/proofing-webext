'use strict';

document.addEventListener('DOMContentLoaded', () => {
	chrome.tabs.executeScript({
		file: 'inject.js',
	});
});
