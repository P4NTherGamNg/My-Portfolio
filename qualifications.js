// qualifications.js

// Default qualifications with date ranges (createdAt = 0 ensures they appear at bottom)
const defaultQualifications = [
  {
    id: 'level4',
    title: 'NVQ Level 04',
    levelTag: 'ICT · Completed',
    description: '6-month intensive course covering hardware, operating systems, office applications, and basic programming.',
    status: 'Completed · 2024',
    icon: 'fa-certificate',
    progressType: 'date',
    startDate: '2024-01-01',
    endDate: '2024-07-01',
    noProgress: false,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: 'level5',
    title: 'NVQ Level 05',
    levelTag: 'Diploma in ICT · in progress',
    description: 'Advanced diploma focusing on networking, database design, web development, systems analysis.',
    status: 'Started Jan 9, 2026',
    icon: 'fa-layer-group',
    progressType: 'date',
    startDate: '2026-01-09',
    endDate: '2027-01-09',
    noProgress: false,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: 'skills',
    title: 'Core skills',
    levelTag: 'technical toolbox',
    description: 'HTML/CSS, JavaScript basics, Python fundamentals, networking essentials (Cisco), MySQL, and PC troubleshooting.',
    status: 'Always learning',
    icon: 'fa-code',
    progressType: 'none',
    noProgress: true,
    createdAt: 0,
    updatedAt: 0
  }
];

// Load qualifications from localStorage, or set defaults
function loadQualifications() {
  const stored = localStorage.getItem('qualifications');
  if (stored) {
    return JSON.parse(stored);
  } else {
    localStorage.setItem('qualifications', JSON.stringify(defaultQualifications));
    return defaultQualifications;
  }
}

// Save qualifications to localStorage
function saveQualifications(quals) {
  localStorage.setItem('qualifications', JSON.stringify(quals));
}

// Calculate progress percentage based on start and end dates
function calculateProgress(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (now < start) return 0;
  if (now > end) return 100;

  const total = end - start;
  const elapsed = now - start;
  return Math.round((elapsed / total) * 100);
}

// Render qualifications on any page (sort by latest updated/created)
function renderQualifications(containerId, showControls = false) {
  let quals = loadQualifications();

  // Sort by updatedAt (if exists) else createdAt, descending (newest first)
  quals.sort((a, b) => {
    const aTime = a.updatedAt || a.createdAt || 0;
    const bTime = b.updatedAt || b.createdAt || 0;
    return bTime - aTime;
  });

  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = ''; // clear

  quals.forEach(qual => {
    const card = document.createElement('div');
    card.className = 'qual-card';
    card.dataset.id = qual.id;

    // Icon
    const iconDiv = document.createElement('div');
    iconDiv.className = 'card-icon';
    iconDiv.innerHTML = `<i class="fas ${qual.icon}"></i>`;

    // Title
    const title = document.createElement('h3');
    title.textContent = qual.title;

    // Level tag
    const levelTag = document.createElement('span');
    levelTag.className = 'level-tag';
    levelTag.textContent = qual.levelTag;

    // Description
    const desc = document.createElement('p');
    desc.textContent = qual.description;

    // Status
    const statusDiv = document.createElement('div');
    statusDiv.className = 'status';
    statusDiv.innerHTML = `<i class="fas ${qual.icon}"></i> ${qual.status}`;

    card.appendChild(iconDiv);
    card.appendChild(title);
    card.appendChild(levelTag);
    card.appendChild(desc);
    card.appendChild(statusDiv);

    // Progress bar (if not hidden)
    if (!qual.noProgress) {
      let progress = 0;
      if (qual.progressType === 'date') {
        progress = calculateProgress(qual.startDate, qual.endDate);
      } else if (qual.progressType === 'fixed') {
        progress = qual.progressFixed;
      }

      const progressContainer = document.createElement('div');
      progressContainer.className = 'progress-container';
      progressContainer.innerHTML = `
        <div class="progress-label">
          <span>Progress</span>
          <span class="progress-percent">${progress}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%;"></div>
        </div>
      `;
      card.appendChild(progressContainer);
    }

    // Edit/Delete buttons (only in dashboard)
    if (showControls) {
      const controlsDiv = document.createElement('div');
      controlsDiv.style.display = 'flex';
      controlsDiv.style.gap = '10px';
      controlsDiv.style.marginTop = '16px';

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn';
      editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
      editBtn.addEventListener('click', () => populateEditForm(qual));

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
      deleteBtn.addEventListener('click', () => deleteQualification(qual.id));

      controlsDiv.appendChild(editBtn);
      controlsDiv.appendChild(deleteBtn);
      card.appendChild(controlsDiv);
    }

    container.appendChild(card);
  });
}

// Delete a qualification
function deleteQualification(id) {
  let quals = loadQualifications();
  quals = quals.filter(q => q.id !== id);
  saveQualifications(quals);
  renderQualifications('dashboard-quals-container', true);
}

// Populate the edit form with qualification data
function populateEditForm(qual) {
  document.getElementById('edit-id').value = qual.id;
  document.getElementById('edit-title').value = qual.title;
  document.getElementById('edit-level').value = qual.levelTag;
  document.getElementById('edit-desc').value = qual.description;
  document.getElementById('edit-status').value = qual.status;
  document.getElementById('edit-icon').value = qual.icon;

  if (qual.progressType === 'date') {
    document.getElementById('edit-progress-type-date').checked = true;
    document.getElementById('edit-start-date').value = qual.startDate;
    document.getElementById('edit-end-date').value = qual.endDate;
    document.getElementById('date-fields').style.display = 'block';
    document.getElementById('fixed-progress-field').style.display = 'none';
  } else if (qual.progressType === 'fixed') {
    document.getElementById('edit-progress-type-fixed').checked = true;
    document.getElementById('edit-fixed-progress').value = qual.progressFixed;
    document.getElementById('date-fields').style.display = 'none';
    document.getElementById('fixed-progress-field').style.display = 'block';
  } else {
    // no progress
    document.getElementById('edit-progress-type-none').checked = true;
    document.getElementById('date-fields').style.display = 'none';
    document.getElementById('fixed-progress-field').style.display = 'none';
  }

  // Change form button to Update
  document.getElementById('form-submit-btn').textContent = 'Update Qualification';
  document.getElementById('form-cancel-btn').style.display = 'inline-block';
}

// Clear the edit form
function clearEditForm() {
  document.getElementById('edit-id').value = '';
  document.getElementById('edit-title').value = '';
  document.getElementById('edit-level').value = '';
  document.getElementById('edit-desc').value = '';
  document.getElementById('edit-status').value = '';
  document.getElementById('edit-icon').value = 'fa-certificate';
  document.getElementById('edit-start-date').value = '';
  document.getElementById('edit-end-date').value = '';
  document.getElementById('edit-fixed-progress').value = '';
  document.getElementById('edit-progress-type-date').checked = true;
  document.getElementById('date-fields').style.display = 'block';
  document.getElementById('fixed-progress-field').style.display = 'none';
  document.getElementById('form-submit-btn').textContent = 'Add Qualification';
  document.getElementById('form-cancel-btn').style.display = 'none';
}

// Handle form submit (add or update)
function handleQualificationSubmit(event) {
  event.preventDefault();

  const id = document.getElementById('edit-id').value;
  const title = document.getElementById('edit-title').value.trim();
  const levelTag = document.getElementById('edit-level').value.trim();
  const description = document.getElementById('edit-desc').value.trim();
  const status = document.getElementById('edit-status').value.trim();
  const icon = document.getElementById('edit-icon').value;

  let progressType = 'date';
  if (document.getElementById('edit-progress-type-fixed').checked) progressType = 'fixed';
  if (document.getElementById('edit-progress-type-none').checked) progressType = 'none';

  let newQual = {
    id: id || 'qual_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    title,
    levelTag,
    description,
    status,
    icon,
    progressType,
    noProgress: (progressType === 'none')
  };

  if (progressType === 'date') {
    newQual.startDate = document.getElementById('edit-start-date').value;
    newQual.endDate = document.getElementById('edit-end-date').value;
  } else if (progressType === 'fixed') {
    newQual.progressFixed = parseInt(document.getElementById('edit-fixed-progress').value) || 0;
  }

  let quals = loadQualifications();

  if (id) {
    // Update existing qualification
    const index = quals.findIndex(q => q.id === id);
    if (index !== -1) {
      // Preserve createdAt and set updatedAt
      newQual.createdAt = quals[index].createdAt || Date.now();
      newQual.updatedAt = Date.now();
      quals[index] = newQual;
    }
  } else {
    // Add new qualification
    newQual.createdAt = Date.now();
    newQual.updatedAt = Date.now();
    quals.push(newQual);
  }

  saveQualifications(quals);
  clearEditForm();
  renderQualifications('dashboard-quals-container', true);
}

// Toggle progress type fields
function toggleProgressFields() {
  const dateRadio = document.getElementById('edit-progress-type-date');
  const fixedRadio = document.getElementById('edit-progress-type-fixed');
  const noneRadio = document.getElementById('edit-progress-type-none');
  const dateFields = document.getElementById('date-fields');
  const fixedField = document.getElementById('fixed-progress-field');

  if (dateRadio.checked) {
    dateFields.style.display = 'block';
    fixedField.style.display = 'none';
  } else if (fixedRadio.checked) {
    dateFields.style.display = 'none';
    fixedField.style.display = 'block';
  } else {
    dateFields.style.display = 'none';
    fixedField.style.display = 'none';
  }
}