import { weightedRandomChoice } from './utils.js';
import { aomCivilizations, aomGods } from './civgods.js';

let currentAoMCiv = null;

function initializeAoMWeights(civ, god) {
  return {
    Classical: [0.5, 0.5],
    Heroic: [0.5, 0.5],
    Mythic: [0.5, 0.5],
  };
}

export function generateRandomAoMCiv() {
  const civ = aomCivilizations[Math.floor(Math.random() * aomCivilizations.length)];
  const majorGod = aomGods[civ].major[Math.floor(Math.random() * aomGods[civ].major.length)];
  currentAoMCiv = { name: civ, god: majorGod, weights: initializeAoMWeights(civ, majorGod) };
  updateAoMWeightInputs();
  updateAoMButtons();
  return currentAoMCiv;
}

function updateAoMWeight(key, index, value) {
  value = parseFloat(value);
  currentAoMCiv.weights[key][index] = value;
  currentAoMCiv.weights[key][1 - index] = 1 - value;

  // Update the displayed values
  updateAoMWeightDisplay();
}

function updateAoMWeightDisplay() {
  const weightsDiv = document.getElementById('aomWeights');
  const sliders = weightsDiv.querySelectorAll('.weight-slider');
  sliders.forEach((slider) => {
    const key = slider.dataset.key;
    const index = parseInt(slider.dataset.index);
    const value = currentAoMCiv.weights[key][index];
    slider.value = value;
    slider.nextElementSibling.textContent = (value * 100).toFixed(0) + '%';
  });
}

function updateAoMWeightInputs() {
  const weightsDiv = document.getElementById('aomWeights');
  if (!weightsDiv) {
    console.error('aomWeights div not found');
    return;
  }

  if (!currentAoMCiv) {
    weightsDiv.innerHTML = ''; // Clear the content if no civilization is selected
    return;
  }

  let html = `<h3>Weights for ${currentAoMCiv.name} - ${currentAoMCiv.god}:</h3>`;
  for (const age of ['Classical', 'Heroic', 'Mythic']) {
    const options = aomGods[currentAoMCiv.name].minor[currentAoMCiv.god][age];
    html += `<div class="weight-group"><h4>${age} Age</h4>`;
    options.forEach((option, index) => {
      html += `
        <div class="weight-item">
          <span class="weight-label">${option}</span>
          <input type="range" class="weight-slider" min="0" max="1" step="0.01" value="${currentAoMCiv.weights[age][index]}"
            data-key="${age}" data-index="${index}">
          <span class="weight-value">${(currentAoMCiv.weights[age][index] * 100).toFixed(0)}%</span>
        </div>
      `;
    });
    html += '</div>';
  }
  weightsDiv.innerHTML = html;

  // Add event listeners for all sliders
  const sliders = weightsDiv.querySelectorAll('.weight-slider');
  sliders.forEach((slider) => {
    slider.addEventListener('input', handleAoMSliderInput);
  });
}

function handleAoMSliderInput(event) {
  const slider = event.target;
  const key = slider.dataset.key;
  const index = parseInt(slider.dataset.index);
  const value = parseFloat(slider.value);
  updateAoMWeight(key, index, value);
}

function updateAoMButtons() {
  const additionalButtonsDiv = document.getElementById('aomAdditionalButtons');
  const generateBtn = document.getElementById('generateAoMBtn');
  const finalizeBtn = document.getElementById('finalizeAoMBtn');

  if (!additionalButtonsDiv || !generateBtn || !finalizeBtn) {
    console.error('One or more AoM button elements not found');
    return;
  }

  // Update additional buttons
  additionalButtonsDiv.innerHTML = currentAoMCiv
    ? `
    <button id="rerollAoMGodsBtn">Roll Gods</button>
  `
    : '';

  // Set up event listeners
  if (currentAoMCiv) {
    document.getElementById('rerollAoMGodsBtn').addEventListener('click', rerollAoMGods);
  }

  // Remove existing event listeners before adding new ones
  finalizeBtn.removeEventListener('click', finalizeAoMButtonHandler);
  if (currentAoMCiv) {
    finalizeBtn.addEventListener('click', finalizeAoMButtonHandler);
  }

  // Show/hide buttons as needed
  generateBtn.style.display = currentAoMCiv ? 'none' : 'inline-block';
  finalizeBtn.style.display = currentAoMCiv ? 'inline-block' : 'none';
  additionalButtonsDiv.style.display = currentAoMCiv ? 'block' : 'none';
}

function rerollAoMGods() {
  if (!currentAoMCiv) {
    console.error('No current AoM civilization selected');
    return;
  }

  const result = finalizeAoMSelection(false);
  displayAoMResult(result);
}

export function finalizeAoMSelection(addToHistory = true) {
  if (!currentAoMCiv) return null;
  const minorGods = {};
  for (const age of ['Classical', 'Heroic', 'Mythic']) {
    const options = aomGods[currentAoMCiv.name].minor[currentAoMCiv.god][age];
    minorGods[age] = weightedRandomChoice(options, currentAoMCiv.weights[age]);
  }
  const result = {
    game: 'AoM',
    civilization: currentAoMCiv.name,
    majorGod: currentAoMCiv.god,
    minorGods,
  };
  if (addToHistory) {
    try {
      if (typeof window.addToHistory === 'function') {
        window.addToHistory(result);
      } else {
        console.warn('addToHistory is not a function. History will not be updated.');
      }
    } catch (error) {
      console.error('Error while adding to history:', error);
    }
  }
  return result;
}

function finalizeAoMButtonHandler() {
  const result = finalizeAoMSelection(true);
  if (result) {
    displayAoMResult(result, true);
    resetAoMState();
  } else {
    console.error('Failed to finalize AoM selection');
  }
}

export function resetAoMState() {
  currentAoMCiv = null;
  updateAoMButtons();
  updateAoMWeightInputs(); // This will now clear the weights div
}

export function displayAoMResult(result, isFinalized = false) {
  const resultDiv = document.getElementById('aomResult');
  let html = `
    <div class="selection-result">
      <h3>Selected Civilization:</h3>
      <h4>${result.civilization}</h4>
      <h3>Major God:</h3>
      <h4>${result.majorGod}</h4>
    </div>`;
  html += '<ul>';
  for (const [age, god] of Object.entries(result.minorGods)) {
    html += `<li>${age} Age: ${god}</li>`;
  }
  html += '</ul>';
  if (isFinalized) {
    html += '<p><strong>This result has been finalised and added to history.</strong></p>';
  }
  resultDiv.innerHTML = html;
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
  updateAoMButtons();
});
