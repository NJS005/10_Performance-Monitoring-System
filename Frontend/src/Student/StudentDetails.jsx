import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── Constants ───
const PROGRAMS = ["B.Tech", "B.Arch", "M.Tech", "PhD", "BSc", "MSc", "Integrated"];
const UG_PROGRAMS = ["B.Tech", "B.Arch"];
const FACULTY_PROGRAMS = ["B.Tech", "B.Arch", "M.Tech"];
const DEPARTMENTS = [
  { code: "CS", label: "CS – Computer Science" },
  { code: "EC", label: "EC – Electronics & Communication" },
  { code: "EE", label: "EE – Electrical Engineering" },
  { code: "ME", label: "ME – Mechanical Engineering" },
  { code: "CE", label: "CE – Civil Engineering" },
  { code: "CH", label: "CH – Chemical Engineering" },
  { code: "PE", label: "PE – Production Engineering" },
  { code: "MT", label: "MT – Materials Science" },
  { code: "BT", label: "BT – Biotechnology" },
  { code: "EP", label: "EP – Engineering Physics" },
  { code: "AR", label: "AR – Architecture" },
];

const dropdownArrow = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`;

// ─── Reusable Input Field ───
const InputField = ({ label, value, onChange, placeholder, type = "text", required, error }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    <label style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase" }}>
      {label} {required && <span style={{ color: "#f87171" }}>*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || label}
      style={{
        background: error ? "rgba(248,113,113,0.05)" : "rgba(255,255,255,0.05)",
        border: error ? "1px solid rgba(248,113,113,0.55)" : "1px solid rgba(255,255,255,0.1)",
        borderRadius: "10px", padding: "10px 14px",
        color: "#e2e8f0", fontSize: "14px", outline: "none",
        transition: "all 0.2s", width: "100%", boxSizing: "border-box",
      }}
      onFocus={(e) => { e.target.style.border = "1px solid rgba(139,92,246,0.6)"; e.target.style.background = "rgba(139,92,246,0.08)"; }}
      onBlur={(e) => { e.target.style.border = error ? "1px solid rgba(248,113,113,0.55)" : "1px solid rgba(255,255,255,0.1)"; e.target.style.background = error ? "rgba(248,113,113,0.05)" : "rgba(255,255,255,0.05)"; }}
    />
    {error && <span style={{ color: "#f87171", fontSize: "11px" }}>{error}</span>}
  </div>
);

// ─── Select / Dropdown ───
const SelectField = ({ label, value, onChange, options, required, error }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    <label style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase" }}>
      {label} {required && <span style={{ color: "#f87171" }}>*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: `${error ? "rgba(248,113,113,0.05)" : "rgba(255,255,255,0.05)"} ${dropdownArrow} no-repeat right 14px center`,
        border: error ? "1px solid rgba(248,113,113,0.55)" : "1px solid rgba(255,255,255,0.1)",
        borderRadius: "10px", padding: "10px 36px 10px 14px",
        color: value ? "#e2e8f0" : "#64748b", fontSize: "14px", outline: "none",
        width: "100%", boxSizing: "border-box", cursor: "pointer",
        appearance: "none", transition: "all 0.2s",
      }}
      onFocus={(e) => { e.target.style.border = "1px solid rgba(139,92,246,0.6)"; }}
      onBlur={(e) => { e.target.style.border = error ? "1px solid rgba(248,113,113,0.55)" : "1px solid rgba(255,255,255,0.1)"; }}
    >
      <option value="" style={{ background: "#1e1b4b", color: "#64748b" }}>— Select —</option>
      {options.map((opt) => (
        <option key={opt.value ?? opt} value={opt.value ?? opt} style={{ background: "#1e1b4b", color: "#e2e8f0" }}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
    {error && <span style={{ color: "#f87171", fontSize: "11px" }}>{error}</span>}
  </div>
);

// ─── Address Block ───
const AddressBlock = ({ title, type, data, onChange, accentColor, errors }) => (
  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: accentColor }} />
      <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "600" }}>{title}</span>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
      <div style={{ gridColumn: "1 / -1" }}>
        <InputField label="Address Line 1" value={data.line1} onChange={(v) => onChange(type, "line1", v)} required error={errors?.[`${type}_line1`]} />
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <InputField label="Address Line 2" value={data.line2} onChange={(v) => onChange(type, "line2", v)} />
      </div>
      <InputField label="City"    value={data.city}    onChange={(v) => onChange(type, "city", v)}    required error={errors?.[`${type}_city`]} />
      <InputField label="State"   value={data.state}   onChange={(v) => onChange(type, "state", v)}   required error={errors?.[`${type}_state`]} />
      <InputField label="Country" value={data.country} onChange={(v) => onChange(type, "country", v)} required error={errors?.[`${type}_country`]} />
      <InputField label="ZIP Code" value={data.zip}    onChange={(v) => onChange(type, "zip", v)}     required error={errors?.[`${type}_zip`]} />
    </div>
  </div>
);

// ─── Step Indicator ───
const STEPS = ["Personal", "Address", "Family"];

const StepIndicator = ({ current }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "28px" }}>
    {STEPS.map((step, i) => (
      <div key={step} style={{ display: "flex", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "50%",
            background: i <= current ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(255,255,255,0.07)",
            border: i === current ? "2px solid rgba(139,92,246,0.8)" : "2px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: i === current ? "0 0 16px rgba(124,58,237,0.5)" : "none",
            transition: "all 0.3s",
          }}>
            {i < current
              ? <span style={{ color: "#fff", fontSize: "13px" }}>✓</span>
              : <span style={{ color: i === current ? "#fff" : "#475569", fontSize: "12px", fontWeight: "700" }}>{i + 1}</span>
            }
          </div>
          <span style={{ fontSize: "11px", fontWeight: "600", color: i <= current ? "#a78bfa" : "#475569", letterSpacing: "0.05em" }}>{step}</span>
        </div>
        {i < STEPS.length - 1 && (
          <div style={{ width: "60px", height: "2px", margin: "0 4px", marginBottom: "20px", background: i < current ? "linear-gradient(90deg,#7c3aed,#4f46e5)" : "rgba(255,255,255,0.08)", transition: "all 0.4s" }} />
        )}
      </div>
    ))}
  </div>
);

// ─── Main Page ───
export default function StudentDetailCollection() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [sameAddress, setSameAddress] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    name: user.name || "",
    batch: "",
    contactNo: "",
    rollNo: "",
    department: "",
    program: "",
    facultyAdvisor: "",
    supervisor: "",
    permanentAddress:  { line1: "", line2: "", city: "", state: "", country: "India", zip: "" },
    temporaryAddress:  { line1: "", line2: "", city: "", state: "", country: "India", zip: "" },
    fatherName: "",
    motherName: "",
    guardianContact: "",
  });

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  // Mirror permanent → temporary when checkbox is ticked
  useEffect(() => {
    if (sameAddress) {
      setFormData((prev) => ({ ...prev, temporaryAddress: { ...prev.permanentAddress } }));
    }
  }, [sameAddress, formData.permanentAddress]);

  const isFacultyProgram = FACULTY_PROGRAMS.includes(formData.program);
  const isUGProgram      = UG_PROGRAMS.includes(formData.program);
  const advisorLabel     = formData.program ? (isFacultyProgram ? "Faculty Advisor" : "Supervisor") : "Faculty Advisor / Supervisor";
  const advisorField     = isFacultyProgram ? "facultyAdvisor" : "supervisor";

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleAddressChange = (type, field, value) => {
    if (type === "temporary" && sameAddress) return;
    setFormData((prev) => ({ ...prev, [`${type}Address`]: { ...prev[`${type}Address`], [field]: value } }));
    setErrors((prev) => ({ ...prev, [`${type}_${field}`]: "" }));
  };

  // ─── Per-step validation ───
  const validateStep = (s) => {
    const errs = {};
    const phone = /^\d{10}$/;

    if (s === 0) {
      if (!formData.name.trim())            errs.name           = "Required";
      if (!formData.rollNo.trim())          errs.rollNo         = "Required";
      if (!formData.batch.trim())           errs.batch          = "Required";
      if (!formData.program)                errs.program        = "Please select a program";
      if (!formData.department.trim())      errs.department     = "Required";
      if (!formData[advisorField].trim())   errs[advisorField]  = "Required";
      if (!formData.contactNo.trim())       errs.contactNo      = "Required";
      else if (!phone.test(formData.contactNo.trim())) errs.contactNo = "Must be exactly 10 digits (no country code)";
    }

    if (s === 1) {
      ["line1", "city", "state", "country", "zip"].forEach((f) => {
        if (!formData.permanentAddress[f].trim()) errs[`permanent_${f}`] = "Required";
        if (!sameAddress && !formData.temporaryAddress[f].trim()) errs[`temporary_${f}`] = "Required";
      });
    }

    if (s === 2) {
      if (!formData.fatherName.trim())      errs.fatherName     = "Required";
      if (!formData.motherName.trim())      errs.motherName     = "Required";
      if (!formData.guardianContact.trim()) errs.guardianContact = "Required";
      else if (!phone.test(formData.guardianContact.trim())) errs.guardianContact = "Must be exactly 10 digits (no country code)";
    }

    return errs;
  };

  const handleContinue = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    const errs = validateStep(2);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
   try {
      const res = await fetch("http://localhost:8080/api/student/details", { 
         method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          ...formData,
          rollNo: formData.rollNo.toUpperCase(),
          email: user.email,
          batch: parseInt(formData.batch, 10) || 0,
          contactNo: Number(formData.contactNo) || 0,
          guardianContact: Number(formData.guardianContact) || 0,
          verificationStatus: 'pending',
          personalVerificationStatus: 'pending',
          temporaryAddress: sameAddress ? { ...formData.permanentAddress } : formData.temporaryAddress,
        }),
      });
     if (res.ok) {
       
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        
        const updatedUser = { 
          ...currentUser, 
          rollno: formData.rollNo.toUpperCase() 
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        navigate("/student", { state: { rollno: formData.rollNo.toUpperCase() } });
      }
      else alert("Failed to save details. Please try again.");
    } catch (err) {
      console.error(err);
      alert("Could not connect to server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@300;400;500;600&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .modal-appear { animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) forwards; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 10px; }
        select option { background: #1e1b4b; color: #e2e8f0; }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29 0%, #1a1035 50%, #1e1b4b 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden",
      }}>
        {/* Ambient orbs */}
        <div style={{ position: "absolute", width: "400px", height: "400px", top: "-100px", left: "-100px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "300px", height: "300px", bottom: "-80px", right: "-80px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* AMS top badge */}
        <div style={{ position: "absolute", top: "28px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: "11px", fontWeight: "700" }}>AMS</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", letterSpacing: "0.05em" }}>Academic Monitoring System</span>
        </div>

        {/* ── Modal ── */}
        <div className={mounted ? "modal-appear" : ""} style={{
          width: "100%", maxWidth: "660px", maxHeight: "90vh",
          background: "linear-gradient(135deg, #1e1b4b 0%, #1a1035 50%, #0f0c29 100%)",
          borderRadius: "28px", border: "1px solid rgba(139,92,246,0.25)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
          display: "flex", flexDirection: "column", overflow: "hidden", position: "relative",
        }}>
          {/* Glow line */}
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "60%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.9), transparent)" }} />
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "40%", height: "80px", background: "radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />

          {/* Header */}
          <div style={{ padding: "32px 32px 0", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", boxShadow: "0 4px 20px rgba(124,58,237,0.45)", flexShrink: 0 }}>🎓</div>
              <div>
                <h2 style={{ color: "#f1f5f9", fontSize: "20px", fontWeight: "700", margin: 0, fontFamily: "'Playfair Display', serif" }}>
                  Welcome, {user.name?.split(" ")[0] || "Student"}!
                </h2>
                <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0" }}>Let's set up your profile before we begin.</p>
              </div>
            </div>
            <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "20px 0 24px" }} />
            <StepIndicator current={step} />
          </div>

          {/* Scrollable body */}
          <div style={{ overflowY: "auto", padding: "0 32px 24px", flex: 1 }}>

            {/* ── STEP 0: Personal ── */}
            {step === 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <InputField label="Full Name"   value={formData.name}   onChange={(v) => handleChange("name", v)}   required error={errors.name} />
                  <InputField label="Roll Number" value={formData.rollNo} onChange={(v) => handleChange("rollNo", v)} required error={errors.rollNo} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <InputField label="Batch / Year" value={formData.batch} onChange={(v) => handleChange("batch", v)} placeholder="e.g. 2023" required error={errors.batch} />
                  <InputField
                    label="Contact Number"
                    value={formData.contactNo}
                    onChange={(v) => handleChange("contactNo", v.replace(/\D/g, "").slice(0, 10))}
                    type="tel" placeholder="10-digit mobile" required error={errors.contactNo}
                  />
                </div>

                {/* Program + Department */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <SelectField
                    label="Program" value={formData.program} required error={errors.program}
                    options={PROGRAMS}
                    onChange={(v) => { handleChange("program", v); handleChange("department", ""); }}
                  />
                  {isUGProgram ? (
                    <SelectField
                      label="Department" value={formData.department} required error={errors.department}
                      options={DEPARTMENTS.map((d) => ({ value: d.code, label: d.label }))}
                      onChange={(v) => handleChange("department", v)}
                    />
                  ) : (
                    <InputField
                      label="Department / School" value={formData.department}
                      onChange={(v) => handleChange("department", v)}
                      placeholder="e.g. Computer Science" required error={errors.department}
                    />
                  )}
                </div>

                {/* Faculty Advisor / Supervisor */}
                {formData.program && (
                  <>
                    <InputField
                      label={advisorLabel}
                      value={formData[advisorField]}
                      onChange={(v) => handleChange(advisorField, v)}
                      placeholder={`Name of your ${advisorLabel}`}
                      required error={errors[advisorField]}
                    />
                    {/* Indicator pill */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "20px", padding: "5px 12px", alignSelf: "flex-start" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: isFacultyProgram ? "#8b5cf6" : "#06b6d4" }} />
                      <span style={{ color: isFacultyProgram ? "#a78bfa" : "#67e8f9", fontSize: "11px", fontWeight: "600" }}>
                        {isFacultyProgram ? "Faculty Advisor applies for this program" : "Supervisor applies for this program"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── STEP 1: Address ── */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <AddressBlock title="Permanent Address" type="permanent" data={formData.permanentAddress} onChange={handleAddressChange} accentColor="#8b5cf6" errors={errors} />

                {/* Same-address checkbox */}
                <div
                  onClick={() => setSameAddress((v) => !v)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "13px 16px", background: sameAddress ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.03)", border: sameAddress ? "1px solid rgba(139,92,246,0.35)" : "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", transition: "all 0.25s", userSelect: "none" }}
                >
                  <div style={{
                    width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0,
                    background: sameAddress ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(255,255,255,0.06)",
                    border: sameAddress ? "none" : "1px solid rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: sameAddress ? "0 2px 8px rgba(124,58,237,0.45)" : "none",
                    transition: "all 0.2s",
                  }}>
                    {sameAddress && <span style={{ color: "#fff", fontSize: "12px", fontWeight: "700", lineHeight: 1 }}>✓</span>}
                  </div>
                  <div>
                    <span style={{ color: "#cbd5e1", fontSize: "13px", fontWeight: "500" }}>Temporary address same as permanent address</span>
                    <p style={{ color: "#475569", fontSize: "11px", margin: "2px 0 0" }}>Fields below will be auto-filled</p>
                  </div>
                </div>

                {/* Temporary address */}
                <div style={{ opacity: sameAddress ? 0.4 : 1, pointerEvents: sameAddress ? "none" : "auto", transition: "opacity 0.3s" }}>
                  <AddressBlock title="Temporary / Local Address" type="temporary" data={sameAddress ? formData.permanentAddress : formData.temporaryAddress} onChange={handleAddressChange} accentColor="#06b6d4" errors={sameAddress ? {} : errors} />
                </div>
              </div>
            )}

            {/* ── STEP 2: Family ── */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }} />
                    <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "600" }}>Guardian Information</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <InputField label="Father's Name" value={formData.fatherName} onChange={(v) => handleChange("fatherName", v)} required error={errors.fatherName} />
                    <InputField label="Mother's Name" value={formData.motherName} onChange={(v) => handleChange("motherName", v)} required error={errors.motherName} />
                    <div style={{ gridColumn: "1 / -1" }}>
                      <InputField
                        label="Guardian Contact Number"
                        value={formData.guardianContact}
                        onChange={(v) => handleChange("guardianContact", v.replace(/\D/g, "").slice(0, 10))}
                        type="tel" placeholder="10-digit mobile" required error={errors.guardianContact}
                      />
                    </div>
                  </div>
                </div>

                {/* Summary card */}
                <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "14px", padding: "18px" }}>
                  <p style={{ color: "#a78bfa", fontSize: "12px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 12px" }}>Profile Summary</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {[
                      ["Name", formData.name],
                      ["Roll No", formData.rollNo],
                      ["Program", formData.program],
                      ["Batch", formData.batch],
                      ["Department", formData.department],
                      [advisorLabel, formData[advisorField]],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <span style={{ color: "#64748b", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</span>
                        <p style={{ color: "#e2e8f0", fontSize: "13px", margin: "2px 0 0", fontWeight: "500" }}>{v || "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "16px 32px 28px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <button
              onClick={() => { setErrors({}); setStep((s) => s - 1); }}
              disabled={step === 0}
              style={{ padding: "10px 22px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: step === 0 ? "#334155" : "#94a3b8", fontSize: "13px", fontWeight: "600", cursor: step === 0 ? "not-allowed" : "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { if (step > 0) e.target.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => e.target.style.background = "transparent"}
            >← Back</button>

            <div style={{ display: "flex", gap: "6px" }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{ width: i === step ? "20px" : "6px", height: "6px", borderRadius: "3px", background: i === step ? "#7c3aed" : i < step ? "#4f46e5" : "rgba(255,255,255,0.15)", transition: "all 0.3s" }} />
              ))}
            </div>

            {step < STEPS.length - 1 ? (
              <button
                onClick={handleContinue}
                style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.4)", transition: "opacity 0.2s" }}
                onMouseEnter={e => e.target.style.opacity = "0.85"}
                onMouseLeave={e => e.target.style.opacity = "1"}
              >Continue →</button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ padding: "10px 28px", borderRadius: "10px", border: "none", background: submitting ? "rgba(124,58,237,0.5)" : "linear-gradient(135deg, #7c3aed, #059669)", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: submitting ? "not-allowed" : "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.4)", display: "flex", alignItems: "center", gap: "8px" }}
              >{submitting ? "Saving…" : "✓ Complete Setup"}</button>
            )}
          </div>
        </div>

        <p style={{ position: "absolute", bottom: "20px", color: "rgba(255,255,255,0.2)", fontSize: "12px", letterSpacing: "0.04em" }}>
          Only <span style={{ color: "#818cf8" }}>@nitc.ac.in</span> accounts are permitted · AMS v1.0
        </p>
      </div>
    </>
  );
}