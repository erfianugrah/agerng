// DOM Elements
const elements = {
  hamburgerMenu: document.getElementById('hamburger-menu'),
  historyPanel: document.getElementById('historyPanel'),
  historyPopup: document.getElementById('historyPopup'),
  closePopup: document.querySelector('.close-popup'),
  historyPreview: document.getElementById('historyPreview'),
  generateAoE4Btn: document.getElementById('generateAoE4Btn'),
  generateAoMBtn: document.getElementById('generateAoMBtn'),
  finalizeAoE4Btn: document.getElementById('finalizeAoE4Btn'),
  finalizeAoMBtn: document.getElementById('finalizeAoMBtn'),
  exportJSONBtn: document.getElementById('exportJSON'),
  exportCSVBtn: document.getElementById('exportCSV'),
};

// Event Listeners
function setupEventListeners() {
  elements.hamburgerMenu.addEventListener('click', toggleHistoryPanel);
  document.addEventListener('click', closeHistoryPanelOutside);
  elements.closePopup.addEventListener('click', closeHistoryPopup);
  globalThis.addEventListener('click', closeHistoryPopupOutside);

  elements.generateAoE4Btn.addEventListener('click', handleGenerateAoE4);
  elements.generateAoMBtn.addEventListener('click', handleGenerateAoM);
  elements.finalizeAoE4Btn.addEventListener('click', handleFinalizeAoE4);
  elements.finalizeAoMBtn.addEventListener('click', handleFinalizeAoM);

  elements.exportJSONBtn.addEventListener('click', exportJSON);
  elements.exportCSVBtn.addEventListener('click', exportCSV);
}

// UI Functions
function toggleHistoryPanel() {
  elements.historyPanel.classList.toggle('active');
}

function closeHistoryPanelOutside(event) {
  if (
    !elements.historyPanel.contains(event.target) &&
    !elements.hamburgerMenu.contains(event.target)
  ) {
    elements.historyPanel.classList.remove('active');
  }
}

function closeHistoryPopup() {
  elements.historyPopup.style.display = 'none';
}

function closeHistoryPopupOutside(event) {
  if (event.target === elements.historyPopup) {
    closeHistoryPopup();
  }
}

function displayHistoryPreview(index) {
  const item = history[index];
  let html = '';

  if (item.game === 'AoE IV') {
    html = generateAoE4PreviewHTML(item);
  } else if (item.game === 'AoM') {
    html = generateAoMPreviewHTML(item);
  }

  elements.historyPreview.innerHTML = html;
  elements.historyPreview.style.display = 'block';
}

function generateAoE4PreviewHTML(item) {
  let html = `
    <div class="preview-content">
      <h3 class="preview-title">Age of Empires IV</h3>
      <h4 class="preview-subtitle">Civilization: ${item.civilization}</h4>
      <h5 class="preview-section-title">Age Ups:</h5>
      <ul class="preview-list">
  `;
  for (const [age, choice] of Object.entries(item.ageUps)) {
    html += `<li><strong>Age ${age}:</strong> ${choice}</li>`;
  }
  html += `
      </ul>
    </div>
  `;
  return html;
}

function generateAoMPreviewHTML(item) {
  let html = `
    <div class="preview-content">
      <h3 class="preview-title">Age of Mythology</h3>
      <h4 class="preview-subtitle">Civilization: ${item.civilization}</h4>
      <h5 class="preview-section-title">Major God: ${item.majorGod}</h5>
      <h5 class="preview-section-title">Minor Gods:</h5>
      <ul class="preview-list">
  `;
  for (const [age, god] of Object.entries(item.minorGods)) {
    html += `<li><strong>${age} Age:</strong> ${god}</li>`;
  }
  html += `
      </ul>
    </div>
  `;
  return html;
}

// Game Logic Functions
function handleGenerateAoE4() {
  console.log('Generating AoE IV civilization');
  const result = generateRandomAoE4Civ();
  displayAoE4Result(result, false);
  elements.generateAoE4Btn.style.display = 'none';
  elements.finalizeAoE4Btn.style.display = 'inline-block';
  elements.historyPreview.style.display = 'none';
}

function handleGenerateAoM() {
  console.log('Generating AoM civilization');
  const result = generateRandomAoMCiv();
  displayAoMResult(result, false);
  elements.generateAoMBtn.style.display = 'none';
  elements.finalizeAoMBtn.style.display = 'inline-block';
  elements.historyPreview.style.display = 'none';
}

function handleFinalizeAoE4() {
  console.log('Finalizing AoE IV selection');
  const result = finalizeAoE4Selection(false);
  if (result) {
    displayAoE4Result(result, true);
    addToHistory(result);
    resetAoE4State();
  } else {
    console.error('Failed to finalize AoE IV selection');
  }
}

function handleFinalizeAoM() {
  console.log('Finalizing AoM selection');
  const result = finalizeAoMSelection(false);
  if (result) {
    displayAoMResult(result, true);
    addToHistory(result);
    resetAoMState();
  } else {
    console.error('Failed to finalize AoM selection');
  }
}

// Initialization
function init() {
  loadHistory();
  setupEventListeners();
  updateAoE4Buttons();
  updateAoMButtons();
}

// Start the application
document.addEventListener('DOMContentLoaded', init);

// Make necessary functions globally available
globalThis.addToHistory = addToHistory;
globalThis.displayHistoryItem = displayHistoryPreview;
