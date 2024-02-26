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

// Standaard Datum selecties
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const selecteerPeriode = document.getElementById('selecteer-periode');

let today = new Date();
const beginDate = new Date(today.getFullYear(), today.getMonth() - 16, today.getDate());
const beginDateString = beginDate.toISOString().split("T")[0];
startDateInput.setAttribute("min", beginDateString);
endDateInput.setAttribute("min", beginDateString);

let yesterday = new Date(today);
yesterday.setDate(today.getDate() - 2);
const yesterdayString = yesterday.toISOString().split("T")[0];
startDateInput.setAttribute("max", yesterdayString);
endDateInput.setAttribute("max", yesterdayString);

const currentDate = new Date();
currentDate.setDate(currentDate.getDate() - 1);

// Snelle selecties
const lastMonth = document.getElementById("last-month-btn");
const lastMonthMoM = document.getElementById("last-month-compared-to-previous-month-btn");
const lastMonthYoY = document.getElementById("last-month-compared-to-last-year-btn");

lastMonth.addEventListener("click", function() {
    const startDate = new Date();
    startDate.setMonth(today.getMonth() - 1, 1);
    const endDate = new Date();
    endDate.setDate(0);
    const startDateFormat = formatDate(startDate);
    const endDateFormat = formatDate(endDate);
    addParametersToUrl({start_date: startDateFormat, end_date: endDateFormat});
});

lastMonthMoM.addEventListener("click", function() {
    selecteerPeriode.value = 'a-maand';
    document.getElementById('previous').checked = true;
    handleDate();
    customSelection();
});

lastMonthYoY.addEventListener("click", function() {
    selecteerPeriode.value = 'a-maand';
    document.getElementById('year').checked = true;
    handleDate();
    customSelection();
});

// Custom selecties
selecteerPeriode.addEventListener('change', function () {
    handleDate();
});

const warning_text = document.getElementById("warning");

function handleDate() {
    const selectedValue = selecteerPeriode.value;

    let startDate = new Date(currentDate);
    let endDate = new Date();
    let currentQuarter = Math.floor(today.getMonth() / 3);;

    switch (selectedValue) {
        case 'd-maand':
            if ((today.getDate() === 1 || today.getDate() === 2)) {
                warning_text.innerHTML = "It takes time for Google Search Console to update data. Due to that reason it is currently not possible to get the data, try again the third day of this month.";
                return;
            };
            startDate.setDate(1);
            endDate.setDate(today.getDate() - 2);
            break;
        case 'a-maand':
            startDate.setMonth(today.getMonth() - 1, 1);
            endDate.setDate(0);
            break;
        case 'd-kwartaal':
            startDate.setMonth(currentQuarter * 3, 1);
            endDate.setDate(today.getDate() - 2);
            break;
        case 'a-kwartaal':
            const lastQuarter = currentQuarter - 1;
            if (lastQuarter === -1) {
                startDate.setFullYear(today.getFullYear() - 1, 9, 1);
                endDate.setFullYear(today.getFullYear() - 1, 11, 31);
            } else {
                startDate.setFullYear(today.getFullYear(), lastQuarter * 3, 1);
                endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 3, 0);
            }
            break;
        case 'jaar':
            startDate.setMonth(0, 1);
            endDate.setDate(today.getDate() - 2);
            break;
        default:
            break;
    }
    startDateInput.value = formatDateForm(startDate);
    endDateInput.value = formatDateForm(endDate);
}

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
    const selectedValue = selecteerPeriode.value;

    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    const startDateFormat = formatDate(startDate);
    const endDateFormat = formatDate(endDate);

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
        console.log(quarterMonth);
        if (quarterMonth === 10 || quarterMonth === 11 || quarterMonth === 12) {
            year -= 1;
        }
        return new Date(year, quarterMonth - 1, date.getDate());
    }

    if (document.getElementById('previous').checked == true) {
        switch (selectedValue) {
            case 'd-maand':
                previousStartDate = getPreviousMonth(startDate);
                previousEndDate = getPreviousMonth(endDate);
                break;
            case 'a-maand':
                previousStartDate = getPreviousMonth(startDate);
                previousEndDate = new Date(startDate.getFullYear(), startDate.getMonth(), 0);
                break;
            case 'd-kwartaal':
                previousStartDate = getPreviousQuarter(startDate);
                previousEndDate = getPreviousQuarter(endDate);
                break;
            case 'a-kwartaal':
                previousStartDate = getPreviousQuarter(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
                previousEndDate = new Date(startDate.getFullYear(), startDate.getMonth(), 0);
                break;
            case 'jaar':
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
        console.log(previousStartDate, previousEndDate);
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
        console.log(yearStartDate, yearEndDate);
        addParametersToUrl({start_date: startDateFormat, end_date: endDateFormat, compare_start_date: yearStartDateFormat, compare_end_date: yearEndDateFormat});
    }
}

const compareButton = document.getElementById("compare");
compareButton.addEventListener("click", async() => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/popup.js'],
        func: customSelection(),
    })
});

// Handle changes click
const changes = document.getElementById('generate-changes');
changes.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.runtime.sendMessage({ action: "executeStatistieken", tabId: tab.id });
});

// Update checkbox
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
        chrome.storage.local.set({ login: login_value });
        chrome.storage.local.set({ password: password_value });
        chrome.storage.local.set({ location: location_value });
        chrome.storage.local.set({ language: language_value });
    } else {
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
    document.getElementById("search-location").value = 'United Kingdom';
    document.getElementById("search-language").value = 'English';
    instellingen.style = "display:none";
};

// Language & location
let typingTimer;
const Interval = 500;
document.getElementById("search-location").addEventListener("input", function() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function() {
        fetchLocationData();
    }, Interval);
});

async function fetchLocationData() {
    const searchInput = document.getElementById("search-location").value;
    const locationResponse = await fetch ('/files/locations.json');
    const locationData = await locationResponse.json();
    const desiredCountries = [searchInput];
    const filteredLocationEntries = locationData.filter(location => {
        return desiredCountries.some(country => location.location_name.toLowerCase().includes(country.toLowerCase()));
    });

    const locationOptions = filteredLocationEntries.map(location => location.location_name);
    const locationDropdown = document.getElementById('location-dropdown');
    createCustomDropdown(locationDropdown, 'location-options', 'search-location', locationOptions);
    
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
    if (!login) {
        instellingen.style = "";
        return;
    }
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.runtime.sendMessage({ action: "executeVolume", tabId: tab.id });
});