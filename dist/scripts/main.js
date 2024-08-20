document.addEventListener('DOMContentLoaded', () => {
  loadHistory();

  const hamburgerMenu = document.getElementById('hamburger-menu');
  const historyPanel = document.getElementById('historyPanel');
  const historyPopup = document.getElementById('historyPopup');
  const closePopup = document.querySelector('.close-popup');

  hamburgerMenu.addEventListener('click', () => {
    historyPanel.classList.toggle('active');
  });

  // Close history panel when clicking outside of it
  document.addEventListener('click', (event) => {
    if (!historyPanel.contains(event.target) && !hamburgerMenu.contains(event.target)) {
      historyPanel.classList.remove('active');
    }
  });

  closePopup.addEventListener('click', () => {
    historyPopup.style.display = 'none';
  });

  globalThis.addEventListener('click', (event) => {
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

  // Initial setup
  updateAoE4Buttons();
  updateAoMButtons();
});

function handleGenerateAoE4() {
  const result = generateRandomAoE4Civ();
  displayAoE4Result(result);
  document.getElementById('historyPreview').style.display = 'none';
}

function handleGenerateAoM() {
  const result = generateRandomAoMCiv();
  displayAoMResult(result);
  document.getElementById('historyPreview').style.display = 'none';
}

function handleFinalizeAoE4() {
  const result = finalizeAoE4Selection(true);
  if (result) {
    displayAoE4Result(result, true);
    addToHistory(result);
    resetAoE4State();
  } else {
    console.error('Failed to finalize AoE4 selection');
  }
}

function handleFinalizeAoM() {
  const result = finalizeAoMSelection(true);
  if (result) {
    displayAoMResult(result, true);
    addToHistory(result);
    resetAoMState();
  } else {
    console.error('Failed to finalize AoM selection');
  }
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

// Ensure these functions are globally available
globalThis.addToHistory = addToHistory;
globalThis.displayHistoryItem = displayHistoryItem;
