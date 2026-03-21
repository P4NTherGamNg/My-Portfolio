// gallery.js – tested working version

// Storage key
const STORAGE_KEY = 'galleryImages';

// Load images from localStorage
function loadImages() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch(e) {
      return [];
    }
  }
  return [];
}

// Save images to localStorage
function saveImages(images) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
}

// Render public gallery (with optional limit)
function renderGallery(containerId, limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return console.error('Gallery container not found:', containerId);
  
  let images = loadImages();
  // Sort newest first
  images.sort((a,b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  if (limit) images = images.slice(0, limit);
  
  container.innerHTML = '';
  if (images.length === 0) {
    container.innerHTML = '<p style="text-align:center; grid-column:1/-1;">No photos yet. Check back soon!</p>';
    return;
  }
  
  images.forEach(img => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.innerHTML = `
      <img src="${img.imageData}" alt="${img.title}">
      <div class="gallery-info">
        <h4>${escapeHtml(img.title)}</h4>
        <p>${escapeHtml(img.tags || '')}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

// Render dashboard gallery with edit/delete buttons
function renderDashboardGallery(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return console.error('Dashboard gallery container not found:', containerId);
  
  let images = loadImages();
  images.sort((a,b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  
  container.innerHTML = '';
  if (images.length === 0) {
    container.innerHTML = '<p>No images uploaded yet.</p>';
    return;
  }
  
  images.forEach(img => {
    const card = document.createElement('div');
    card.className = 'dashboard-gallery-card';
    card.innerHTML = `
      <img src="${img.imageData}" alt="${img.title}">
      <div class="dashboard-gallery-info">
        <h4>${escapeHtml(img.title)}</h4>
        <p>${escapeHtml(img.tags || '')}</p>
        <div class="dashboard-gallery-actions">
          <button class="edit-gallery-btn" data-id="${img.id}"><i class="fas fa-edit"></i> Edit</button>
          <button class="delete-gallery-btn" data-id="${img.id}"><i class="fas fa-trash"></i> Delete</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
  
  // Attach event listeners to dynamically created buttons
  document.querySelectorAll('.edit-gallery-btn').forEach(btn => {
    btn.addEventListener('click', () => editGalleryImage(btn.dataset.id));
  });
  document.querySelectorAll('.delete-gallery-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteGalleryImage(btn.dataset.id));
  });
}

// Add new image
function addGalleryImage(title, tags, imageData) {
  const images = loadImages();
  const newImage = {
    id: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8),
    title: title.trim(),
    tags: tags.trim(),
    imageData: imageData,
    uploadDate: new Date().toISOString()
  };
  images.push(newImage);
  saveImages(images);
  return newImage;
}

// Delete image
function deleteGalleryImage(id) {
  if (!confirm('Delete this image?')) return;
  let images = loadImages();
  images = images.filter(img => img.id !== id);
  saveImages(images);
  renderDashboardGallery('dashboard-gallery-container');
  // Also update public gallery if on the same page (optional)
  if (document.getElementById('gallery-container')) renderGallery('gallery-container', 5);
}

// Edit image – populate form
function editGalleryImage(id) {
  const images = loadImages();
  const img = images.find(i => i.id === id);
  if (!img) return;
  
  document.getElementById('edit-image-id').value = img.id;
  document.getElementById('edit-image-title').value = img.title;
  document.getElementById('edit-image-tags').value = img.tags || '';
  const preview = document.getElementById('edit-image-preview');
  if (preview) {
    preview.src = img.imageData;
    preview.style.display = 'block';
  }
  document.getElementById('gallery-form-submit').textContent = 'Update Image';
  document.getElementById('gallery-form-cancel').style.display = 'inline-block';
  
  // Clear file input so user can choose new file if needed
  document.getElementById('edit-image-file').value = '';
}

// Update image
function updateGalleryImage(id, title, tags, newImageData = null) {
  let images = loadImages();
  const index = images.findIndex(i => i.id === id);
  if (index === -1) return;
  
  images[index].title = title.trim();
  images[index].tags = tags.trim();
  if (newImageData) {
    images[index].imageData = newImageData;
  }
  saveImages(images);
}

// Clear gallery form
function clearGalleryForm() {
  document.getElementById('edit-image-id').value = '';
  document.getElementById('edit-image-title').value = '';
  document.getElementById('edit-image-tags').value = '';
  document.getElementById('edit-image-file').value = '';
  const preview = document.getElementById('edit-image-preview');
  if (preview) {
    preview.src = '';
    preview.style.display = 'none';
  }
  document.getElementById('gallery-form-submit').textContent = 'Upload Image';
  document.getElementById('gallery-form-cancel').style.display = 'none';
}

// Handle gallery form submission (add or update)
function handleGallerySubmit(event) {
  event.preventDefault();
  
  const id = document.getElementById('edit-image-id').value;
  const title = document.getElementById('edit-image-title').value.trim();
  const tags = document.getElementById('edit-image-tags').value.trim();
  const fileInput = document.getElementById('edit-image-file');
  const file = fileInput.files[0];
  
  if (!title) {
    alert('Please enter a title');
    return;
  }
  
  if (!id && !file) {
    alert('Please select an image file');
    return;
  }
  
  function processImage(imageData) {
    if (id) {
      updateGalleryImage(id, title, tags, imageData);
    } else {
      addGalleryImage(title, tags, imageData);
    }
    clearGalleryForm();
    renderDashboardGallery('dashboard-gallery-container');
    if (document.getElementById('gallery-container')) renderGallery('gallery-container', 5);
  }
  
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => processImage(e.target.result);
    reader.onerror = () => alert('Error reading file');
    reader.readAsDataURL(file);
  } else {
    // Update without new image (only title/tags)
    processImage(null);
  }
}

// Helper to escape HTML to prevent injection
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}