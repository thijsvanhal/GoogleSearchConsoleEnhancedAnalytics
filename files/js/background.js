chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && new URL(tab.url).hostname === 'search.google.com') {
        chrome.storage.session.get(["changes"], async (result) => {
            if (result.changes === true) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['/files/js/statistieken.js'],
                });
            }
        });
        chrome.storage.session.get(["dates"], async (result) => {
            if (result.dates === true) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['/files/js/datum.js'],
                })
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
    } else if (message.action == "updateUrl") {
        updateTabUrl(sender.tab.id, message.url);
    }
});

function updateTabUrl(tabId, newUrl) {
    chrome.tabs.update(tabId, {url: newUrl});
}