// Global variables
let history = [];

// History management functions
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
  console.log('Adding to history:', result);
  history.unshift(result);
  if (history.length > 100) {
    history.pop();
  }
  saveHistory();
  console.log('Current history length:', history.length);
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
    html = generateAoE4PreviewHTML(item);
  } else if (item.game === 'AoM') {
    html = generateAoMPreviewHTML(item);
  }

  previewDiv.innerHTML = html;
  previewDiv.style.display = 'block';
}

function generateAoE4PreviewHTML(item) {
  let html = `<h3>AoE IV: ${item.civilization}</h3><ul>`;
  for (const [age, choice] of Object.entries(item.ageUps)) {
    html += `<li>Age ${age}: ${choice}</li>`;
  }
  html += '</ul>';
  return html;
}

function generateAoMPreviewHTML(item) {
  let html = `<h3>AoM: ${item.civilization} - ${item.majorGod}</h3><ul>`;
  for (const [age, god] of Object.entries(item.minorGods)) {
    html += `<li>${age} Age: ${god}</li>`;
  }
  html += '</ul>';
  return html;
}

// Export functions
function exportJSON() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history));
  downloadFile(dataStr, 'aoe_rng_history.json');
}

function exportCSV() {
  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'Game,Civilization,Major God,Minor Gods\n';
  history.forEach((item) => {
    let row = `${item.game},${item.civilization},${item.majorGod || ''},`;
    row += item.minorGods ? formatMinorGods(item.minorGods) : formatAgeUps(item.ageUps);
    csvContent += row + '\n';
  });
  downloadFile(encodeURI(csvContent), 'aoe_rng_history.csv');
}

function formatMinorGods(minorGods) {
  return `"${Object.entries(minorGods)
    .map(([age, god]) => `${age}: ${god}`)
    .join(', ')}"`;
}

function formatAgeUps(ageUps) {
  return `"${Object.entries(ageUps)
    .map(([age, choice]) => `Age ${age}: ${choice}`)
    .join(', ')}"`;
}

function downloadFile(content, filename) {
  const link = document.createElement('a');
  link.setAttribute('href', content);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// Utility functions
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

// Fisher-Yates shuffle algorithm
function fisherYatesShuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
