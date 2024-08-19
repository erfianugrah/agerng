let currentAoE4Civ = null;

function initializeAoE4Weights(civ) {
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

function updateAoE4Weight(key, index, value) {
  value = parseFloat(value);
  if (currentAoE4Civ.name === 'Abbasid Dynasty' || currentAoE4Civ.name === 'Ayyubids') {
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
    currentAoE4Civ.weights[key][index] = value;
    currentAoE4Civ.weights[key][1 - index] = 1 - value;
  }
  updateAoE4WeightInputs();
}

function updateAoE4WeightInputs() {
  const weightsDiv = document.getElementById('aoe4Weights');
  let html = '<h3>Weights for ' + currentAoE4Civ.name + ':</h3>';

  if (currentAoE4Civ.name === 'Abbasid Dynasty' || currentAoE4Civ.name === 'Ayyubids') {
    html += '<div class="weight-group"><h4>Wings (Adjust to set initial probabilities)</h4>';
    const wings = aoe4AgeUpOptions[currentAoE4Civ.name];
    wings.forEach((wing, index) => {
      html += `
        <div class="weight-item">
          <span class="weight-label">${wing}</span>
          <input type="range" class="weight-slider" min="0" max="1" step="0.01" value="${currentAoE4Civ.weights.wings[index]}"
            oninput="updateAoE4Weight('wings', ${index}, this.value)">
          <span class="weight-value">${currentAoE4Civ.weights.wings[index].toFixed(2)}</span>
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
              <input type="range" class="weight-slider" min="0" max="1" step="0.01" value="${currentAoE4Civ.weights[age][index]}"
                oninput="updateAoE4Weight('${age}', ${index}, this.value)">
              <span class="weight-value">${currentAoE4Civ.weights[age][index].toFixed(2)}</span>
            </div>
          `;
        });
        html += '</div>';
      }
    }
  }

  weightsDiv.innerHTML = html;
}

function generateRandomAoE4Civ() {
  const civ = aoe4Civilizations[Math.floor(Math.random() * aoe4Civilizations.length)];
  currentAoE4Civ = { name: civ, weights: initializeAoE4Weights(civ) };
  updateAoE4WeightInputs();
  return currentAoE4Civ;
}

function finalizeAoE4Selection() {
  if (!currentAoE4Civ) return;

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
  const resultDiv = document.getElementById('aoe4Result');
  let html = `<h3>Result: ${result.civilization}</h3>`;
  html += '<ul>';
  for (const [age, choice] of Object.entries(result.ageUps)) {
    html += `<li>Age ${age}: ${choice}</li>`;
  }
  html += '</ul>';
  resultDiv.innerHTML = html;
}
