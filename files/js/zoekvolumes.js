Variables();

function Variables() {
    login = undefined;
    password = undefined;
    country = undefined;
    language = undefined;
    mixedKeywordsArray = undefined;
    taskIds = undefined;
    pages = undefined;
    latestPage = undefined;
    checkCurrentPageZoekvolume();
}

async function checkCurrentPageZoekvolume() {
    pages = document.querySelectorAll('.zQTmif');
    latestPage = pages[pages.length - 1];
    while (latestPage && latestPage.id !== '') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        pages = document.querySelectorAll('.zQTmif');
        latestPage = pages[pages.length - 1];
    }
    getCredentials();
}

async function getCredentials() {
    const loginLocal = await chrome.storage.local.get(["login"]);
    const passwordLocal = await chrome.storage.local.get(["password"]);
    const locationLocal = await chrome.storage.local.get(["location"]);
    const languageLocal = await chrome.storage.local.get(["language"]);

    const loginSession = await chrome.storage.session.get(["login"]);
    const passwordSession = await chrome.storage.session.get(["password"]);
    const locationSession = await chrome.storage.session.get(["location"]);
    const languageSession = await chrome.storage.session.get(["language"]);

    if (loginLocal.login) {
        login = loginLocal.login;
        password = passwordLocal.password;
        country = locationLocal.location;
        language = languageLocal.language;
    } else if (loginSession.login) {
        login = loginSession.login;
        password = passwordSession.password;
        country = locationSession.location;
        language = languageSession.language;
    }
    getVolumes();
}

async function getVolumes() { 
    const statusElement = latestPage.querySelector('.XoFXcf');
    statusElement.innerHTML = "<p>Search volume data is being generated in the background. Do <b>not reload</b> the page!</p>";

    const volumeElements = document.querySelectorAll(".searchvolume");
    volumeElements.forEach(element => {
        element.remove();
    });

    mixedKeywordsArray = [];
    mixedKeywordsArray.push({
        mixedKeywords: [],
        searchVolume: []
    });
    taskIds = [];

    const zoekwoorden = latestPage.querySelectorAll('.LoCYSb.XL1mme');
    if (zoekwoorden.length == 0) {
        return;
    }

    for(const zoekwoord of zoekwoorden) {
        const keyword = zoekwoord.innerText;
        if (isValidKeywordPhrase(keyword)) {
            mixedKeywordsArray[0].mixedKeywords.push(keyword);
            mixedKeywordsArray[0].searchVolume.push(0);
        }
    };

    const selectedCountry = country;
    const selectedLanguage = language;

    const SearchVolumeKeywords = mixedKeywordsArray[0].mixedKeywords;

    await SearchVolumeData(SearchVolumeKeywords, selectedCountry, selectedLanguage);

    for (const zoekwoord of zoekwoorden) {
        for(let i = 0; i < mixedKeywordsArray[0].mixedKeywords.length; i++) {
            if(mixedKeywordsArray[0].mixedKeywords[i] === zoekwoord.innerText) {
                const searchVolumeElement = document.createElement('span');
                searchVolumeElement.textContent = ` - ${mixedKeywordsArray[0].searchVolume[i]}`;
                searchVolumeElement.className = 'searchvolume';
                zoekwoord.appendChild(searchVolumeElement);
            }
        }
    }
}

async function SearchVolumeData(keywords, country, language) {
    const statusElement = latestPage.querySelector('.XoFXcf');
    const numRequests = Math.ceil(keywords.length / 1000);
        
    for (let i = 0; i < numRequests; i++) {
        const startIndex = i * 1000;
        const endIndex = Math.min(startIndex + 1000, keywords.length);
        const keywordsSlice = keywords.slice(startIndex, endIndex);

        const post_array = [{
            "location_name": country,
            "language_name": language,
            "keywords": keywordsSlice,
        }];

        const post_url = `https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/task_post`;
        const requestPostOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(login + ':' + password)
            }
        };

        // POST request
        const post_response = await fetch(post_url, { ...requestPostOptions, body: JSON.stringify(post_array) });
        if (post_response.ok === false) {
            statusElement.innerHTML = `<p>Oops! There has been an error when accessing DataForSEO: <b>${post_response.status} - ${post_response.statusText}</b>. Do you think this is an error? <a href="https://thijsvanhal.nl/contact-me/?utm_source=google&utm_medium=extension">Report this bug</a></p>`;
            return;
        } else {
            const post_result = await post_response.json();
            console.log(post_result.tasks);
            const status = post_result.tasks[0].status_code;
            if (status === 20100) {
                taskIds.push(post_result.tasks[0].id);
            } else {
                statusElement.innerHTML = `<p>Oops! There has been an error: <b>${post_result.tasks[0].status_message}</b><a href="https://thijsvanhal.nl/contact-me/?utm_source=google&utm_medium=extension"> Report this bug</a></p>`;
                return;
            }
        }
    }
    
    for (let i = 0; i < taskIds.length; i++) {
        const taskId = taskIds[i];
        const results = await fetchData(taskId, login, password);
        for (const result of results) {
            const keyword = result.keyword;
            let NewSearchVolume;
            if (result.search_volume !== null) {
                NewSearchVolume = result.search_volume
            } else {
                NewSearchVolume = 0;
            }
            
            for (const obj of mixedKeywordsArray) {
                for(let i = 0; i < obj.mixedKeywords.length; i++) {
                    if(obj.mixedKeywords[i] === keyword) {
                        obj.searchVolume[i] = NewSearchVolume;
                    }
                }
            }
        }
        statusElement.innerHTML = "";
    }
}

async function fetchData(taskId, login, password) {
    let status = '';
    let fetchResults = [];
    while (status !== 'Ok.') {
        const requestGetOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(login + ':' + password)
            }
        };
        const get_url = `https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/task_get/${taskId}`;
        const get_response = await fetch(get_url, requestGetOptions);
        const get_result = await get_response.json();
        console.log(get_result.tasks);
        status = get_result.tasks[0].status_message;
        if (status === 'Ok.') {
            fetchResults = get_result.tasks[0].result;
        } else {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    return fetchResults;
}

function isValidKeywordPhrase(phrase) {
    const modifiedPhrase = phrase.replace(/(site:|search:)/g, '');

    if (modifiedPhrase.length > 80) {
        return false;
    }

    const invalidSymbolsRegex = /[,!@%^()={}~`<>?\\|―®™]/;
    if (invalidSymbolsRegex.test(modifiedPhrase)) {
        return false;
    }

    const fourByteUnicodeRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u{10000}-\u{10FFFF}]/u;
    if (fourByteUnicodeRegex.test(modifiedPhrase)) {
        return false;
    }

    const replacementCharRegex = /\uFFFD/;
    if (replacementCharRegex.test(modifiedPhrase)) {
        return false;
    }

    const words = modifiedPhrase.split(/\s+/);
    if (words.length > 10) {
        return false;
    }
    for (const word of words) {
        if (!/^(C\+\+)$/.test(word) && /[\.\-\+]/.test(word)) {
            return false;
        }
    }

    return true;
}