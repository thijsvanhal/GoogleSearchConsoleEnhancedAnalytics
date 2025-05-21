Variables();

function Variables() {
    latestPagina = undefined;
    checkCurrentPage();
}

async function checkCurrentPage() {
    let paginas = document.querySelectorAll('.zQTmif');
    latestPagina = paginas[paginas.length - 1];
    let currentURL = window.location.href;
    while (latestPagina && latestPagina.className.includes('oCHqfe')) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        paginas = document.querySelectorAll('.zQTmif');
        latestPagina = paginas[paginas.length - 1];
        currentURL = window.location.href;
    }
    if (currentURL.includes('/search-console/performance/search-analytics') || currentURL.includes('/search-console/performance/discover') || currentURL.includes('/search-console/performance/google-news')) {
        addCustomDateSelections();
    }
}

// Add function to handle date selection clicks
async function handleDateSelection(event) {
    const button = event.currentTarget;
    const selection = button.getAttribute('data-selection');
    
    let startDate, endDate;
    const today = new Date();
    
    switch(selection) {
        case 'this-month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today);
            endDate.setDate(today.getDate() - 2);
            break;
        case 'last-month':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
        case 'this-quarter':
            const currentQuarter = Math.floor(today.getMonth() / 3);
            startDate = new Date(today.getFullYear(), currentQuarter * 3, 1);
            endDate = new Date(today);
            endDate.setDate(today.getDate() - 2);
            break;
        case 'last-quarter':
            const lastQuarter = Math.floor((today.getMonth() - 3) / 3);
            const lastQuarterYear = lastQuarter < 0 ? today.getFullYear() - 1 : today.getFullYear();
            const lastQuarterStartMonth = lastQuarter < 0 ? 9 : lastQuarter * 3;
            startDate = new Date(lastQuarterYear, lastQuarterStartMonth, 1);
            endDate = new Date(lastQuarterYear, lastQuarterStartMonth + 3, 0);
            break;
        case 'this-year':
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today);
            endDate.setDate(today.getDate() - 2);
            break;
    }
    
    const startDateFormat = formatDate(startDate);
    const endDateFormat = formatDate(endDate);
    
    // Send message to background script to update URL
    chrome.runtime.sendMessage({
        action: "updateDates",
        data: {
            start_date: startDateFormat,
            end_date: endDateFormat
        }
    });
}

// async function to create a date selection button
async function createDateButton(text, selection) {
    const button = document.createElement('button');
    button.className = 'sjAOyb SGXFxe s0TU8c PuUf9b PqfI6e';
    button.setAttribute('jscontroller', 'Wh3DYd');
    button.setAttribute('jsaction', 'click:mgNc5d;');
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', 'false');
    button.setAttribute('tabindex', '-1');
    button.setAttribute('data-selection', selection);
    button.setAttribute('data-tooltip-enabled', 'false');

    const innerDiv = document.createElement('div');
    innerDiv.className = 'MCyFjf';
    innerDiv.setAttribute('jsname', 'bN97Pc');

    // Create main text span
    const mainSpan = document.createElement('span');
    mainSpan.className = 'Uxkgyf';
    
    const iconSpan = document.createElement('span');
    iconSpan.className = 'n3aiU';
    
    const textSpan = document.createElement('span');
    textSpan.className = 'GzDMwf';
    textSpan.setAttribute('jsname', 'V67aGc');
    textSpan.textContent = text;

    mainSpan.appendChild(iconSpan);
    mainSpan.appendChild(textSpan);

    // Create checkmark span
    const checkSpan = document.createElement('span');
    checkSpan.className = 'pDSnLd';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'DaraKe v3ey5');
    svg.setAttribute('viewBox', '0 0 18 18');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'KZT3Q');
    path.setAttribute('fill', 'none');
    path.setAttribute('d', 'M3 9.23529L6.84 13L15 5');
    
    svg.appendChild(path);
    checkSpan.appendChild(svg);

    const hiddenSpan = document.createElement('span');
    hiddenSpan.className = 'GzDMwf';
    hiddenSpan.setAttribute('jsname', 'V67aGc');
    hiddenSpan.setAttribute('aria-hidden', 'true');
    hiddenSpan.style.visibility = 'hidden';
    hiddenSpan.textContent = text;
    
    checkSpan.appendChild(hiddenSpan);

    innerDiv.appendChild(mainSpan);
    innerDiv.appendChild(checkSpan);
    button.appendChild(innerDiv);

    // Add additional spans for styling
    const spans = [
        { class: 'RBHQF-ksKsZd', attrs: { jscontroller: 'LBaJxb', jsname: 'ksKsZd', 'soy-skip': '', ssk: '6:RWVI5c' } },
        { class: 'UiRurc', attrs: {} },
        { class: 'TPi3n', attrs: {} },
        { class: 'OiePBf-zPjgPe OFiDV', attrs: {} },
        { class: 'iqf3Db', attrs: {} }
    ];

    spans.forEach(spanInfo => {
        const span = document.createElement('span');
        span.className = spanInfo.class;
        
        for (const [key, value] of Object.entries(spanInfo.attrs)) {
            span.setAttribute(key, value);
        }
        
        button.appendChild(span);
    });
    
    button.addEventListener('click', handleDateSelection);
    
    return button;
}

// async function to add custom date selections
async function addCustomDateSelections() {
    const filterContainer = latestPagina.querySelector('.rRArIc');

    if (!filterContainer || latestPagina.querySelector('.custom-date-selections-container')) return;

    // Create a flex container for both rows
    const flexContainer = document.createElement('div');
    flexContainer.className = 'custom-date-selections-container';
    flexContainer.style.display = 'flex';
    flexContainer.style.flexDirection = 'column';

    // Move the original filter container to the flex container
    const originalRow = filterContainer.querySelector('.JrRhcc');
    if (originalRow) {
        flexContainer.appendChild(originalRow);
    }

    // Create our custom row
    const customRow = document.createElement('div');
    customRow.className = 'JrRhcc custom-date-selections';
    customRow.style.marginTop = '-25px';

    const innerContainer = document.createElement('div');
    innerContainer.className = 'cpc7gb urNrd';
    innerContainer.setAttribute('role', 'radiogroup');

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'W6BWO';

    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'SjPuUc';

    // Create buttons for each date selection
    const dateSelections = [
        { text: 'This month', value: 'this-month' },
        { text: 'Last month', value: 'last-month' },
        { text: 'This quarter', value: 'this-quarter' },
        { text: 'Last quarter', value: 'last-quarter' },
        { text: 'This year', value: 'this-year' }
    ];

    for (const selection of dateSelections) {
        const button = await createDateButton(selection.text, selection.value);
        buttonWrapper.appendChild(button);
    }

    buttonContainer.appendChild(buttonWrapper);
    innerContainer.appendChild(buttonContainer);
    customRow.appendChild(innerContainer);
    
    // Add both rows to the flex container
    flexContainer.appendChild(customRow);
    
    // Create attribution text
    const attribution = document.createElement('div');
    attribution.style.marginTop = '-15px';

    const text = document.createElement('span');
    text.textContent = 'Added by Google Search Console Enhanced Analytics';
    text.style.color = '#666';
    text.style.fontSize = '8px';

    attribution.appendChild(text);
    flexContainer.appendChild(attribution);

    // Insert the flex container as the first child
    filterContainer.insertBefore(flexContainer, filterContainer.firstChild);
}

// Format date for GSC
function formatDate(date) {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    return year + month + day;
}