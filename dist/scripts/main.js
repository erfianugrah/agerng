document.addEventListener('DOMContentLoaded', () => {
  loadHistory();

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
