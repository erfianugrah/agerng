import { loadHistory, addToHistory, exportJSON, exportCSV } from './utils.js';
import {
  generateRandomAoE4Civ,
  finalizeAoE4Selection,
  displayAoE4Result,
  resetAoE4State,
  updateAoE4Buttons,
} from './aoe4.js';
import {
  generateRandomAoMCiv,
  finalizeAoMSelection,
  displayAoMResult,
  resetAoMState,
  updateAoMButtons,
} from './aom.js';

let history = [];

function initializeEventListeners() {
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const historyPanel = document.getElementById('historyPanel');
  const historyPopup = document.getElementById('historyPopup');
  const closePopup = document.querySelector('.close-popup');

  hamburgerMenu.addEventListener('click', () => {
    historyPanel.classList.toggle('active');
  });

  document.addEventListener('click', (event) => {
    if (!historyPanel.contains(event.target) && !hamburgerMenu.contains(event.target)) {
      historyPanel.classList.remove('active');
    }
  });

  closePopup.addEventListener('click', () => {
    historyPopup.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target === historyPopup) {
      historyPopup.style.display = 'none';
    }
  });

  document.getElementById('generateAoE4Btn').addEventListener('click', handleGenerateAoE4);
  document.getElementById('generateAoMBtn').addEventListener('click', handleGenerateAoM);
  document.getElementById('finalizeAoE4Btn').addEventListener('click', handleFinalizeAoE4);
  document.getElementById('finalizeAoMBtn').addEventListener('click', handleFinalizeAoM);
  document.getElementById('exportJSON').addEventListener('click', exportJSON);
  document.getElementById('exportCSV').addEventListener('click', exportCSV);
}

function handleGenerateAoE4() {
  const result = generateRandomAoE4Civ();
  document.getElementById('aoe4Result').innerHTML = `
    <div class="selection-result">
      <h3>Selected Civilization:</h3>
      <h4>${result.name}</h4>
    </div>
  `;
  updateAoE4Buttons();
  document.getElementById('historyPreview').style.display = 'none';
}

function handleGenerateAoM() {
  const result = generateRandomAoMCiv();
  document.getElementById('aomResult').innerHTML = `
    <div class="selection-result">
      <h3>Selected Civilization:</h3>
      <h4>${result.name}</h4>
      <h3>Major God:</h3>
      <h4>${result.god}</h4>
    </div>
  `;
  updateAoMButtons();
  document.getElementById('historyPreview').style.display = 'none';
}

function handleFinalizeAoE4() {
  const result = finalizeAoE4Selection();
  if (result) {
    displayAoE4Result(result, true);
    addToHistory(result);
    resetAoE4State();
  } else {
    console.error('Failed to finalize AoE4 selection');
  }
}

function handleFinalizeAoM() {
  const result = finalizeAoMSelection();
  if (result) {
    displayAoMResult(result, true);
    addToHistory(result);
    resetAoMState();
  } else {
    console.error('Failed to finalize AoM selection');
  }
}

function updateHistoryDisplay() {
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = '';
  history.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = `${item.game}: ${item.civilization}${item.majorGod ? ' - ' + item.majorGod : ''}`;
    li.addEventListener('click', () => displayHistoryItem(index));
    historyList.appendChild(li);
  });
}

function displayHistoryItem(index) {
  const item = history[index];
  const popupContent = document.getElementById('popupContent');
  let html = '';

  if (item.game === 'AoE IV') {
    html = `
      <div class="selection-result">
        <h3>AoE IV:</h3>
        <h4>${item.civilization}</h4>
      </div>
    `;
    html += '<ul>';
    for (const [age, choice] of Object.entries(item.ageUps)) {
      html += `<li>Age ${age}: ${choice}</li>`;
    }
    html += '</ul>';
  } else if (item.game === 'AoM') {
    html = `
      <div class="selection-result">
        <h3>AoM:</h3>
        <h4>${item.civilization}</h4>
        <h3>Major God:</h3>
        <h4>${item.majorGod}</h4>
      </div>
    `;
    html += '<ul>';
    for (const [age, god] of Object.entries(item.minorGods)) {
      html += `<li>${age} Age: ${god}</li>`;
    }
    html += '</ul>';
  }

  popupContent.innerHTML = html;
  document.getElementById('historyPopup').style.display = 'block';
}

function init() {
  history = loadHistory();
  initializeEventListeners();
  updateHistoryDisplay();
  updateAoE4Buttons();
  updateAoMButtons();
}

// Wait for the DOM to be fully loaded before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
