// Initialize expenses array
let expenses = [];

// DOM elements
const expenseForm = document.getElementById('expenseForm');
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const expensesBody = document.getElementById('expensesBody');
const totalExpenses = document.getElementById('totalExpenses');
const currentDateDisplay = document.getElementById('currentDate');
const monthFilter = document.getElementById('monthFilter');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadExpenses();
    displayCurrentDate();
    populateMonthFilter();
    displayExpenses();
    updateTotal();
});

// Load expenses from localStorage
function loadExpenses() {
    const stored = localStorage.getItem('expenses');
    if (stored) {
        expenses = JSON.parse(stored);
    }
}

// Save expenses to localStorage
function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Display current date
function displayCurrentDate() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    currentDateDisplay.textContent = today.toLocaleDateString('en-US', options);
}

// Format date to "DD MMM YYYY" format
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

// Get current date in ISO format
function getCurrentDateISO() {
    return new Date().toISOString().split('T')[0];
}

// Handle form submission
expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value.trim();

    if (amount <= 0 || !description) {
        alert('Please enter a valid amount and description');
        return;
    }

    // Create expense object
    const expense = {
        id: Date.now(),
        amount: amount,
        description: description,
        date: getCurrentDateISO()
    };

    // Add to expenses array
    expenses.push(expense);

    // Save to localStorage
    saveExpenses();

    // Clear form
    amountInput.value = '';
    descriptionInput.value = '';

    // Update display
    displayExpenses();
    updateTotal();
    populateMonthFilter();
});

// Display expenses in table
function displayExpenses() {
    const filterValue = monthFilter.value;
    let filteredExpenses = expenses;

    // Filter by month if selected
    if (filterValue !== 'all') {
        const [year, month] = filterValue.split('-');
        filteredExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getFullYear() == year &&
                   expenseDate.getMonth() == (month - 1);
        });
    }

    // Sort by date (newest first)
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Clear table body
    expensesBody.innerHTML = '';

    if (filteredExpenses.length === 0) {
        expensesBody.innerHTML = `
            <tr>
                <td colspan="4" class="no-expenses">
                    ${expenses.length === 0 ? 'No expenses yet. Add your first expense above!' : 'No expenses found for the selected month.'}
                </td>
            </tr>
        `;
        return;
    }

    // Add rows to table
    filteredExpenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Date:">${formatDate(expense.date)}</td>
            <td data-label="Description:">${escapeHtml(expense.description)}</td>
            <td class="amount" data-label="Amount:">Rs${parseFloat(expense.amount).toFixed(2)}</td>
            <td class="action-cell">
                <button class="delete-btn" onclick="deleteExpense(${expense.id})">Delete</button>
            </td>
        `;
        expensesBody.appendChild(row);
    });
}

// Update total expenses
function updateTotal() {
    const filterValue = monthFilter.value;
    let filteredExpenses = expenses;

    if (filterValue !== 'all') {
        const [year, month] = filterValue.split('-');
        filteredExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getFullYear() == year &&
                   expenseDate.getMonth() == (month - 1);
        });
    }

    const total = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    totalExpenses.textContent = `Rs${total.toFixed(2)}`;
}

// Delete expense
function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        expenses = expenses.filter(expense => expense.id !== id);
        saveExpenses();
        displayExpenses();
        updateTotal();
        populateMonthFilter();
    }
}

// Populate month filter dropdown
function populateMonthFilter() {
    const months = new Set();
    const currentValue = monthFilter.value;

    expenses.forEach(expense => {
        const date = new Date(expense.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthYear = `${year}-${String(month).padStart(2, '0')}`;
        months.add(monthYear);
    });

    // Sort months
    const sortedMonths = Array.from(months).sort();

    // Clear existing options except "All Months"
    while (monthFilter.options.length > 1) {
        monthFilter.remove(1);
    }

    // Add month options
    sortedMonths.reverse().forEach(monthYear => {
        const option = document.createElement('option');
        const [year, month] = monthYear.split('-');
        const date = new Date(year, month - 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        option.value = monthYear;
        option.textContent = monthName;
        if (monthYear === currentValue) {
            option.selected = true;
        }
        monthFilter.appendChild(option);
    });

    // Re-apply filter if it was set
    if (currentValue && currentValue !== 'all') {
        monthFilter.value = currentValue;
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
