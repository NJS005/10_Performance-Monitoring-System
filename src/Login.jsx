import { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom"

const FloatingOrb = ({ size, top, left, color, delay }) => (
  <div
    className="absolute rounded-full opacity-30 blur-xl"
    style={{
      width: size,
      height: size,
      top,
      left,
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
  <div className="bg-white bg-opacity-[0.07] border border-white border-opacity-10 rounded-xl p-4 backdrop-blur-sm">
    <div className="flex items-center gap-3">
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="text-black text-opacity-40 text-xs tracking-widest uppercase">{label}</p>
        <p className="text-black font-semibold text-sm mt-0.5">{value}</p>
      </div>
    </div>
  </div>
);

export default function LoginPage() {
  const Navigate = useNavigate();
  const [hoveredRole, setHoveredRole] = useState(null);
  const [mounted, setMounted] = useState(false);

  const handleClick = (role) => {

  alert(`Initiating Google Auth for ${role}...`);
  if (role === "Student") {
    Navigate("/student");
  } else if (role === "Faculty Advisor") {
    alert("Faculty dashboard coming soon!");
  }
}

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@300;400;500;600&display=swap');

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(12px, -20px) scale(1.08); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(99,102,241,0.3); }
          50% { box-shadow: 0 0 28px rgba(99,102,241,0.55); }
        }
        .anim-fadeup { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) forwards; opacity: 0; }
        .anim-slidein { animation: slideIn 0.6s cubic-bezier(.22,1,.36,1) forwards; opacity: 0; }
        .role-btn:hover .role-icon-wrap { transform: scale(1.12); }
        .role-btn:hover .role-arrow { transform: translateX(4px); opacity: 1; }
        .role-arrow { opacity: 0; transition: all 0.3s ease; }
        .role-icon-wrap { transition: transform 0.3s cubic-bezier(.22,1,.36,1); }
        .glow-btn { animation: glowPulse 3s ease-in-out infinite; }
      `}</style>

      <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* ─── LEFT PANEL ─── */}
        <div
          className="relative w-5/12 flex flex-col justify-between p-10 overflow-hidden"
          style={{ background: "linear-gradient(155deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%)" }}
        >
          <GridLines />

          {/* Floating orbs */}
          <FloatingOrb size="220px" top="-60px" left="-40px" color="#6366f1" delay={0} />
          <FloatingOrb size="160px" top="55%" left="60%" color="#8b5cf6" delay={1.2} />
          <FloatingOrb size="100px" top="75%" left="10%" color="#a78bfa" delay={2.4} />
          <FloatingOrb size="80px" top="20%" left="75%" color="#6366f1" delay={0.8} />

          {/* Content */}
          <div className="relative z-10">
            {/* Logo area */}
            <div className={`flex items-center gap-3 ${mounted ? "anim-fadeup" : ""}`} style={{ animationDelay: "0.1s" }}>
              <div className="w-10 h-10 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-white font-semibold text-sm tracking-wide opacity-90">AMS</span>
            </div>
          </div>

          <div className="relative z-10">
            <h1
              className={`text-white text-5xl leading-tight ${mounted ? "anim-fadeup" : ""}`}
              style={{ fontFamily: "'Playfair Display', serif", animationDelay: "0.25s" }}
            >
              Track.<br />
              <span className="opacity-50">Verify.</span><br />
              Grow.
            </h1>
            <p
              className={`text-white text-opacity-40 text-sm leading-relaxed mt-5 max-w-xs ${mounted ? "anim-fadeup" : ""}`}
              style={{ animationDelay: "0.4s" }}
            >
              A unified platform for academic performance monitoring, verification workflows, and student guidance.
            </p>
          </div>

          <div className={`relative z-10 flex flex-col gap-3 ${mounted ? "anim-fadeup" : ""}`} style={{ animationDelay: "0.55s" }}>
            <StatCard label="Active Students" value="2,400+" icon="👤" />
            <StatCard label="Faculty Advisors" value="148" icon="🎓" />
            <StatCard label="Reports Generated" value="18,920" icon="📊" />
          </div>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div className="w-7/12 bg-gray-50 flex items-center justify-center relative">
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(circle, #312e81 1px, transparent 1px)",
            backgroundSize: "28px 28px"
          }} />

          <div className={`relative z-10 w-full max-w-md px-8 ${mounted ? "anim-slidein" : ""}`} style={{ animationDelay: "0.35s" }}>
            {/* Header */}
            <div className="mb-10">
              <p className="text-xs tracking-widest uppercase text-indigo-500 font-semibold mb-2">Welcome back</p>
              <h2 className="text-gray-800 text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Sign in to AMS
              </h2>
              <p className="text-gray-400 text-sm mt-2">Choose your role to continue</p>
            </div>

            {/* Role Cards */}
            <div className="flex flex-col gap-4">
              {[
                {
                  role: "student",
                  label: "Student",
                  desc: "View grades, submit data & get guidance",
                  emoji: "📚",
                  accentBg: "bg-indigo-50",
                  accentBorder: "border-indigo-200",
                  accentText: "text-indigo-600",
                  hoverBorder: "hover:border-indigo-400",
                  hoverShadow: "hover:shadow-lg hover:shadow-indigo-100",
                },
                {
                  role: "faculty",
                  label: "Faculty Advisor",
                  desc: "Review submissions & manage students",
                  emoji: "🏛️",
                  accentBg: "bg-violet-50",
                  accentBorder: "border-violet-200",
                  accentText: "text-violet-600",
                  hoverBorder: "hover:border-violet-400",
                  hoverShadow: "hover:shadow-lg hover:shadow-violet-100",
                },
              ].map((item) => (
                <button
                  key={item.role}
                  className={`role-btn group flex items-center gap-4 p-5 rounded-2xl border bg-white transition-all duration-300 text-left cursor-pointer
                    ${item.accentBorder} ${item.hoverBorder} ${item.hoverShadow}
                    ${hoveredRole === item.role ? "scale-[1.01]" : ""}
                  `}
                  onMouseEnter={() => setHoveredRole(item.role)}
                  onMouseLeave={() => setHoveredRole(null)}
                  onClick={() => handleClick(item.label)}
                >
                  {/* Icon */}
                  <div className={`role-icon-wrap w-14 h-14 rounded-xl ${item.accentBg} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {item.emoji}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold text-gray-800 text-base`}>{item.label}</p>
                      <svg className={`role-arrow w-4 h-4 ${item.accentText}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5 truncate">{item.desc}</p>
                  </div>

                  {/* Google icon */}
                  <div className="flex-shrink-0 opacity-30 group-hover:opacity-60 transition-opacity">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-7">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-350 text-xs tracking-wider uppercase" style={{ color: "#9ca3af" }}>or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Admin link */}
            <button
              className="glow-btn w-full py-3 rounded-xl border-2 border-indigo-300 bg-indigo-50 text-indigo-600 font-semibold text-sm tracking-wide hover:bg-indigo-100 hover:border-indigo-400 transition-all duration-300 cursor-pointer"
              onClick={() => alert("Initiating Google Auth for Admin...")}
            >
              Admin Access
            </button>

            {/* Footer note */}
            <p className="text-center text-gray-400 text-xs mt-8 leading-relaxed">
              Sign in using your <span className="text-indigo-500 font-medium">institute Gmail account</span>.<br />
              Only registered users can access this platform.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}