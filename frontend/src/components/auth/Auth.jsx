import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";

const COLORS = {
  gradientStart: "#4f46e5",
  gradientMid: "#7c3aed",
  gradientEnd: "#a855f7",
  accent: "#818cf8",
  white: "#ffffff",
  offWhite: "#f8f7ff",
  textDark: "#1e1b4b",
  textMuted: "#6b7280",
  inputBorder: "#e5e7eb",
  inputFocus: "#818cf8",
  errorRed: "#ef4444",
  successGreen: "#10b981",
};

const pulseKeyframes = `
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(129, 140, 248, 0.4); }
    50% { box-shadow: 0 0 0 10px rgba(129, 140, 248, 0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes panelSlide {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(38px) rotate(0deg); }
    to { transform: rotate(360deg) translateX(38px) rotate(-360deg); }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

function OrbitRing({ size, duration, delay, color, dotSize = 6 }) {
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `1.5px dashed ${color}`,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        animation: `spin-slow ${duration}s linear infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: color,
          top: -dotSize / 2,
          left: "50%",
          transform: "translateX(-50%)",
          boxShadow: `0 0 8px ${color}`,
        }}
      />
    </div>
  );
}

function FloatingParticle({ style }) {
  return (
    <div
      style={{
        position: "absolute",
        borderRadius: "50%",
        opacity: 0.18,
        animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
        ...style,
      }}
    />
  );
}

function SocialButton({ icon, label, hovered, onMouseEnter, onMouseLeave, onClick }) {
  return (
    <button
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        width: 46,
        height: 46,
        borderRadius: 14,
        border: hovered ? "1.5px solid #818cf8" : "1.5px solid #e5e7eb",
        background: hovered ? "rgba(129,140,248,0.08)" : COLORS.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? "0 6px 16px rgba(129,140,248,0.18)" : "0 1px 4px rgba(0,0,0,0.06)",
        color: hovered ? "#4f46e5" : COLORS.textMuted,
        fontSize: 15,
        fontWeight: 700,
        outline: "none",
      }}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function InputField({ label, type, value, onChange, placeholder, icon, error }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: focused ? "#4f46e5" : COLORS.textMuted,
          marginBottom: 7,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          transition: "color 0.2s",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: focused ? "#4f46e5" : COLORS.textMuted,
            fontSize: 15,
            pointerEvents: "none",
            transition: "color 0.2s",
          }}
        >
          {icon}
        </span>
        <input
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: "13px 14px 13px 42px",
            borderRadius: 14,
            border: error
              ? `1.5px solid ${COLORS.errorRed}`
              : focused
              ? `1.5px solid #818cf8`
              : `1.5px solid ${COLORS.inputBorder}`,
            background: focused ? "rgba(129,140,248,0.04)" : COLORS.offWhite,
            fontSize: 14.5,
            color: COLORS.textDark,
            outline: "none",
            transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
            boxShadow: focused ? "0 0 0 4px rgba(129,140,248,0.12)" : "none",
            boxSizing: "border-box",
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            style={{
              position: "absolute",
              right: 13,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: COLORS.textMuted,
              fontSize: 13,
              padding: 2,
              outline: "none",
            }}
          >
            {show ? "🙈" : "👁️"}
          </button>
        )}
      </div>
      {error && (
        <p style={{ color: COLORS.errorRed, fontSize: 11.5, marginTop: 5, marginLeft: 2 }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function Auth() {
  const navigate = useNavigate();   // 👈 ADD HERE
  // your other states below
  const [mode, setMode] = useState("signup"); // 'login' | 'signup'
  const [animating, setAnimating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [socialHovered, setSocialHovered] = useState(null);
  const [btnHovered, setBtnHovered] = useState(false);
  const [panelBtnHovered, setPanelBtnHovered] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent =
      pulseKeyframes +
      `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
      * { box-sizing: border-box; }
      input::placeholder { color: #c4c4d4; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const switchMode = (newMode) => {
    if (newMode === mode || animating) return;
    setAnimating(true);
    setErrors({});
    setSuccess(false);
    setForm({ name: "", email: "", password: "" });
    setTimeout(() => {
      setMode(newMode);
      setAnimating(false);
    }, 320);
  };

  const validate = () => {
    const e = {};
    if (mode === "signup" && !form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required.";
    if (!form.password || form.password.length < 6) e.password = "Min. 6 characters required.";
    return e;
  };
   const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const body = mode === "signup"
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

      const apiCall = mode === "signup" ? authAPI.register : authAPI.login;
      const { data } = await apiCall(body);

      // Store JWT token and user data
      localStorage.setItem("hg_token", data.token);
      localStorage.setItem("hg_user", JSON.stringify(data.user));
      
      const u = data.user;
      if (u.profile && u.profile.weight) {
        // Calculate age
        let age = 0;
        if (u.profile.dob) {
          const birth = new Date(u.profile.dob);
          const today = new Date();
          age = today.getFullYear() - birth.getFullYear();
          const m = today.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        }
        
        let bmi = 0;
        if (u.profile.weight && u.profile.height) {
          const h = u.profile.height / 100;
          bmi = (u.profile.weight / (h * h)).toFixed(1);
        }

        localStorage.setItem("hg_profile", JSON.stringify({
          fullName: u.name,
          dob: u.profile.dob,
          weight: u.profile.weight,
          height: u.profile.height,
          age: Math.max(0, age),
          bmi: bmi,
          lastUpdated: u.profile.lastUpdated || new Date().toISOString()
        }));
      } else {
        localStorage.removeItem("hg_profile");
      }

      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        // Check if profile has been completed
        const user = data.user;
        if (user.profile && user.profile.weight > 0) {
          navigate("/dashboard");
        } else {
          navigate("/profile-setup");
        }
      }, 800);
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || "Unable to connect to server. Please try again.";
      setErrors({ email: msg });
    }
  };
 
  const isLogin = mode === "login";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #ede9fe 0%, #f0f4ff 50%, #fdf4ff 100%)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        padding: "20px",
      }}
    >
      {/* Card Container */}
      <div
        style={{
          display: "flex",
          width: "100%",
          maxWidth: 920,
          minHeight: 580,
          borderRadius: 32,
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(79,70,229,0.18), 0 8px 32px rgba(0,0,0,0.10)",
          position: "relative",
        }}
      >
        {/* ── LEFT PANEL ─────────────────────────────────── */}
        <div
          style={{
            width: "42%",
            background: `linear-gradient(145deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)`,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "50px 36px",
            overflow: "hidden",
            borderRadius: "0 56px 56px 0",
            zIndex: 2,
            animation: "panelSlide 0.6s cubic-bezier(.4,0,.2,1) both",
          }}
        >
          {/* Background blobs */}
          <FloatingParticle style={{ width: 180, height: 180, background: "rgba(255,255,255,0.07)", top: -40, left: -60 }} />
          <FloatingParticle style={{ width: 120, height: 120, background: "rgba(255,255,255,0.05)", bottom: 30, right: -30, animationDelay: "1.2s" }} />
          <FloatingParticle style={{ width: 80, height: 80, background: "rgba(255,255,255,0.06)", bottom: 120, left: 20, animationDelay: "0.6s" }} />

          {/* Orbit animation */}
          <div style={{ position: "relative", width: 110, height: 110, marginBottom: 36 }}>
            {/* Center shield icon */}
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: 26,
                zIndex: 2,
                boxShadow: "0 0 0 2px rgba(255,255,255,0.25)",
              }}
            >
              🛡️
            </div>
            <OrbitRing size={90} duration={7} delay={0} color="rgba(255,255,255,0.35)" dotSize={7} />
            <OrbitRing size={115} duration={11} delay={-3} color="rgba(255,255,255,0.18)" dotSize={5} />
          </div>

          {/* Brand */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.16em",
              color: "rgba(255,255,255,0.6)",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            HealthGuard AI
          </div>

          <h2
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: COLORS.white,
              margin: "0 0 16px",
              textAlign: "center",
              lineHeight: 1.18,
              fontFamily: "'Syne', sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            {isLogin ? "New Here?" : "Welcome\nBack!"}
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: 14.5,
              textAlign: "center",
              lineHeight: 1.65,
              margin: "0 0 34px",
              maxWidth: 220,
            }}
          >
            {isLogin
              ? "Create an account and start your AI-powered health journey today."
              : "Sign in to continue monitoring your health with intelligent AI insights."}
          </p>

          {/* Panel CTA Button */}
          <button
            onMouseEnter={() => setPanelBtnHovered(true)}
            onMouseLeave={() => setPanelBtnHovered(false)}
            onClick={() => switchMode(isLogin ? "signup" : "login")}
            style={{
              padding: "13px 38px",
              borderRadius: 50,
              border: "2px solid rgba(255,255,255,0.7)",
              background: panelBtnHovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.12)",
              color: panelBtnHovered ? "#4f46e5" : COLORS.white,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.12em",
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
              transform: panelBtnHovered ? "scale(1.04)" : "scale(1)",
              backdropFilter: "blur(6px)",
              outline: "none",
              boxShadow: panelBtnHovered ? "0 8px 28px rgba(0,0,0,0.15)" : "none",
            }}
          >
            {isLogin ? "SIGN UP" : "SIGN IN"}
          </button>

          {/* Bottom decorative line */}
          <div
            style={{
              position: "absolute",
              bottom: 28,
              display: "flex",
              gap: 5,
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: i === 2 ? 22 : 8,
                  height: 4,
                  borderRadius: 99,
                  background: i === 2 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)",
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            background: COLORS.white,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "50px 52px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle corner decoration */}
          <div
            style={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(129,140,248,0.07) 0%, rgba(168,85,247,0.06) 100%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -40,
              left: -40,
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "rgba(129,140,248,0.05)",
              pointerEvents: "none",
            }}
          />

          {/* Form container */}
          <div
            style={{
              width: "100%",
              maxWidth: 360,
              opacity: animating ? 0 : 1,
              transform: animating ? "translateY(14px)" : "translateY(0)",
              transition: "opacity 0.32s ease, transform 0.32s ease",
              animation: !animating ? "fadeSlideIn 0.5s cubic-bezier(.4,0,.2,1) both" : "none",
            }}
          >
            {/* Title */}
            <div style={{ marginBottom: 28 }}>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: COLORS.textDark,
                  margin: "0 0 6px",
                  fontFamily: "'Syne', sans-serif",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                }}
              >
                {isLogin ? "Sign In" : "Create Account"}
              </h1>
              <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>
                {isLogin
                  ? "Welcome back! Enter your credentials."
                  : "Join HealthGuard AI — it's free."}
              </p>
            </div>

            {/* Social Login */}
            <div style={{ marginBottom: 24 }}>
              <p
                style={{
                  fontSize: 11.5,
                  color: COLORS.textMuted,
                  textAlign: "center",
                  letterSpacing: "0.08em",
                  marginBottom: 14,
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Continue with
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                {[
                  { id: "google", icon: "G", label: "Google" },
                  { id: "facebook", icon: "f", label: "Facebook" },
                  { id: "linkedin", icon: "in", label: "LinkedIn" },
                ].map(({ id, icon, label }) => (
                  <SocialButton
                    key={id}
                    icon={<span style={{ fontWeight: 800, fontSize: id === "linkedin" ? 12 : 15 }}>{icon}</span>}
                    label={label}
                    hovered={socialHovered === id}
                    onMouseEnter={() => setSocialHovered(id)}
                    onMouseLeave={() => setSocialHovered(null)}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 22,
              }}
            >
              <div style={{ flex: 1, height: 1, background: COLORS.inputBorder }} />
              <span style={{ fontSize: 12, color: "#c4c4d4", fontWeight: 500 }}>or</span>
              <div style={{ flex: 1, height: 1, background: COLORS.inputBorder }} />
            </div>

            {/* Fields */}
            {!isLogin && (
              <InputField
                label="Full Name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Alex Johnson"
                icon="👤"
                error={errors.name}
              />
            )}
            <InputField
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
              icon="✉️"
              error={errors.email}
            />
            <InputField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              icon="🔒"
              error={errors.password}
            />

            {isLogin && (
              <div style={{ textAlign: "right", marginTop: -10, marginBottom: 20 }}>
                <a
                  href="#"
                  style={{
                    fontSize: 13,
                    color: "#7c3aed",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot password?
                </a>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1.5px solid rgba(16,185,129,0.3)",
                  borderRadius: 12,
                  padding: "11px 16px",
                  marginBottom: 16,
                  color: COLORS.successGreen,
                  fontSize: 13.5,
                  fontWeight: 600,
                  textAlign: "center",
                  animation: "fadeSlideIn 0.4s ease both",
                }}
              >
                ✅ {isLogin ? "Signed in successfully!" : "Account created! Welcome aboard."}
              </div>
            )}

            {/* CTA Button */}
            <button
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              onClick={handleSubmit}
              disabled={loading || success}
              style={{
                width: "100%",
                padding: "14.5px",
                borderRadius: 14,
                border: "none",
                background:
                  loading || success
                    ? "linear-gradient(135deg, #a5b4fc, #c084fc)"
                    : btnHovered
                    ? "linear-gradient(135deg, #3730a3 0%, #6d28d9 100%)"
                    : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #a855f7 100%)",
                color: COLORS.white,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.10em",
                cursor: loading || success ? "not-allowed" : "pointer",
                transition: "all 0.28s cubic-bezier(.4,0,.2,1)",
                transform: btnHovered && !loading ? "translateY(-2px)" : "translateY(0)",
                boxShadow: btnHovered && !loading
                  ? "0 12px 32px rgba(124,58,237,0.38)"
                  : "0 4px 16px rgba(124,58,237,0.22)",
                outline: "none",
                position: "relative",
                overflow: "hidden",
                animation: loading ? "pulse-glow 1.2s infinite" : "none",
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: "2.5px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin-slow 0.7s linear infinite",
                    }}
                  />
                  Processing...
                </span>
              ) : isLogin ? (
                "SIGN IN →"
              ) : (
                "CREATE ACCOUNT →"
              )}
            </button>

            {/* Switch mode (mobile helper) */}
            <p
              style={{
                textAlign: "center",
                marginTop: 22,
                fontSize: 13.5,
                color: COLORS.textMuted,
              }}
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); switchMode(isLogin ? "signup" : "login"); }}
                style={{ color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
