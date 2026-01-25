import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, runTransaction, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyA12T5bM97-wB5jRZukxs-0ofjyLJ1w_Ho",
    authDomain: "heartpredictor-fa5fe.firebaseapp.com",
    projectId: "heartpredictor-fa5fe",
    storageBucket: "heartpredictor-fa5fe.appspot.com",
    messagingSenderId: "509775412276",
    appId: "1:509775412276:web:4e580e02385262135f5e61",
};

// --- Initialization ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Ensure 'db' is declared only once here

console.log("🔥 Cardium Script Loaded: Custom Serial Mode Active");

// --- Main Calculation Function ---
window.calculateRisk = function () {
    const age = Number(document.getElementById("age").value);
    const sex = document.getElementById("sex").value;
    const chestPain = document.getElementById("chestPain").value;
    const fastingBS = document.getElementById("fastingBS").value;
    const angina = document.getElementById("angina").value;
    const oldPeak = Number(document.getElementById("oldPeak").value || 0);
    const stSlope = document.getElementById("stSlope").value;

    if (!age || sex === "Select" || chestPain === "Select") {
        alert("⚠️ Please fill all fields correctly");
        return;
    }

    // 1. Rule-Based Calculation
    const score_age = age > 50 ? 1 : 0;
    const score_sex = sex === "M" ? 1 : 0;
    const score_chest = (chestPain === "ASY" || chestPain === "ATA") ? 1 : 0;
    const score_sugar = fastingBS === "Yes" ? 1 : 0;
    const score_angina = angina === "Yes" ? 1 : 0;
    const score_oldpeak = oldPeak > 2 ? 1 : 0;
    const score_stslope = (stSlope === "Flat" || stSlope === "Down") ? 1 : 0;

    const totalScore = score_age + score_sex + score_chest + score_sugar + score_angina + score_oldpeak + score_stslope;
    let ruleProbability = Math.round((totalScore / 7) * 100);

    // 2. Prepare Data for ML API
    const mlData = {
        age: age,
        sex: sex === "M" ? 1 : 0,
        chestPain: chestPain === "ASY" ? 0 : chestPain === "ATA" ? 1 : chestPain === "NAP" ? 2 : 3,
        sugar: fastingBS === "Yes" ? 1 : 0,
        angina: angina === "Yes" ? 1 : 0,
        oldPeak: oldPeak,
        stSlope: stSlope === "Up" ? 0 : stSlope === "Flat" ? 1 : 2 
    };

    // 3. Fetch Prediction from Flask
    fetch("http://127.0.0.1:5000/ml-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mlData)
    })
    .then(res => res.json())
    .then(data => {
        const rawMl = data.probability ?? 0;
        const mlProb = rawMl <= 1 ? Math.round(rawMl * 100) : Math.round(rawMl);
        
       // Ab finalProb wahi hoga jo ML bhej raha hai
const finalProb = mlProb; 
// ruleProbability ko 0 bhej sakte hain ya hata sakte hain
finishProcess(mlProb, 0, finalProb, mlData, totalScore);
    })
    .catch(err => {
        console.warn("❌ ML Offline. Fallback to Rule-Based.");
        finishProcess(0, ruleProbability, ruleProbability, mlData, totalScore);
    });
};

// --- Save with Transaction & Redirect ---
async function finishProcess(mlProb, ruleProb, finalProb, inputs, totalScore) {
    // Reference to the counter document
    const counterRef = doc(db, "metadata", "patientCounter");

    try {
        const assignedID = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            
            if (!counterDoc.exists()) {
                throw "Counter document missing! Create 'metadata/patientCounter' in Firebase Console.";
            }

            // A. Increment the Serial
            const nextNumber = counterDoc.data().lastSerial + 1;
            const formattedID = "CARD-" + String(nextNumber).padStart(3, '0');

            // B. Update the Counter in 'metadata'
            transaction.update(counterRef, { lastSerial: nextNumber });

            // C. Save Patient Data in 'users' with CUSTOM ID
            const patientRef = doc(db, "users", formattedID);
            transaction.set(patientRef, {
                patientName: localStorage.getItem("patientName") || "Anonymous",
                email: localStorage.getItem("patientEmail") || "No Email",
                hospital: localStorage.getItem("hospitalName") || "General Clinic",
                medicalData: inputs,
                totalScore: totalScore,
                mlProbability: mlProb,
                ruleProbability: ruleProb,
                finalProbability: finalProb,
                riskLevel: finalProb > 15 ? "LOW" : (finalProb > 50 ? "MEDIUM" : "HIGH"),
                createdAt: serverTimestamp()
            });

            return formattedID;
        });

        // 4. Success: Store Result and Redirect
        localStorage.setItem("finalProbability", finalProb);
        localStorage.setItem("currentSerialID", assignedID);
        console.log("✅ Data saved with ID:", assignedID);
        window.location.href = "result.html";

    } catch (error) {
        console.error("❌ Firebase Error:", error);
        alert("Transaction Failed: " + error);
    }
}