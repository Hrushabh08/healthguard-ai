import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";

const COLORS = {
  gradientStart: "#4f46e5",
  gradientMid: "#7c3aed",
  gradientEnd: "#a855f7",
  white: "#ffffff",
  offWhite: "#f8f7ff",
  textDark: "#1e1b4b",
  textMuted: "#6b7280",
  inputBorder: "#e5e7eb",
  errorRed: "#ef4444",
  successGreen: "#10b981",
};

function calculateAge(dob) {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}

function calculateBMI(weight, height) {
  if (!weight || !height) return null;
  const h = height / 100; // cm to m
  return (weight / (h * h)).toFixed(1);
}

function getBMICategory(bmi) {
  if (!bmi) return { label: "", color: "#6b7280" };
  const val = parseFloat(bmi);
  if (val < 18.5) return { label: "Underweight", color: "#F59E0B" };
  if (val < 25) return { label: "Normal", color: "#10B981" };
  if (val < 30) return { label: "Overweight", color: "#F59E0B" };
  return { label: "Obese", color: "#EF4444" };
}

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: basics, 2: body, 3: done
  const [animating, setAnimating] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [errors, setErrors] = useState({});

  const age = calculateAge(dob);
  const bmi = calculateBMI(parseFloat(weight), parseFloat(height));
  const bmiCat = getBMICategory(bmi);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
      @keyframes fadeSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      @keyframes scaleIn { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
      @keyframes confetti { 0% { transform:translateY(0) rotate(0); opacity:1; } 100% { transform:translateY(-60px) rotate(360deg); opacity:0; } }
      @keyframes pulse-ring { 0% { transform:scale(0.9); opacity:0.6; } 50% { transform:scale(1.15); opacity:0; } 100% { transform:scale(0.9); opacity:0; } }
      @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      input::placeholder { color: #c4c4d4; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const goNext = () => {
    const e = {};
    if (step === 1) {
      if (!fullName.trim()) e.fullName = "Please enter your full name.";
      if (!dob) e.dob = "Please enter your date of birth.";
      else if (age < 1 || age > 130) e.dob = "Please enter a valid date of birth.";
    }
    if (step === 2) {
      if (!weight || parseFloat(weight) < 10 || parseFloat(weight) > 300) e.weight = "Enter a valid weight (10–300 kg).";
      if (!height || parseFloat(height) < 50 || parseFloat(height) > 250) e.height = "Enter a valid height (50–250 cm).";
    }
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setAnimating(true);
    setTimeout(async () => {
      if (step === 2) {
        const profile = {
          fullName: fullName.trim(),
          dob,
          weight: parseFloat(weight),
          height: parseFloat(height),
          age: calculateAge(dob),
          bmi: calculateBMI(parseFloat(weight), parseFloat(height)),
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        // Save to localStorage (offline fallback)
        localStorage.setItem("hg_profile", JSON.stringify(profile));
        // Save to database
        try {
          await authAPI.updateProfile({
            name: fullName.trim(),
            dob,
            weight: parseFloat(weight),
            height: parseFloat(height),
          });
        } catch { /* continue — data saved locally */ }
      }
      setStep(step + 1);
      setAnimating(false);
    }, 300);
  };

  const goToDashboard = () => navigate("/dashboard");

  // Max date for DOB (today)
  const maxDate = new Date().toISOString().split("T")[0];

  const inputStyle = (field, focused) => ({
    width: "100%",
    padding: "14px 16px",
    borderRadius: 14,
    border: errors[field] ? `1.5px solid ${COLORS.errorRed}` : `1.5px solid ${COLORS.inputBorder}`,
    background: COLORS.offWhite,
    fontSize: 15,
    color: COLORS.textDark,
    outline: "none",
    transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  });

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #ede9fe 0%, #f0f4ff 50%, #fdf4ff 100%)",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: 20,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 520,
        background: COLORS.white,
        borderRadius: 32,
        boxShadow: "0 30px 80px rgba(79,70,229,0.14), 0 8px 32px rgba(0,0,0,0.08)",
        padding: "48px 44px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: "absolute", top: -60, right: -60, width: 200, height: 200,
          borderRadius: "50%", background: "linear-gradient(135deg, rgba(129,140,248,0.08), rgba(168,85,247,0.06))",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", bottom: -40, left: -40, width: 140, height: 140,
          borderRadius: "50%", background: "rgba(129,140,248,0.05)", pointerEvents: "none"
        }} />

        {/* Progress Steps */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 36 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700,
                background: step >= s
                  ? "linear-gradient(135deg, #4f46e5, #7c3aed)"
                  : COLORS.offWhite,
                color: step >= s ? "#fff" : COLORS.textMuted,
                border: step >= s ? "none" : `1.5px solid ${COLORS.inputBorder}`,
                transition: "all 0.3s ease",
                boxShadow: step === s ? "0 4px 14px rgba(124,58,237,0.3)" : "none",
              }}>
                {step > s ? "✓" : s}
              </div>
              {s < 3 && <div style={{
                width: 40, height: 2, borderRadius: 1,
                background: step > s ? "#7c3aed" : COLORS.inputBorder,
                transition: "background 0.3s"
              }} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div style={{
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(14px)" : "translateY(0)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          animation: !animating ? "fadeSlideUp 0.45s ease both" : "none",
        }}>

          {/* STEP 1: Name & DOB */}
          {step === 1 && (
            <>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%", margin: "0 auto 14px",
                  background: "linear-gradient(135deg, rgba(79,70,229,0.1), rgba(168,85,247,0.1))",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26
                }}>👤</div>
                <h2 style={{
                  fontSize: 24, fontWeight: 800, color: COLORS.textDark, margin: "0 0 6px",
                  fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em"
                }}>Tell us about yourself</h2>
                <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>
                  We'll personalize your health experience.
                </p>
              </div>

              {/* Full Name */}
              <div style={{ marginBottom: 18 }}>
                <label style={{
                  display: "block", fontSize: 12, fontWeight: 600, color: COLORS.textMuted,
                  marginBottom: 7, letterSpacing: "0.06em", textTransform: "uppercase"
                }}>Full Name</label>
                <input
                  type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  style={inputStyle("fullName")}
                  onFocus={e => { e.target.style.border = "1.5px solid #818cf8"; e.target.style.boxShadow = "0 0 0 4px rgba(129,140,248,0.12)"; }}
                  onBlur={e => { e.target.style.border = `1.5px solid ${COLORS.inputBorder}`; e.target.style.boxShadow = "none"; }}
                />
                {errors.fullName && <p style={{ color: COLORS.errorRed, fontSize: 11.5, marginTop: 5 }}>{errors.fullName}</p>}
              </div>

              {/* Date of Birth */}
              <div style={{ marginBottom: 18 }}>
                <label style={{
                  display: "block", fontSize: 12, fontWeight: 600, color: COLORS.textMuted,
                  marginBottom: 7, letterSpacing: "0.06em", textTransform: "uppercase"
                }}>Date of Birth</label>
                <input
                  type="date" value={dob} onChange={e => setDob(e.target.value)}
                  max={maxDate}
                  style={{ ...inputStyle("dob"), cursor: "pointer" }}
                  onFocus={e => { e.target.style.border = "1.5px solid #818cf8"; e.target.style.boxShadow = "0 0 0 4px rgba(129,140,248,0.12)"; }}
                  onBlur={e => { e.target.style.border = `1.5px solid ${COLORS.inputBorder}`; e.target.style.boxShadow = "none"; }}
                />
                {errors.dob && <p style={{ color: COLORS.errorRed, fontSize: 11.5, marginTop: 5 }}>{errors.dob}</p>}
              </div>

              {/* Age Preview */}
              {dob && age > 0 && (
                <div style={{
                  padding: "12px 16px", borderRadius: 12, marginBottom: 18,
                  background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)",
                  display: "flex", alignItems: "center", gap: 10,
                  animation: "fadeSlideUp 0.3s ease"
                }}>
                  <span style={{ fontSize: 20 }}>🎂</span>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textDark }}>
                      Age: {age} years
                    </span>
                    <span style={{ fontSize: 11, color: COLORS.textMuted, display: "block", marginTop: 1 }}>
                      Auto-calculated from your DOB
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 2: Weight & Height */}
          {step === 2 && (
            <>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%", margin: "0 auto 14px",
                  background: "linear-gradient(135deg, rgba(79,70,229,0.1), rgba(168,85,247,0.1))",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26
                }}>⚖️</div>
                <h2 style={{
                  fontSize: 24, fontWeight: 800, color: COLORS.textDark, margin: "0 0 6px",
                  fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em"
                }}>Body Measurements</h2>
                <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>
                  This helps calculate your BMI and health risk.
                </p>
              </div>

              {/* Weight */}
              <div style={{ marginBottom: 18 }}>
                <label style={{
                  display: "block", fontSize: 12, fontWeight: 600, color: COLORS.textMuted,
                  marginBottom: 7, letterSpacing: "0.06em", textTransform: "uppercase"
                }}>Weight (kg)</label>
                <input
                  type="number" value={weight} onChange={e => setWeight(e.target.value)}
                  placeholder="e.g. 65"
                  style={inputStyle("weight")}
                  onFocus={e => { e.target.style.border = "1.5px solid #818cf8"; e.target.style.boxShadow = "0 0 0 4px rgba(129,140,248,0.12)"; }}
                  onBlur={e => { e.target.style.border = `1.5px solid ${COLORS.inputBorder}`; e.target.style.boxShadow = "none"; }}
                />
                {errors.weight && <p style={{ color: COLORS.errorRed, fontSize: 11.5, marginTop: 5 }}>{errors.weight}</p>}
              </div>

              {/* Height */}
              <div style={{ marginBottom: 18 }}>
                <label style={{
                  display: "block", fontSize: 12, fontWeight: 600, color: COLORS.textMuted,
                  marginBottom: 7, letterSpacing: "0.06em", textTransform: "uppercase"
                }}>Height (cm)</label>
                <input
                  type="number" value={height} onChange={e => setHeight(e.target.value)}
                  placeholder="e.g. 170"
                  style={inputStyle("height")}
                  onFocus={e => { e.target.style.border = "1.5px solid #818cf8"; e.target.style.boxShadow = "0 0 0 4px rgba(129,140,248,0.12)"; }}
                  onBlur={e => { e.target.style.border = `1.5px solid ${COLORS.inputBorder}`; e.target.style.boxShadow = "none"; }}
                />
                {errors.height && <p style={{ color: COLORS.errorRed, fontSize: 11.5, marginTop: 5 }}>{errors.height}</p>}
              </div>

              {/* BMI Preview */}
              {bmi && (
                <div style={{
                  padding: "14px 18px", borderRadius: 12, marginBottom: 18,
                  background: `${bmiCat.color}0A`, border: `1px solid ${bmiCat.color}25`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  animation: "fadeSlideUp 0.3s ease"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>📊</span>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textDark }}>
                        BMI: {bmi}
                      </span>
                      <span style={{ fontSize: 11, color: COLORS.textMuted, display: "block", marginTop: 1 }}>
                        Body Mass Index
                      </span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: bmiCat.color,
                    background: `${bmiCat.color}14`, padding: "4px 12px", borderRadius: 20
                  }}>{bmiCat.label}</span>
                </div>
              )}

              {/* Back button */}
              <button
                onClick={() => { setAnimating(true); setTimeout(() => { setStep(1); setAnimating(false); }, 300); }}
                style={{
                  background: "none", border: "none", color: COLORS.textMuted,
                  fontSize: 13, fontWeight: 500, cursor: "pointer", marginBottom: 8,
                  fontFamily: "'DM Sans', sans-serif"
                }}
              >← Back to basics</button>
            </>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <div style={{ textAlign: "center", animation: "scaleIn 0.5s ease" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%", margin: "0 auto 20px",
                background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.06))",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
                position: "relative"
              }}>
                ✅
                <div style={{
                  position: "absolute", inset: -6, borderRadius: "50%",
                  border: "2px solid rgba(16,185,129,0.2)",
                  animation: "pulse-ring 1.5s ease-out infinite"
                }} />
              </div>
              <h2 style={{
                fontSize: 24, fontWeight: 800, color: COLORS.textDark, margin: "0 0 8px",
                fontFamily: "'Syne', sans-serif"
              }}>You're all set, {fullName.split(" ")[0]}!</h2>
              <p style={{ color: COLORS.textMuted, fontSize: 14, margin: "0 0 10px", lineHeight: 1.6 }}>
                Your profile has been saved. Here's your summary:
              </p>

              {/* Summary Card */}
              <div style={{
                background: COLORS.offWhite, borderRadius: 16, padding: "20px 24px",
                margin: "20px 0", textAlign: "left", border: `1px solid ${COLORS.inputBorder}`
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {[
                    { label: "Name", value: fullName },
                    { label: "Age", value: `${age} years` },
                    { label: "Weight", value: `${weight} kg` },
                    { label: "Height", value: `${height} cm` },
                    { label: "BMI", value: `${bmi} (${bmiCat.label})` },
                    { label: "DOB", value: new Date(dob).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textDark, marginTop: 3 }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>
                💡 We'll remind you every month to update your weight & height.
              </p>
            </div>
          )}

          {/* CTA Button */}
          <button
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            onClick={step === 3 ? goToDashboard : goNext}
            style={{
              width: "100%",
              padding: "14.5px",
              borderRadius: 14,
              border: "none",
              marginTop: 8,
              background: btnHovered
                ? "linear-gradient(135deg, #3730a3 0%, #6d28d9 100%)"
                : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #a855f7 100%)",
              color: COLORS.white,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.10em",
              cursor: "pointer",
              transition: "all 0.28s cubic-bezier(.4,0,.2,1)",
              transform: btnHovered ? "translateY(-2px)" : "translateY(0)",
              boxShadow: btnHovered
                ? "0 12px 32px rgba(124,58,237,0.38)"
                : "0 4px 16px rgba(124,58,237,0.22)",
              outline: "none",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {step === 1 ? "CONTINUE →" : step === 2 ? "SAVE PROFILE →" : "GO TO DASHBOARD →"}
          </button>
        </div>
      </div>
    </div>
  );
}
