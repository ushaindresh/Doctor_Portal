// ─────────────────────────────────────────────
// SIGNUP
// ─────────────────────────────────────────────

function signupDoctor() {

  const name = document.getElementById("doctorName").value.trim();
  const email = document.getElementById("doctorEmail").value.trim();
  const password = document.getElementById("doctorPassword").value.trim();

  // Validation
  if (!name || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  // Get existing doctors
  const doctors =
    JSON.parse(localStorage.getItem("doctors")) || [];

  // Check existing email
  const exists = doctors.find(doc => doc.email === email);

  if (exists) {
    alert("Doctor already exists with this email");
    return;
  }

  // Create doctor object
  const doctor = {
    id: "DOC-" + Date.now(),
    name,
    email,
    password
  };

  // Save
  doctors.push(doctor);

  localStorage.setItem(
    "doctors",
    JSON.stringify(doctors)
  );

  alert("Signup successful!");

  window.location.href = "index.html";
}


// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────

function loginDoctor() {

  const email =
    document.getElementById("loginEmail").value.trim();

  const password =
    document.getElementById("loginPassword").value.trim();

  // Get doctors
  const doctors =
    JSON.parse(localStorage.getItem("doctors")) || [];

  // Find matching doctor
  const doctor = doctors.find(
    doc =>
      doc.email === email &&
      doc.password === password
  );

  if (!doctor) {
    alert("Invalid email or password");
    return;
  }

  // Save logged-in doctor
  localStorage.setItem(
    "loggedInDoctor",
    JSON.stringify(doctor)
  );

  window.location.href = "dashboard.html";
}


// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────

function logoutDoctor() {

  localStorage.removeItem("loggedInDoctor");

  window.location.href = "index.html";
}