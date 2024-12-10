// Fields to track
const fields = [
    "fullName", "age", "birthPlace", "currentResidence",
    "height", "weight", "facialFeatures", "hair", "eyes", "complexion", "dress", "bodyLanguage", "voice",
    "family", "childhood", "education", "occupation", "significantEvents", "culture", "languagesSpoken",
    "personality", "values", "fears", "motivations", "strengths", "hobbies", "habits", "emotionalProfile", "mentalHealth", "beliefs",
    "romanticLife", "friends", "rivals", "socialCircle", "reputation", "communicationStyle",
    "internalConflicts", "externalConflicts", "pastMistakes", "hiddenAgendas",
    "talents", "extraLanguages", "supernatural", "weapons",
    "financial", "possessions", "transportation",
    "dailyRoutine", "diet", "physicalHealth",
    "storyRole", "characterArc", "plotConflicts", "themes",
    "mannerisms", "spiritualAffiliations", "symbolism", "accomplishments", "failures", "legacy"
];

let characters = loadCharacters();
let selectedCharacterKey = null;

// DOM references
const characterList = document.getElementById('characterList');
const saveBtn = document.getElementById('saveBtn');
const newCharacterBtn = document.getElementById('newCharacterBtn');
const deleteCharacterBtn = document.getElementById('deleteCharacterBtn');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const summaryContent = document.getElementById('summaryContent');

const container = document.querySelector('.container');
const resizer = document.getElementById('resizer');

let isDirty = false; // Track if form changed since last save or load.

const copySummaryBtn = document.getElementById('copySummaryBtn');

copySummaryBtn.addEventListener('click', () => {
  const textToCopy = summaryContent.innerText; 
  navigator.clipboard.writeText(textToCopy).then(() => {
    alert('Summary copied to clipboard!');
  });
});

function markDirty() {
  isDirty = true;
}

fields.forEach(f => {
  const el = document.getElementById(f);
  el.addEventListener('input', markDirty);
});

// Build a dictionary of field labels from the HTML labels
const fieldLabels = {};
fields.forEach(f => {
    const labelEl = document.querySelector(`label[for="${f}"]`);
    if (labelEl) {
        // Remove trailing colon if present
        let labelText = labelEl.textContent.trim().replace(/:`\s*$/, '');
        fieldLabels[f] = labelText;
    } else {
        // Fallback if no label found
        fieldLabels[f] = f;
    }
});

// Populate the character list
function populateCharacterList() {
    characterList.innerHTML = '';
    for (const key of Object.keys(characters)) {
        const li = document.createElement('li');
        li.textContent = characters[key].fullName || key;
        li.dataset.key = key;
        if (key === selectedCharacterKey) {
            li.classList.add('selected');
        }
        characterList.appendChild(li);
    }
}

// Load from localStorage
function loadCharacters() {
    const data = localStorage.getItem('characters');
    return data ? JSON.parse(data) : {};
}

// Save to localStorage
function saveCharacters() {
    localStorage.setItem('characters', JSON.stringify(characters));
}

// Clear form
function clearForm() {
    fields.forEach(f => {
        const el = document.getElementById(f);
        el.value = '';
        autoResizeTextarea(el);
    });
}

// Load character into form
function loadCharacter(charKey) {
    clearForm();
    const charData = characters[charKey];
    if (!charData) return;
    fields.forEach(f => {
      const el = document.getElementById(f);
      el.value = charData[f] || '';
      autoResizeTextarea(el);
    });
    isDirty = false; // loaded from saved data, no unsaved changes yet
    updateSummary();
  }

// Get form data
function getFormData() {
    const data = {};
    fields.forEach(f => {
        data[f] = document.getElementById(f).value.trim();
    });
    return data;
}


// Create a new character mode
newCharacterBtn.addEventListener('click', () => {
    if (isDirty && !confirm('You have unsaved changes. Discard them?')) {
      return;
    }
    selectedCharacterKey = null;
    clearForm();
    isDirty = false;
    updateListSelection();
    updateSummary();
  });

// Save character
saveBtn.addEventListener('click', () => {
    let key = selectedCharacterKey;
    if (!key) {
        // Create a unique key for new character
        const nameField = document.getElementById('fullName').value.trim() || 'UnnamedCharacter';
        key = nameField.replace(/\s+/g, '_') + '_' + Date.now();
    }
    characters[key] = getFormData();
    saveCharacters();
    selectedCharacterKey = key;
    populateCharacterList();
    updateListSelection();
    updateSummary();
    isDirty = false;
    alert('Character saved successfully!');
});

// Delete character
deleteCharacterBtn.addEventListener('click', () => {
    if (!selectedCharacterKey) {
        alert('No character selected to delete.');
        return;
    }
    const confirmDelete = confirm('Are you sure you want to delete this character?');
    if (confirmDelete) {
        delete characters[selectedCharacterKey];
        saveCharacters();
        selectedCharacterKey = null;
        populateCharacterList();
        clearForm();
        updateSummary();
        alert('Character deleted.');
    }
});

// Click on character in list
characterList.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'li') {
      if (isDirty && !confirm('You have unsaved changes. Discard them?')) {
        return;
      }
      selectedCharacterKey = e.target.dataset.key;
      loadCharacter(selectedCharacterKey);
      updateListSelection();
    }
  });

// Update the selected style in the list
function updateListSelection() {
    const lis = characterList.querySelectorAll('li');
    lis.forEach(li => {
        if (li.dataset.key === selectedCharacterKey) {
            li.classList.add('selected');
        } else {
            li.classList.remove('selected');
        }
    });
}

// Export all to JSON
exportBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(characters, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'characters.json');
    a.click();
    URL.revokeObjectURL(url);
});

// Import from JSON
importFile.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (typeof importedData === 'object') {
                characters = importedData;
                saveCharacters();
                populateCharacterList();
                clearForm();
                updateSummary();
                alert('Characters imported successfully!');
            } else {
                alert('Invalid JSON format.');
            }
        } catch (err) {
            alert('Error reading JSON: ' + err.message);
        }
    };
    reader.readAsText(file);
});

// Update summary panel
function updateSummary() {
    summaryContent.innerHTML = '';
    if (!selectedCharacterKey) return;
    const charData = characters[selectedCharacterKey];
    for (const f of fields) {
      const val = charData[f];
      if (val && val.trim() !== '') {
        const div = document.createElement('div');
        div.classList.add('summary-field');
        const fieldLabel = document.createElement('span');
        fieldLabel.textContent = fieldLabels[f] + ':'; // Use the label text
        const fieldValue = document.createElement('div');
        fieldValue.textContent = val;
        div.appendChild(fieldLabel);
        div.appendChild(fieldValue);
        summaryContent.appendChild(div);
      }
    }
  }

// Auto-resizing textareas
function autoResizeTextarea(el) {
    if (el && el.tagName.toLowerCase() === 'textarea') {
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    }
}

// Add event listeners to auto-resize textareas
fields.forEach(f => {
    const el = document.getElementById(f);
    el.addEventListener('input', () => {
        autoResizeTextarea(el);
        const tempData = getFormData();
        updateSummaryLive(tempData);
    });
});

// Update summary from current form data (without saving)
function updateSummaryLive(tempData) {
    summaryContent.innerHTML = '';
    for (const f of fields) {
      const val = tempData[f];
      if (val && val.trim() !== '') {
        const div = document.createElement('div');
        div.classList.add('summary-field');
        const fieldLabel = document.createElement('span');
        fieldLabel.textContent = fieldLabels[f] + ':'; 
        const fieldValue = document.createElement('div');
        fieldValue.textContent = val;
        div.appendChild(fieldLabel);
        div.appendChild(fieldValue);
        summaryContent.appendChild(div);
      }
    }
  }

// Draggable Resizer functionality
let isResizing = false;
let startX = 0;
let startWidth = 0;

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    const summaryPanel = document.querySelector('.summary-panel');
    startWidth = summaryPanel.offsetWidth;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const dx = e.clientX - startX;
    // Invert the resizing direction:
    const newWidth = startWidth - dx;
    const minWidth = 250;
    const maxWidth = 800;
    const finalWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
    container.style.gridTemplateColumns = `200px 1fr 5px ${finalWidth}px`;
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = '';
    }
});

// Initial population
populateCharacterList();
clearForm();
updateSummary();
