// ============ FIREBASE SETUP ============
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
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

// ============ LOAD DATA ============
async function loadAnalytics() {

  const snapshot = await getDocs(collection(db, "users"));

  let low = 0, medium = 0, high = 0;

  snapshot.forEach(doc => {
    const risk = doc.data().riskLevel;
    if (risk === "LOW") low++;
    if (risk === "MEDIUM") medium++;
    if (risk === "HIGH") high++;
  });

  const total = low + medium + high;

  // Update counts
  document.getElementById("totalCount").innerText = total;
  document.getElementById("lowCount").innerText = low;
  document.getElementById("mediumCount").innerText = medium;
  document.getElementById("highCount").innerText = high;

  // Chart
  const ctx = document.getElementById("riskChart");

new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Low Risk", "Medium Risk", "High Risk"],
    datasets: [{
      data: [low, medium, high],
      backgroundColor: ["#28a745", "#ffc107", "#dc3545"]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,   // 🔥 THIS FIXES SIZE
    plugins: {
      legend: {
        position: "top"
      }
    }
  }
});

}

loadAnalytics();
