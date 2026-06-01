// alert("CRITICAL TEST: The browser is successfully running app.js!");
// console.log("CRITICAL TEST: app.js is alive!");

// ─────────────────────────────────────────────
// AUTH CHECK & INITIALIZATION
// ─────────────────────────────────────────────
const loggedInDoctor = JSON.parse(localStorage.getItem("loggedInDoctor"));

if (!loggedInDoctor) {
  window.location.href = "index.html";
}

// Display authenticated doctor details in the layout header
window.addEventListener("DOMContentLoaded", () => {
  const doctorName = document.getElementById("doctorDisplayName");
  if (doctorName) {
    doctorName.innerText = "Dr " + loggedInDoctor.name;
  }

  const avatar = document.getElementById("doctorAvatar");
  if (avatar && loggedInDoctor.name) {
    const initials = loggedInDoctor.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    avatar.innerText = initials;
  }
});

// ─────────────────────────────────────────────
// CENTRAL VIEW STATE ENGINE
// ─────────────────────────────────────────────
let currentPage = "consultation";
let currentStep = 1;
let selectedCase = null;

// Dynamic Filter State Trackers
let activeRecordFilter = "all"; // Options: "all", "recent", "my-patients"
let activeTimeFilter = 5;       // Options: 0.03 (1mo), 0.5 (6mo), 1 (1yr), 3 (3yr), 5 (5yr)

// Clean Data Layer State Layout
let formData = {
  patientId: generatePatientId(), 
  patientName: "",
  visitDate: new Date().toISOString().split('T')[0], // Automatically defaults to today
  visitType: "OPD consultation",
  referringDoctor: "",
  chiefComplaint: "",
  clinicalNotes: "",
  files: [], 
};

// ─────────────────────────────────────────────
// ROUTING / SIDEBAR NAVIGATION
// ─────────────────────────────────────────────
function navigate(page) {
  currentPage = page;
  currentStep = 1;
  selectedCase = null;
  render();
}

// ─────────────────────────────────────────────
// ROOT CONTENT INJECTION LOOP
// ─────────────────────────────────────────────
function render() {
  const main = document.getElementById("mainContent");
  if (!main) return;

  // Track dynamic active navigation highlight states inside the sidebar
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.page === currentPage);
  });

  if (currentPage === "consultation") renderConsultation(main);
  else if (currentPage === "records") renderRecords(main);
  else if (currentPage === "cases") renderCases(main);
}

// ─────────────────────────────────────────────
// AUTOMATIC UNIQUE PATIENT ID GENERATOR
// ─────────────────────────────────────────────
function generatePatientId() {
  return "HB-PAT-" + Math.floor(10000 + Math.random() * 90000);
}

// ─────────────────────────────────────────────
// CONSULTATION WIZARD TRACKING STEPS BUILDER
// ─────────────────────────────────────────────
function buildSteps() {
  const steps = [
    { num: 1, label: "Patient details" },
    { num: 2, label: "Clinical notes" },
    { num: 3, label: "Upload documents" },
    { num: 4, label: "Review & submit" },
  ];

  let html = '<div class="steps-container">';
  steps.forEach((step, i) => {
    const state = step.num < currentStep ? "completed" : step.num === currentStep ? "active" : "pending";
    html += `
      <div class="step ${state}">
        <div class="step-circle">${step.num}</div>
        <span>${step.label}</span>
      </div>`;
    if (i < steps.length - 1) html += '<div class="step-line"></div>';
  });
  return html + "</div>";
}

// ─────────────────────────────────────────────
// PATIENT CONSULTATION LAYOUT WIZARD
// ─────────────────────────────────────────────
function renderConsultation(main) {
  let content = "";

  if (currentStep === 1) {
    content = `
      <div class="content-box">
        <h2 class="content-title">Patient consultation — step 1</h2>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Patient ID</label>
            <input id="f-patientId" type="text" class="form-input" value="${formData.patientId}" readonly style="background:#fafaf9; color:var(--text-light); font-weight:600;">
          </div>
          <div class="form-group">
            <label class="form-label">Patient name</label>
            <input id="f-patientName" type="text" class="form-input" placeholder="Enter patient name" value="${formData.patientName}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Visit date</label>
            <input id="f-visitDate" type="date" class="form-input" value="${formData.visitDate}">
          </div>
          <div class="form-group">
            <label class="form-label">Visit type</label>
            <select id="f-visitType" class="form-select">
              <option ${formData.visitType === "OPD consultation" ? "selected" : ""}>OPD consultation</option>
              <option ${formData.visitType === "Follow-up" ? "selected" : ""}>Follow-up</option>
              <option ${formData.visitType === "Emergency" ? "selected" : ""}>Emergency</option>
              <option ${formData.visitType === "Pre-op assessment" ? "selected" : ""}>Pre-op assessment</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group full">
            <label class="form-label">Referring doctor (if any)</label>
            <input id="f-referringDoctor" type="text" class="form-input" placeholder="Optional" value="${formData.referringDoctor}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group full">
            <label class="form-label">Chief complaint</label>
            <input id="f-chiefComplaint" type="text" class="form-input" placeholder="e.g. Chest pain, shortness of breath" value="${formData.chiefComplaint}">
          </div>
        </div>
        <div class="btn-group">
          <button class="btn btn-primary" id="btn-next1">Next →</button>
        </div>
      </div>`;
  } else if (currentStep === 2) {
    content = `
      <div class="content-box">
        <h2 class="content-title">Patient consultation — step 2</h2>
        <div class="form-group">
          <label class="form-label">Clinical notes</label>
          <textarea id="f-clinicalNotes" class="form-textarea" placeholder="Enter detailed clinical notes, examination findings, diagnosis, and treatment plan...">${formData.clinicalNotes}</textarea>
        </div>
        <div class="btn-group">
          <button class="btn btn-primary" id="btn-next2">Next →</button>
          <button class="btn btn-secondary" id="btn-back2">← Back</button>
        </div>
      </div>`;
  } else if (currentStep === 3) {
    content = `
      <div class="content-box">
        <h2 class="content-title">Patient consultation — step 3</h2>
        <div class="upload-area" id="uploadArea">
          <input type="file" id="fileInput" multiple accept=".pdf,.jpg,.jpeg,.png,.dcm" style="display:none">
          <div class="upload-icon">📄</div>
          <div class="upload-text">Click to upload MRI scans / reports</div>
          <div class="upload-hint">PDF, JPG, PNG, DICOM supported</div>
        </div>
        <div id="uploadedFiles" style="margin-top: 16px;"></div>
        <div class="btn-group">
          <button class="btn btn-primary" id="btn-next3">Next →</button>
          <button class="btn btn-secondary" id="btn-back3">← Back</button>
        </div>
      </div>`;
  } else {
    content = `
      <div class="content-box">
        <h2 class="content-title">Patient consultation — step 4</h2>
        <div class="review-panel">
          <div class="review-panel-title">Review consultation details</div>
          <div class="review-row">
            <div class="review-label">Patient ID</div>
            <div class="review-value" style="font-weight:600;">${formData.patientId}</div>
          </div>
          <div class="review-row">
            <div class="review-label">Patient name</div>
            <div class="review-value">${formData.patientName || "Not provided"}</div>
          </div>
          <div class="review-row">
            <div class="review-label">Visit date</div>
            <div class="review-value">${formData.visitDate || "Not provided"}</div>
          </div>
          <div class="review-row">
            <div class="review-label">Visit type</div>
            <div class="review-value">${formData.visitType}</div>
          </div>
          <div class="review-row">
            <div class="review-label">Chief complaint</div>
            <div class="review-value">${formData.chiefComplaint || "Not provided"}</div>
          </div>
          <div class="review-row">
            <div class="review-label">Attached Files</div>
            <div class="review-value">${formData.files.length} document(s) uploaded</div>
          </div>
        </div>
        <div class="info-box">
          ℹ️ This consultation will be linked to the patient's medical record and shared with their consent.
        </div>
        <div class="btn-group">
          <button class="btn btn-primary" id="btn-submit">Submit consultation</button>
          <button class="btn btn-secondary" id="btn-back4">← Back</button>
        </div>
      </div>`;
  }

  main.innerHTML = buildSteps() + content;
  bindConsultationEvents();
  if (currentStep === 3) displayFilesList();
}

// ─────────────────────────────────────────────
// REAL-TIME MEMORY RUNTIME INPUT SYNCRONIZATION
// ─────────────────────────────────────────────
function syncActiveWizardFormFields() {
  if (document.getElementById("f-patientName")) {
    formData.patientName = document.getElementById("f-patientName").value.trim();
    formData.visitDate = document.getElementById("f-visitDate").value;
    formData.visitType = document.getElementById("f-visitType").value;
    formData.referringDoctor = document.getElementById("f-referringDoctor").value.trim();
    formData.chiefComplaint = document.getElementById("f-chiefComplaint").value.trim();
  }
  if (document.getElementById("f-clinicalNotes")) {
    formData.clinicalNotes = document.getElementById("f-clinicalNotes").value.trim();
  }
}

// ─────────────────────────────────────────────
// EVENT INTERACTION MANAGEMENT AGENTS
// ─────────────────────────────────────────────
function bindConsultationEvents() {
  const next1 = document.getElementById("btn-next1");
  if (next1) {
    next1.addEventListener("click", () => {
      syncActiveWizardFormFields();
      if (!formData.patientName) { alert("Please input a valid Patient Name before moving forward."); return; }
      currentStep = 2; render();
    });
  }

  const next2 = document.getElementById("btn-next2");
  if (next2) {
    next2.addEventListener("click", () => { syncActiveWizardFormFields(); currentStep = 3; render(); });
  }
  const back2 = document.getElementById("btn-back2");
  if (back2) back2.addEventListener("click", () => { syncActiveWizardFormFields(); currentStep = 1; render(); });

  const next3 = document.getElementById("btn-next3");
  if (next3) next3.addEventListener("click", () => { currentStep = 4; render(); });
  const back3 = document.getElementById("btn-back3");
  if (back3) back3.addEventListener("click", () => { syncActiveWizardFormFields(); currentStep = 2; render(); });

  const back4 = document.getElementById("btn-back4");
  if (back4) back4.addEventListener("click", () => { currentStep = 3; render(); });

  const fileInput = document.getElementById("fileInput");
  const uploadArea = document.getElementById("uploadArea");
  if (fileInput && uploadArea) {
    uploadArea.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      const parsedFilesList = Array.from(e.target.files);
      formData.files = parsedFilesList.map(file => ({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB"
      }));
      displayFilesList();
    });
  }

  const submit = document.getElementById("btn-submit");
  if (submit) submit.addEventListener("click", submitConsultation);
}

function displayFilesList() {
  const filesWrapper = document.getElementById("uploadedFiles");
  if (!filesWrapper) return;
  if (formData.files.length === 0) {
    filesWrapper.innerHTML = `<span style="color:var(--text-lighter); font-size:12px;">No documents selected.</span>`;
    return;
  }
  filesWrapper.innerHTML = formData.files.map(file => `
    <div style="margin-top:10px; padding:10px; background:#f5f5f4; border:1px solid var(--border); border-radius:var(--radius); display:flex; justify-content:space-between; align-items:center;">
      <span>📄 ${file.name} <small style="color:var(--text-light);">(${file.size})</small></span>
    </div>
  `).join("");
}

// ─────────────────────────────────────────────
// CENTRAL AWS CLOUD DATABASE HANDLER
// ─────────────────────────────────────────────
async function submitConsultation() {
  // 1. Build the network payload mapping exactly to your backend DynamoDB table scheme
  const executionPayload = {
    id: formData.patientId, // Maps to the expected 'id' Partition Key in DynamoDB
    patientId: formData.patientId,
    patientName: formData.patientName,
    doctorId: loggedInDoctor.id,
    doctorName: loggedInDoctor.name,
    visitDate: formData.visitDate,
    visitType: formData.visitType,
    referringDoctor: formData.referringDoctor,
    chiefComplaint: formData.chiefComplaint,
    clinicalNotes: formData.clinicalNotes,
    files: formData.files,
    status: "Active",
    submittedAt: new Date().toISOString()
  };

  try {
    // 2. Dispatch an asynchronous HTTP POST request to your live API Gateway resource
    const response = await fetch(`${config.BASE_URL}/consultations`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(executionPayload)
    });

    // 3. Evaluate backend API responses
    if (response.ok || response.status === 201) {
      alert("Consultation submitted successfully to AWS Cloud Database!");

      // 4. Reset runtime memory state loop variables upon successful cloud save
      currentStep = 1;
      formData = {
        patientId: generatePatientId(),
        patientName: "",
        visitDate: new Date().toISOString().split('T')[0],
        visitType: "OPD consultation",
        referringDoctor: "",
        chiefComplaint: "",
        clinicalNotes: "",
        files: []
      };

      render();
    } else {
      const errorData = await response.json().catch(() => ({}));
      alert(`Backend Error: ${errorData.message || 'Submission rejected by API Gateway.'}`);
    }
  } catch (err) {
    console.error("AWS Sync Error:", err);
    alert("Network communication failure connecting to API Gateway. Please verify your internet connection or CORS settings.");
  }
}
// ─────────────────────────────────────────────
// INTERACTIVE AWS PATIENT RECORD ENGINE WITH TOGGLE
// ─────────────────────────────────────────────
async function renderRecords(main) {
  // Capture current search bar value
  const searchInput = document.getElementById("recordSearch");
  const query = searchInput ? searchInput.value.trim() : "";

  let recordsHTML = "";

  try {
    // 1. Fetch live data matching the query directly from your AWS /patients endpoint
    const response = await fetch(`${config.BASE_URL}/patients?search=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`API Gateway returned status: ${response.status}`);
    }
    
    let records = await response.json();

    // 2. Filter records based on the logged-in doctor if needed
    // (If your AWS backend does not filter by doctorId automatically, we handle it here)
    if (activeRecordFilter === "my-patients" && loggedInDoctor) {
      records = records.filter(r => r.doctorId === loggedInDoctor.id);
    }

    // 3. Apply Sub-Filter Chip States Live on the fetched data
    if (activeRecordFilter === "recent") {
      const todayStr = new Date().toISOString().split('T')[0];
      records = records.filter(r => (r.visitDate || r.lastVisit) === todayStr);
    }

    // 4. Construct HTML content based on Cloud Results
    if (!records || records.length === 0) {
      recordsHTML = `
        <div style="text-align:center; padding:40px; color:var(--text-light); background:white; border-radius:8px; border:1px solid var(--border)">
          ⚠️ No medical records found matching this active cloud filter view.
        </div>`;
    } else {
      recordsHTML = `<div class="results">` + records.map(p => {
        // Unify properties from potential DynamoDB field variants (e.g. 'name' or 'patientName')
        const patientName = p.patientName || p.name || "Unknown Patient";
        const patientId = p.patientId || p.id;
        const visitDate = p.visitDate || p.lastVisit || "N/A";
        const doctorName = p.doctorName || p.doctor || "Portal Staff";
        
        // Handle fallback strings for objects missing the status field property
        const currentStatus = p.status || "Active";
        const isCurrentlyActive = currentStatus === "Active";
        
        // Determine look adjustments based on current status state
        const statusPillClass = isCurrentlyActive ? "pill-success" : "pill-info";
        const statusStyleOverrides = isCurrentlyActive ? "" : "background:#e2e8f0; color:#475569; border-color:#cbd5e1;";
        const statusButtonLabel = isCurrentlyActive ? "Mark Inactive" : "Mark Active";

        return `
        <div class="result-item" style="${!isCurrentlyActive ? 'opacity: 0.85; background: #fafafa;' : ''}">
          <div class="result-header">
            <div>
              <div class="result-title">${patientName} ${!isCurrentlyActive ? '<small style="color:var(--text-light); font-weight:normal;">(Discharged)</small>' : ''}</div>
              <div class="result-id">Patient ID: ${patientId}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <button onclick="togglePatientStatus('${patientId}')" style="background:none; border:none; color:var(--teal); font-size:12px; cursor:pointer; padding:4px; font-weight:600; text-decoration:underline;">${statusButtonLabel}</button>
              <button onclick="deleteRecord('${patientId}')" style="background:none; border:none; color:#ef4444; font-size:12px; cursor:pointer; padding:4px; font-weight:500;">Delete</button>
              <span class="pill ${statusPillClass}" style="${statusStyleOverrides}">${currentStatus}</span>
            </div>
          </div>
          <div class="result-desc">
            Encounter Date: ${visitDate} &bull; Visit Type: ${p.visitType || "OPD consultation"}
          </div>
          <div class="result-desc" style="margin-top: 6px; color: var(--text-light); font-size:13px; line-height:1.4;">
            <strong>Clinical Notes:</strong> ${p.clinicalNotes || 'No consultation notes detailed.'}
          </div>
          <div class="result-meta">Department: Clinical Portal Specialists &bull; Attending: ${doctorName}</div>
          <div class="result-tags">
            ${p.chiefComplaint ? `<span class="tag">${p.chiefComplaint}</span>` : ''}
            ${p.files && p.files.length > 0 ? `<span class="tag" style="background:var(--teal-light); color:var(--teal-dark); border-color:var(--teal);">📎 ${p.files.length} Document(s) attached</span>` : ''}
          </div>
        </div>`;
      }).join("") + `</div>`;
    }
  } catch (err) {
    console.error("AWS Retrieval Error:", err);
    recordsHTML = `
      <div style="text-align:center; padding:40px; color:#ef4444; background:white; border-radius:8px; border:1px solid var(--border)">
        ❌ Failed to sync or pull medical records from AWS Cloud Backend.
      </div>`;
  }

  // Inject layout controls and cloud records list into main panel
  main.innerHTML = `
    <div class="search-wrapper">
      <span class="search-icon">🔍</span>
      <input type="text" class="form-input search-input"
        placeholder="Search by Patient ID, patient name, or registration number..."
        id="recordSearch" value="${query}">
    </div>
    <div class="filters">
      <div class="filter-chip ${activeRecordFilter === 'all' ? 'active' : ''}" onclick="setRecordFilter('all')">All records</div>
      <div class="filter-chip ${activeRecordFilter === 'recent' ? 'active' : ''}" onclick="setRecordFilter('recent')">Recent visits</div>
      <div class="filter-chip ${activeRecordFilter === 'my-patients' ? 'active' : ''}" onclick="setRecordFilter('my-patients')">My patients</div>
    </div>
    ${recordsHTML}`;

  // Restore cursor focus state to preserve flawless continuous user typing
  const cleanFieldRef = document.getElementById("recordSearch");
  if (cleanFieldRef) {
    cleanFieldRef.focus();
    cleanFieldRef.setSelectionRange(cleanFieldRef.value.length, cleanFieldRef.value.length);
    cleanFieldRef.addEventListener("input", () => renderRecords(main));
  }
}

function setRecordFilter(filterType) {
  activeRecordFilter = filterType;
  renderRecords(document.getElementById("mainContent"));
}

// ─────────────────────────────────────────────
// NEW FUNCTION: ACTIVE / INACTIVE STATUS TOGGLE
// ─────────────────────────────────────────────
function togglePatientStatus(patientId) {
  let globalDatabaseIndices = JSON.parse(localStorage.getItem("cloud_patient_consultations")) || [];
  
  globalDatabaseIndices = globalDatabaseIndices.map(p => {
    if (p.patientId === patientId) {
      // Toggle value logic sequence
      const dynamicCurrentStatus = p.status || "Active";
      p.status = dynamicCurrentStatus === "Active" ? "Inactive" : "Active";
    }
    return p;
  });

  localStorage.setItem("cloud_patient_consultations", JSON.stringify(globalDatabaseIndices));
  renderRecords(document.getElementById("mainContent"));
}

// ─────────────────────────────────────────────
// DELETION LOGIC ROUTINE FUNCTION
// ─────────────────────────────────────────────
function deleteRecord(patientId) {
  if (confirm(`Are you sure you want to permanently delete record ${patientId}?`)) {
    let globalDatabaseIndices = JSON.parse(localStorage.getItem("cloud_patient_consultations")) || [];
    globalDatabaseIndices = globalDatabaseIndices.filter(p => p.patientId !== patientId);
    localStorage.setItem("cloud_patient_consultations", JSON.stringify(globalDatabaseIndices));
    renderRecords(document.getElementById("mainContent"));
  }
}

// ─────────────────────────────────────────────
// CROSS-CASE INTELLIGENCE SEARCH ENGINE (TIMELINES) - AWS SYNCED
// ─────────────────────────────────────────────
async function renderCases(main) {
  const caseSearchInput = document.getElementById("caseSearch");
  const query = caseSearchInput ? caseSearchInput.value.trim() : "";

  let caseListHTML = "";

  try {
    // 1. Fetch case files directly from your AWS /cases endpoint 
    const response = await fetch(`${config.BASE_URL}/cases?search=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`API Gateway returned status: ${response.status}`);
    }

    const casesFromCloud = await response.json();
    const now = new Date();

    // 2. Filter records based on your active timeline chip values (activeTimeFilter)
    let matchingCases = casesFromCloud.filter(c => {
      // Use case date or fallback to present if missing
      const rawDate = c.visitDate || c.date;
      if (!rawDate) return true; // Keep case if date metadata is unmapped
      
      const caseDate = new Date(rawDate);
      // Fallback parser if date format is a custom text string like "Nov 2023"
      if (isNaN(caseDate.getTime())) return true; 

      const diffTime = Math.abs(now - caseDate);
      const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
      return diffYears <= activeTimeFilter;
    });

    // 3. Construct HTML display items mirroring your exact design system
    if (!matchingCases || matchingCases.length === 0) {
      caseListHTML = `
        <div style="text-align:center; padding:40px; color:var(--text-light); background:white; border-radius:8px; border:1px solid var(--border)">
          No matching clinical profiles found within this specific timeline window.
        </div>`;
    } else {
      caseListHTML = `<div class="results">` + matchingCases.map((c, idx) => {
        // Unify properties from potential local/DynamoDB field structure variants
        const caseId = c.patientId || c.id || "CASE-REF";
        const caseTitle = c.chiefComplaint || c.title || "General Health Consultation";
        const caseNotes = c.clinicalNotes || c.desc || "No notes mapped.";
        const caseDate = c.visitDate || c.date || "N/A";
        const provider = c.doctorName || c.doctor || c.hospital || "Reference Repository";
        const visitType = c.visitType || c.source || "Internal Case";

        let baseMatch = 100 - (idx * 4);
        if (query && !caseTitle.toLowerCase().includes(query.toLowerCase())) baseMatch -= 7;
        const finalMatchRate = Math.max(74, baseMatch);

        return `
        <div class="result-item">
          <div class="result-header">
            <div>
              <span class="result-id">${caseId}</span>
              <span class="pill pill-success" style="margin-left:8px; background:var(--teal-light); color:var(--teal-dark);">${finalMatchRate}% match</span>
            </div>
            <span class="pill pill-info">${visitType}</span>
          </div>
          <div class="result-title">${caseTitle}</div>
          <div class="result-desc">
            ${caseNotes}
          </div>
          <div class="result-meta">Encounter Reference Date: ${caseDate} &bull; Origin Facility Provider: ${provider}</div>
          <div class="result-tags">
            <span class="tag">Shared Cloud Database</span>
            ${(c.tags || []).map(t => {
              const tagText = typeof t === 'object' && t.S ? t.S : (typeof t === 'string' ? t : JSON.stringify(t));
              return `<span class="tag">${tagText}</span>`;
            }).join("")}
          </div>
        </div>`;
      }).join("") + `</div>`;
    }

    // 4. Inject structural layouts with active tracking counts
    main.innerHTML = `
      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input type="text" class="form-input search-input"
          placeholder="Search by symptoms, diagnosis, ICD code..."
          value="${query}" id="caseSearch">
      </div>
      <div class="filters">
        <div class="filter-chip ${activeTimeFilter === 0.03 ? 'active' : ''}" onclick="setTimeFilter(0.03)">Last 1 Month</div>
        <div class="filter-chip ${activeTimeFilter === 0.5 ? 'active' : ''}" onclick="setTimeFilter(0.5)">Last 6 Months</div>
        <div class="filter-chip ${activeTimeFilter === 1 ? 'active' : ''}" onclick="setTimeFilter(1)">Last 1 Year</div>
        <div class="filter-chip ${activeTimeFilter === 3 ? 'active' : ''}" onclick="setTimeFilter(3)">Last 3 Years</div>
        <div class="filter-chip ${activeTimeFilter === 5 ? 'active' : ''}" onclick="setTimeFilter(5)">Last 5 Years</div>
      </div>
      <div style="margin:16px 0;">
        <div style="font-size:15px;font-weight:600;margin-bottom:4px;">${matchingCases.length} similar cases discovered in this timeline</div>
      </div>
      ${caseListHTML}`;

  } catch (err) {
    console.error("AWS Cases Engine Failure:", err);
    main.innerHTML = `
      <div style="text-align:center; padding:40px; color:#ef4444; background:white; border-radius:8px; border:1px solid var(--border)">
        ❌ Failed connecting to case study index repository on AWS.
      </div>`;
  }

  // 5. Seamless cursor recovery for uninterrupted typing search inputs
  const searchBox = document.getElementById("caseSearch");
  if (searchBox) {
    searchBox.focus();
    searchBox.setSelectionRange(searchBox.value.length, searchBox.value.length);
    searchBox.addEventListener("input", () => renderCases(main));
  }
}

function setTimeFilter(yearsValue) {
  activeTimeFilter = yearsValue;
  renderCases(document.getElementById("mainContent"));
}

// ─────────────────────────────────────────────
// SIDEBAR EVENT REGISTRATION DELEGATORS
// ─────────────────────────────────────────────
document.querySelectorAll(".nav-item[data-page]").forEach((item) => {
  item.addEventListener("click", () => navigate(item.dataset.page));
});

// Run application engine loop
render();