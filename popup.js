function addParametersToUrl(params) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var tab = tabs[0];
        var url = new URL(tab.url);
        url.searchParams.set('start_date', params.start_date);
        url.searchParams.set('end_date', params.end_date);
        if (params.compare_start_date && params.compare_end_date) {
            url.searchParams.set('compare_start_date', params.compare_start_date);
            url.searchParams.set('compare_end_date', params.compare_end_date);
        }
        chrome.tabs.update(tab.id, {url: url.href});
    });
}
  
let lastMonth = document.getElementById("last-month-btn")
let lastMonthMoM = document.getElementById("last-month-compared-to-previous-month-btn")
let lastMonthYoY = document.getElementById("last-month-compared-to-last-year-btn")

let today = new Date();
let firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
let lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
let firstDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 2, 1);
let lastDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 0);
let firstDayOfPreviousYear = new Date(today.getFullYear() - 1, 3, 1);
let lastDayOfPreviousYear = new Date(today.getFullYear() - 1, 3, 30);

let startDate = formatDate(firstDayOfLastMonth);
let endDate = formatDate(lastDayOfLastMonth);
let startCompareDate = formatDate(firstDayOfPreviousMonth);
let endCompareDate = formatDate(lastDayOfPreviousMonth);
let startPreviousYearDate = formatDate(firstDayOfPreviousYear);
let endPreviousYearDate = formatDate(lastDayOfPreviousYear);

function formatDate(date) {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    return year + month + day;
}

lastMonth.addEventListener("click", async() => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/popup.js'],
        func: addParametersToUrl({start_date: startDate, end_date: endDate}),
    })
});

lastMonthMoM.addEventListener("click", async() => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/popup.js'],
        func: addParametersToUrl({start_date: startDate, end_date: endDate, compare_start_date: startCompareDate, compare_end_date: endCompareDate}),
    })
});

lastMonthYoY.addEventListener("click", async() => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/popup.js'],
        func: addParametersToUrl({start_date: startDate, end_date: endDate, compare_start_date: startPreviousYearDate, compare_end_date: endPreviousYearDate}),
    })
});