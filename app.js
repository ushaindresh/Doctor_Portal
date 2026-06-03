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

  // Create global hidden pop-up hover panel container if it doesn't exist
  if (!document.getElementById("global-hover-preview-panel")) {
    const previewContainer = document.createElement("div");
    previewContainer.id = "global-hover-preview-panel";
    previewContainer.style.position = "fixed";
    previewContainer.style.display = "none";
    previewContainer.style.zIndex = "99999";
    previewContainer.style.pointerEvents = "none"; // Prevents mouse traps
    previewContainer.style.background = "#ffffff";
    previewContainer.style.boxShadow = "0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3)";
    previewContainer.style.border = "2px solid #14b8a6";
    previewContainer.style.borderRadius = "8px";
    previewContainer.style.padding = "4px";
    previewContainer.style.width = "400px";
    previewContainer.style.height = "400px";
    previewContainer.style.overflow = "hidden";
    document.body.appendChild(previewContainer);
  }
});

// ─────────────────────────────────────────────
// CENTRAL VIEW STATE ENGINE
// ─────────────────────────────────────────────
let currentPage = "consultation";
let currentStep = 1;
let selectedCase = null;

// Dynamic Filter State Trackers
let activeRecordFilter = "all";
let activeTimeFilter = 5;

// Clean Data Layer State Layout
let formData = {
  patientId: generatePatientId(),
  patientName: "",
  visitDate: new Date().toISOString().split('T')[0],
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
            <input id="f-referringDoctor" type="text" class="form-input" placeholder="Optional name or email address" value="${formData.referringDoctor}">
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
    const refDoc = formData.referringDoctor ? formData.referringDoctor.trim() : "";
    let refDocHTML = "Not provided";
    
    if (refDoc) {
      const emailSubject = encodeURIComponent(`Medical Referral Case Update: ${formData.patientId}`);
      const emailBody = encodeURIComponent(
        `Dear Doctor,\n\n` +
        `This is a medical case notification from the Clinical Portal network:\n\n` +
        `- Patient Reference ID: ${formData.patientId}\n` +
        `- Patient Profile Name: ${formData.patientName || "Not provided"}\n` +
        `- Encounter Date: ${formData.visitDate}\n` +
        `- Primary Encounter Classification: ${formData.visitType}\n` +
        `- Chief Medical Complaint: ${formData.chiefComplaint || "Not provided"}\n\n` +
        `Please log into your clinic worklist terminal to access complete document sets.\n\n` +
        `Kind regards,\n` +
        `Dr. ${(loggedInDoctor && loggedInDoctor.name) ? loggedInDoctor.name : "Portal Attending Staff"}`
      );
      
      const targetMailbox = refDoc.includes('@') ? refDoc : "";
      refDocHTML = `<a href="mailto:${targetMailbox}?subject=${emailSubject}?body=${emailBody}" style="color: var(--teal); font-weight: 600; text-decoration: underline;">✉️ ${refDoc} (Click to open mail notification)</a>`;
    }

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
            <div class="review-label">Referring Doctor</div>
            <div class="review-value">${refDocHTML}</div>
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
    fileInput.addEventListener("change", async (e) => {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length === 0) return;

      const uploadStatus = document.getElementById("uploadedFiles");
      if (uploadStatus) uploadStatus.innerHTML = `<span style="color:var(--teal); font-size:13px;">⏳ Uploading files to cloud...</span>`;

      const uploadedResults = [];

      for (const file of selectedFiles) {
        try {
          // Determine MIME type — browser sometimes leaves file.type empty for certain formats
          const extMap = {
            jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
            pdf: "application/pdf", dcm: "application/dicom"
          };
          const ext = file.name.split('.').pop().toLowerCase();
          const mimeType = file.type || extMap[ext] || "application/octet-stream";

          // Step 1: Get pre-signed URL from your API
          const urlRes = await fetch(
            `${config.BASE_URL}/consultations?action=getUploadUrl` +
            `&fileName=${encodeURIComponent(file.name)}` +
            `&fileType=${encodeURIComponent(mimeType)}` +
            `&folder=consultations` +
            `&bucket=doctor-portal-files-25`
          );

          if (!urlRes.ok) {
            const errText = await urlRes.text();
            throw new Error(`Presign URL error ${urlRes.status}: ${errText}`);
          }

          const urlData = await urlRes.json();

          if (!urlData.uploadUrl) {
            throw new Error("API did not return an uploadUrl. Response: " + JSON.stringify(urlData));
          }

          // Step 2: PUT the file directly to S3 using the presigned URL
          // IMPORTANT: Content-Type must exactly match what was used to generate the presigned URL
          const s3Res = await fetch(urlData.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": mimeType },
            body: file
          });

          if (!s3Res.ok) {
            const s3Err = await s3Res.text();
            throw new Error(`S3 PUT failed ${s3Res.status}: ${s3Err}`);
          }

          uploadedResults.push({
            name: file.name,
            size: (file.size / 1024).toFixed(1) + " KB",
            url: urlData.fileUrl,
            key: urlData.fileKey,
            mimeType: mimeType
          });

        } catch (err) {
          console.error("S3 Upload Error for", file.name, ":", err.message);
          uploadedResults.push({
            name: file.name,
            size: (file.size / 1024).toFixed(1) + " KB",
            url: "",
            key: "",
            error: true,
            errorMsg: err.message
          });
        }
      }

      formData.files = uploadedResults;
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
  filesWrapper.innerHTML = formData.files.map(file => {
    const iconMap = { jpg: "🖼️", jpeg: "🖼️", png: "🖼️", pdf: "📄", dcm: "🩻" };
    const ext = file.name.split('.').pop().toLowerCase();
    const icon = iconMap[ext] || "📎";
    const statusColor = file.error ? "#ef4444" : "#10b981";
    const statusText = file.error ? `❌ Upload failed — ${file.errorMsg || "Check console for details"}` : "✅ Uploaded to S3";
    return `
      <div style="margin-top:10px; padding:10px 14px; background:#f5f5f4; border:1px solid var(--border); border-radius:var(--radius); display:flex; justify-content:space-between; align-items:center; gap:12px;">
        <span style="font-size:13px;">${icon} ${file.name} <small style="color:var(--text-light);">(${file.size})</small></span>
        <small style="color:${statusColor}; white-space:nowrap;">${statusText}</small>
      </div>`;
  }).join("");
}

// ─────────────────────────────────────────────
// CENTRAL AWS CLOUD DATABASE HANDLER
// ─────────────────────────────────────────────
async function submitConsultation() {
  const executionPayload = {
    id: formData.patientId,
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
    const response = await fetch(`${config.BASE_URL}/consultations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(executionPayload)
    });

    if (response.ok || response.status === 201) {
      alert("Consultation submitted successfully!");

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
// HOVER PREVIEW CONTROLLER LOGIC
// ─────────────────────────────────────────────
function showHoverPreview(event, url, fileName) {
  const panel = document.getElementById("global-hover-preview-panel");
  if (!panel || !url) return;

  const ext = fileName.split('.').pop().toLowerCase();

  if (['jpg', 'jpeg', 'png'].includes(ext)) {
    // Use an img tag — works as long as S3 bucket allows public read or has CORS configured
    panel.innerHTML = `
      <div style="width:100%; height:100%; background:#111; display:flex; align-items:center; justify-content:center; border-radius:6px; overflow:hidden;">
        <img src="${url}" crossorigin="anonymous"
          style="max-width:100%; max-height:100%; object-fit:contain;"
          onerror="this.parentElement.innerHTML='<div style=\\'color:white;text-align:center;padding:16px;font-size:12px;\\'>⚠️ Preview unavailable.<br>S3 bucket may require CORS or public-read ACL.</div>'">
      </div>`;
  } else if (ext === 'pdf') {
    // PDFs: use an embed tag — more reliable than iframe for S3 URLs
    panel.innerHTML = `
      <embed src="${url}#toolbar=0&navpanes=0&scrollbar=0"
        type="application/pdf"
        style="width:100%; height:100%; border:none; border-radius:6px;"
        onerror="">
      <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.5);color:white;text-align:center;font-size:11px;padding:4px;border-radius:0 0 6px 6px;">📄 PDF Preview</div>`;
    panel.style.position = "fixed"; // re-ensure
  } else if (ext === 'dcm') {
    panel.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--text-light); text-align:center; padding:20px;">
        <span style="font-size:40px;">🩻</span>
        <div style="font-weight:600; margin-top:10px; font-size:13px;">${fileName}</div>
        <small style="color:var(--teal); margin-top:6px;">DICOM file — requires viewer app</small>
      </div>`;
  } else {
    panel.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--text-light); text-align:center; padding:20px;">
        <span style="font-size:40px;">📄</span>
        <div style="font-weight:600; margin-top:10px; font-size:13px;">${fileName}</div>
        <small style="color:var(--teal); margin-top:6px;">Medical Document</small>
      </div>`;
  }

  panel.style.display = "block";
  positionHoverPreview(event);
}

function positionHoverPreview(event) {
  const panel = document.getElementById("global-hover-preview-panel");
  if (!panel || panel.style.display === "none") return;

  let top = event.clientY + 15;
  let left = event.clientX + 15;

  if (top + 400 > window.innerHeight) top = event.clientY - 415;
  if (left + 400 > window.innerWidth) left = event.clientX - 415;

  panel.style.top = top + "px";
  panel.style.left = left + "px";
}

function hideHoverPreview() {
  const panel = document.getElementById("global-hover-preview-panel");
  if (panel) {
    panel.style.display = "none";
    panel.innerHTML = "";
  }
}

// ─────────────────────────────────────────────
// PATIENT RECORDS PAGE — READS FROM CONSULTATIONS TABLE
// ─────────────────────────────────────────────
async function renderRecords(main) {
  const searchInput = document.getElementById("recordSearch");
  const query = searchInput ? searchInput.value.trim() : "";

  let recordsHTML = "";

  try {
    const response = await fetch(`${config.BASE_URL}/consultations?search=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`API Gateway returned status: ${response.status}`);
    }

    let allRecords = await response.json();

    let records = allRecords.filter(r => {
      const recordDocId = r.doctorId || r.doctor || "";
      const currentDocId = loggedInDoctor ? (loggedInDoctor.id || loggedInDoctor.doctorId) : "";
      return String(recordDocId).trim() == String(currentDocId).trim();
    });

    if (query) {
      const q = query.toLowerCase();
      records = records.filter(r =>
        (r.patientName && r.patientName.toLowerCase().includes(q)) ||
        (r.patientId && r.patientId.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q)) ||
        (r.chiefComplaint && r.chiefComplaint.toLowerCase().includes(q))
      );
    }

    if (activeRecordFilter === "recent") {
      const todayStr = new Date().toISOString().split('T')[0];
      records = records.filter(r => (r.visitDate || r.lastVisit) === todayStr);
    }

    if (!records || records.length === 0) {
      recordsHTML = `
        <div style="text-align:center; padding:40px; color:var(--text-light); background:white; border-radius:8px; border:1px solid var(--border)">
          ⚠️ No matching patient records found in your workspace list.
        </div>`;
    } else {
      recordsHTML = `<div class="results">` + records.map(p => {
        const patientName = p.patientName || p.name || "Unknown Patient";
        const patientId = p.patientId || p.id;
        const visitDate = p.visitDate || p.lastVisit || "N/A";
        const doctorName = p.doctorName || p.doctor || loggedInDoctor.name || "Portal Staff";
        const currentStatus = p.status || "Active";
        const isCurrentlyActive = currentStatus === "Active";
        const statusPillClass = isCurrentlyActive ? "pill-success" : "pill-info";
        const statusStyleOverrides = isCurrentlyActive ? "" : "background:#e2e8f0; color:#475569; border-color:#cbd5e1;";
        const statusButtonLabel = isCurrentlyActive ? "Mark Inactive" : "Mark Active";
        
        const targetId = p.id || p.patientId || patientId;

        let documentsBadgeHTML = "";
        if (p.files && p.files.length > 0) {
          documentsBadgeHTML = p.files.map(f => {
            if (!f.url) return "";
            return `
              <span class="tag" 
                style="background:var(--teal-light); color:var(--teal-dark); border-color:var(--teal); cursor:help; user-select:none;"
                onmouseenter="showHoverPreview(event, '${f.url}', '${f.name.replace(/'/g, "\\'")}')"
                onmousemove="positionHoverPreview(event)"
                onmouseleave="hideHoverPreview()">
                📎 Hover to View: ${f.name}
              </span>`;
          }).join("");
        }

        return `
        <div class="result-item" style="${!isCurrentlyActive ? 'opacity: 0.85; background: #fafafa;' : ''}">
          <div class="result-header">
            <div>
              <div class="result-title">${patientName} ${!isCurrentlyActive ? '<small style="color:var(--text-light); font-weight:normal;">(Discharged)</small>' : ''}</div>
              <div class="result-id">Patient ID: ${patientId}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <button onclick="togglePatientStatus('${targetId}', '${currentStatus}')" style="background:none; border:none; color:var(--teal); font-size:12px; cursor:pointer; padding:4px; font-weight:600; text-decoration:underline;">${statusButtonLabel}</button>
              <span class="pill ${statusPillClass}" style="${statusStyleOverrides}">${currentStatus}</span>
            </div>
          </div>
          <div class="result-desc">
            Encounter Date: ${visitDate} &bull; Visit Type: ${p.visitType || "OPD consultation"}
          </div>
          <div class="result-desc" style="margin-top: 6px; color: var(--text-light); font-size:13px; line-height:1.4;">
            <strong>Referring Doctor:</strong> ${p.referringDoctor || 'Not specified'}
          </div>
          <div class="result-desc" style="margin-top: 6px; color: var(--text-light); font-size:13px; line-height:1.4;">
            <strong>Clinical Notes:</strong> ${p.clinicalNotes || 'No consultation notes detailed.'}
          </div>
          <div class="result-meta">Department: Clinical Portal Specialists &bull; Attending: Dr ${doctorName}</div>
          <div class="result-tags">
            ${p.chiefComplaint ? `<span class="tag">${p.chiefComplaint}</span>` : ''}
            ${documentsBadgeHTML}
          </div>
        </div>`;
      }).join("") + `</div>`;
    }
  } catch (err) {
    console.error("AWS Retrieval Error:", err);
    recordsHTML = `
      <div style="text-align:center; padding:40px; color:#ef4444; background:white; border-radius:8px; border:1px solid var(--border)">
        Failed to sync with cloud workspace.
      </div>`;
  }

  main.innerHTML = `
    <div class="search-wrapper">
      <span class="search-icon">🔍</span>
      <input type="text" class="form-input search-input"
      placeholder="Search by Patient Name, Patient ID or Chief Complaint..."
        id="recordSearch" value="${query}">
    </div>
    <div class="filters">
      <div class="filter-chip ${activeRecordFilter === 'all' ? 'active' : ''}" onclick="setRecordFilter('all')">My Patients</div>
      <div class="filter-chip ${activeRecordFilter === 'recent' ? 'active' : ''}" onclick="setRecordFilter('recent')">Today's Visits</div>
    </div>
    ${recordsHTML}`;

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

async function togglePatientStatus(recordId, currentStatus) {
  const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

  try {
    const response = await fetch(`${config.BASE_URL}/consultations`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: recordId, status: newStatus })
    });

    if (response.ok) {
      renderRecords(document.getElementById("mainContent"));
    } else {
      alert("Failed to update status. Please try again.");
    }
  } catch (err) {
    console.error("Status update error:", err);
    alert("Network error updating status.");
  }
}

function deleteRecord(patientId) {
  if (confirm(`Are you sure you want to permanently delete record ${patientId}?`)) {
    let globalDatabaseIndices = JSON.parse(localStorage.getItem("cloud_patient_consultations")) || [];
    globalDatabaseIndices = globalDatabaseIndices.filter(p => p.patientId !== patientId);
    localStorage.setItem("cloud_patient_consultations", JSON.stringify(globalDatabaseIndices));
    renderRecords(document.getElementById("mainContent"));
  }
}

// ─────────────────────────────────────────────
// SIMILAR CASE SEARCH — READS FROM CONSULTATIONS TABLE
// ─────────────────────────────────────────────
async function renderCases(main) {
  const caseSearchInput = document.getElementById("caseSearch");
  const query = caseSearchInput ? caseSearchInput.value.trim() : "";

  let caseListHTML = "";

  try {
    const response = await fetch(`${config.BASE_URL}/consultations?search=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`API Gateway returned status: ${response.status}`);
    }

    const casesFromCloud = await response.json();
    const now = new Date();

    let matchingCases = casesFromCloud.filter(c => {
      const rawDate = c.visitDate || c.date;
      if (!rawDate) return true;
      const caseDate = new Date(rawDate);
      if (isNaN(caseDate.getTime())) return true;
      const diffTime = Math.abs(now - caseDate);
      const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
      return diffYears <= activeTimeFilter;
    });

    if (!matchingCases || matchingCases.length === 0) {
      caseListHTML = `
        <div style="text-align:center; padding:40px; color:var(--text-light); background:white; border-radius:8px; border:1px solid var(--border)">
          No matching clinical profiles found within this specific timeline window.
        </div>`;
    } else {
      caseListHTML = `<div class="results">` + matchingCases.map((c, idx) => {
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
          <div class="result-desc">${caseNotes}</div>
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