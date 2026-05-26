// Debug: log when the front-end script runs and which elements are present
console.log('app.js loaded');
const brandSelect = document.getElementById('brandSelect');
const fuelSelect = document.getElementById('fuelSelect');
const yearInput = document.getElementById('yearInput');
const kmsInput = document.getElementById('kmsInput');
const predictButton = document.getElementById('predictButton');
const statusMessage = document.getElementById('statusMessage');
const brandPreviewImage = document.getElementById('brandPreviewImage');
const previewBrand = document.getElementById('previewBrand');
const previewMeta = document.getElementById('previewMeta');
const predictionCard = document.getElementById('predictionCard');
const predictionAmount = document.getElementById('predictionAmount');
const predictionRange = document.getElementById('predictionRange');
const historyList = document.getElementById('historyList');
const clearHistory = document.getElementById('clearHistory');
const themeToggle = document.getElementById('themeToggle');
const historyChartCanvas = document.getElementById('historyChart');
const predictionForm = document.getElementById('predictForm');
const chartCountEl = document.getElementById('chartCount');

console.log('elements:', {
  brandSelect: !!brandSelect,
  fuelSelect: !!fuelSelect,
  yearInput: !!yearInput,
  kmsInput: !!kmsInput,
  predictionForm: !!predictionForm,
  historyChartCanvas: !!historyChartCanvas,
  historyList: !!document.getElementById('historyList'),
});

const HISTORY_KEY = 'carPredictionHistory';
let chartInstance = null;

const brandImages = {
  'Maruti Suzuki': 'https://images.unsplash.com/photo-1471640122410-60a541b12d40?auto=format&fit=crop&w=1200&q=80',
  Hyundai: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
  Honda: 'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80',
  Tata: 'https://images.unsplash.com/photo-1517363898872-73786d7e4ee4?auto=format&fit=crop&w=1200&q=80',
  Mahindra: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  Toyota: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
  Ford: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80',
  Mercedes: 'https://images.unsplash.com/photo-1517364011845-906a6f56b0b0?auto=format&fit=crop&w=1200&q=80',
  BMW: 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1200&q=80',
  Audi: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80',
};

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch (error) {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    console.log('saveHistory: saved', history.length);
    try { console.log('localStorage snapshot:', JSON.parse(localStorage.getItem(HISTORY_KEY))); } catch(e) { console.warn('Could not parse localStorage after save', e); }
    if (chartCountEl) {
      try { chartCountEl.querySelector('strong').textContent = history.length; } catch(e) { chartCountEl.textContent = `Saved predictions: ${history.length}`; }
    }
  } catch (err) {
    console.error('saveHistory error', err);
  }
}

function renderHistory() {
  const history = getHistory().slice().reverse();
  if (!historyList) return;
  historyList.innerHTML = '';

  if (chartCountEl) {
    try { chartCountEl.querySelector('strong').textContent = history.length; } catch(e) { chartCountEl.textContent = `Saved predictions: ${history.length}`; }
  }

  if (!history.length) {
    historyList.innerHTML = `
      <div class="empty-state">
        <p>No saved predictions yet.</p>
        <span>Make your first prediction to see history here.</span>
      </div>
    `;
    updateChart([]);
    return;
  }

  history.forEach(item => {
    const entry = document.createElement('div');
    entry.className = 'history-item';
    const imageUrl = brandImages[item.brand] || brandImages['Maruti Suzuki'];
    entry.innerHTML = `
      <div class="history-item-image">
        <img src="${imageUrl}" alt="${item.brand}" loading="lazy">
      </div>
      <div class="history-item-content">
        <h3>₹ ${item.prediction.toLocaleString()}</h3>
        <p class="history-meta">${item.brand} · ${item.fuel_type}</p>
        <p class="history-meta">${item.year} · ${item.kms_driven.toLocaleString()} km</p>
        <p class="history-time">${new Date(item.timestamp).toLocaleString()}</p>
      </div>
    `;
    historyList.appendChild(entry);
  });

  updateChart(history.reverse());
}

function updateChart(history) {
  if (!historyChartCanvas) return;
  const labels = history.map(entry => `${entry.brand} ${entry.year}`);
  const values = history.map(entry => entry.prediction);
  const isEmpty = !values.length;

  // Build dataset with emphasis on the latest point
  const pointBackgrounds = values.map((v, i) => (i === values.length - 1 ? '#ffdd57' : '#ffffff'));
  const pointRadii = values.map((v, i) => (i === values.length - 1 ? 7 : 4));

  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = values;
    chartInstance.data.datasets[0].pointBackgroundColor = pointBackgrounds;
    chartInstance.data.datasets[0].pointRadius = pointRadii;
    chartInstance.update();
    return;
  }

  chartInstance = new Chart(historyChartCanvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Prediction price',
          data: values,
          fill: true,
          tension: 0.28,
          borderWidth: 3,
          borderColor: '#7c5cff',
          backgroundColor: 'rgba(124, 92, 255, 0.16)',
          pointRadius: pointRadii,
          pointBackgroundColor: pointBackgrounds,
          pointBorderColor: '#7c5cff',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#101c39',
          titleColor: '#ffffff',
          bodyColor: '#c8d1ff',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
        },
      },
      layout: { padding: 8 },
      scales: {
        x: {
          ticks: { color: '#c8d1ff', font: { size: 12 } },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        y: {
          ticks: {
            color: '#c8d1ff',
            callback: value => `₹ ${Number(value).toLocaleString()}`,
            font: { size: 12 },
          },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
      },
    },
  });
}

// Expand / fullscreen toggle for chart
const expandChartBtn = document.getElementById('expandChart');
if (expandChartBtn) {
  expandChartBtn.addEventListener('click', () => {
    const container = document.getElementById('chartContainer');
    if (!container) return;
    container.classList.toggle('fullscreen');
    setTimeout(() => {
      if (chartInstance) chartInstance.resize();
    }, 340);
  });
}

function setPreview() {
  if (!brandSelect || !brandPreviewImage || !previewBrand || !previewMeta || !fuelSelect || !yearInput || !kmsInput) return;
  const brand = brandSelect.value;
  const imageUrl = brandImages[brand] || brandImages['Maruti Suzuki'];
  brandPreviewImage.src = imageUrl;
  previewBrand.textContent = brand;
  previewMeta.textContent = `${fuelSelect.value} · ${yearInput.value} · ${Number(kmsInput.value).toLocaleString()} km`;
}

function setLoading(isLoading) {
  if (!predictButton) return;
  if (isLoading) {
    predictButton.disabled = true;
    predictButton.innerHTML = '<span class="loader"></span>Predicting...';
  } else {
    predictButton.disabled = false;
    predictButton.textContent = 'Predict price';
  }
}

function showStatus(message, type = 'default') {
  if (!statusMessage) return;
  statusMessage.textContent = message;
  statusMessage.style.color = type === 'error' ? '#ff8b92' : '#bbc5ff';
}

async function sendPrediction(data) {
  const response = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return response.json();
}

function renderPredictionDetails(result) {
  if (!predictionCard || !predictionAmount || !predictionRange) return;
  predictionCard.classList.remove('hidden');
  predictionAmount.textContent = `₹ ${result.prediction.toLocaleString()}`;

  const low = Math.max(result.prediction * 0.88, 0).toFixed(2);
  const high = (result.prediction * 1.12).toFixed(2);
  predictionRange.textContent = `Estimated range: ₹ ${Number(low).toLocaleString()} - ₹ ${Number(high).toLocaleString()}`;
}

function applyTheme(isDark) {
  if (isDark) {
    document.documentElement.dataset.theme = 'dark';
    themeToggle.textContent = 'Light mode';
  } else {
    document.documentElement.dataset.theme = 'light';
    themeToggle.textContent = 'Dark mode';
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem('carAppTheme');
  const isDark = savedTheme ? savedTheme === 'dark' : true;
  applyTheme(isDark);
}

function saveTheme(isDark) {
  localStorage.setItem('carAppTheme', isDark ? 'dark' : 'light');
}

if (predictionForm) {
  predictionForm.addEventListener('submit', async event => {
  event.preventDefault();
  setLoading(true);
  showStatus('Analyzing prices...');

  const payload = {
    brand: brandSelect.value,
    year: Number(yearInput.value),
    fuel_type: fuelSelect.value,
    kms_driven: Number(kmsInput.value),
  };

  try {
    const result = await sendPrediction(payload);
    if (!result.success) {
      throw new Error(result.error || 'Prediction failed');
    }

    renderPredictionDetails(result);
    showStatus('Prediction completed successfully.');

    const history = getHistory();
    const entry = {
      ...payload,
      prediction: result.prediction,
      timestamp: new Date().toISOString(),
    };
    history.push(entry);
    console.log('About to save history entry:', entry);
    saveHistory(history);
    console.log('After save, history length:', getHistory().length);
    renderHistory();
  } catch (error) {
    showStatus(error.message || 'Unable to fetch prediction.', 'error');
  } finally {
    setLoading(false);
  }
  });
}

// Debug: save test entry button
const saveTestBtn = document.getElementById('saveTest');
if (saveTestBtn) {
  saveTestBtn.addEventListener('click', () => {
    const sample = {
      brand: brandSelect ? brandSelect.value : 'Toyota',
      year: yearInput ? Number(yearInput.value) : 2018,
      fuel_type: fuelSelect ? fuelSelect.value : 'Petrol',
      kms_driven: kmsInput ? Number(kmsInput.value) : 50000,
    };
    const history = getHistory();
    const entry = { ...sample, prediction: Math.round(Math.random() * 500000 + 50000), timestamp: new Date().toISOString() };
    history.push(entry);
    console.log('saveTest: saving', entry);
    saveHistory(history);
    renderHistory();
    showStatus('Saved test prediction locally.');
  });
}

if (brandSelect && fuelSelect && yearInput && kmsInput) {
  [brandSelect, fuelSelect, yearInput, kmsInput].forEach(element => {
    element.addEventListener('input', setPreview);
  });
}

if (clearHistory) {
  clearHistory.addEventListener('click', () => {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
    showStatus('Prediction history cleared.');
  });
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.dataset.theme;
    const darkMode = currentTheme !== 'dark';
    applyTheme(darkMode);
    saveTheme(darkMode);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  // init predict page elements if present
  if (brandSelect) setPreview();
  // init history/chart if present
  if (historyList) renderHistory();
});
