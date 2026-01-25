// ================= FIREBASE SETUP =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA12T5bM97-wB5jRZukxs-0ofjyLJ1w_Ho",
  authDomain: "heartpredictor-fa5fe.firebaseapp.com",
  projectId: "heartpredictor-fa5fe",
  storageBucket: "heartpredictor-fa5fe.appspot.com",
  messagingSenderId: "509775412276",
  appId: "1:509775412276:web:4e580e02385262135f5e61",
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= LOAD PATIENT DATA =================
const table = document.getElementById("patientTable");

async function loadPatients() {
  table.innerHTML = "";

  try {
    const q = query(
      collection(db, "users"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      table.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted">
            No patient records found
          </td>
        </tr>`;
      return;
    }

    let count = 1;

    snapshot.forEach(doc => {
      const data = doc.data();
      const date =
        data.createdAt?.toDate().toLocaleString() || "-";

      // ================= RISK BADGE LOGIC =================
      let riskBadge = `
        <span class="badge bg-success px-3">
          🟢 LOW
        </span>
      `;

      if (data.riskLevel === "MEDIUM") {
        riskBadge = `
          <span class="badge bg-warning text-dark px-3">
            🟡 MEDIUM
          </span>
        `;
      } else if (data.riskLevel === "HIGH") {
        riskBadge = `
          <span class="badge bg-danger px-3">
            🔴 HIGH
          </span>
        `;
      }

      table.innerHTML += `
        <tr>
          <td>${count++}</td>
          <td>${data.patientName || "-"}</td>
          <td>${data.medicalData?.age || "-"}</td>
          <td>${data.medicalData?.sex || "-"}</td>
          <td>${riskBadge}</td>
          <td>${date}</td>
        </tr>
      `;
    });
    

  } catch (error) {
    console.error("Dashboard Load Error:", error);
    table.innerHTML = `
      <tr>
        <td colspan="6" class="text-danger text-center">
          Error loading patient data
        </td>
      </tr>`;
  }
}


loadPatients();

// ================= LOGOUT FUNCTION =================
window.logoutDoctor = function () {
  if (confirm("Are you sure you want to logout?")) {
    sessionStorage.clear();
    window.location.href = "index.html";
  }
};
