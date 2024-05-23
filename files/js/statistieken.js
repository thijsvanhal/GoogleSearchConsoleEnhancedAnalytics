checkCurrentPage();

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
    if (currentURL.includes('compare_date') || currentURL.includes('compare_start_date')) {
        processStatistics();
    }
}

async function processStatistics() {
    let min;
    const currentURL = window.location.href;
    if (currentURL.includes('/search-console/performance/search-analytics')) {
        min = 8;
    } else {
        min = 6;
    }

    const percentageElements = latestPagina.querySelectorAll(".percentage");
    percentageElements.forEach(element => {
        element.remove();
    });

    const stats = [];

    const statsElements = latestPagina.querySelectorAll('.CJvxcd');
    statsElements.forEach((statElement, index) => {
        const titleValue = statElement.getAttribute('title');
        if (index >= statsElements.length - min) {
            stats.push(titleValue);
        }
    });

    for (let i = 0; i < stats.length; i += 2) {
        let currentValue;
        let previousValue;
        if (stats[0].includes('.') || stats[2].includes('.') || stats[4].includes(',') || stats[6].includes(',')) {
            currentValue = parseNumberWithComma(stats[i]);
            previousValue = parseNumberWithComma(stats[i + 1]);
        } else {
            currentValue = parseNumberWithDot(stats[i]);
            previousValue = parseNumberWithDot(stats[i + 1]);
        }
        console.log(currentValue, previousValue);
        
        if (previousValue !== undefined) {
            const percentageElementIndex = statsElements.length - min + i;
            const percentageElement = statsElements[percentageElementIndex].querySelector('.percentage');
            if (percentageElement) {
                percentageElement.remove();
            }
            updateStatisticsPercentage(statsElements[percentageElementIndex], currentValue, previousValue);
        }
    }
    tableChanges('.CC8hte');
    tableChanges('.OCEh7');
    tableChanges('.SjNqKe');
    tableChanges('.CrQbQ');
}

// Vergelijken van data
function parseNumberWithComma(numberString) {
    const normalizedNumberString = numberString.replace(/\s+/g, '').replace(/\./g, '').replace(',', '.').trim();
    const numericValue = parseFloat(normalizedNumberString.replace(/[a-zA-Z]+$/, ''));
    return numericValue * 1;
}

function parseNumberWithDot(numberString) {
    const normalizedNumberString = numberString.replace(/\s+/g, '').replace(/\,/g, '').trim();
    const numericValue = parseFloat(normalizedNumberString.replace(/[a-zA-Z]+$/, ''));
    return numericValue * 1;
}
  
function calculatePercentage(currentValue, previousValue) {
    const diff = currentValue - previousValue;
    return ((diff / previousValue) * 100).toFixed(2);
}
  
function updateStatisticsPercentage(statElement, currentValue, previousValue) {
    const percentage = calculatePercentage(currentValue, previousValue);
    const percentageElement = document.createElement('span');
    percentageElement.textContent = ` ${percentage}%`;
    percentageElement.className = 'percentage summary';
    percentageElement.style.paddingLeft = '5px';

    statElement.parentNode.insertBefore(percentageElement, statElement.nextSibling);

    const percentageElements = latestPagina.querySelectorAll('.percentage');

    if (percentage > 0) {
        percentageElement.style.color = '#68ce12';
    } else if (percentage < 0) {
        percentageElement.style.color = '#dd300b';
    }

    if (percentageElements[3]) {
        if (percentage > 0) {
            percentageElement.style.color.remove;
            percentageElements[3].style.color = '#dd300b';
        } else if (percentage < 0) {
            percentageElement.style.color.remove;
            percentageElements[3].style.color = '#68ce12';
        }
    }
}

function tableChanges(selector) {
    const checkInterval = setInterval(() => {
        const paginas = document.querySelectorAll('.zQTmif');
        const latestPagina = paginas[paginas.length - 1];
        const huidigeTab = latestPagina.querySelector('.HALYaf.KKjvXb');
        const tabel = huidigeTab.querySelector('.ZXyt2');
        if (tabel) {
            clearInterval(checkInterval);
            
            const changeElements = huidigeTab.querySelectorAll(selector);
            for (let i = 0; i < changeElements.length; i += 3) {
                let currentValue;
                let previousValue;
                let percentageChange;
                if (selector === '.CC8hte' || selector === '.OCEh7') {
                    currentValue = parseFloat(changeElements[i].textContent.replace(/\D/g, ''));
                    previousValue = parseFloat(changeElements[i + 1].textContent.replace(/\D/g, ''));
                } else {
                    if (changeElements[i].innerText.includes('.') || changeElements[i + 1].innerText.includes('.')) {
                        currentValue = parseNumberWithDot(changeElements[i].innerText);
                        previousValue = parseNumberWithDot(changeElements[i + 1].innerText);
                    } else {
                        currentValue = parseNumberWithComma(changeElements[i].innerText);
                        previousValue = parseNumberWithComma(changeElements[i + 1].innerText);
                    }
                    
                }
                if (currentValue === 0 || previousValue === 0) {
                    percentageChange = 'N/A';
                } else {
                    percentageChange = calculatePercentage(currentValue, previousValue);
                }
        
                const percentageChangeElement = document.createElement('span');
                percentageChangeElement.textContent = ` ${percentageChange}%`;
                percentageChangeElement.className = `percentage table s${selector.replace(/\./g,'')}`;
                percentageChangeElement.style.paddingLeft = '5px';
        
                const nextSibling = changeElements[i + 2].nextElementSibling;
                if (!nextSibling) {
                    changeElements[i + 2].insertAdjacentElement('afterend', percentageChangeElement);
                
                    if (percentageChange !== 'N/A') {
                        let color = '#0000008a';
                        if (selector === '.CrQbQ') {
                            color = percentageChange > 0 ? '#dd300b' : (percentageChange < 0 ? '#68ce12' : color);
                        } else {
                            color = percentageChange > 0 ? '#68ce12' : (percentageChange < 0 ? '#dd300b' : color);
                        }
                        percentageChangeElement.style.color = color;
                    } else {
                        percentageChangeElement.style.color = '#0000008a';
                    }
                }
            }
        }
    }, 500);    
}