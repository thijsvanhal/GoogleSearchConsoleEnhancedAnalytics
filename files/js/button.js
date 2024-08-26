chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.backgroundMethod) {
        let backgroundMethod = request.backgroundMethod;
        checkCurrentPageButton(backgroundMethod);
    }
});

async function checkCurrentPageButton(backgroundMethod) {
    let paginas = document.querySelectorAll('.zQTmif');
    latestPagina = paginas[paginas.length - 1];
    let currentURL = window.location.href;
    while (latestPagina && latestPagina.className.includes('oCHqfe')) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        paginas = document.querySelectorAll('.zQTmif');
        latestPagina = paginas[paginas.length - 1];
        currentURL = window.location.href;
    }
    if (currentURL.includes('/search-console/performance/search-analytics')) {
        if (currentURL.includes('compare_date') || currentURL.includes('compare_start_date')) {
            generateButton("compare");
        } else if (backgroundMethod == 'volume') {
            generateButton("single");
        }
    }
}

async function generateButton(method) {
    const buttonExist = latestPagina.querySelector('#generate-excel');
    if (buttonExist) {
        buttonExist.remove();
    }

    const buttonElement = latestPagina.querySelector('.too21');
    const buttonHTML = `<button type="button" class="btn btn-primary" id="generate-excel" style="font-size: 14px;color: #fff !important;background-color: #02343f;border-color: #031c22 !important;margin-bottom: 10px;border-radius: 0.7rem;border-width: 1.5px;width: 100%;line-height: 17px;cursor: pointer;">Export Data</button>`;
    buttonElement.insertAdjacentHTML('afterbegin', buttonHTML);
    const DomButton = buttonElement.querySelector('#generate-excel');
    DomButton.addEventListener('mouseover', function() {
        this.style.backgroundColor = '#031c22';
    });
    DomButton.addEventListener('mouseout', function() {
        this.style.backgroundColor = '#02343f';
    });
    DomButton.addEventListener('mousedown', function() {
        this.style.backgroundColor = '#031c22';
    });
    DomButton.addEventListener('mouseup', function() {
        this.style.backgroundColor = '#031c22';
    });
    DomButton.addEventListener('click', function() {
        if (method === "single") {
            generateExcelWhenSingle();
        } else {
            generateExcelWhenComparing();
        }
    })
}

async function generateExcelWhenSingle() {
    const summaryElementsHTML = latestPagina.querySelectorAll('.nnLLaf');
    const summaryElements = [];
    summaryElementsHTML.forEach(element => {
        summaryElements.push(element.innerText.trim());
    });

    const currentPeriod = latestPagina.querySelectorAll('.OTrxGf')[1].innerText.trim();

    const wb = XLSX.utils.book_new();

    const summarySheetData = [
        ['Clicks', 'Impressions', 'CTR', 'Position'],
        [...summaryElements],
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summarySheetData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    const huidigeTab = latestPagina.querySelector('.HALYaf.KKjvXb');
    const tabelElement = huidigeTab.querySelector('.ZXyt2');

    const column1DataElements = tabelElement.querySelectorAll('.LoCYSb.XL1mme');
    const column1Data = Array.from(column1DataElements).map(element => element.innerText.trim().replace(/ - \d+$/, ''));

    const columnNamesElements = [`Query`, `Clicks`, `Impressions`, `CTR`, `Position`];

    const searchVolumeElements = tabelElement.querySelectorAll('.searchvolume');
    let searchVolumeData = [];
    if (searchVolumeElements.length !== 0) {
        searchVolumeData = Array.from(searchVolumeElements).map(element => element.innerText.trim().replace(/- (?=\d)/g, ''));
        columnNamesElements.splice(1, 0, 'Search volume');
    }

    const columnNames = Array.from(columnNamesElements).map(element => element);

    const fetchColumnsData = (selector, chunkSize) => {
        const allElements = Array.from(tabelElement.querySelectorAll(selector)).map(element => element.innerText.trim());
        const chunks = [];
        for (let i = 0; i < allElements.length; i += chunkSize) {
            chunks.push(allElements.slice(i, i + chunkSize));
        }
        return chunks;
    };

    const columns2to4Data = fetchColumnsData('.CC8hte', 1);
    const columns5to7Data = fetchColumnsData('.OCEh7', 1);
    const columns8to10Data = fetchColumnsData('.SjNqKe', 1);
    const columns11to13Data = fetchColumnsData('.CrQbQ', 1);

    const detailedRows = [columnNames];

    column1Data.forEach((column1Value, index) => {
        const row = [column1Value];
        if (searchVolumeData[index]) row.push(searchVolumeData[index]);
        if (columns2to4Data[index]) row.push(...columns2to4Data[index]);
        if (columns5to7Data[index]) row.push(...columns5to7Data[index]);
        if (columns8to10Data[index]) row.push(...columns8to10Data[index]);
        if (columns11to13Data[index]) row.push(...columns11to13Data[index]);
        detailedRows.push(row);
    });

    const detailedWs = XLSX.utils.aoa_to_sheet(detailedRows);
    XLSX.utils.book_append_sheet(wb, detailedWs, 'Data');

    XLSX.writeFile(wb, `Google Search Console Data ${currentPeriod}.xlsx`);
}

async function generateExcelWhenComparing() {
    const summaryElementsHTML = latestPagina.querySelectorAll('.CJvxcd');
    const summaryElements = [];
    summaryElementsHTML.forEach(element => {
        summaryElements.push(element.innerText.trim());
    });

    const percentageElementsHTML = latestPagina.querySelectorAll('.percentage.summary');
    const percentageElements = [];
    percentageElementsHTML.forEach(element => {
        percentageElements.push(element.innerText.trim());
    });

    const currentPeriod = latestPagina.querySelectorAll('.zhJ3J')[0].innerText.trim();
    const comparisonPeriod = latestPagina.querySelectorAll('.zhJ3J')[1].innerText.trim();

    const wb = XLSX.utils.book_new();

    const currentPeriodIndices = [0, 2, 4, 6];
    const comparisonPeriodIndices = [1, 3, 5, 7];
    const currentPeriodData = currentPeriodIndices.map(index => summaryElements[index]);
    const comparisonPeriodData = comparisonPeriodIndices.map(index => summaryElements[index]);
    const summarySheetData = [
        ['Period', 'Clicks', 'Impressions', 'CTR', 'Position'],
        [currentPeriod, ...currentPeriodData],
        [comparisonPeriod, ...comparisonPeriodData],
        ['', ...percentageElements]
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summarySheetData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    const huidigeTab = latestPagina.querySelector('.HALYaf.KKjvXb');
    const tabelElement = huidigeTab.querySelector('.ZXyt2');

    const column1DataElements = tabelElement.querySelectorAll('.LoCYSb.XL1mme');
    const column1Data = Array.from(column1DataElements).map(element => element.innerText.trim().replace(/ - \d+$/, ''));

    const percentageClickElements = tabelElement.querySelectorAll('.percentage.table.sCC8hte');
    const percentageClickData = Array.from(percentageClickElements).map(element => element.innerText.trim());

    const impressionsClickElements = tabelElement.querySelectorAll('.percentage.table.sOCEh7');
    const impressionsClickData = Array.from(impressionsClickElements).map(element => element.innerText.trim());

    const ctrClickElements = tabelElement.querySelectorAll('.percentage.table.sSjNqKe');
    const ctrClickData = Array.from(ctrClickElements).map(element => element.innerText.trim());
    
    const positionClickElements = tabelElement.querySelectorAll('.percentage.table.sCrQbQ');
    const positionClickData = Array.from(positionClickElements).map(element => element.innerText.trim());

    const columnNamesElements = [`Query`, `Clicks ${currentPeriod}`, `Clicks ${comparisonPeriod}`, `Clicks difference`, `Impressions ${currentPeriod}`, `Impressions ${comparisonPeriod}`, `Impressions difference`, `CTR ${currentPeriod}`, `CTR ${comparisonPeriod}`, `CTR difference`, `Position ${currentPeriod}`, `Position ${comparisonPeriod}`, `Position difference`];

    if (percentageClickElements.length !== 0) {
        columnNamesElements.splice(4, 0, '%');
        columnNamesElements.splice(8, 0, '%');
        columnNamesElements.splice(12, 0, '%');
        columnNamesElements.splice(16, 0, '%');
    }

    const searchVolumeElements = tabelElement.querySelectorAll('.searchvolume');
    let searchVolumeData = [];
    if (searchVolumeElements.length !== 0) {
        searchVolumeData = Array.from(searchVolumeElements).map(element => element.innerText.trim().replace(/- (?=\d)/g, ''));
        columnNamesElements.splice(1, 0, 'Search volume');
    }

    const columnNames = Array.from(columnNamesElements).map(element => element);

    const fetchColumnsData = (selector, chunkSize) => {
        const allElements = Array.from(tabelElement.querySelectorAll(selector)).map(element => element.innerText.trim());
        const chunks = [];
        for (let i = 0; i < allElements.length; i += chunkSize) {
            chunks.push(allElements.slice(i, i + chunkSize));
        }
        return chunks;
    };

    const columns2to4Data = fetchColumnsData('.CC8hte', 3);
    const columns5to7Data = fetchColumnsData('.OCEh7', 3);
    const columns8to10Data = fetchColumnsData('.SjNqKe', 3);
    const columns11to13Data = fetchColumnsData('.CrQbQ', 3);

    const detailedRows = [columnNames];

    column1Data.forEach((column1Value, index) => {
        const row = [column1Value];
        if (searchVolumeData[index]) row.push(searchVolumeData[index]);
        if (columns2to4Data[index]) row.push(...columns2to4Data[index]);
        if (percentageClickData[index]) row.push(percentageClickData[index]);
        if (columns5to7Data[index]) row.push(...columns5to7Data[index]);
        if (impressionsClickData[index]) row.push(impressionsClickData[index]);
        if (columns8to10Data[index]) row.push(...columns8to10Data[index]);
        if (ctrClickData[index]) row.push(ctrClickData[index]);
        if (columns11to13Data[index]) row.push(...columns11to13Data[index]);
        if (positionClickData[index]) row.push(positionClickData[index]);
        detailedRows.push(row);
    });

    const detailedWs = XLSX.utils.aoa_to_sheet(detailedRows);
    XLSX.utils.book_append_sheet(wb, detailedWs, 'Data');

    XLSX.writeFile(wb, `Google Search Console Data ${currentPeriod} / ${comparisonPeriod}.xlsx`);
}