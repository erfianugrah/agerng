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
  currentAoE4Civ = { name: civ, weights: initializeAoE4Weights(civ) };
  updateAoE4WeightInputs();
  return currentAoE4Civ;
}

function updateAoE4WeightInputs() {
  console.log('Updating AoE4 weight inputs');
  const weightsDiv = document.getElementById('aoe4Weights');
  if (!weightsDiv) {
    console.error('aoe4Weights div not found');
    return;
  }

  let html = '<h3>Weights for ' + currentAoE4Civ.name + ':</h3>';

  if (currentAoE4Civ.name === 'Abbasid Dynasty' || currentAoE4Civ.name === 'Ayyubids') {
    html += '<div class="weight-group"><h4>Wings (Adjust to set initial probabilities)</h4>';
    const wings = aoe4AgeUpOptions[currentAoE4Civ.name];
    wings.forEach((wing, index) => {
      html += `
      <div class="weight-item">
        <span class="weight-label">${option}</span>
        <input type="range" class="weight-slider aoe4-slider" min="0" max="1" step="0.01" value="${currentAoE4Civ.weights[age][index]}"
          data-key="${age}" data-index="${index}">
        <span class="weight-value">${(currentAoE4Civ.weights[age][index] * 100).toFixed(0)}%</span>
      </div>
    `;
    });
    html += '</div>';
  } else {
    for (const [age, options] of Object.entries(aoe4AgeUpOptions[currentAoE4Civ.name])) {
      if (Array.isArray(options)) {
        html += `<div class="weight-group"><h4>Age ${age}</h4>`;
        options.forEach((option, index) => {
          html += `
            <div class="weight-item">
              <span class="weight-label">${option}</span>
              <input type="range" class="weight-slider aoe4-slider" min="0" max="1" step="0.01" value="${currentAoE4Civ.weights[age][index]}"
                data-key="${age}" data-index="${index}">
              <span class="weight-value">${currentAoE4Civ.weights[age][index].toFixed(2)}</span>
            </div>
          `;
        });
        html += '</div>';
      }
    }
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

function updateAoE4Weight(key, index, value) {
  console.log(`Updating AoE4 weight: key=${key}, index=${index}, value=${value}`);
  value = parseFloat(value);

  if (currentAoE4Civ.name === 'Abbasid Dynasty' || currentAoE4Civ.name === 'Ayyubids') {
    // Existing logic for Abbasid Dynasty and Ayyubids
    const totalWeight = currentAoE4Civ.weights.wings.reduce(
      (sum, w, i) => (i !== index ? sum + w : sum),
      0
    );
    currentAoE4Civ.weights.wings[index] = value;
    const scaleFactor = (1 - value) / totalWeight;
    currentAoE4Civ.weights.wings.forEach((w, i) => {
      if (i !== index) currentAoE4Civ.weights.wings[i] *= scaleFactor;
    });
  } else {
    // New logic for other civilizations
    const oldValue = currentAoE4Civ.weights[key][index];
    const change = value - oldValue;

    currentAoE4Civ.weights[key][index] = value;
    currentAoE4Civ.weights[key][1 - index] = Math.max(
      0,
      Math.min(1, currentAoE4Civ.weights[key][1 - index] - change)
    );

    // Normalize to ensure sum is 1
    const sum = currentAoE4Civ.weights[key][0] + currentAoE4Civ.weights[key][1];
    currentAoE4Civ.weights[key][0] /= sum;
    currentAoE4Civ.weights[key][1] /= sum;
  }

  console.log('Updated AoE4 weights:', currentAoE4Civ.weights);
  updateAoE4WeightInputs();
}

function handleAoE4SliderInput(event) {
  console.log('AoE4 Slider input event triggered');
  const slider = event.target;
  const key = slider.dataset.key;
  const index = parseInt(slider.dataset.index);
  const value = parseFloat(slider.value);
  updateAoE4Weight(key, index, value);
}

function finalizeAoE4Selection() {
  console.log('Finalizing AoE4 selection');
  if (!currentAoE4Civ) {
    console.error('No current AoE4 civilization selected');
    return;
  }

  const ageUps = {};
  if (currentAoE4Civ.name === 'Abbasid Dynasty' || currentAoE4Civ.name === 'Ayyubids') {
    const wings = [...aoe4AgeUpOptions[currentAoE4Civ.name]];
    let weights = [...currentAoE4Civ.weights.wings];
    const selectedWings = [];
    for (let i = 0; i < 3; i++) {
      const wing = weightedRandomChoice(wings, weights);
      selectedWings.push(wing);
      const index = wings.indexOf(wing);
      wings.splice(index, 1);
      weights.splice(index, 1);
    }

    if (currentAoE4Civ.name === 'Abbasid Dynasty') {
      ageUps['II'] = selectedWings[0];
      ageUps['III'] = selectedWings[1];
      ageUps['IV'] = selectedWings[2];
    } else {
      // Ayyubids
      for (const [index, age] of ['II', 'III', 'IV'].entries()) {
        const wing = selectedWings[index];
        const bonusTypes = Object.keys(aoe4AyyubidBonuses[wing]);
        const bonusType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
        ageUps[age] = `${wing} - ${bonusType}: ${aoe4AyyubidBonuses[wing][bonusType][age]}`;
      }
    }
  } else {
    for (const [age, options] of Object.entries(aoe4AgeUpOptions[currentAoE4Civ.name])) {
      if (Array.isArray(options)) {
        ageUps[age] = weightedRandomChoice(options, currentAoE4Civ.weights[age]);
      }
    }
  }

  const result = { game: 'AoE IV', civilization: currentAoE4Civ.name, ageUps };
  addToHistory(result);
  displayAoE4Result(result);
}

function displayAoE4Result(result) {
  console.log('Displaying AoE4 result', result);
  const resultDiv = document.getElementById('aoe4Result');
  if (!resultDiv) {
    console.error('aoe4Result div not found');
    return;
  }
  let html = `<h3>Result: ${result.civilization}</h3>`;
  html += '<ul>';
  for (const [age, choice] of Object.entries(result.ageUps)) {
    html += `<li>Age ${age}: ${choice}</li>`;
  }
  html += '</ul>';
  resultDiv.innerHTML = html;
}

// Note: The following functions/variables are assumed to be defined elsewhere:
// - aoe4Civilizations (array of civilization names)
// - aoe4AgeUpOptions (object containing age-up options for each civilization)
// - aoe4AyyubidBonuses (object containing bonus options for Ayyubids)
// - weightedRandomChoice(options, weights) (function to choose an option based on weights)
// - addToHistory(result) (function to add the result to history)
