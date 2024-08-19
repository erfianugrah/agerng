let currentAoMCiv = null;

function initializeAoMWeights(civ, god) {
  return {
    Classical: [0.5, 0.5],
    Heroic: [0.5, 0.5],
    Mythic: [0.5, 0.5],
  };
}

function updateAoMWeight(key, index, value) {
  value = parseFloat(value);
  currentAoMCiv.weights[key][index] = value;
  currentAoMCiv.weights[key][1 - index] = 1 - value;
  updateAoMWeightInputs();
}

function updateAoMWeightInputs() {
  const weightsDiv = document.getElementById('aomWeights');
  let html = `<h3>Weights for ${currentAoMCiv.name} - ${currentAoMCiv.god}:</h3>`;

  for (const age of ['Classical', 'Heroic', 'Mythic']) {
    const options = aomGods[currentAoMCiv.name].minor[currentAoMCiv.god][age];
    html += `<div class="weight-group"><h4>${age} Age</h4>`;
    options.forEach((option, index) => {
      html += `
        <div class="weight-item">
          <span class="weight-label">${option}</span>
          <input type="range" class="weight-slider" min="0" max="1" step="0.01" value="${currentAoMCiv.weights[age][index]}"
            oninput="updateAoMWeight('${age}', ${index}, this.value)">
          <span class="weight-value">${currentAoMCiv.weights[age][index].toFixed(2)}</span>
        </div>
      `;
    });
    html += '</div>';
  }

  weightsDiv.innerHTML = html;
}

function generateRandomAoMCiv() {
  const civ = aomCivilizations[Math.floor(Math.random() * aomCivilizations.length)];
  const majorGod = aomGods[civ].major[Math.floor(Math.random() * aomGods[civ].major.length)];
  currentAoMCiv = { name: civ, god: majorGod, weights: initializeAoMWeights(civ, majorGod) };
  updateAoMWeightInputs();
  return currentAoMCiv;
}

function finalizeAoMSelection() {
  if (!currentAoMCiv) return;

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
  addToHistory(result);
  displayAoMResult(result);
}

function displayAoMResult(result) {
  const resultDiv = document.getElementById('aomResult');
  let html = `<h3>AoM Result: ${result.civilization} - ${result.majorGod}</h3>`;
  html += '<ul>';
  for (const [age, god] of Object.entries(result.minorGods)) {
    html += `<li>${age} Age: ${god}</li>`;
  }
  html += '</ul>';
  resultDiv.innerHTML = html;
}
