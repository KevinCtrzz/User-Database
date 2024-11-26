const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1Cx2A4q_EaRbXVtHsXBPGFQ23XaR2hSZo1qIhk9VIvWw/edit?resourcekey=&gid=1841594051#gid=1841594051';
const STATUS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSbFw0icnOR-UZnFBT86GGx2DH4zt6ULBAfZUBLH-2GZE9FzXGR_sYDXB7MSrI21A8q9F2iwhi-crDE/pubhtml';

const searchInput = document.querySelector('.search-input');
const resultsDiv = document.querySelector('.results');
const statusResultsDiv = document.querySelector('.status-results');

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
let statusData = null;

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
                discordUsername: cells[0]?.textContent || '',
                epicIgn: cells[1]?.textContent || '',
                cashApp: cells[2]?.textContent || '',
                payPal: cells[3]?.textContent || '',
                preferredPayment: cells[4]?.textContent || '',
                dateSubmitted: cells[5]?.textContent || '',
                notes: cells[6]?.textContent || ''
            };
        }).filter(row => row.discordId || row.discordUsername);
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
function displayResults(results) {
    if (results.length === 0) {
        resultsDiv.innerHTML = 'No results found';
        return;
    }

    // Filter out the disclaimer message
    results = results.filter(row => 
        !row.discordId.includes('Quotes are not sourced')
    );

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

// New Payment Status Functions
async function fetchStatusData() {
    try {
        const response = await fetch(STATUS_SHEET_URL);
        const text = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const rows = doc.querySelectorAll('tbody tr');
        
        statusData = Array.from(rows).slice(1).map(row => {
            const cells = row.querySelectorAll('td');
            return {
                username: cells[0]?.textContent || '',
                amount: cells[1]?.textContent || '',
                status: cells[2]?.textContent.toLowerCase() || ''
            };
        });
        
        displayStatusResults('all');
    } catch (error) {
        console.error('Error fetching status data:', error);
        statusResultsDiv.innerHTML = 'Error loading payment status data.';
    }
}

function displayStatusResults(filter) {
    if (!statusData) {
        statusResultsDiv.innerHTML = 'Loading data...';
        return;
    }

    const filteredData = filter === 'all' 
        ? statusData 
        : statusData.filter(item => item.status === filter);

    if (filteredData.length === 0) {
        statusResultsDiv.innerHTML = 'No results found';
        return;
    }

    statusResultsDiv.innerHTML = filteredData
        .map(item => `
            <div class="result-item ${item.status}">
                <span>${item.username}</span>
                <span>$${item.amount}</span>
            </div>
        `)
        .join('');
}

// Filter button event listeners
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        displayStatusResults(e.target.dataset.filter);
    });
});

// Load both data sets when page loads
fetchSheetData();
fetchStatusData();
