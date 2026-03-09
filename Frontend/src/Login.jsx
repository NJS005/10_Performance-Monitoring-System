import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';

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
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  
  const handleLoginSuccess = async (credentialResponse) => {
    if (!selectedRole) {
      alert("Please select a role (Student or Faculty) first!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          token: credentialResponse.credential, 
          role: selectedRole 
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("user", JSON.stringify(data.user));
        if (selectedRole === "Student")
        {
          const rollNo = data.user.email.split('_')[1].split('@')[0].toUpperCase();
          if(data["Existing User"])
          {
               alert("Welcome back, " + data.user.name + "!");
            Navigate("/student", { state: { rollNo: rollNo } });
          }
          else 
          {
            alert("Welcome, " + data.user.name + "! Your account has been created.");
            Navigate("/student/details", { state: { rollNo: rollNo } });
          }
          
        }
        else if (selectedRole === "Faculty Advisor") Navigate("/faculty/dashboard");
        else if (selectedRole === "Admin") Navigate("/admin/dashboard");
      } 
      else {
        const errorData = await response.text();
        alert(`Login Denied: ${errorData}`);
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
        .anim-fadeup { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) forwards; opacity: 0; }
        .anim-slidein { animation: slideIn 0.6s cubic-bezier(.22,1,.36,1) forwards; opacity: 0; }
        .role-btn { transition: all 0.3s cubic-bezier(.22,1,.36,1); }
      `}</style>

      <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* ─── LEFT PANEL ─── */}
        <div className="relative w-5/12 flex flex-col justify-between p-10 overflow-hidden"
          style={{ background: "linear-gradient(155deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%)" }}>
          <GridLines />
          <FloatingOrb size="220px" top="-60px" left="-40px" color="#6366f1" delay={0} />
          <FloatingOrb size="160px" top="55%" left="60%" color="#8b5cf6" delay={1.2} />

          <div className="relative z-10">
            <div className={`flex items-center gap-3 ${mounted ? "anim-fadeup" : ""}`} style={{ animationDelay: "0.1s" }}>
              <div className="w-10 h-10 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 flex items-center justify-center">
                <span className="text-white font-bold">AMS</span>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <h1 className={`text-white text-5xl leading-tight ${mounted ? "anim-fadeup" : ""}`}
              style={{ fontFamily: "'Playfair Display', serif", animationDelay: "0.25s" }}>
              Track.<br /><span className="opacity-50">Verify.</span><br />Grow.
            </h1>
          </div>

          <div className={`relative z-10 flex flex-col gap-3 ${mounted ? "anim-fadeup" : ""}`} style={{ animationDelay: "0.55s" }}>
            <StatCard label="Active Students" value="2,400+" icon="👤" />
            <StatCard label="Faculty Advisors" value="148" icon="🎓" />
          </div>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div className="w-7/12 bg-gray-50 flex items-center justify-center relative">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #312e81 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

          <div className={`relative z-10 w-full max-w-md px-8 ${mounted ? "anim-slidein" : ""}`} style={{ animationDelay: "0.35s" }}>
            <div className="mb-8">
              <p className="text-xs tracking-widest uppercase text-indigo-500 font-semibold mb-2">Academic Monitoring System</p>
              <h2 className="text-gray-800 text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Sign in</h2>
              <p className="text-gray-400 text-sm mt-2">First, select your identity:</p>
            </div>

            {/* ROLE SELECTION */}
            <div className="flex flex-col gap-3 mb-8">
              {[
                { id: "Student", emoji: "📚", desc: "For NITC Students" },
                { id: "Faculty Advisor", emoji: "🏛️", desc: "For NITC Faculty" },
                { id: "Admin", emoji: "⚡", desc: "System Management" }
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`role-btn flex items-center gap-4 p-4 rounded-xl border-2 text-left cursor-pointer transition-all
                    ${selectedRole === role.id 
                      ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100" 
                      : "border-gray-200 bg-white hover:border-indigo-300 shadow-sm"}`}
                >
                  <span className="text-2xl">{role.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{role.id}</p>
                    <p className="text-gray-400 text-xs">{role.desc}</p>
                  </div>
                </button>
              ))}
            </div>

           
            <div className={`transition-all duration-500 ${selectedRole ? "opacity-100 scale-100" : "opacity-40 grayscale pointer-events-none"}`}>
              <div className="flex justify-center flex-col items-center gap-4">
                <p className="text-xs font-medium text-gray-500 italic">
                  {selectedRole ? `Ready to sign in as ${selectedRole}` : "Select a role above to enable Google Login"}
                </p>
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

            <p className="text-center text-gray-400 text-xs mt-10">
              Only <span className="text-indigo-500 font-medium">@nitc.ac.in</span> emails are permitted.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}