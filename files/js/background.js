function setupListeners() {  
    chrome.permissions.contains({
        permissions: ['webNavigation'],
    }, (result) => {
        if (result) {
            const filter = {
                url: [
                    {
                        urlMatches: 'https://search.google.com/',
                    },
                ],
            };
            chrome.webNavigation.onCompleted.addListener(async (details) => {
                let tabId = details.tabId;
            
                chrome.storage.session.get(["changes"], async (result) => {
                    if (result.changes === true) {
                        chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            files: ['/files/js/statistieken.js'],
                        });
                        chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            files: ['/files/js/xlsx.js', '/files/js/button.js'],
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
                chrome.storage.local.get(["method"], async (result) => {
                    if (result.method === "exact") {
                        chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            files: ['/files/js/exact.js'],
                        })
                    }
                });
            }, filter);
            
            chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
                let tabId = details.tabId;
                chrome.storage.session.get(["changes"], async (result) => {
                    if (result.changes === true) {
                        chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            files: ['/files/js/statistieken.js'],
                        });
                        chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            files: ['/files/js/xlsx.js', '/files/js/button.js'],
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
                chrome.storage.local.get(["method"], async (result) => {
                    if (result.method === "exact") {
                        chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            files: ['/files/js/exact.js'],
                        })
                    }
                });
            }, filter);        
        }
    });
}

chrome.permissions.contains({
    permissions: ['webNavigation'],
}, (result) => {
    if (result) {
        setupListeners();
    }
});

chrome.runtime.onMessage.addListener(async (message, sender) => {
    if (message.action === "executeStatistieken") {
        chrome.scripting.executeScript({
            target: { tabId: message.tabId },
            files: ['/files/js/statistieken.js'],
        });
        chrome.scripting.executeScript({
            target: { tabId: message.tabId },
            files: ['/files/js/xlsx.js', '/files/js/button.js'],
        });
    } else if (message.action === "executeVolume") {
        chrome.scripting.executeScript({
            target: { tabId: message.tabId },
            files: ['/files/js/zoekvolumes.js'],
        });
        chrome.scripting.executeScript({
            target: { tabId: message.tabId },
            files: ['/files/js/xlsx.js', '/files/js/button.js'],
        });
    } else if (message.action == "updateUrl") {
        updateTabUrl(sender.tab.id, message.url);
    } else if (message.action == "updatePermissions") {
        setupListeners();
    }

});

function updateTabUrl(tabId, newUrl) {
    chrome.tabs.update(tabId, {url: newUrl});
}