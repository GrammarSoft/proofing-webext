'use strict';

function handler(request, sender, sendResponse) {
	if (!request.hasOwnProperty('a') || request.a === 'log') {
		console.log([request, sender, sendResponse]);
	}
	return false;
}

chrome.runtime.onMessage.addListener(handler);
