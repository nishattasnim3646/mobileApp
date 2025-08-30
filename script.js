// Calculator state
let currentInput = '0';
let currentResult = '';
let calculationHistory = [];
let historyIndex = -1;
let undoStack = [];
let redoStack = [];
let currentTrigFunction = '';
let currentLogFunction = '';

// DOM elements
const inputElement = document.getElementById('input');
const resultElement = document.getElementById('result');
const miniHistoryElement = document.getElementById('mini-history');
const dateCalcElement = document.getElementById('date-calc');
const calcKeypad = document.getElementById('calc-keypad');
const historyPopup = document.getElementById('history-popup');
const historyList = document.getElementById('history-list');
const closeHistoryBtn = document.getElementById('close-history');
const rootPopup = document.getElementById('root-popup');
const confirmRootBtn = document.getElementById('confirm-root');
const cancelRootBtn = document.getElementById('cancel-root');
const logPopup = document.getElementById('log-popup');
const confirmLogBtn = document.getElementById('confirm-log');
const cancelLogBtn = document.getElementById('cancel-log');
const trigPopup = document.getElementById('trig-popup');
const confirmTrigBtn = document.getElementById('confirm-trig');
const cancelTrigBtn = document.getElementById('cancel-trig');
const trigTitle = document.getElementById('trig-title');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    // Mode toggling
    document.getElementById('calc-mode').addEventListener('click', () => {
        setMode(true);
    });
    
    document.getElementById('date-mode').addEventListener('click', () => {
        setMode(false);
    });
    
    // Date calculation
    document.getElementById('calculate-date').addEventListener('click', calculateDateDifference);
    
    // History popup
    closeHistoryBtn.addEventListener('click', () => {
        historyPopup.style.display = 'none';
    });
    
    // Root popup
    confirmRootBtn.addEventListener('click', calculateRoot);
    cancelRootBtn.addEventListener('click', () => {
        rootPopup.style.display = 'none';
    });
    
    // Log popup
    confirmLogBtn.addEventListener('click', calculateLog);
    cancelLogBtn.addEventListener('click', () => {
        logPopup.style.display = 'none';
    });
    
    // Trig popup
    confirmTrigBtn.addEventListener('click', calculateTrig);
    cancelTrigBtn.addEventListener('click', () => {
        trigPopup.style.display = 'none';
    });
    
    // Button clicks
    document.querySelectorAll('button').forEach(button => {
        if (button.id !== 'calculate-date' && button.id !== 'close-history' && 
            button.id !== 'confirm-root' && button.id !== 'cancel-root' &&
            button.id !== 'confirm-log' && button.id !== 'cancel-log' &&
            button.id !== 'confirm-trig' && button.id !== 'cancel-trig') {
            button.addEventListener('click', handleButtonClick);
        }
    });
    
    // Close popups when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === historyPopup) {
            historyPopup.style.display = 'none';
        }
        if (event.target === rootPopup) {
            rootPopup.style.display = 'none';
        }
        if (event.target === logPopup) {
            logPopup.style.display = 'none';
        }
        if (event.target === trigPopup) {
            trigPopup.style.display = 'none';
        }
    });
}

// Set mode (calculator/date)
function setMode(isCalcMode) {
    document.getElementById('calc-mode').classList.toggle('active', isCalcMode);
    document.getElementById('date-mode').classList.toggle('active', !isCalcMode);
    
    calcKeypad.style.display = isCalcMode ? 'grid' : 'none';
    dateCalcElement.style.display = isCalcMode ? 'none' : 'block';
}

// Handle button clicks
function handleButtonClick(event) {
    const button = event.target;
    const action = button.dataset.action;
    const value = button.dataset.value;
    
    buttonPressEffect(button);
    
    switch(action) {
        case 'append':
            appendValue(value);
            break;
        case 'function':
            handleFunction(value);
            break;
        case 'clear':
            clearAll();
            break;
        case 'calculate':
            calculate();
            break;
        case 'showHistory':
            showHistory();
            break;
        case 'undo':
            undo();
            break;
        case 'redo':
            redo();
            break;
    }
}

// Button press effects
function buttonPressEffect(button) {
    // Haptic feedback (if available)
    if ('vibrate' in navigator) {
        navigator.vibrate(10);
    }
    
    // Visual feedback
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = '';
    }, 100);
}

// Append values to input
function appendValue(value) {
    // Save state for undo before making changes
    saveState();
    
    if (currentInput === '0' && value !== '.') {
        currentInput = value;
    } else {
        // Keep digits together by preventing operators from being added without numbers
        if (isOperator(value) && isOperator(currentInput.slice(-1))) {
            currentInput = currentInput.slice(0, -1) + value;
        } else {
            currentInput += value;
        }
    }
    updateDisplay();
}

// Check if a value is an operator
function isOperator(value) {
    return ['+', '-', '*', '/', '%'].includes(value);
}

// Handle special functions
function handleFunction(func) {
    switch(func) {
        case 'sin':
        case 'cos':
        case 'tan':
            showTrigPopup(func);
            break;
        case 'log':
            showLogPopup();
            break;
        case 'x^y':
            currentInput += '^';
            updateDisplay();
            break;
        case '√':
            showRootPopup();
            break;
    }
}

// Show trigonometric function popup
function showTrigPopup(func) {
    currentTrigFunction = func;
    trigTitle.textContent = `${func.toUpperCase()} Function`;
    trigPopup.style.display = 'block';
    document.getElementById('trig-value').value = '';
}

// Show log function popup
function showLogPopup() {
    logPopup.style.display = 'block';
    document.getElementById('log-base').value = '';
    document.getElementById('log-number').value = '';
}

// Show root calculation popup
function showRootPopup() {
    rootPopup.style.display = 'block';
    document.getElementById('root-degree').value = '';
    document.getElementById('root-number').value = '';
}

// Calculate trigonometric function
function calculateTrig() {
    const value = parseFloat(document.getElementById('trig-value').value);
    
    if (isNaN(value)) {
        alert('Please enter a valid number');
        return;
    }
    
    // Save state for undo before making changes
    saveState();
    
    // Convert degrees to radians
    const radians = value * Math.PI / 180;
    let result;
    
    // Calculate the trigonometric function
    switch(currentTrigFunction) {
        case 'sin':
            result = Math.sin(radians);
            break;
        case 'cos':
            result = Math.cos(radians);
            break;
        case 'tan':
            result = Math.tan(radians);
            break;
    }
    
    // Update the display
    currentInput = `${currentTrigFunction}(${value})`;
    currentResult = result.toString();
    
    // Add to history
    if (calculationHistory.length >= 3) {
        calculationHistory.shift();
    }
    calculationHistory.push({input: currentInput, result: currentResult});
    historyIndex = calculationHistory.length - 1;
    
    updateMiniHistory();
    updateDisplay();
    trigPopup.style.display = 'none';
}

// Calculate log function
function calculateLog() {
    const base = parseFloat(document.getElementById('log-base').value);
    const number = parseFloat(document.getElementById('log-number').value);
    
    if (isNaN(base) || isNaN(number) || base <= 0 || base === 1 || number <= 0) {
        alert('Please enter valid values for log base (positive, not 1) and number (positive)');
        return;
    }
    
    // Save state for undo before making changes
    saveState();
    
    // Calculate the logarithm
    const logValue = Math.log(number) / Math.log(base);
    
    // Update the display
    currentInput = `log${base}(${number})`;
    currentResult = logValue.toString();
    
    // Add to history
    if (calculationHistory.length >= 3) {
        calculationHistory.shift();
    }
    calculationHistory.push({input: currentInput, result: currentResult});
    historyIndex = calculationHistory.length - 1;
    
    updateMiniHistory();
    updateDisplay();
    logPopup.style.display = 'none';
}

// Calculate root based on user input
function calculateRoot() {
    const degree = parseFloat(document.getElementById('root-degree').value);
    const number = parseFloat(document.getElementById('root-number').value);
    
    if (isNaN(degree) || isNaN(number) || degree === 0) {
        alert('Please enter valid values for root degree and number');
        return;
    }
    
    if (number < 0 && degree % 2 === 0) {
        alert('Even root of a negative number is not a real number');
        return;
    }
    
    // Save state for undo before making changes
    saveState();
    
    // Calculate the root
    const rootValue = Math.pow(number, 1/degree);
    
    // Update the display
    currentInput = `${degree}√(${number})`;
    currentResult = rootValue.toString();
    
    // Add to history
    if (calculationHistory.length >= 3) {
        calculationHistory.shift();
    }
    calculationHistory.push({input: currentInput, result: currentResult});
    historyIndex = calculationHistory.length - 1;
    
    updateMiniHistory();
    updateDisplay();
    rootPopup.style.display = 'none';
}

// Save current state for undo/redo
function saveState() {
    undoStack.push({
        input: currentInput,
        result: currentResult,
        history: [...calculationHistory],
        historyIndex: historyIndex
    });
    redoStack = []; // Clear redo stack when new action is performed
}

// Calculate the result
function calculate() {
    try {
        // Save state for undo before making changes
        saveState();
        
        // Convert input to evaluable expression
        let expression = currentInput
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/\^/g, '**');
        
        // Evaluate the expression
        currentResult = eval(expression).toString();
        
        // Save to history (keep only last 3 calculations)
        if (calculationHistory.length >= 3) {
            calculationHistory.shift(); // Remove the oldest calculation
        }
        calculationHistory.push({input: currentInput, result: currentResult});
        historyIndex = calculationHistory.length - 1;
        
        // Update mini history display
        updateMiniHistory();
        
        updateDisplay();
    } catch (error) {
        currentResult = 'Error';
        updateDisplay();
    }
}

// Update mini history display
function updateMiniHistory() {
    if (calculationHistory.length > 0) {
        const lastCalculation = calculationHistory[calculationHistory.length - 1];
        miniHistoryElement.textContent = `${lastCalculation.input} = ${lastCalculation.result}`;
    } else {
        miniHistoryElement.textContent = '';
    }
}

// Clear all
function clearAll() {
    // Save state for undo before making changes
    saveState();
    
    currentInput = '0';
    currentResult = '';
    updateMiniHistory();
    updateDisplay();
}

// Show calculation history in popup
function showHistory() {
    if (calculationHistory.length > 0) {
        // Clear previous history
        historyList.innerHTML = '';
        
        // Add history items
        calculationHistory.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = `${item.input} = ${item.result}`;
            historyList.appendChild(historyItem);
        });
        
        // Show popup
        historyPopup.style.display = 'block';
    } else {
        // Show message if no history
        historyList.innerHTML = '<div class="history-item">No calculation history yet</div>';
        historyPopup.style.display = 'block';
    }
}

// Undo function
function undo() {
    if (undoStack.length > 0) {
        // Save current state to redo stack
        redoStack.push({
            input: currentInput,
            result: currentResult,
            history: [...calculationHistory],
            historyIndex: historyIndex
        });
        
        // Restore previous state
        const previousState = undoStack.pop();
        currentInput = previousState.input;
        currentResult = previousState.result;
        calculationHistory = previousState.history;
        historyIndex = previousState.historyIndex;
        
        updateMiniHistory();
        updateDisplay();
    }
}

// Redo function
function redo() {
    if (redoStack.length > 0) {
        // Save current state to undo stack
        undoStack.push({
            input: currentInput,
            result: currentResult,
            history: [...calculationHistory],
            historyIndex: historyIndex
        });
        
        // Restore next state
        const nextState = redoStack.pop();
        currentInput = nextState.input;
        currentResult = nextState.result;
        calculationHistory = nextState.history;
        historyIndex = nextState.historyIndex;
        
        updateMiniHistory();
        updateDisplay();
    }
}

// Calculate date difference
function calculateDateDifference() {
    const date1 = new Date(document.getElementById('date1').value);
    const date2 = new Date(document.getElementById('date2').value);
    
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        document.getElementById('date-result').textContent = 'Please select valid dates';
        return;
    }
    
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    let resultText = `Total Days: ${diffDays}\n`;
    if (diffWeeks > 0) {
        resultText += `Weeks: ${diffWeeks}, Days: ${remainingDays}\n`;
    }
    if (diffMonths > 0) {
        resultText += `Months: ${diffMonths}\n`;
    }
    if (diffYears > 0) {
        resultText += `Years: ${diffYears}`;
    }
    
    document.getElementById('date-result').textContent = resultText;
}

// Update display
function updateDisplay() {
    inputElement.textContent = currentInput;
    resultElement.textContent = currentResult;
}