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
                        }, () => {
                            chrome.tabs.sendMessage(tabId, { backgroundMethod: 'comparison' });
                        });
                    }
                });
                chrome.storage.local.get(["changes"], async (result) => {
                    if (result.changes === true) {
                        chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            files: ['/files/js/statistieken.js'],
                        });
                        chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            files: ['/files/js/xlsx.js', '/files/js/button.js'],
                        }, () => {
                            chrome.tabs.sendMessage(tabId, { backgroundMethod: 'comparison' });
                        });
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

                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['/files/js/dateSelections.js']
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
                        }, () => {
                            chrome.tabs.sendMessage(tabId, { backgroundMethod: 'comparison' });
                        });
                    }
                });
                chrome.storage.local.get(["changes"], async (result) => {
                    if (result.changes === true) {
                        chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            files: ['/files/js/statistieken.js'],
                        });
                        chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            files: ['/files/js/xlsx.js', '/files/js/button.js'],
                        }, () => {
                            chrome.tabs.sendMessage(tabId, { backgroundMethod: 'comparison' });
                        });
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

                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['/files/js/dateSelections.js']
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
        }, () => {
            chrome.tabs.sendMessage(message.tabId, { backgroundMethod: 'button' });
        });
    } else if (message.action === "executeVolume") {
        chrome.scripting.executeScript({
            target: { tabId: message.tabId },
            files: ['/files/js/zoekvolumes.js'],
        });
        chrome.scripting.executeScript({
            target: { tabId: message.tabId },
            files: ['/files/js/xlsx.js', '/files/js/button.js'],
        }, () => {
            chrome.tabs.sendMessage(message.tabId, { backgroundMethod: 'button' });
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

// Handle date selection updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateDates") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var tab = tabs[0];
            var url = new URL(tab.url);
            url.searchParams.delete('start_date');
            url.searchParams.delete('end_date');
            url.searchParams.delete('compare_start_date');
            url.searchParams.delete('compare_end_date');
            url.searchParams.delete('compare_date');
            url.searchParams.delete('num_of_months');
            url.searchParams.set('start_date', request.data.start_date);
            url.searchParams.set('end_date', request.data.end_date);
            chrome.tabs.update(tab.id, {url: url.href});
        });

        chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
        chrome.storage.session.set({ startDate: request.data.start_date });
        chrome.storage.session.set({ endDate: request.data.end_date });
        chrome.storage.session.remove(["compareStartDate"]);
        chrome.storage.session.remove(["compareEndDate"]);
    }
});