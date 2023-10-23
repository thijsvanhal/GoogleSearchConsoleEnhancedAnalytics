function addParametersToUrl(params) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var tab = tabs[0];
        var url = new URL(tab.url);
        url.searchParams.delete('start_date');
        url.searchParams.delete('end_date');
        url.searchParams.delete('compare_start_date');
        url.searchParams.delete('compare_end_date');
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
let firstDayOfPreviousYear = new Date(firstDayOfLastMonth);
firstDayOfPreviousYear.setFullYear(firstDayOfPreviousYear.getFullYear() - 1);
let lastDayOfPreviousYear = new Date(lastDayOfLastMonth);
lastDayOfPreviousYear.setFullYear(lastDayOfPreviousYear.getFullYear() - 1);

// Datum selecties
var beginDate = new Date(today.getFullYear(), today.getMonth() - 16, today.getDate());
var beginDateString = beginDate.toISOString().split("T")[0];
document.getElementById("startDate").setAttribute("min", beginDateString);

var yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
var yesterdayString = yesterday.toISOString().split("T")[0];
document.getElementById("endDate").setAttribute("max", yesterdayString);

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

function customSelection() {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    const timeDiff = endDate - startDate;
    const previousStartDate = new Date(startDate.getTime() - timeDiff - (1000 * 60 * 60 * 24));
    const previousEndDate = new Date(endDate.getTime() - timeDiff - (1000 * 60 * 60 * 24));
    const yearStartDate = new Date(startDate);
    yearStartDate.setFullYear(yearStartDate.getFullYear() - 1);
    const yearEndDate = new Date(endDate);
    yearEndDate.setFullYear(yearEndDate.getFullYear() - 1);
    const startDateFormat = formatDate(startDate);
    const endDateFormat = formatDate(endDate);
    const previousStartDateFormat = formatDate(previousStartDate);
    const previousEndDateFormat = formatDate(previousEndDate);
    const yearStartDateFormat = formatDate(yearStartDate);
    const yearEndDateFormat = formatDate(yearEndDate);
    if (document.getElementById('previous').checked == true) {
        addParametersToUrl({start_date: startDateFormat, end_date: endDateFormat, compare_start_date: previousStartDateFormat, compare_end_date: previousEndDateFormat});
    } else {
        addParametersToUrl({start_date: startDateFormat, end_date: endDateFormat, compare_start_date: yearStartDateFormat, compare_end_date: yearEndDateFormat});
    }
}

const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const compareButton = document.getElementById("compare");
compareButton.addEventListener("click", async() => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/popup.js'],
        func: customSelection(startDateInput, endDateInput),
    })
});

const changes = document.getElementById('changes-text');

changes.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.reload(tab.id);
    const listener = (tabId, changeInfo) => {
        if (tabId === tab.id && changeInfo.status === "complete") {
            chrome.tabs.onUpdated.removeListener(listener);
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['/statistieken.js'],
            });
        }
    };
    chrome.tabs.onUpdated.addListener(listener);
});


