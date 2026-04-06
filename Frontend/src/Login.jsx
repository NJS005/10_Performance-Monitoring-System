// LoginPage.jsx — responsive version
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import DarkModeToggle from "./DarkModeToggle";

const FloatingOrb = ({ size, top, left, color, delay }) => (
  <div
    className="absolute rounded-full opacity-30 blur-xl"
    style={{
      width: size, height: size, top, left,
      background: color,
      animation: `float ${4 + delay}s ease-in-out ${delay}s infinite alternate`,
    }}
  />
);

const GridLines = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 400 800" preserveAspectRatio="none">
    {[...Array(9)].map((_, i) => (
      <line key={`v${i}`} x1={(i + 1) * 40} y1="0" x2={(i + 1) * 40} y2="800" stroke="white" strokeWidth="0.5" />
    ))}
    {[...Array(20)].map((_, i) => (
      <line key={`h${i}`} x1="0" y1={(i + 1) * 40} x2="400" y2={(i + 1) * 40} stroke="white" strokeWidth="0.5" />
    ))}
  </svg>
);

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white bg-opacity-70 border border-white border-opacity-10 rounded-xl p-3 sm:p-4 backdrop-blur-sm flex-1 min-w-0">
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="text-lg sm:text-2xl flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-black text-[9px] sm:text-xs tracking-widest uppercase truncate">{label}</p>
        <p className="text-black font-semibold text-xs sm:text-sm mt-0.5">{value}</p>
      </div>
    </div>
  </div>
);

export default function LoginPage() {
  const Navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => { setMounted(true); }, []);

  const handleLoginSuccess = async (credentialResponse) => {
    if (!selectedRole) {
      alert("Please select a role first!");
      return;
    }
    try {
      const response = await fetch("http://localhost:8080/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential, role: selectedRole }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", credentialResponse.credential);
        if (selectedRole === "Student") {
          const rollNo = data.user.email.split('_')[1].split('@')[0].toUpperCase();
          if (data["Existing User"]) {
            alert("Welcome back, " + data.user.name + "!");
            Navigate("/student", { state: { rollNo } });
          } else {
            alert("Welcome, " + data.user.name + "! Your account has been created.");
            Navigate("/student/details", { state: { rollNo } });
          }
        } else if (selectedRole === "Faculty Advisor") Navigate("/faculty/dashboard");
        else if (selectedRole === "Admin") Navigate("/admin/dashboard");
      } else {
        alert(`Login Denied: ${await response.text()}`);
      }
    } catch (error) {
      console.error("Backend communication error:", error);
      alert("Could not connect to the server. Is Spring Boot running on port 8080?");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@300;400;500;600&display=swap');
        @keyframes float {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(12px, -20px) scale(1.08); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .anim-fadeup  { animation: fadeUp  0.6s cubic-bezier(.22,1,.36,1) forwards; opacity: 0; }
        .anim-slidein { animation: slideIn 0.6s cubic-bezier(.22,1,.36,1) forwards; opacity: 0; }
        .role-btn { transition: all 0.3s cubic-bezier(.22,1,.36,1); }
      `}</style>

      <div className="min-h-screen flex flex-col lg:flex-row" style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* ─── LEFT PANEL ─── */}
        {/* Mobile: horizontal strip at top. Tablet+: vertical sidebar. Desktop: wider sidebar */}
        <div
          className="relative flex flex-row lg:flex-col justify-between overflow-hidden
                     p-4 sm:p-6 lg:p-10
                     w-full lg:w-5/12
                     lg:min-h-screen"
          style={{ background: "linear-gradient(155deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%)" }}
        >
          <GridLines />
          <FloatingOrb size="220px" top="-60px" left="-40px" color="#6366f1" delay={0} />
          <FloatingOrb size="160px" top="55%" left="60%" color="#8b5cf6" delay={1.2} />

          {/* Brand mark */}
          <div className={`relative z-10 flex items-start ${mounted ? "anim-fadeup" : ""}`} style={{ animationDelay: "0.1s" }}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs sm:text-sm">AMS</span>
            </div>
          </div>

          {/* Tagline — hidden on mobile (too cramped in strip layout) */}
          <div className="relative z-10 hidden lg:block">
            <h1
              className={`text-white text-5xl leading-tight ${mounted ? "anim-fadeup" : ""}`}
              style={{ fontFamily: "'Playfair Display', serif", animationDelay: "0.25s" }}
            >
              Track.<br /><span className="opacity-50">Verify.</span><br />Grow.
            </h1>
          </div>

          {/* Stat cards — row on mobile, column on desktop */}
          <div
            className={`relative z-10 flex flex-row lg:flex-col gap-2 sm:gap-3 ${mounted ? "anim-fadeup" : ""}`}
            style={{ animationDelay: "0.55s" }}
          >
            <StatCard label="Students" value="2,400+" icon="👤" />
            <StatCard label="Faculty" value="148" icon="🎓" />
          </div>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center relative">
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, #312e81 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Dark mode toggle */}
          <div className="absolute top-4 right-4 z-20">
            <DarkModeToggle />
          </div>

          <div
            className={`relative z-10 w-full max-w-sm sm:max-w-md px-5 sm:px-8 py-10 lg:py-0 ${mounted ? "anim-slidein" : ""}`}
            style={{ animationDelay: "0.35s" }}
          >
            <div className="mb-6 sm:mb-8">
              <p className="text-xs tracking-widest uppercase text-indigo-500 dark:text-indigo-400 font-semibold mb-2">
                Academic Monitoring System
              </p>
              <h2
                className="text-gray-800 dark:text-white text-2xl sm:text-3xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Sign in
              </h2>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">First, select your identity:</p>
            </div>

            {/* Role selection */}
            <div className="flex flex-col gap-2 sm:gap-3 mb-6 sm:mb-8">
              {[
                { id: "Student",         emoji: "📚", desc: "For NITC Students" },
                { id: "Faculty Advisor", emoji: "🏛️", desc: "For NITC Faculty"  },
                { id: "Admin",           emoji: "⚡", desc: "System Management" },
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`role-btn flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 text-left cursor-pointer
                    min-h-[56px] sm:min-h-[auto]
                    ${selectedRole === role.id
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950 ring-2 ring-indigo-100 dark:ring-indigo-900"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm"
                    }`}
                >
                  <span className="text-xl sm:text-2xl">{role.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">{role.id}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs">{role.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div
              className={`transition-all duration-500 ${
                selectedRole ? "opacity-100 scale-100" : "opacity-40 grayscale pointer-events-none"
              }`}
            >
              <div className="flex justify-center flex-col items-center gap-3 sm:gap-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 italic text-center">
                  {selectedRole
                    ? `Ready to sign in as ${selectedRole}`
                    : "Select a role above to enable Google Login"}
                </p>
                <div className="w-full flex justify-center">
                  <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={() => console.log('Login Failed')}
                    useOneTap
                    theme="filled_blue"
                    shape="pill"
                    width="100%"
                  />
                </div>
              </div>
            </div>

            <p className="text-center text-gray-400 dark:text-gray-600 text-xs mt-8 sm:mt-10">
              Only{" "}
              <span className="text-indigo-500 dark:text-indigo-400 font-medium">@nitc.ac.in</span>{" "}
              emails are permitted.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}