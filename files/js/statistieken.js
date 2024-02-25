checkCurrentPage();

async function checkCurrentPage() {
    let paginas = document.querySelectorAll('.zQTmif');
    let latestPagina = paginas[paginas.length - 1];
    while (latestPagina && latestPagina.id !== '') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        paginas = document.querySelectorAll('.zQTmif');
        latestPagina = paginas[paginas.length - 1];
    }
    processStatistics();
}

function processStatistics() {
    const percentageElements = document.querySelectorAll(".percentage");
    percentageElements.forEach(element => {
        element.remove();
    });
    const statsElements = document.querySelectorAll('.CJvxcd');
    const stats = [];

    statsElements.forEach((statElement, index) => {
        const statValue = parseNumberWithComma(statElement.innerText);
        if (index >= statsElements.length - 8) {
            stats.push(statValue);
        }
    });
  
    for (let i = 0; i < stats.length; i += 2) {
        const currentValue = stats[i];
        const previousValue = stats[i + 1];
        if (previousValue !== undefined) {
            const percentageElementIndex = statsElements.length - 8 + i;
            const percentageElement = statsElements[percentageElementIndex].querySelector('.percentage');
            if (percentageElement) {
                percentageElement.remove();
            }
            updateStatisticsPercentage(statsElements[percentageElementIndex], previousValue);
        }
    }
    tableChanges('.CC8hte');
    tableChanges('.OCEh7');
    tableChanges('.SjNqKe');
    tableChanges('.CrQbQ');
}

// Vergelijken van data
function parseNumberWithComma(numberString) {
    const normalizedNumberString = numberString.replace(',', '.').trim();
    let multiplier = 1;

    switch (true) {
        case /k|K|mil$/i.test(normalizedNumberString):
            multiplier = 1000;
            break;
        case /mln\.|M|Mio\.$/i.test(normalizedNumberString):
            multiplier = 1000000;
            break;
    }
    const numericValue = parseFloat(normalizedNumberString.replace(/[a-zA-Z]+$/, ''));
    return numericValue * multiplier;
}
  
function calculatePercentage(currentValue, previousValue) {
    const diff = currentValue - previousValue;
    return ((diff / previousValue) * 100).toFixed(2);
}
  
function updateStatisticsPercentage(statElement, previousValue) {
    const currentValue = parseNumberWithComma(statElement.innerText);
    const percentage = calculatePercentage(currentValue, previousValue);
    
    const percentageElement = document.createElement('span');
    percentageElement.textContent = ` ${percentage}%`;
    percentageElement.className = 'percentage';

    statElement.parentNode.insertBefore(percentageElement, statElement.nextSibling);

    const percentageElements = document.querySelectorAll('.percentage');

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
                if (selector === '.CC8hte' || selector === '.OCEh7') {
                    var currentValue = parseFloat(changeElements[i].textContent.replace(/\D/g, ''));
                    var previousValue = parseFloat(changeElements[i + 1].textContent.replace(/\D/g, ''));
                } else {
                    var currentValue = parseNumberWithComma(changeElements[i].innerText);
                    var previousValue = parseNumberWithComma(changeElements[i + 1].innerText);
                }
                if (currentValue === 0 || previousValue === 0) {
                    var percentageChange = 'N/A';
                } else {
                    var percentageChange = calculatePercentage(currentValue, previousValue);
                }
        
                const percentageChangeElement = document.createElement('span');
                percentageChangeElement.textContent = ` ${percentageChange}%`;
                percentageChangeElement.className = 'percentage';
        
                if (!changeElements[i + 2].querySelector('.percentage')) {
                    changeElements[i + 2].appendChild(percentageChangeElement);
                
                    if (selector === '.CrQbQ') {
                        if (percentageChange !== 'N/A') {
                            if (percentageChange > 0) {
                                percentageChangeElement.style.color = '#dd300b';
                            } else if (percentageChange < 0) {
                                percentageChangeElement.style.color = '#68ce12';
                            }
                        }
                    } else {
                        if (percentageChange !== 'N/A') {
                            if (percentageChange > 0) {
                                percentageChangeElement.style.color = '#68ce12';
                            } else if (percentageChange < 0) {
                                percentageChangeElement.style.color = '#dd300b';
                            }
                        }
                    }
                }
            }
        }
    }, 500);    
}