function addParametersToUrl(params) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var tab = tabs[0];
        var url = new URL(tab.url);
        url.searchParams.delete('start_date');
        url.searchParams.delete('end_date');
        url.searchParams.delete('compare_start_date');
        url.searchParams.delete('compare_end_date');
        url.searchParams.delete('compare_date');
        url.searchParams.delete('num_of_months');
        url.searchParams.set('start_date', params.start_date);
        url.searchParams.set('end_date', params.end_date);
        if (params.compare_start_date && params.compare_end_date) {
            url.searchParams.set('compare_start_date', params.compare_start_date);
            url.searchParams.set('compare_end_date', params.compare_end_date);
        }
        chrome.tabs.update(tab.id, {url: url.href});
    });

    chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
    chrome.storage.session.set({ startDate: params.start_date });
    chrome.storage.session.set({ endDate: params.end_date });
    if (params.compare_start_date) {
        chrome.storage.session.set({ compareStartDate: params.compare_start_date });
        chrome.storage.session.set({ compareEndDate: params.compare_end_date });
    } else {
        chrome.storage.session.remove(["compareStartDate"]);
        chrome.storage.session.remove(["compareEndDate"]);
    }
    document.getElementById('keep-dates-alive').disabled = false;
    keuze = '';
}

// Standaard Datum selecties
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const selecteerPeriode = document.getElementById('selecteer-periode');

let today = new Date();
const beginDate = new Date(today.getFullYear(), today.getMonth() - 16, today.getDate());
const beginDateString = beginDate.toISOString().split("T")[0];

let yesterday = new Date(today);
yesterday.setDate(today.getDate() - 2);
const yesterdayString = yesterday.toISOString().split("T")[0];

const currentDate = new Date();
currentDate.setDate(currentDate.getDate() - 1);

const sevenStartDate = new Date();
sevenStartDate.setDate(currentDate.getDate() - 7);

const twentyEightStartDate = new Date();
twentyEightStartDate.setDate(currentDate.getDate() - 28);

const threeMonthStartDate = new Date(currentDate);
threeMonthStartDate.setMonth(currentDate.getMonth() - 3);

const sixMonthStartDate = new Date(currentDate);
sixMonthStartDate.setMonth(currentDate.getMonth() - 6);

const twelveMonthStartDate = new Date(currentDate);
twelveMonthStartDate.setFullYear(currentDate.getFullYear() - 1);

const sixTeenMonthStartDate = new Date(currentDate); 
sixTeenMonthStartDate.setFullYear(currentDate.getFullYear() - 1, currentDate.getMonth() - 4);


//Datepicker
const startDate = new Date(currentDate);
let endDate = new Date(today);
const currentQuarter = Math.floor(today.getMonth() / 3);;

const dMaandStart = startDate.setDate(1);
const dMaandEnd = endDate.setDate(today.getDate() - 2);

endDate = new Date(today);
const aMaandStart = startDate.setMonth(today.getMonth() - 1, 1);
const aMaandEnd = endDate.setDate(0);

endDate = new Date(today);
const dKwartaalStart = startDate.setMonth(currentQuarter * 3, 1);
const dKwartaalEnd = endDate.setDate(today.getDate() - 2);

endDate = new Date(today);
const lastQuarter = currentQuarter - 1;
let lKwartaalStart;
let lKwartaalEnd;
if (lastQuarter === -1) {
    lKwartaalStart = startDate.setFullYear(today.getFullYear() - 1, 9, 1);
    lKwartaalEnd = endDate.setFullYear(today.getFullYear() - 1, 11, 31);
} else {
    lKwartaalStart = startDate.setFullYear(today.getFullYear(), lastQuarter * 3, 1);
    lKwartaalEnd = endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 3, 0);
}

endDate = new Date(today);
let dJaarStart = startDate.setMonth(0, 1);
let dJaarEnd = endDate.setDate(today.getDate() - 2);

let startDateSelection;
let endDateSelection;
let comparisonStartDateSelection;
let comparisonEndDateSelection;

const picker = new easepick.create({
    element: "#datepicker",
    css: [
        "/files/css/easypick.css",
        "files/css/popup.css"
    ],
    setup(picker) {
        picker.on('select', (e) => {
            startDateSelection = e.detail.start;
            endDateSelection = e.detail.end;
        });

        picker.on('view', () => {
            const presetContainer = picker.ui.container.querySelector('.preset-plugin-container');
            if (presetContainer) {
                const presetButtons = Array.from(picker.ui.container.querySelectorAll('.preset-button.unit'));

                const column1 = document.createElement('div');
                const column2 = document.createElement('div');

                presetButtons.slice(0, 5).forEach(button => column1.appendChild(button));
                presetButtons.slice(5).forEach(button => column2.appendChild(button));

                column1.style.display = 'flex';
                column1.style.flexDirection = 'column';
                column1.style.marginRight = '10px';

                column2.style.display = 'flex';
                column2.style.flexDirection = 'column';

                presetContainer.style.display = 'flex';
                presetContainer.style.flexDirection = 'row';
                presetContainer.style.width = '222px';

                presetContainer.innerHTML = '';
                presetContainer.appendChild(column1);
                presetContainer.appendChild(column2);
            }
        });
    },
    zIndex: 10,
    LockPlugin: {
        presets: false,
        minDate: beginDateString,
        maxDate: yesterdayString
    },
    PresetPlugin: {
        position: "right",
        customPreset: {
            'This month': [new Date(dMaandStart), new Date(dMaandEnd)],
            'Last month': [new Date(aMaandStart), new Date(aMaandEnd)],
            'This quarter': [new Date(dKwartaalStart), new Date(dKwartaalEnd)],
            'Last quarter': [new Date(lKwartaalStart), new Date(lKwartaalEnd)],
            'This year': [new Date(dJaarStart), new Date(dJaarEnd)],
            'Last 7 days': [new Date(sevenStartDate), new Date(yesterday)],
            'Last 28 days': [new Date(twentyEightStartDate), new Date(yesterday)],
            'Last 3 months': [new Date(threeMonthStartDate), new Date(yesterday)],
            'Last 6 months': [new Date(sixMonthStartDate), new Date(yesterday)],
            'Last 12 months': [new Date(twelveMonthStartDate), new Date(yesterday)],
            'Last 16 months': [new Date(sixTeenMonthStartDate), new Date(yesterday)],
        },
        customLabels: ['This month', 'Last month', 'This quarter', 'Last quarter', 'This year', 'Last 7 days', 'Last 28 days', 'Last 3 months', 'Last 6 months', 'Last 12 months', 'Last 16 months']
    },
    AmpPlugin: {
        dropdown: {
            months: true,
            years: true,
            minYear: 2022
        },
        darkMode: false
    },
    plugins: [
        "RangePlugin",
        "LockPlugin",
        "PresetPlugin",
        "AmpPlugin"
    ]
})

// Event listeners
const customComparisonElement = document.getElementById("datepickercomparison");
const compareButton = document.getElementById("compare"); 
const patternCheckbox = document.querySelector(".pattern-checkbox");

const customSelectionElement = document.getElementById("custom");
customSelectionElement.addEventListener("click", function() {
    if (customSelectionElement.checked == true) {
        customComparisonElement.removeAttribute("disabled");
        compareButton.innerText = 'Compare date range';
        patternCheckbox.style.display = 'none';
    } else {
        customComparisonElement.setAttribute("disabled", "disabled");
    }
});

const previousSelectionElement = document.getElementById("previous");
previousSelectionElement.addEventListener("click", function() {
    if (previousSelectionElement.checked == true) {
        customComparisonElement.setAttribute("disabled", "disabled");
        compareButton.innerText = 'Compare date range';
        patternCheckbox.style.display = 'inline-block';
    } else {
        patternCheckbox.style.display = 'none';
    }
});

const yearSelectionElement = document.getElementById("year");
yearSelectionElement.addEventListener("click", function() {
    if (yearSelectionElement.checked == true) {
        customComparisonElement.setAttribute("disabled", "disabled");
        compareButton.innerText = 'Compare date range';
        patternCheckbox.style.display = 'inline-block';
    } else {
        patternCheckbox.style.display = 'none';
    }
});

const pickerComparison = new easepick.create({
    element: "#datepickercomparison",
    css: [
        "/files/css/easypick.css",
        "files/css/popup.css"
    ],
    setup(picker) {
        picker.on('select', (e) => {
            comparisonStartDateSelection = e.detail.start;
            comparisonEndDateSelection = e.detail.end;
        });
    },
    zIndex: 10,
    LockPlugin: {
        presets: false,
        minDate: beginDateString,
        maxDate: yesterdayString
    },
    AmpPlugin: {
        dropdown: {
            months: true,
            years: true,
            minYear: 2022
        },
        darkMode: false
    },
    plugins: [
        "RangePlugin",
        "LockPlugin",
        "AmpPlugin"
    ]
})
pickerComparison.ui.container.style.marginLeft = "-80px";

let keuze;
const root = document.querySelector('.easepick-wrapper')
const buttons = root.shadowRoot.querySelectorAll('.preset-plugin-container>button');
buttons.forEach(button => {
    button.addEventListener('click', function() {
        keuze = button.innerText;
    });
});

// Snelle selecties
const lastMonth = document.getElementById("last-month-btn");
const lastMonthMoM = document.getElementById("last-month-compared-to-previous-month-btn");
const lastMonthYoY = document.getElementById("last-month-compared-to-last-year-btn");

lastMonth.addEventListener("click", function() {
    const startDateFormat = formatDate(new Date(aMaandStart));
    const endDateFormat = formatDate(new Date(aMaandEnd));
    addParametersToUrl({start_date: startDateFormat, end_date: endDateFormat});
});

lastMonthMoM.addEventListener("click", function() {
    startDateSelection = aMaandStart;
    endDateSelection = aMaandEnd;
    keuze = 'Last month';
    document.getElementById('previous').checked = true;
    customSelection();
});

lastMonthYoY.addEventListener("click", function() {
    startDateSelection = aMaandStart;
    endDateSelection = aMaandEnd;
    keuze = 'Last month';
    document.getElementById('year').checked = true;
    customSelection();
});

const warning_text = document.getElementById("warning");

// Format date for form
function formatDateForm(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Format date for GSC
function formatDate(date) {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    return year + month + day;
}

// Add these helper functions before customSelection()
function getPatternMatchedDateYear(currentDate) {
    // Existing function renamed - matches same day pattern from previous year
    const dayOfWeek = currentDate.getDay();
    
    // Create date for previous year, same month
    const prevYear = new Date(currentDate);
    prevYear.setFullYear(currentDate.getFullYear() - 1);
    
    // Count total occurrences of this weekday in both months
    function countWeekdaysInMonth(date, targetDay) {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        let count = Math.floor((lastDay.getDate() - (firstDay.getDay() > targetDay ? 
            7 - (firstDay.getDay() - targetDay) : 
            targetDay - firstDay.getDay())) / 7) + 1;
        return count;
    }
    
    const prevWeekdayCount = countWeekdaysInMonth(prevYear, dayOfWeek);
    
    // Find which occurrence of the weekday we're on in the current month
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    let weekNumber = Math.ceil((currentDate.getDate() - 
        (dayOfWeek - firstDayOfMonth.getDay() + 7) % 7) / 7);
    
    // Adjust if we're in the last week and months have different number of occurrences
    if (weekNumber > prevWeekdayCount) {
        weekNumber = prevWeekdayCount;
    }
    
    // Calculate the matching date in previous year
    const firstDayPrevYear = new Date(prevYear.getFullYear(), prevYear.getMonth(), 1);
    let matchingDate = 1 + ((dayOfWeek - firstDayPrevYear.getDay() + 7) % 7);
    matchingDate += (weekNumber - 1) * 7;
    
    prevYear.setDate(matchingDate);
    return prevYear;
}

function getPatternMatchedDatePrevious(currentDate, startDate, endDate) {
    // Matches same day pattern from previous period
    const dayOfWeek = currentDate.getDay();
    const periodLength = endDate - startDate;
    
    // Create date for previous period
    const prevPeriod = new Date(currentDate.getTime() - periodLength);
    
    // Find the same weekday in the previous period
    while (prevPeriod.getDay() !== dayOfWeek) {
        prevPeriod.setDate(prevPeriod.getDate() + 1);
    }
    
    return prevPeriod;
}

// Update the customSelection function's pattern matching section
function customSelection() {
    const startDate = new Date(startDateSelection);
    const endDate = new Date(endDateSelection);
    const startDateFormat = formatDate(startDate);
    const endDateFormat = formatDate(endDate);
    const patternChecked = document.getElementById('pattern').checked;

    let previousStartDate, previousEndDate, yearStartDate, yearEndDate;

    function getPreviousMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
    }

    function getPreviousYear(date) {
        return new Date(date.getFullYear() - 1, date.getMonth(), date.getDate());
    }

    function getPreviousQuarter(date) {
        let month = date.getMonth();
        let quarterMonth = (month - 2 + 12) % 12;
        let year = date.getFullYear();
        if (quarterMonth === 10 || quarterMonth === 11 || quarterMonth === 12) {
            year -= 1;
        }
        return new Date(year, quarterMonth - 1, date.getDate());
    }

    if (document.getElementById('previous').checked == true) {
        switch (keuze) {
            case 'This month':
                if ((today.getDate() === 1 || today.getDate() === 2)) {
                    warning_text.innerHTML = "This extension sets the end date 2 days in the past to be sure Google Search Console shows data. This comparison is not possible, try again the third of the month.";
                    return;
                };
                previousStartDate = getPreviousMonth(startDate);
                previousEndDate = getPreviousMonth(endDate);
                break;
            case 'Last month':
                previousStartDate = getPreviousMonth(startDate);
                previousEndDate = new Date(startDate.getFullYear(), startDate.getMonth(), 0);
                break;
            case 'This quarter':
                previousStartDate = getPreviousQuarter(startDate);
                previousEndDate = getPreviousQuarter(endDate);
                break;
            case 'Last quarter':
                previousStartDate = getPreviousQuarter(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
                previousEndDate = new Date(startDate.getFullYear(), startDate.getMonth(), 0);
                break;
            case 'This year':
                previousStartDate = new Date(startDate.getFullYear() - 1, startDate.getMonth(), startDate.getDate());
                previousEndDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());
                break;
            default:
                const timeDiff = endDate - startDate;
                previousStartDate = new Date(startDate.getTime() - timeDiff - (1000 * 60 * 60 * 24));
                previousEndDate = new Date(endDate.getTime() - timeDiff - (1000 * 60 * 60 * 24));
                break;
        }
        if (previousStartDate < beginDate) {
            warning_text.innerHTML = `Your comparison start date is before ${beginDateString} (max. start date in Google Search Console) , you will not see all your data.`;
        }
        
        if (patternChecked) {
            // Use previous period pattern matching
            previousStartDate = getPatternMatchedDatePrevious(startDate, startDate, endDate);
            previousEndDate = getPatternMatchedDatePrevious(endDate, startDate, endDate);

            if (previousEndDate.getTime() >= startDate.getTime()) {
                previousStartDate.setDate(previousStartDate.getDate() - 7);
                previousEndDate.setDate(previousEndDate.getDate() - 7);
            }
        }
        
        const previousStartDateFormat = formatDate(previousStartDate);
        const previousEndDateFormat = formatDate(previousEndDate);
        addParametersToUrl({start_date: startDateFormat, end_date: endDateFormat, compare_start_date: previousStartDateFormat, compare_end_date: previousEndDateFormat});
    } else if (document.getElementById('year').checked == true) {
        yearStartDate = getPreviousYear(startDate);
        yearEndDate = getPreviousYear(endDate);
        if (yearStartDate < beginDate) {
            warning_text.innerHTML = `Your comparison start date is before ${beginDateString} (max. start date in Google Search Console) , you will not see all your data.`;
        } else if (keuze === 'This month' && today.getDate() === 1 || keuze === 'This month' && today.getDate() === 2) {
            warning_text.innerHTML = "This extension sets the end date 2 days in the past to be sure Google Search Console shows data. This comparison is not possible, try again the third of the month.";
            return;
        }
        
        if (patternChecked) {
            // Use year pattern matching
            yearStartDate = getPatternMatchedDateYear(startDate);
            yearEndDate = getPatternMatchedDateYear(endDate);
        }
        
        const yearStartDateFormat = formatDate(yearStartDate);
        const yearEndDateFormat = formatDate(yearEndDate);
        addParametersToUrl({start_date: startDateFormat, end_date: endDateFormat, compare_start_date: yearStartDateFormat, compare_end_date: yearEndDateFormat});
    } else if (document.getElementById('custom').checked == true) {
        const previousstartDate = new Date(comparisonStartDateSelection);
        const previousendDate = new Date(comparisonEndDateSelection);
        const previousStartDateFormat = formatDate(previousstartDate);
        const previousEndDateFormat = formatDate(previousendDate);
        addParametersToUrl({start_date: startDateFormat, end_date: endDateFormat, compare_start_date: previousStartDateFormat, compare_end_date: previousEndDateFormat});
        patternCheckbox.style.display = 'none';
    } else {
        addParametersToUrl({start_date: startDateFormat, end_date: endDateFormat})
    }
}

compareButton.addEventListener("click", async() => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/files/js/popup.js'],
        func: customSelection(),
    })
});

// Handle changes click
const changes = document.getElementById('generate-changes');
changes.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.runtime.sendMessage({ action: "executeStatistieken", tabId: tab.id });
});

// Keep date selection in session
const generateDatesCheckbox = document.getElementById('keep-dates-alive');
chrome.storage.session.get(["dates"]).then(async (result) => {
    if (result.dates === true) {
        const startDateString = await chrome.storage.session.get("startDate");
        const endDateString = await chrome.storage.session.get("endDate");

        const startDateYear = startDateString.startDate.slice(0, 4);
        const startDateMonth = startDateString.startDate.slice(4, 6);
        const startDateDay = startDateString.startDate.slice(6, 8);

        const endDateYear = endDateString.endDate.slice(0, 4);
        const endDateMonth = endDateString.endDate.slice(4, 6);
        const endDateDay = endDateString.endDate.slice(6, 8);

        document.getElementById('datepicker').value = `${startDateYear}-${startDateMonth}-${startDateDay} - ${endDateYear}-${endDateMonth}-${endDateDay}`;
        generateDatesCheckbox.checked = true;
        generateDatesCheckbox.disabled = false;
    }
});

generateDatesCheckbox.addEventListener('click', function () {
    if (generateDatesCheckbox.checked) {
        checkPermissions('webNavigation').then((result) => {
            if (result === 'yes') {
                chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
                chrome.storage.session.set({ dates: true });
                chrome.tabs.query({ active: true, currentWindow: true }).then((tab) => {
                    chrome.runtime.sendMessage({ action: "updatePermissions", tabId: tab.id });
                });
            } else {
                chrome.permissions.request({
                    permissions: ['webNavigation']
                }, (granted) => {
                    if (granted) {
                        chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
                        chrome.storage.session.set({ dates: true });
                        chrome.tabs.query({ active: true, currentWindow: true }).then((tab) => {
                            chrome.runtime.sendMessage({ action: "updatePermissions", tabId: tab.id });
                        });
                    } else {
                        generateDatesCheckbox.checked = false;
                    }
                });
            }
        });
    } else {
        chrome.storage.session.remove(["dates"]);
    }
});

// Show exact metrics above the chart
const showExactMetricsCheckbox = document.getElementById("show-exact-metrics");

chrome.storage.local.get(["method"]).then((result) => {
    if (result.method === "exact") {
        showExactMetricsCheckbox.checked = true;
    }
});

showExactMetricsCheckbox.addEventListener('click', function () {
    if (showExactMetricsCheckbox.checked) {
        checkPermissions('webNavigation').then((result) => {
            if (result === 'yes') {
                chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
                chrome.storage.local.set({ method: "exact" });
                chrome.tabs.query({ active: true, currentWindow: true }).then((tab) => {
                    chrome.runtime.sendMessage({ action: "updatePermissions", tabId: tab.id });
                });
            } else {
                chrome.permissions.request({
                    permissions: ['webNavigation']
                }, (granted) => {
                    if (granted) {
                        chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
                        chrome.storage.local.set({ method: "exact" });
                        chrome.tabs.query({ active: true, currentWindow: true }).then((tab) => {
                            chrome.runtime.sendMessage({ action: "updatePermissions", tabId: tab.id });
                        });
                    }
                });
            }
        });
    } else {
        chrome.storage.local.remove(["method"]);
    }
});

// Generate % changes in session
const generatePercentChangesCheckbox = document.getElementById('keep-changes-alive-session');

chrome.storage.session.get(["changes"]).then((result) => {
    if (result.changes === true) {
        generatePercentChangesCheckbox.checked = true;
    }
});

generatePercentChangesCheckbox.addEventListener('click', function () {
    if (generatePercentChangesCheckbox.checked) {
        checkPermissions('webNavigation').then((result) => {
            if (result === 'yes') {
                chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
                chrome.storage.session.set({ changes: true });
                chrome.tabs.query({ active: true, currentWindow: true }).then((tab) => {
                    chrome.runtime.sendMessage({ action: "updatePermissions", tabId: tab.id });
                });
            } else {
                chrome.permissions.request({
                    permissions: ['webNavigation']
                }, (granted) => {
                    if (granted) {
                        chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
                        chrome.storage.session.set({ changes: true });
                        chrome.tabs.query({ active: true, currentWindow: true }).then((tab) => {
                            chrome.runtime.sendMessage({ action: "updatePermissions", tabId: tab.id });
                        });
                    } else {
                        generatePercentChangesCheckbox.checked = false;
                    }
                });
            }
        });
    } else {
        chrome.storage.session.remove(["changes"]);
    }
});

// Generate % changes in session
const generatePercentChangesPermanentCheckbox = document.getElementById('keep-changes-alive-permanent');

chrome.storage.local.get(["changes"]).then((result) => {
    if (result.changes === true) {
        generatePercentChangesPermanentCheckbox.checked = true;
    }
});

generatePercentChangesPermanentCheckbox.addEventListener('click', function () {
    if (generatePercentChangesPermanentCheckbox.checked) {
        checkPermissions('webNavigation').then((result) => {
            if (result === 'yes') {
                chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
                chrome.storage.local.set({ changes: true });
                chrome.tabs.query({ active: true, currentWindow: true }).then((tab) => {
                    chrome.runtime.sendMessage({ action: "updatePermissions", tabId: tab.id });
                });
            } else {
                chrome.permissions.request({
                    permissions: ['webNavigation']
                }, (granted) => {
                    if (granted) {
                        chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
                        chrome.storage.local.set({ changes: true });
                        chrome.tabs.query({ active: true, currentWindow: true }).then((tab) => {
                            chrome.runtime.sendMessage({ action: "updatePermissions", tabId: tab.id });
                        });
                    } else {
                        generatePercentChangesPermanentCheckbox.checked = false;
                    }
                });
            }
        });
    } else {
        chrome.storage.local.remove(["changes"]);
    }
});

// Login met DataForSEO
let login;
let login_local;
let password;
let country;
let language;
let instellingen = document.getElementById("instellingen");

async function getCredentials() {
    const [loginData, passwordData, locationData, languageData] = await Promise.all([
        chrome.storage.local.get(["login"]),
        chrome.storage.local.get(["password"]),
        chrome.storage.local.get(["location"]),
        chrome.storage.local.get(["language"]),
    ]);

    const [loginSessionData, passwordSessionData, locationSessionData, languageSessionData] = await Promise.all([
        chrome.storage.session.get(["login"]),
        chrome.storage.session.get(["password"]),
        chrome.storage.session.get(["location"]),
        chrome.storage.session.get(["language"]),
    ]);
    if (loginData.login) {
        login = loginData.login;
        login_local = true;
        password = passwordData.password;
        country = locationData.location;
        language = languageData.language;
    } else if (loginSessionData.login) {
        login = loginSessionData.login;
        password = passwordSessionData.password;
        if (locationSessionData.location) {
            country = locationSessionData.location;
            language = languageSessionData.language;
        }
    } 
    fetchLanguageData();
    fetchLocationData();
};

getCredentials();

const loginLink = document.getElementById("loginLink");
const loginButton = document.getElementById("loginButton");
const deleteButton = document.getElementById("deleteButton");
const rememberme = document.getElementById("rememberMe");
const logoutButtonContainer = document.getElementById("logoutButtonContainer");
const backButton = document.getElementById("backButton");

backButton.onclick = function () {
    instellingen.style = "display:none";
    let percentage_value = document.getElementById("exact").checked;
    if (percentage_value === true) {
        checkPermissions('webNavigation').then((result) => {
            if (result === 'yes') {
                chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
                chrome.storage.local.set({ method: "exact" });
                chrome.tabs.query({ active: true, currentWindow: true }).then((tab) => {
                    chrome.runtime.sendMessage({ action: "updatePermissions", tabId: tab.id });
                });
            } else {
                chrome.permissions.request({
                    permissions: ['webNavigation']
                }, (granted) => {
                    if (granted) {
                        chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
                        chrome.storage.local.set({ method: "exact" });
                        chrome.tabs.query({ active: true, currentWindow: true }).then((tab) => {
                            chrome.runtime.sendMessage({ action: "updatePermissions", tabId: tab.id });
                        });
                    } else {
                        document.getElementById("rounded").checked = true;
                    }
                });
            }
        });
    } else {
        chrome.storage.local.remove(["method"]);
    }
};

loginLink.onclick = function () {
    instellingen.style = "";
    if (login) {
        document.getElementById("inputEmail").value = login;
        document.getElementById("inputAPI").value = password;
        document.getElementById("search-location").value = country;
        document.getElementById("search-language").value = language;
        if (login_local === true) {
            rememberme.checked = true;
        }
        deleteButton.style.display = 'block';
    } else {
        deleteButton.style.display = 'none';
    }
};

loginButton.onclick = function() {
    let login_value = document.getElementById("inputEmail").value;
    let password_value = document.getElementById("inputAPI").value;
    let location_value = document.getElementById("search-location").value;
    let language_value = document.getElementById("search-language").value;

    if (rememberme.checked) {
        chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
        chrome.storage.local.set({ login: login_value });
        chrome.storage.local.set({ password: password_value });
        chrome.storage.local.set({ location: location_value });
        chrome.storage.local.set({ language: language_value });
    } else {
        chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
        chrome.storage.session.set({ login: login_value });
        chrome.storage.session.set({ password: password_value });
        chrome.storage.session.set({ location: location_value });
        chrome.storage.session.set({ language: language_value });
    }
    login = login_value;
    password = password_value;
    country = location_value;
    language = language_value;
    instellingen.style = "display:none";
};

deleteButton.onclick = function() {
    chrome.storage.local.remove(["login","password","location","language"]);
    chrome.storage.session.remove(["login","password","location","language"]);
    login = '';
    password = '';
    country = '';
    language = '';
    rememberme.checked = false;
    document.getElementById("inputEmail").value = '';
    document.getElementById("inputAPI").value = '';
    document.getElementById("search-location").value = '';
    document.getElementById("search-language").value = '';
    instellingen.style = "display:none";
};

// Language & location
let typingTimer;
const Interval = 1000;
document.getElementById("search-location").addEventListener("input", function() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function() {
        fetchLocationData();
    }, Interval);
});

async function fetchLocationData() {
    const searchInput = document.getElementById("search-location").value;
    const locationDropdown = document.getElementById('location-dropdown');
    const OptionsElement = document.getElementById('location-options');
    if(searchInput !== '') {
        OptionsElement.innerHTML = '';
        const locationResponse = await fetch ('/files/locations.json');
        const locationData = await locationResponse.json();
        const desiredCountries = [searchInput];
        const filteredLocationEntries = locationData.filter(location => {
            return desiredCountries.some(country => location.location_name.toLowerCase().includes(country.toLowerCase()));
        });

        const locationOptions = filteredLocationEntries.map(location => location.location_name);
        createCustomDropdown(locationDropdown, 'location-options', 'search-location', locationOptions);
    } else {
        OptionsElement.innerHTML = '';
        const locationOptions = [];
        createCustomDropdown(locationDropdown, 'location-options', 'search-location', locationOptions);
    }   
    
}

async function fetchLanguageData() {
    const languageResponse = await fetch("/files/languages.json");
    const languageData = await languageResponse.json();
    const languageOptions = languageData.map(language => language.language_name);

    const languageDropdown = document.getElementById('language-dropdown');
    createCustomDropdown(languageDropdown, 'language-options', 'search-language', languageOptions);
}

document.addEventListener('click', (event) => {
    if (!event.target.closest('.custom-dropdown')) {
        closeOptions();
    }
});

function closeOptions () {
    const dropdowns = document.querySelectorAll('.custom-dropdown .dropdown-options');
    dropdowns.forEach((dropdown) => {
        dropdown.classList.remove('open');
    });
}

function createCustomDropdown(dropdown, optionsId, searchInputId, data) {
    const dropdownOptions = document.getElementById(optionsId);
    const searchInput = document.getElementById(searchInputId);
  
    data.forEach(optionText => {
        const option = document.createElement('li');
        option.textContent = optionText;
        option.dataset.value = optionText;
        dropdownOptions.appendChild(option);
    
        option.addEventListener('click', () => {
            document.querySelector(`#${dropdown.id} input`).value = optionText;
            closeOptions();
        });
    });
  
    // Show/hide dropdown on input focus
    searchInput.addEventListener('focus', () => {
        document.getElementById(searchInputId).value = '';
        const options = document.getElementById(optionsId);
        options.classList.add('open');
        filterOptions(optionsId, '')
    });
  
    searchInput.addEventListener('input', () => {
      filterOptions(optionsId, searchInput.value.toLowerCase());
    });
}
  
function filterOptions(optionsId, filter) {
    const options = document.querySelectorAll(`#${optionsId} li[data-value]`);
    options.forEach(option => {
      const optionText = option.dataset.value.toLowerCase();
      if (optionText.includes(filter)) {
        option.style.display = 'block';
      } else {
        option.style.display = 'none';
      }
    });
}

// Search volumes
const volumesButton = document.getElementById("generate-search-volumes");
volumesButton.addEventListener("click", async() => {
    if (!login || !country) {
        loginLink.onclick();
        return;
    }
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.runtime.sendMessage({ action: "executeVolume", tabId: tab.id });
});

function checkPermissions(permissions) {
    return new Promise((resolve) => {
        chrome.permissions.contains({ permissions: [permissions] }, (result) => {
            if (result) {
                resolve("yes");
            } else {
                resolve("no");
            }
        });
    });
}