chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        chrome.storage.session.get(["changes"], async (result) => {
            if (result.changes === true) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['/files/js/statistieken.js'],
                });
            }
        });
    }
});

chrome.runtime.onMessage.addListener(async (message, sender) => {
    if (message.action === "executeStatistieken") {
        chrome.scripting.executeScript({
            target: { tabId: message.tabId },
            files: ['/files/js/statistieken.js'],
        });
    } else if (message.action === "executeVolume") {
        chrome.scripting.executeScript({
            target: { tabId: message.tabId },
            files: ['/files/js/zoekvolumes.js'],
        });
    }
});