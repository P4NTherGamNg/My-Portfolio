// gallery.js

// Load images from localStorage
function loadImages() {
  const stored = localStorage.getItem('galleryImages');
  return stored ? JSON.parse(stored) : [];
}

// Save images to localStorage
function saveImages(images) {
  localStorage.setItem('galleryImages', JSON.stringify(images));
}

// Render images in a container (optional limit)
function renderGallery(containerId, limit = null) {
  const images = loadImages();
  const container = document.getElementById(containerId);
  if (!container) return;

  // Sort by upload date (newest first)
  images.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

  const limited = limit ? images.slice(0, limit) : images;

  container.innerHTML = '';
  limited.forEach(img => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.innerHTML = `
      <img src="${img.imageData}" alt="${img.title}">
      <div class="gallery-info">
        <h4>${img.title}</h4>
        <p>${img.tags || ''}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

// Render dashboard gallery with edit/delete buttons
function renderDashboardGallery(containerId) {
  const images = loadImages();
  const container = document.getElementById(containerId);
  if (!container) return;

  images.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

  container.innerHTML = '';
  images.forEach(img => {
    const card = document.createElement('div');
    card.className = 'dashboard-gallery-card';
    card.dataset.id = img.id;
    card.innerHTML = `
      <img src="${img.imageData}" alt="${img.title}">
      <div class="dashboard-gallery-info">
        <h4>${img.title}</h4>
        <p>${img.tags || ''}</p>
        <div class="dashboard-gallery-actions">
          <button class="edit-gallery-btn" onclick="editGalleryImage('${img.id}')"><i class="fas fa-edit"></i> Edit</button>
          <button class="delete-gallery-btn" onclick="deleteGalleryImage('${img.id}')"><i class="fas fa-trash"></i> Delete</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Add new image
function addGalleryImage(title, tags, imageData) {
  const images = loadImages();
  const newImage = {
    id: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    title,
    tags,
    imageData,
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
  // Also update public gallery if on same page (unlikely)
}

// Edit image – populate form
function editGalleryImage(id) {
  const images = loadImages();
  const img = images.find(i => i.id === id);
  if (!img) return;

  document.getElementById('edit-image-id').value = img.id;
  document.getElementById('edit-image-title').value = img.title;
  document.getElementById('edit-image-tags').value = img.tags || '';
  // Image data is stored – we can show a thumbnail preview
  const preview = document.getElementById('edit-image-preview');
  if (preview) {
    preview.src = img.imageData;
    preview.style.display = 'block';
  }
  document.getElementById('gallery-form-submit').textContent = 'Update Image';
  document.getElementById('gallery-form-cancel').style.display = 'inline-block';
}

// Update image
function updateGalleryImage(id, title, tags, imageData = null) {
  let images = loadImages();
  const index = images.findIndex(i => i.id === id);
  if (index === -1) return;

  images[index].title = title;
  images[index].tags = tags;
  if (imageData) {
    images[index].imageData = imageData; // new image uploaded
  }
  saveImages(images);
}

// Clear gallery form
function clearGalleryForm() {
  document.getElementById('edit-image-id').value = '';
  document.getElementById('edit-image-title').value = '';
  document.getElementById('edit-image-tags').value = '';
  document.getElementById('edit-image-file').value = '';
  document.getElementById('edit-image-preview').src = '';
  document.getElementById('edit-image-preview').style.display = 'none';
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
    alert('Title is required');
    return;
  }

  if (!id && !file) {
    alert('Please select an image');
    return;
  }

  function processImage(dataUrl) {
    if (id) {
      // Update existing
      updateGalleryImage(id, title, tags, dataUrl);
    } else {
      // Add new
      addGalleryImage(title, tags, dataUrl);
    }
    clearGalleryForm();
    renderDashboardGallery('dashboard-gallery-container');
  }

  if (file) {
    // New image uploaded
    const reader = new FileReader();
    reader.onload = (e) => processImage(e.target.result);
    reader.readAsDataURL(file);
  } else {
    // No new file – update only title/tags (keep existing image)
    updateGalleryImage(id, title, tags, null);
    clearGalleryForm();
    renderDashboardGallery('dashboard-gallery-container');
  }
}