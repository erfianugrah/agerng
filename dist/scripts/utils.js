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
  console.log('Attempting to add to history:', result);

  // Check for duplicate
  const isDuplicate = history.some(
    (item) =>
      item.game === result.game &&
      item.civilization === result.civilization &&
      JSON.stringify(item.ageUps || item.minorGods) ===
        JSON.stringify(result.ageUps || result.minorGods)
  );

  if (!isDuplicate) {
    history.unshift(result);
    if (history.length > 100) {
      history.pop();
    }
    saveHistory();
    console.log('Entry added to history');
  } else {
    console.log('Duplicate entry not added to history');
  }
}

function getCivUrlName(civName) {
  return AOE4_CIVILIZATIONS[civName] || civName.toLowerCase().replace(/ /g, '-');
}

function updateHistoryDisplay() {
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = '';
  history.forEach((item, index) => {
    const li = document.createElement('li');
    if (item.game === 'AoE IV') {
      li.textContent = `${item.game}: ${item.civilization}`;
    } else {
      li.textContent = `${item.game}: ${item.civilization}${item.majorGod ? ' - ' + item.majorGod : ''}`;
    }
    li.addEventListener('click', () => displayHistoryItem(index));
    historyList.appendChild(li);
  });
}

function displayHistoryItem(index) {
  const item = history[index];
  const popupContent = document.getElementById('popupContent');
  let html = '';

  if (item.game === 'AoE IV') {
    const civUrlName = getCivUrlName(item.civilization);
    const civLink = `https://aoe4world.com/civilizations/${civUrlName}`;
    html = `
      <div class="selection-result">
        <h3>AoE IV:</h3>
        <h4><a href="${civLink}" target="_blank">${item.civilization}</a></h4>
      </div>
    `;
    html += '<ul>';
    for (const [age, choice] of Object.entries(item.ageUps)) {
      if (item.civilization === 'Abbasid Dynasty' || item.civilization === 'Ayyubids') {
        const [wing, bonus] = choice.split(' - ');
        const wingLink = `https://aoe4world.com/civilizations/${civUrlName}/technologies`;
        html += `<li>Age ${age}: <a href="${wingLink}" target="_blank">${wing}</a> - ${bonus}</li>`;
      } else {
        const landmarkLink = `https://aoe4world.com/civilizations/${civUrlName}/buildings`;
        html += `<li>Age ${age}: <a href="${landmarkLink}" target="_blank">${choice}</a></li>`;
      }
    }
    if (item.civilization === 'Abbasid Dynasty' || item.civilization === 'Ayyubids') {
      const houseOfWisdomLink = `https://aoe4world.com/civilizations/${civUrlName}/buildings`;
      html += `<li><a href="${houseOfWisdomLink}" target="_blank">House of Wisdom</a></li>`;
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
