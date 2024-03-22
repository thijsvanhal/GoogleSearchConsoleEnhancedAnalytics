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
    if (currentURL.includes('/search-console/performance/search-analytics') || currentURL.includes('/search-console/performance/discover') || currentURL.includes('/search-console/performance/google-news')) {
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

    const statsElementsEnkel = latestPagina.querySelectorAll('.nnLLaf');
    statsElementsEnkel.forEach((statElement, index) => {
        const titleValue = statElement.getAttribute('title');
        if (index >= statsElementsEnkel.length - min) {
            statElement.innerText = titleValue;
        }
    });

    const statsElements = latestPagina.querySelectorAll('.CJvxcd');
    statsElements.forEach((statElement, index) => {
        const titleValue = statElement.getAttribute('title');
        if (index >= statsElements.length - min) {
            statElement.innerText = titleValue;
        }
    });
}