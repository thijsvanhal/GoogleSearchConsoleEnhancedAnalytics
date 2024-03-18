Variables();

function Variables() {
    start_date = undefined;
    end_date = undefined;
    compare_start_date = undefined;
    compare_end_date = undefined;
    getSessionData();
}

async function getSessionData() {
    const startDateSession = await chrome.storage.session.get(["startDate"]);
    const endDateSession = await chrome.storage.session.get(["endDate"]);
    const startCompareDateSession = await chrome.storage.session.get(["compareStartDate"]);
    const endCompareDateSession = await chrome.storage.session.get(["compareEndDate"]);

    start_date = startDateSession.startDate;
    end_date = endDateSession.endDate;
    compare_start_date = startCompareDateSession.compareStartDate;
    compare_end_date = endCompareDateSession.compareEndDate;
    addParametersToUrl(start_date, end_date, compare_start_date, compare_end_date);
}

function addParametersToUrl(start_date, end_date, compare_start_date, compare_end_date) {
    const url = new URL(window.location.href);

    const currentURL = window.location.href;
    if (currentURL.includes('/search-console/performance/search-analytics') || currentURL.includes('/search-console/performance/discover') || currentURL.includes('/search-console/performance/google-news')) {
        const start = url.searchParams.get('start_date');
        if (start === start_date) {
            return;
        } else {
            url.searchParams.delete('start_date');
            url.searchParams.delete('end_date');
            url.searchParams.delete('compare_start_date');
            url.searchParams.delete('compare_end_date');
            url.searchParams.set('start_date', start_date);
            url.searchParams.set('end_date', end_date);
            if (compare_start_date && compare_end_date) {
                url.searchParams.set('compare_start_date', compare_start_date);
                url.searchParams.set('compare_end_date', compare_end_date);
            }
            chrome.runtime.sendMessage({action: "updateUrl", url: url.href});
        }
    } 
}