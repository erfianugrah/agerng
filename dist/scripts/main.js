// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);

// Initialization function
function initializeApp() {
  loadHistory();
  setupEventListeners();
  updateAoE4Buttons();
  updateAoMButtons();
}

// Setup event listeners
function setupEventListeners() {
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const historyPanel = document.getElementById('historyPanel');
  const historyPopup = document.getElementById('historyPopup');
  const closePopup = document.querySelector('.close-popup');

  hamburgerMenu.addEventListener('click', toggleHistoryPanel);
  document.addEventListener('click', closeHistoryPanelOutside);
  closePopup.addEventListener('click', () => (historyPopup.style.display = 'none'));
  globalThis.addEventListener('click', closeHistoryPopupOutside);

  document.getElementById('generateAoE4Btn').addEventListener('click', handleGenerateAoE4);
  document.getElementById('generateAoMBtn').addEventListener('click', handleGenerateAoM);
  document.getElementById('finalizeAoE4Btn').addEventListener('click', handleFinalizeAoE4);
  document.getElementById('finalizeAoMBtn').addEventListener('click', handleFinalizeAoM);
  document.getElementById('exportJSON').addEventListener('click', exportJSON);
  document.getElementById('exportCSV').addEventListener('click', exportCSV);

  function toggleHistoryPanel() {
    historyPanel.classList.toggle('active');
  }

  function closeHistoryPanelOutside(event) {
    if (!historyPanel.contains(event.target) && !hamburgerMenu.contains(event.target)) {
      historyPanel.classList.remove('active');
    }
  }

  function closeHistoryPopupOutside(event) {
    if (event.target === historyPopup) {
      historyPopup.style.display = 'none';
    }
  }
}

// Handler functions
function handleGenerateAoE4() {
  console.log('handleGenerateAoE4 called');
  const result = generateRandomAoE4Civ();
  displayAoE4Result(result, false);
  updateButtonVisibility('aoe4', true);
  document.getElementById('historyPreview').style.display = 'none';
  console.log('handleGenerateAoE4 completed');
}

function handleGenerateAoM() {
  console.log('handleGenerateAoM called');
  const result = generateRandomAoMCiv();
  displayAoMResult(result, false);
  updateButtonVisibility('aom', true);
  document.getElementById('historyPreview').style.display = 'none';
  console.log('handleGenerateAoM completed');
}

function handleFinalizeAoE4() {
  console.log('handleFinalizeAoE4 called');
  const result = finalizeAoE4Selection(false);
  if (result) {
    displayAoE4Result(result, true);
    addToHistory(result);
    resetAoE4State();
  } else {
    console.error('Failed to finalize AoE4 selection');
  }
  console.log('handleFinalizeAoE4 completed');
}

function handleFinalizeAoM() {
  console.log('handleFinalizeAoM called');
  const result = finalizeAoMSelection(false);
  if (result) {
    displayAoMResult(result, true);
    addToHistory(result);
    resetAoMState();
  } else {
    console.error('Failed to finalize AoM selection');
  }
  console.log('handleFinalizeAoM completed');
}

// Helper functions
function updateButtonVisibility(game, isGenerating) {
  const generateBtn = document.getElementById(`generate${game.toUpperCase()}Btn`);
  const finalizeBtn = document.getElementById(`finalize${game.toUpperCase()}Btn`);
  generateBtn.style.display = isGenerating ? 'none' : 'inline-block';
  finalizeBtn.style.display = isGenerating ? 'inline-block' : 'none';
}

function displayHistoryItem(index) {
  const item = history[index];
  const popupContent = document.getElementById('popupContent');
  let html = '';

  if (item.game === 'AoE IV') {
    html = generateAoE4HistoryHTML(item);
  } else if (item.game === 'AoM') {
    html = generateAoMHistoryHTML(item);
  }

  popupContent.innerHTML = html;
  document.getElementById('historyPopup').style.display = 'block';
}

function generateAoE4HistoryHTML(item) {
  const civSlug = AOE4_CIVILIZATIONS[item.civilization];
  let html = `
    <div class="selection-result">
      <h3>AoE IV:</h3>
      <h4><a href="https://aoe4world.com/explorer/civs/${civSlug}" target="_blank">${item.civilization}</a></h4>
    </div>
    <ul>`;

  for (const [age, choice] of Object.entries(item.ageUps)) {
    const linkUrl = getAoE4LinkUrl(item.civilization, civSlug, age, choice);
    html += `<li>Age ${age}: <a href="${linkUrl}" target="_blank">${choice}</a></li>`;
  }
  html += '</ul>';
  return html;
}

function generateAoMHistoryHTML(item) {
  let html = `
    <div class="selection-result">
      <h3>AoM:</h3>
      <h4>${item.civilization}</h4>
      <h3>Major God:</h3>
      <h4>${item.majorGod}</h4>
    </div>
    <ul>`;

  for (const [age, god] of Object.entries(item.minorGods)) {
    html += `<li>${age} Age: ${god}</li>`;
  }
  html += '</ul>';
  return html;
}

function getAoE4LinkUrl(civilization, civSlug, age, choice) {
  if (civilization === 'Abbasid Dynasty' || civilization === 'Ayyubids') {
    const wingSlug = choice.split(' - ')[0].toLowerCase().replace(/\s+/g, '-');
    return `https://aoe4world.com/explorer/civs/${civSlug}/technologies/${age.toLowerCase()}-${wingSlug}-advancement`;
  } else {
    const buildingSlug = choice.toLowerCase().replace(/\s+/g, '-');
    return `https://aoe4world.com/explorer/civs/${civSlug}/buildings/${buildingSlug}`;
  }
}

// Make functions globally available
globalThis.addToHistory = addToHistory;
globalThis.displayHistoryItem = displayHistoryItem;
