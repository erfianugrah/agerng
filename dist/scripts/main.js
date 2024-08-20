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

  window.addEventListener('click', (event) => {
    if (event.target === historyPopup) {
      historyPopup.style.display = 'none';
    }
  });

  document.getElementById('generateAoE4Btn').addEventListener('click', () => {
    const result = generateRandomAoE4Civ();
    document.getElementById('aoe4Result').innerHTML =
      `<h3>Selected Civilization: ${result.name}</h3>`;
    document.getElementById('generateAoE4Btn').style.display = 'none';
    document.getElementById('finalizeAoE4Btn').style.display = 'inline-block';
    document.getElementById('historyPreview').style.display = 'none';
  });

  document.getElementById('generateAoMBtn').addEventListener('click', () => {
    const result = generateRandomAoMCiv();
    document.getElementById('aomResult').innerHTML =
      `<h3>Selected Civilization: ${result.name}</h3><h4>Major God: ${result.god}</h4>`;
    document.getElementById('generateAoMBtn').style.display = 'none';
    document.getElementById('finalizeAoMBtn').style.display = 'inline-block';
    document.getElementById('historyPreview').style.display = 'none';
  });

  document.getElementById('finalizeAoE4Btn').addEventListener('click', () => {
    finalizeAoE4Selection();
    document.getElementById('finalizeAoE4Btn').style.display = 'none';
    document.getElementById('generateAoE4Btn').style.display = 'inline-block';
  });

  document.getElementById('finalizeAoMBtn').addEventListener('click', () => {
    finalizeAoMSelection();
    document.getElementById('finalizeAoMBtn').style.display = 'none';
    document.getElementById('generateAoMBtn').style.display = 'inline-block';
  });

  document.getElementById('exportJSON').addEventListener('click', exportJSON);
  document.getElementById('exportCSV').addEventListener('click', exportCSV);
});

function displayHistoryItem(index) {
  const item = history[index];
  const popupContent = document.getElementById('popupContent');
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

  popupContent.innerHTML = html;
  document.getElementById('historyPopup').style.display = 'block';
}
