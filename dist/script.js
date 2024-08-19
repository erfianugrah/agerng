let currentAoE4Civ = null;
let currentAoMCiv = null;
let history = [];

function loadHistory() {
  const savedHistory = localStorage.getItem('aoeRngHistory');
  if (savedHistory) {
    history = JSON.parse(savedHistory);
    updateHistoryDisplay();
  }
}

function saveHistory() {
  localStorage.setItem('aoeRngHistory', JSON.stringify(history));
  updateHistoryDisplay();
}

function addToHistory(result) {
  history.unshift(result);
  if (history.length > 100) {
    history.pop();
  }
  saveHistory();
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
  const previewDiv = document.getElementById('historyPreview');
  let html = '';

  if (item.game === 'AoE IV') {
    html = `<h3>AoE IV: ${item.civilization}</h3>`;
    html += '<ul>';
    for (const [age, choice] of Object.entries(item.ageUps)) {
      html += `<li>Age ${age}: ${choice}</li>`;
    }
    html += '</ul>';
  } else if (item.game === 'AoM') {
    html = `<h3>AoM: ${item.civilization} - ${item.majorGod}</h3>`;
    html += '<ul>';
    for (const [age, god] of Object.entries(item.minorGods)) {
      html += `<li>${age} Age: ${god}</li>`;
    }
    html += '</ul>';
  }

  previewDiv.innerHTML = html;
  previewDiv.style.display = 'block';
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

function displayAoMResult(result) {
  const resultDiv = document.getElementById('aomResult');
  let html = `<h3>Result: ${result.civilization} - ${result.majorGod}</h3>`;
  html += '<ul>';
  for (const [age, god] of Object.entries(result.minorGods)) {
    html += `<li>${age} Age: ${god}</li>`;
  }
  html += '</ul>';
  resultDiv.innerHTML = html;
}

function exportJSON() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', 'aoe_rng_history.json');
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function exportCSV() {
  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'Game,Civilization,Major God,Minor Gods\n';
  history.forEach((item) => {
    let row = `${item.game},${item.civilization},${item.majorGod || ''},`;
    if (item.minorGods) {
      row += `"${Object.entries(item.minorGods)
        .map(([age, god]) => `${age}: ${god}`)
        .join(', ')}"`;
    } else if (item.ageUps) {
      row += `"${Object.entries(item.ageUps)
        .map(([age, choice]) => `Age ${age}: ${choice}`)
        .join(', ')}"`;
    }
    csvContent += row + '\n';
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'aoe_rng_history.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function initializeWeights(civ, god = null) {
  if (civ in aoe4AgeUpOptions) {
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
  } else if (civ in aomGods && god) {
    return {
      Classical: [0.5, 0.5],
      Heroic: [0.5, 0.5],
      Mythic: [0.5, 0.5],
    };
  }
  return {};
}

function updateWeight(game, key, index, value) {
  value = parseFloat(value);
  if (game === 'aoe4') {
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
  } else if (game === 'aom') {
    currentAoMCiv.weights[key][index] = value;
    currentAoMCiv.weights[key][1 - index] = 1 - value;
    updateAoMWeightInputs();
  }
}

function updateAoE4WeightInputs() {
  const weightsDiv = document.getElementById('aoe4Weights');
  let html = '';

  if (currentAoE4Civ) {
    html += `<h3>Weights for ${currentAoE4Civ.name}:</h3>`;
    if (currentAoE4Civ.name === 'Abbasid Dynasty' || currentAoE4Civ.name === 'Ayyubids') {
      const wings = aoe4AgeUpOptions[currentAoE4Civ.name];
      wings.forEach((wing, index) => {
        html += `
          <div>
            ${wing} <input type="number" min="0" max="1" step="0.01" value="${currentAoE4Civ.weights.wings[index].toFixed(2)}" 
              onchange="updateWeight('aoe4', 'wings', ${index}, this.value)">
          </div>
        `;
      });
    } else {
      for (const [age, options] of Object.entries(aoe4AgeUpOptions[currentAoE4Civ.name])) {
        if (Array.isArray(options)) {
          html += `
            <div>
              Age ${age}:
              ${options[0]} <input type="number" min="0" max="1" step="0.1" value="${currentAoE4Civ.weights[age][0].toFixed(1)}" 
                onchange="updateWeight('aoe4', '${age}', 0, this.value)">
              ${options[1]} <input type="number" min="0" max="1" step="0.1" value="${currentAoE4Civ.weights[age][1].toFixed(1)}" 
                onchange="updateWeight('aoe4', '${age}', 1, this.value)">
            </div>
          `;
        }
      }
    }
  }

  weightsDiv.innerHTML = html;
}

function updateAoMWeightInputs() {
  const weightsDiv = document.getElementById('aomWeights');
  let html = '';

  if (currentAoMCiv) {
    html += `<h3>Weights for ${currentAoMCiv.name} - ${currentAoMCiv.god}:</h3>`;
    for (const age of ['Classical', 'Heroic', 'Mythic']) {
      const options = aomGods[currentAoMCiv.name].minor[currentAoMCiv.god][age];
      html += `
        <div>
          ${age} Age:
          ${options[0]} <input type="number" min="0" max="1" step="0.1" value="${currentAoMCiv.weights[age][0].toFixed(1)}" 
            onchange="updateWeight('aom', '${age}', 0, this.value)">
          ${options[1]} <input type="number" min="0" max="1" step="0.1" value="${currentAoMCiv.weights[age][1].toFixed(1)}" 
            onchange="updateWeight('aom', '${age}', 1, this.value)">
        </div>
      `;
    }
  }

  weightsDiv.innerHTML = html;
}

function generateRandomAoE4Civ() {
  const civ = aoe4Civilizations[Math.floor(Math.random() * aoe4Civilizations.length)];
  currentAoE4Civ = { name: civ, weights: initializeWeights(civ) };
  updateAoE4WeightInputs();
  return currentAoE4Civ;
}

function generateRandomAoMCiv() {
  const civ = aomCivilizations[Math.floor(Math.random() * aomCivilizations.length)];
  const majorGod = aomGods[civ].major[Math.floor(Math.random() * aomGods[civ].major.length)];
  currentAoMCiv = { name: civ, god: majorGod, weights: initializeWeights(civ, majorGod) };
  updateAoMWeightInputs();
  return currentAoMCiv;
}

function weightedRandomChoice(options, weights) {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < options.length; i++) {
    if (random < weights[i]) {
      return options[i];
    }
    random -= weights[i];
  }
  return options[options.length - 1];
}

function finalizeAoE4Selection() {
  if (!currentAoE4Civ) return;

  const ageUps = {};
  if (currentAoE4Civ.name === 'Abbasid Dynasty' || currentAoE4Civ.name === 'Ayyubids') {
    const wings = aoe4AgeUpOptions[currentAoE4Civ.name];
    const selectedWings = [];
    for (let i = 0; i < 3; i++) {
      const wing = weightedRandomChoice(wings, currentAoE4Civ.weights.wings);
      selectedWings.push(wing);
      // Remove the selected wing from options and redistribute weights
      const index = wings.indexOf(wing);
      wings.splice(index, 1);
      currentAoE4Civ.weights.wings.splice(index, 1);
      const sum = currentAoE4Civ.weights.wings.reduce((a, b) => a + b, 0);
      currentAoE4Civ.weights.wings = currentAoE4Civ.weights.wings.map((w) => w / sum);
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

function displayAoE4Result(result) {
  const resultDiv = document.getElementById('aoe4Result');
  let html = `<h3>AoE IV Result: ${result.civilization}</h3>`;
  html += '<ul>';
  for (const [age, choice] of Object.entries(result.ageUps)) {
    html += `<li>Age ${age}: ${choice}</li>`;
  }
  html += '</ul>';
  resultDiv.innerHTML = html;
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

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  loadHistory();

  document.getElementById('generateAoE4Btn').addEventListener('click', () => {
    const result = generateRandomAoE4Civ();
    document.getElementById('aoe4Result').innerHTML =
      `<h3>Selected Civilization: ${result.name}</h3>`;
    document.getElementById('finalizeAoE4Btn').style.display = 'inline';
    document.getElementById('historyPreview').style.display = 'none';
  });

  document.getElementById('generateAoMBtn').addEventListener('click', () => {
    const result = generateRandomAoMCiv();
    document.getElementById('aomResult').innerHTML =
      `<h3>Selected Civilization: ${result.name}</h3><h4>Major God: ${result.god}</h4>`;
    document.getElementById('finalizeAoMBtn').style.display = 'inline';
    document.getElementById('historyPreview').style.display = 'none';
  });

  document.getElementById('finalizeAoE4Btn').addEventListener('click', () => {
    finalizeAoE4Selection();
    document.getElementById('finalizeAoE4Btn').style.display = 'none';
  });

  document.getElementById('finalizeAoMBtn').addEventListener('click', () => {
    finalizeAoMSelection();
    document.getElementById('finalizeAoMBtn').style.display = 'none';
  });

  document.getElementById('exportJSON').addEventListener('click', exportJSON);
  document.getElementById('exportCSV').addEventListener('click', exportCSV);
});
