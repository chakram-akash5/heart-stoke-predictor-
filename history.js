// ================= FIREBASE SETUP =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
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

const table = document.getElementById("historyTable");

// ================= LOAD HISTORY =================
window.loadHistory = async function () {
  const email = document.getElementById("emailInput").value.trim();

  if (!email) {
    alert("Please enter email");
    return;
  }

  table.innerHTML = `<tr><td colspan="6" class="text-center">Loading...</td></tr>`;

  try {
    const q = query(
      collection(db, "users"),
      where("email", "==", email),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      table.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger">
            No history found
          </td>
        </tr>`;
      return;
    }

    table.innerHTML = "";
    let count = 1;

    snapshot.forEach(doc => {
      const d = doc.data();
      const date = d.createdAt?.toDate().toLocaleString() || "-";

      table.innerHTML += `
        <tr>
          <td>${count++}</td>
          <td>${date}</td>
          <td>${d.medicalData?.age || "-"}</td>
          <td>${d.medicalData?.sex || "-"}</td>
          <td>
            <span class="badge ${
              d.riskLevel === "HIGH" ? "bg-danger" :
              d.riskLevel === "MEDIUM" ? "bg-warning text-dark" :
              "bg-success"
            }">
              ${d.riskLevel}
            </span>
          </td>
          <td>${d.totalScore ?? "-"}</td>
        </tr>
      `;
    });

  } catch (error) {
    console.error(error);
    table.innerHTML = `
      <tr>
        <td colspan="6" class="text-danger text-center">
          Error loading history
        </td>
      </tr>`;
  }
};
