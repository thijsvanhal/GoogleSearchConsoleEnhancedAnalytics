processStatistics();

function processStatistics() {
    const percentageElements = document.querySelectorAll(".percentage");
    percentageElements.forEach(element => {
        element.remove();
    });
    const statsElements = document.querySelectorAll('.CJvxcd');
    const stats = [];
  
    statsElements.forEach(statElement => {
        const statValue = parseNumberWithComma(statElement.innerText);
        stats.push(statValue);
    });
  
    for (let i = 0; i < stats.length; i += 2) {
        const currentValue = stats[i];
        const previousValue = stats[i + 1];
        if (previousValue !== undefined) {
            const percentageElement = statsElements[i].querySelector('.percentage');
            if (percentageElement) {
                percentageElement.remove();
            }
            updateStatisticsPercentage(statsElements[i], previousValue);
        }
    }
}

// Vergelijken van data
function parseNumberWithComma(numberString) {
    let normalizedNumberString = numberString.replace(',', '.').trim();
    let multiplier = 1;

    if (normalizedNumberString.endsWith('K')) {
        normalizedNumberString = normalizedNumberString.replace('K', '');
        multiplier = 1000;
    } else if (normalizedNumberString.endsWith('mln.')) {
        normalizedNumberString = normalizedNumberString.replace('mln.', '');
        multiplier = 1000000;
    }

    return parseFloat(normalizedNumberString) * multiplier;
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
        percentageElement.style.color = '#75FF33';
    } else if (percentage < 0) {
        percentageElement.style.color = '#dd300b';
    }
    
    if (percentageElements[3]) {
        if (percentage > 0) {
            percentageElement.style.color.remove;
            percentageElements[3].style.color = '#dd300b';
        } else if (percentage < 0) {
            percentageElement.style.color.remove;
            percentageElements[3].style.color = '#75FF33';
        }
    }
    
}