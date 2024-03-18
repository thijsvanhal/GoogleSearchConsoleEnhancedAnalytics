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

    chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
    chrome.storage.session.set({ startDate: params.start_date });
    chrome.storage.session.set({ endDate: params.end_date });
    chrome.storage.session.set({ compareStartDate: params.compare_start_date });
    chrome.storage.session.set({ compareEndDate: params.compare_end_date });
    document.getElementById('keep-dates-alive').disabled = false;
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

//Datepicker
const startDate = new Date(currentDate);
let endDate = new Date(today);
const currentQuarter = Math.floor(today.getMonth() / 3);;

const dMaandStart = startDate.setDate(1);
const dMaandEnd = endDate.setDate(today.getDate() - 2);

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

const picker = new easepick.create({
    element: "#datepicker",
    css: [
        "/files/css/easypick.css",
        "files/css/popup.css"
    ],
    setup(picker) {
        picker.on('select', (e) => {
            console.log(e);
            startDateSelection = e.detail.start;
            endDateSelection = e.detail.end;
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
        },
        customLabels: ['This month', 'Last month', 'This quarter', 'Last quarter', 'This year']
    },
    plugins: [
        "RangePlugin",
        "LockPlugin",
        "PresetPlugin"
    ]
})

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
    const startDateFormat = formatDate(aMaandStart);
    const endDateFormat = formatDate(aMaandEnd);
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

function customSelection() {
    const startDate = new Date(startDateSelection);
    const endDate = new Date(endDateSelection);
    const startDateFormat = formatDate(startDate);
    const endDateFormat = formatDate(endDate);
    console.log(startDateFormat, endDateFormat);

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
        const previousStartDateFormat = formatDate(previousStartDate);
        const previousEndDateFormat = formatDate(previousEndDate);
        addParametersToUrl({start_date: startDateFormat, end_date: endDateFormat, compare_start_date: previousStartDateFormat, compare_end_date: previousEndDateFormat});
    } else {
        yearStartDate = getPreviousYear(startDate);
        yearEndDate = getPreviousYear(endDate);
        if (yearStartDate < beginDate) {
            warning_text.innerHTML = `Your comparison start date is before ${beginDateString} (max. start date in Google Search Console) , you will not see all your data.`;
        }
        const yearStartDateFormat = formatDate(yearStartDate);
        const yearEndDateFormat = formatDate(yearEndDate);
        addParametersToUrl({start_date: startDateFormat, end_date: endDateFormat, compare_start_date: yearStartDateFormat, compare_end_date: yearEndDateFormat});
    }
}

const compareButton = document.getElementById("compare");
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

// Update checkbox changes
const generatePercentChangesCheckbox = document.getElementById('keep-changes-alive');
chrome.storage.session.get(["changes"]).then((result) => {
    if (result.changes === true) {
        generatePercentChangesCheckbox.checked = true;
    }
});

generatePercentChangesCheckbox.addEventListener('click', function () {
    if (generatePercentChangesCheckbox.checked) {
        chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
        chrome.storage.session.set({ changes: true });
        generatePercentChangesCheckbox.checked = true;
    } else {
        chrome.storage.session.remove(["changes"]);
    }
});

// Update checkbox dates
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
        chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });
        chrome.storage.session.set({ dates: true });
        generateDatesCheckbox.checked = true;
    } else {
        chrome.storage.session.remove(["dates"]);
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
    const loginData = await chrome.storage.local.get(["login"]);
    const passwordData = await chrome.storage.local.get(["password"]);
    const locationData = await chrome.storage.local.get(["location"]);
    const languageData = await chrome.storage.local.get(["language"]);

    const loginSessionData = await chrome.storage.session.get(["login"]);
    const passwordSessionData = await chrome.storage.session.get(["password"]);
    const locationSessionData = await chrome.storage.session.get(["location"]);
    const languageSessionData = await chrome.storage.session.get(["language"]);

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
}

getCredentials();

const loginLink = document.getElementById("loginLink");
const loginButton = document.getElementById("loginButton");
const deleteButton = document.getElementById("deleteButton");
const rememberme = document.getElementById("rememberMe");
const logoutButtonContainer = document.getElementById("logoutButtonContainer");
const backButton = document.getElementById("backButton");

backButton.onclick = function () {
    instellingen.style = "display:none";
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