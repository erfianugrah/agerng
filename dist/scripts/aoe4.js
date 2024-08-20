let currentAoE4Civ = null;

function initializeAoE4Weights(civ) {
  console.log(`Initializing weights for ${civ}`);
  if (civ === 'Abbasid Dynasty' || civ === 'Ayyubids') {
    return { wings: [0.25, 0.25, 0.25, 0.25] };
  } else {
    return Object.fromEntries(
      Object.entries(aoe4AgeUpOptions[civ]).map(([age, options]) => [
        age,
        Array.isArray(options) ? [0.5, 0.5] : null,
      ])
    );
  }
}

function generateRandomAoE4Civ() {
  console.log('Generating random AoE4 civilization');
  const civ = aoe4Civilizations[Math.floor(Math.random() * aoe4Civilizations.length)];
  currentAoE4Civ = {
    name: civ,
    weights: initializeAoE4Weights(civ),
  };
  updateAoE4WeightInputs();
  updateAoE4Buttons();

  // Add this line to generate the age-ups immediately
  const ageUps = finalizeAoE4Selection(false);

  return { civilization: civ, ageUps };
}

function updateAoE4Weight(key, index, value) {
  console.log(`Updating AoE4 weight: key=${key}, index=${index}, value=${value}`);
  value = parseFloat(value);

  if (currentAoE4Civ.name === 'Abbasid Dynasty' || currentAoE4Civ.name === 'Ayyubids') {
    updateAbbasidAyyubidWeights(key, index, value);
  } else {
    updateStandardWeights(key, index, value);
  }

  updateAoE4WeightDisplay();
}

function updateAbbasidAyyubidWeights(key, index, value) {
  const totalWeight = currentAoE4Civ.weights.wings.reduce(
    (sum, w, i) => (i !== index ? sum + w : sum),
    0
  );
  currentAoE4Civ.weights.wings[index] = value;
  const scaleFactor = (1 - value) / totalWeight;
  currentAoE4Civ.weights.wings.forEach((w, i) => {
    if (i !== index) currentAoE4Civ.weights.wings[i] *= scaleFactor;
  });
}

function updateStandardWeights(key, index, value) {
  currentAoE4Civ.weights[key][index] = value;
  currentAoE4Civ.weights[key][1 - index] = 1 - value;
}

function updateAoE4WeightDisplay() {
  const weightsDiv = document.getElementById('aoe4Weights');
  const sliders = weightsDiv.querySelectorAll('.aoe4-slider');
  sliders.forEach((slider) => {
    const key = slider.dataset.key;
    const index = parseInt(slider.dataset.index);
    const value =
      currentAoE4Civ.name === 'Abbasid Dynasty' || currentAoE4Civ.name === 'Ayyubids'
        ? currentAoE4Civ.weights.wings[index]
        : currentAoE4Civ.weights[key][index];
    slider.value = value;
    slider.nextElementSibling.textContent = (value * 100).toFixed(0) + '%';
  });
}

function updateAoE4WeightInputs() {
  console.log('Updating AoE4 weight inputs');
  const weightsDiv = document.getElementById('aoe4Weights');
  if (!weightsDiv) {
    console.error('aoe4Weights div not found');
    return;
  }

  if (!currentAoE4Civ) {
    weightsDiv.innerHTML =
      '<p class="placeholder-text">Generate an Age of Empires IV civilization to adjust weights.</p>';
    weightsDiv.classList.add('weights-box-empty');
    return;
  }

  // Remove the empty class
  weightsDiv.classList.remove('weights-box-empty');
  let html = '<h3>Weights for ' + currentAoE4Civ.name + ':</h3>';

  if (currentAoE4Civ.name === 'Abbasid Dynasty' || currentAoE4Civ.name === 'Ayyubids') {
    html += generateAbbasidAyyubidHTML();
  } else {
    html += generateStandardHTML();
  }

  console.log('Generated HTML for weights:', html);
  weightsDiv.innerHTML = html;

  // Add event listeners for all sliders
  const sliders = weightsDiv.querySelectorAll('.aoe4-slider');
  console.log(`Found ${sliders.length} AoE4 sliders`);
  sliders.forEach((slider) => {
    slider.addEventListener('input', handleAoE4SliderInput);
  });
}

function handleAoE4SliderInput(event) {
  const slider = event.target;
  const key = slider.dataset.key;
  const index = parseInt(slider.dataset.index);
  const value = parseFloat(slider.value);
  updateAoE4Weight(key, index, value);
}

function updateAoE4Buttons() {
  const additionalButtonsDiv = document.getElementById('aoe4AdditionalButtons');
  const generateBtn = document.getElementById('generateAoE4Btn');
  const finalizeBtn = document.getElementById('finalizeAoE4Btn');

  if (!additionalButtonsDiv || !generateBtn || !finalizeBtn) {
    console.error('One or more AoE4 button elements not found');
    return;
  }

  // Update additional buttons
  if (currentAoE4Civ) {
    const buttonText =
      currentAoE4Civ.name === 'Abbasid Dynasty' || currentAoE4Civ.name === 'Ayyubids'
        ? 'Roll Wings'
        : 'Roll Landmarks';
    additionalButtonsDiv.innerHTML = `
      <button id="rerollAoE4LandmarksBtn">${buttonText}</button>
    `;

    // Set up event listener
    document
      .getElementById('rerollAoE4LandmarksBtn')
      .addEventListener('click', rerollAoE4Landmarks);
  } else {
    additionalButtonsDiv.innerHTML = '';
  }

  // Remove existing event listeners before adding new ones
  finalizeBtn.removeEventListener('click', finalizeAoE4ButtonHandler);
  if (currentAoE4Civ) {
    finalizeBtn.addEventListener('click', finalizeAoE4ButtonHandler);
  }

  // Show/hide buttons as needed
  generateBtn.style.display = currentAoE4Civ ? 'none' : 'inline-block';
  finalizeBtn.style.display = currentAoE4Civ ? 'inline-block' : 'none';
  additionalButtonsDiv.style.display = currentAoE4Civ ? 'block' : 'none';
}

function rerollAoE4Landmarks() {
  console.log('Re-rolling landmarks for current AoE4 civilization');
  if (!currentAoE4Civ) {
    console.error('No current AoE4 civilization selected');
    return;
  }

  const result = finalizeAoE4Selection(false);
  displayAoE4Result(result);
}

function finalizeAoE4Selection(addToHistory = true) {
  console.log('Finalizing AoE4 selection');
  if (!currentAoE4Civ) {
    console.error('No current AoE4 civilization selected');
    return null;
  }

  let ageUps;
  if (currentAoE4Civ.name === 'Abbasid Dynasty' || currentAoE4Civ.name === 'Ayyubids') {
    ageUps = finalizeAbbasidAyyubidSelection();
  } else {
    ageUps = finalizeStandardSelection();
  }

  const result = { game: 'AoE IV', civilization: currentAoE4Civ.name, ageUps };
  console.log('AoE4 finalized result:', result);

  // Remove the addToHistory call from here
  return result;
}

function finalizeAbbasidAyyubidSelection() {
  const wings = [...aoe4AgeUpOptions[currentAoE4Civ.name]];
  const weights = [...currentAoE4Civ.weights.wings];
  const selectedWings = [];
  for (let i = 0; i < 3; i++) {
    const wing = weightedRandomChoice(wings, weights);
    selectedWings.push(wing);
    const index = wings.indexOf(wing);
    wings.splice(index, 1);
    weights.splice(index, 1);
  }

  if (currentAoE4Civ.name === 'Abbasid Dynasty') {
    return {
      II: selectedWings[0],
      III: selectedWings[1],
      IV: selectedWings[2],
    };
  } else {
    // Ayyubids
    return Object.fromEntries(
      ['II', 'III', 'IV'].map((age, index) => {
        const wing = selectedWings[index];
        const bonusTypes = Object.keys(aoe4AyyubidBonuses[wing]);
        const bonusType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
        return [age, `${wing} - ${bonusType}: ${aoe4AyyubidBonuses[wing][bonusType][age]}`];
      })
    );
  }
}

function finalizeStandardSelection() {
  const ageUps = {};
  for (const [age, options] of Object.entries(aoe4AgeUpOptions[currentAoE4Civ.name])) {
    if (Array.isArray(options)) {
      ageUps[age] = weightedRandomChoice(options, currentAoE4Civ.weights[age]);
    }
  }
  return ageUps;
}

function finalizeAoE4ButtonHandler() {
  const result = finalizeAoE4Selection(true);
  if (result) {
    displayAoE4Result(result, true);
    resetAoE4State();
  } else {
    console.error('Failed to finalize AoE4 selection');
  }
}

function resetAoE4State() {
  currentAoE4Civ = null;
  updateAoE4Buttons();
  updateAoE4WeightInputs();

  // Reset result box to empty state
  const resultDiv = document.getElementById('aoe4Result');
  if (resultDiv) {
    resultDiv.innerHTML =
      '<p class="placeholder-text">Generate an Age of Empires IV civilization to see the result here.</p>';
    resultDiv.classList.add('result-box-empty');
  }
}

function displayAoE4Result(result, isFinalized = false) {
  console.log('Displaying AoE4 result', result);
  const resultDiv = document.getElementById('aoe4Result');
  if (!resultDiv) {
    console.error('aoe4Result div not found');
    return;
  }

  // Remove the empty class
  resultDiv.classList.remove('result-box-empty');

  const civName = result.civilization || result.name;
  const civSlug = AOE4_CIVILIZATIONS[civName];

  let html = `
    <div class="selection-result">
      <h3>Selected Civilization:</h3>
      <h4><a href="https://aoe4world.com/explorer/civs/${civSlug}" target="_blank">${civName}</a></h4>
    </div>`;

  if (result.ageUps) {
    html += '<ul>';
    for (const [age, choice] of Object.entries(result.ageUps)) {
      let linkUrl;
      if (civName === 'Abbasid Dynasty' || civName === 'Ayyubids') {
        const wingSlug = choice.toLowerCase().replace(/\s+/g, '-');
        linkUrl = `https://aoe4world.com/explorer/civs/${civSlug}/technologies/${age.toLowerCase()}-${wingSlug}-advancement`;
      } else {
        const buildingSlug = choice.toLowerCase().replace(/\s+/g, '-');
        linkUrl = `https://aoe4world.com/explorer/civs/${civSlug}/buildings/${buildingSlug}`;
      }
      html += `<li>Age ${age}: <a href="${linkUrl}" target="_blank">${choice}</a></li>`;
    }
    html += '</ul>';
  }

  if (isFinalized) {
    html += '<p><strong>This result has been finalised and added to history.</strong></p>';
  }
  resultDiv.innerHTML = html;
}

function generateAbbasidAyyubidHTML() {
  let html = '<div class="weight-group"><h4>Wings (Adjust to set initial probabilities)</h4>';
  const wings = aoe4AgeUpOptions[currentAoE4Civ.name];
  wings.forEach((wing, index) => {
    html += `
      <div class="weight-item-wrapper">
        <div class="weight-item">
          <span class="weight-label">${wing}</span>
          <input type="range" class="weight-slider aoe4-slider" min="0" max="1" step="0.01" value="${currentAoE4Civ.weights.wings[index]}"
            data-key="wings" data-index="${index}">
          <span class="weight-value">${(currentAoE4Civ.weights.wings[index] * 100).toFixed(0)}%</span>
        </div>
      </div>
    `;
  });
  html += '</div>';
  return html;
}

function generateStandardHTML() {
  let html = '';
  for (const [age, options] of Object.entries(aoe4AgeUpOptions[currentAoE4Civ.name])) {
    if (Array.isArray(options)) {
      html += `<div class="weight-group"><h4>Age ${age}</h4>`;
      options.forEach((option, index) => {
        html += `
          <div class="weight-item-wrapper">
            <div class="weight-item">
              <span class="weight-label">${option}</span>
              <input type="range" class="weight-slider aoe4-slider" min="0" max="1" step="0.01" value="${currentAoE4Civ.weights[age][index]}"
                data-key="${age}" data-index="${index}">
              <span class="weight-value">${(currentAoE4Civ.weights[age][index] * 100).toFixed(0)}%</span>
            </div>
          </div>
        `;
      });
      html += '</div>';
    }
  }
  return html;
}

// Make functions globally available
globalThis.generateRandomAoE4Civ = generateRandomAoE4Civ;
globalThis.finalizeAoE4Selection = finalizeAoE4Selection;
globalThis.displayAoE4Result = displayAoE4Result;
globalThis.resetAoE4State = resetAoE4State;
globalThis.updateAoE4Buttons = updateAoE4Buttons;

// Assume weightedRandomChoice function is defined elsewhere
// function weightedRandomChoice(options, weights) { ... }
