/**
 * Nuva Face Search — Upload, detect face, run search
 */

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights';

// DOM
const uploadZone = document.getElementById('uploadZone');
const uploadContent = document.getElementById('uploadContent');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const fileInput = document.getElementById('fileInput');
const removeImageBtn = document.getElementById('removeImage');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('resultsSection');
const resultsGrid = document.getElementById('resultsGrid');
const resultsCount = document.getElementById('resultsCount');

let currentFile = null;
let modelsLoaded = false;

// Mock results for demo (replace with real API later)
const MOCK_NAMES = ['Alex Chen', 'Jordan Lee', 'Sam Williams', 'Casey Morgan', 'Riley Kim', 'Taylor Brooks'];
const MOCK_JOBS = ['Product Designer', 'Software Engineer', 'Marketing Lead', 'Data Scientist', 'UX Researcher'];

function generateMockResults(count = 6) {
  return Array.from({ length: count }, (_, i) => ({
    name: MOCK_NAMES[i % MOCK_NAMES.length],
    role: MOCK_JOBS[i % MOCK_JOBS.length],
    score: (92 + Math.floor(Math.random() * 7)) + '%',
    image: `https://i.pravatar.cc/300?img=${31 + i}`,
  }));
}

// Load face-api models
async function loadModels() {
  if (modelsLoaded) return;
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
  } catch (err) {
    console.warn('Face detection models failed to load, using fallback:', err);
  }
}

// Detect face in image
async function detectFace(img) {
  if (typeof faceapi === 'undefined') return { fallback: true };
  if (!modelsLoaded) await loadModels();
  try {
    const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
    return detections.length > 0 ? detections[0] : null;
  } catch {
    return { fallback: true };
  }
}

// Upload handling
function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  if (file.size > 10 * 1024 * 1024) {
    alert('File too large. Max 10MB.');
    return;
  }
  currentFile = file;
  const url = URL.createObjectURL(file);
  previewImage.src = url;
  uploadContent.hidden = true;
  previewContainer.hidden = false;
  uploadZone.classList.add('has-image');
  searchBtn.disabled = false;
}

function clearImage() {
  if (previewImage.src) URL.revokeObjectURL(previewImage.src);
  previewImage.src = '';
  currentFile = null;
  uploadContent.hidden = false;
  previewContainer.hidden = true;
  uploadZone.classList.remove('has-image');
  searchBtn.disabled = true;
}

uploadZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('dragover');
});
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  handleFile(e.dataTransfer.files[0]);
});

removeImageBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  clearImage();
});

// Search
searchBtn.addEventListener('click', async () => {
  if (!currentFile) return;

  const textEl = searchBtn.querySelector('.btn-search-text');
  const loadingEl = searchBtn.querySelector('.btn-search-loading');
  textEl.hidden = true;
  loadingEl.hidden = false;
  searchBtn.disabled = true;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = URL.createObjectURL(currentFile);

  await new Promise((resolve) => { img.onload = resolve; });

  const face = await detectFace(img);
  URL.revokeObjectURL(img.src);

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 1200));

  const noFace = face === null && modelsLoaded;
  if (noFace) {
    alert('No face detected. Please upload a clear photo of a face.');
  } else {
    const results = generateMockResults();
    renderResults(results);
    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }

  textEl.hidden = false;
  loadingEl.hidden = true;
  searchBtn.disabled = false;
});

function renderResults(results) {
  resultsCount.textContent = `${results.length} matches found`;
  resultsGrid.innerHTML = results
    .map(
      (r) => `
    <article class="result-card">
      <img class="result-card-image" src="${r.image}" alt="${r.name}" loading="lazy">
      <div class="result-card-info">
        <div class="result-card-name">${r.name}</div>
        <div class="result-card-meta">${r.role}</div>
        <span class="result-card-score">${r.score} match</span>
      </div>
    </article>
  `
    )
    .join('');
}

// Preload models on idle
if ('requestIdleCallback' in window) {
  requestIdleCallback(loadModels, { timeout: 3000 });
} else {
  setTimeout(loadModels, 1000);
}
