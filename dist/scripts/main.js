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
  console.log('handleGenerateAoE4 called');
  const result = generateRandomAoE4Civ();
  console.log('AoE4 result:', result);
  displayAoE4Result(result, false); // Display result without finalizing
  document.getElementById('generateAoE4Btn').style.display = 'none';
  document.getElementById('finalizeAoE4Btn').style.display = 'inline-block';
  document.getElementById('historyPreview').style.display = 'none';
  console.log('handleGenerateAoE4 completed');
}

function handleGenerateAoM() {
  console.log('handleGenerateAoM called');
  const result = generateRandomAoMCiv();
  console.log('AoM result:', result);
  displayAoMResult(result, false); // Display result without finalizing
  document.getElementById('generateAoMBtn').style.display = 'none';
  document.getElementById('finalizeAoMBtn').style.display = 'inline-block';
  document.getElementById('historyPreview').style.display = 'none';
  console.log('handleGenerateAoM completed');
}

function handleFinalizeAoE4() {
  console.log('handleFinalizeAoE4 called');
  const result = finalizeAoE4Selection(false); // Set addToHistory to false
  if (result) {
    displayAoE4Result(result, true);
    addToHistory(result); // Add to history here
    resetAoE4State();
  } else {
    console.error('Failed to finalize AoE4 selection');
  }
  console.log('handleFinalizeAoE4 completed');
}

function handleFinalizeAoM() {
  console.log('handleFinalizeAoM called');
  const result = finalizeAoMSelection(false); // Set addToHistory to false
  if (result) {
    displayAoMResult(result, true);
    addToHistory(result); // Add to history here
    resetAoMState();
  } else {
    console.error('Failed to finalize AoM selection');
  }
  console.log('handleFinalizeAoM completed');
}

function displayHistoryItem(index) {
  const item = history[index];
  const popupContent = document.getElementById('popupContent');
  let html = '';

  if (item.game === 'AoE IV') {
    const civSlug = AOE4_CIVILIZATIONS[item.civilization];
    html = `
      <div class="selection-result">
        <h3>Age of Empires IV</h3>
        <h4><a href="https://aoe4world.com/explorer/civs/${civSlug}" target="_blank">${item.civilization}</a></h4>
      </div>
      <div class="age-up-choices">
    `;
    for (const [age, choice] of Object.entries(item.ageUps)) {
      let linkUrl;
      if (item.civilization === 'Abbasid Dynasty' || item.civilization === 'Ayyubids') {
        const wingSlug = choice.toLowerCase().replace(/\s+/g, '-');
        linkUrl = `https://aoe4world.com/explorer/civs/${civSlug}/technologies/${age.toLowerCase()}-${wingSlug}-advancement`;
      } else {
        const buildingSlug = choice.toLowerCase().replace(/\s+/g, '-');
        linkUrl = `https://aoe4world.com/explorer/civs/${civSlug}/buildings/${buildingSlug}`;
      }
      html += `
        <div class="age-up-item">
          <span class="age-label">Age ${age}:</span>
          <a href="${linkUrl}" target="_blank" class="age-choice">${choice}</a>
        </div>
      `;
    }
    html += '</div>';
  } else if (item.game === 'AoM') {
    // AoM content remains unchanged
    html = `
      <div class="selection-result">
        <h3>Age of Mythology</h3>
        <h4>${item.civilization}</h4>
        <h3>Major God:</h3>
        <h4>${item.majorGod}</h4>
      </div>
      <div class="god-choices">
    `;
    for (const [age, god] of Object.entries(item.minorGods)) {
      html += `
        <div class="god-choice-item">
          <span class="age-label">${age} Age:</span>
          <span class="god-name">${god}</span>
        </div>
      `;
    }
    html += '</div>';
  }

  popupContent.innerHTML = html;
  document.getElementById('historyPopup').style.display = 'block';
}

// Ensure these functions are globally available
globalThis.addToHistory = addToHistory;
globalThis.displayHistoryItem = displayHistoryItem;
