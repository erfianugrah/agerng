let history = [];

export function loadHistory() {
  const savedHistory = localStorage.getItem('aoeRngHistory');
  if (savedHistory) {
    history = JSON.parse(savedHistory);
    updateHistoryDisplay();
  }
}

export function saveHistory() {
  localStorage.setItem('aoeRngHistory', JSON.stringify(history));
  updateHistoryDisplay();
}

export function addToHistory(result) {
  history.unshift(result);
  if (history.length > 100) {
    history.pop();
  }
  saveHistory();
}

export function updateHistoryDisplay() {
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = '';
  history.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = `${item.game}: ${item.civilization}${item.majorGod ? ' - ' + item.majorGod : ''}`;
    li.addEventListener('click', () => displayHistoryItem(index));
    historyList.appendChild(li);
  });
}

export function exportJSON() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', 'aoe_rng_history.json');
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function exportCSV() {
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

export function weightedRandomChoice(options, weights) {
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
