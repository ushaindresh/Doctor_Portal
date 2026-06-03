// // ─────────────────────────────────────────────
// // SIGNUP
// // ─────────────────────────────────────────────

// function signupDoctor() {

//   const name = document.getElementById("doctorName").value.trim();
//   const email = document.getElementById("doctorEmail").value.trim();
//   const password = document.getElementById("doctorPassword").value.trim();

//   // Validation
//   if (!name || !email || !password) {
//     alert("Please fill all fields");
//     return;
//   }

//   // Get existing doctors
//   const doctors =
//     JSON.parse(localStorage.getItem("doctors")) || [];

//   // Check existing email
//   const exists = doctors.find(doc => doc.email === email);

//   if (exists) {
//     alert("Doctor already exists with this email");
//     return;
//   }

//   // Create doctor object
//   const doctor = {
//     id: "DOC-" + Date.now(),
//     name,
//     email,
//     password
//   };

//   // Save
//   doctors.push(doctor);

//   localStorage.setItem(
//     "doctors",
//     JSON.stringify(doctors)
//   );

//   alert("Signup successful!");

//   window.location.href = "index.html";
// }


// // ─────────────────────────────────────────────
// // LOGIN
// // ─────────────────────────────────────────────

// function loginDoctor() {

//   const email =
//     document.getElementById("loginEmail").value.trim();

//   const password =
//     document.getElementById("loginPassword").value.trim();

//   // Get doctors
//   const doctors =
//     JSON.parse(localStorage.getItem("doctors")) || [];

//   // Find matching doctor
//   const doctor = doctors.find(
//     doc =>
//       doc.email === email &&
//       doc.password === password
//   );

//   if (!doctor) {
//     alert("Invalid email or password");
//     return;
//   }

//   // Save logged-in doctor
//   localStorage.setItem(
//     "loggedInDoctor",
//     JSON.stringify(doctor)
//   );

//   window.location.href = "dashboard.html";
// }


// // ─────────────────────────────────────────────
// // LOGOUT
// // ─────────────────────────────────────────────

// function logoutDoctor() {

//   localStorage.removeItem("loggedInDoctor");

//   window.location.href = "index.html";
// }













// ─────────────────────────────────────────────
// SIGNUP
// ─────────────────────────────────────────────

async function signupDoctor() {

  const name     = document.getElementById("doctorName").value.trim();
  const email    = document.getElementById("doctorEmail").value.trim();
  const password = document.getElementById("doctorPassword").value.trim();

  if (!name || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const response = await fetch(config.BASE_URL + "/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signup", name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Signup successful!");
      window.location.href = "index.html";
    } else {
      alert(data.message || "Signup failed");
    }

  } catch (error) {
    console.error("Signup error:", error);
    alert("Something went wrong. Please try again.");
  }
}


// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────

async function loginDoctor() {

  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const response = await fetch(config.BASE_URL + "/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Save logged-in doctor to sessionStorage (not localStorage)
      sessionStorage.setItem("loggedInDoctor", JSON.stringify(data.doctor));
      window.location.href = "dashboard.html";
    } else {
      alert(data.message || "Invalid email or password");
    }

  } catch (error) {
    console.error("Login error:", error);
    alert("Something went wrong. Please try again.");
  }
}


// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────

function logoutDoctor() {
  sessionStorage.removeItem("loggedInDoctor");
  window.location.href = "index.html";
}