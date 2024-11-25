const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRngVEmiDseBCI07YF8jeprAA8QvVwAYY9mwV4LWcgf6oCGKB1vM1zSL8WC9r1H4DLHRymodQAIa8BQ/pubhtml';

const searchInput = document.querySelector('.search-input');
const resultsDiv = document.querySelector('.results');

// Update placeholder text to match your data
searchInput.placeholder = "Search by Discord ID, Username, or Epic IGN...";

searchInput.addEventListener('input', debounce(handleSearch, 300));

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

let sheetData = null;

async function fetchSheetData() {
    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        
        // Parse the HTML content to get table data
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const rows = doc.querySelectorAll('tbody tr');
        
        // Convert HTML table to array of objects
        sheetData = Array.from(rows).slice(1).map(row => { // slice(1) to skip header
            const cells = row.querySelectorAll('td');
            return {
                discordId: cells[0]?.textContent || '',
                discordUsername: cells[1]?.textContent || '',
                epicIgn: cells[2]?.textContent || '',
                cashApp: cells[3]?.textContent || '',
                payPal: cells[4]?.textContent || '',
                preferredPayment: cells[5]?.textContent || '',
                dateSubmitted: cells[6]?.textContent || '',
                notes: cells[7]?.textContent || ''
            };
        }).filter(row => row.discordId || row.discordUsername); // Filter out empty rows
    } catch (error) {
        console.error('Error fetching data:', error);
        resultsDiv.innerHTML = 'Error loading data. Please try again later.';
    }
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!sheetData) {
        resultsDiv.innerHTML = 'Loading data...';
        return;
    }

    if (searchTerm.length < 2) {
        resultsDiv.innerHTML = 'No results found';
        return;
    }

    const results = sheetData.filter(row => 
        row.discordId.toLowerCase().includes(searchTerm) ||
        row.discordUsername.toLowerCase().includes(searchTerm) ||
        row.epicIgn.toLowerCase().includes(searchTerm)
    );

    displayResults(results);
}

function displayResults(results) {
    if (results.length === 0) {
        resultsDiv.innerHTML = 'No results found';
        return;
    }

    resultsDiv.innerHTML = results
        .map(row => `
            <div class="result-item">
                <p><strong>Discord ID:</strong> ${row.discordId}</p>
                <p><strong>Discord Username:</strong> ${row.discordUsername}</p>
                <p><strong>Epic IGN:</strong> ${row.epicIgn}</p>
                <p><strong>Cash-App:</strong> ${row.cashApp}</p>
                <p><strong>PayPal:</strong> ${row.payPal}</p>
                <p><strong>Preferred Payment:</strong> ${row.preferredPayment}</p>
                <p><strong>Date Submitted:</strong> ${row.dateSubmitted}</p>
                ${row.notes !== 'N/A' ? `<p><strong>Notes:</strong> ${row.notes}</p>` : ''}
            </div>
        `)
        .join('');
}

// Load data when page loads
fetchSheetData();