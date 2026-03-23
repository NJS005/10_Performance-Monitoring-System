import React, { useState, useEffect } from 'react';

const PROGRAMS = ["B.Tech", "B.Arch", "M.Tech", "PhD", "BSc", "MSc", "Integrated"];
const UG_PROGRAMS = ["B.Tech", "B.Arch"];
const FACULTY_PROGRAMS = ["B.Tech", "B.Arch", "M.Tech"];

// ── Shared inline styles ────────────────────────────────────────────────────

const fieldLabel = {
  display: "block",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  color: "#8b9cb8",
  marginBottom: "6px",
};

const fieldValue = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#1e293b",
  background: "#f1f5fc",
  border: "1px solid #e2e8f8",
  borderRadius: "8px",
  padding: "10px 14px",
  minHeight: "40px",
  display: "flex",
  alignItems: "center",
};

const editInputStyle = {
  width: "100%",
  padding: "10px 14px",
  fontSize: "14px",
  borderRadius: "8px",
  border: "1.5px solid #6366f1",
  outline: "none",
  background: "#fff",
  color: "#1e293b",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const editSelectStyle = {
  ...editInputStyle,
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236366f1' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: "32px",
  cursor: "pointer",
};

// ── Sub-components ──────────────────────────────────────────────────────────

const DisplayField = ({ label, value }) => (
  <div>
    <label style={fieldLabel}>{label}</label>
    <div style={fieldValue}>
      {value || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>—</span>}
    </div>
  </div>
);

const EditInput = ({ label, value, onChange, type = "text", placeholder }) => (
  <div>
    <label style={fieldLabel}>{label}</label>
    <input
      type={type}
      value={value || ""}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={editInputStyle}
      onFocus={e => e.target.style.borderColor = "#4f46e5"}
      onBlur={e => e.target.style.borderColor = "#6366f1"}
    />
  </div>
);

const EditSelect = ({ label, value, onChange, options }) => (
  <div>
    <label style={fieldLabel}>{label}</label>
    <select
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      style={editSelectStyle}
    >
      <option value="">— Select —</option>
      {options.map(opt => (
        <option key={opt.value ?? opt} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
  </div>
);

const SectionDivider = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "8px 0" }}>
    <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, #e2e8f8, transparent)" }} />
    <span style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", whiteSpace: "nowrap" }}>
      {label}
    </span>
    <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, #e2e8f8)" }} />
  </div>
);

const AddressBlock = ({ title, data, prefix, isEditing, editData, handleChange, accentColor }) => {
  const addr = isEditing ? (editData[prefix] || {}) : (data || {});
  const formatAddress = a => {
    if (!a) return "—";
    return [a.line1, a.line2, a.city, a.state, a.country, a.zip].filter(Boolean).join(", ") || "—";
  };
  return (
    <div style={{ borderRadius: "10px", border: "1px solid #e2e8f8", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#f8faff", borderBottom: "1px solid #e2e8f8" }}>
        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: accentColor, flexShrink: 0 }} />
        <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>{title}</span>
      </div>
      {isEditing ? (
        <div style={{ padding: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <EditInput label="Line 1" value={editData[prefix]?.line1} onChange={v => handleChange(prefix, { ...editData[prefix], line1: v })} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <EditInput label="Line 2" value={editData[prefix]?.line2} onChange={v => handleChange(prefix, { ...editData[prefix], line2: v })} />
          </div>
          <EditInput label="City"    value={editData[prefix]?.city}    onChange={v => handleChange(prefix, { ...editData[prefix], city: v })} />
          <EditInput label="State"   value={editData[prefix]?.state}   onChange={v => handleChange(prefix, { ...editData[prefix], state: v })} />
          <EditInput label="Country" value={editData[prefix]?.country} onChange={v => handleChange(prefix, { ...editData[prefix], country: v })} />
          <EditInput label="ZIP"     value={editData[prefix]?.zip}     onChange={v => handleChange(prefix, { ...editData[prefix], zip: v })} />
        </div>
      ) : (
        <div style={{ padding: "12px 14px" }}>
          <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>{formatAddress(addr)}</p>
        </div>
      )}
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────────────

export const PersonalDetailsSection = ({
  studentData,
  setStudentData,
  verificationStatus,
  edit = false,
  showAll = false,
  currentSemester,
  rollNo,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData,  setEditData]  = useState(studentData);
  const [expanded,  setExpanded]  = useState(false);
  const [isSaving,  setIsSaving]  = useState(false);

  const [departmentsList, setDepartmentsList] = useState([]);
  const [deptMap, setDeptMap] = useState({});
  const [facultyList, setFacultyList] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/public/departments')
      .then(res => res.json())
      .then(data => {
        const dmap = {};
        const formattedList = data.map(d => {
           dmap[d.code] = d.name;
           return { value: d.code, label: `${d.code} - ${d.name}` };
        });
        setDepartmentsList(formattedList);
        setDeptMap(dmap);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (editData.department) {
       fetch(`http://localhost:8080/api/public/faculty?department=${editData.department}`)
         .then(res => res.json())
         .then(data => {
            const facultyOpts = data.map(f => ({ value: f.name, label: f.name }));
            setFacultyList(facultyOpts);
         })
         .catch(console.error);
    } else {
       setFacultyList([]);
    }
  }, [editData.department]);

  const handleEdit   = () => { setIsEditing(true); setEditData(studentData); setExpanded(true); };
  const handleCancel = () => { setEditData(studentData); setIsEditing(false); };
  const handleSave   = async () => {
    setIsSaving(true);
    try {
      const payload = {
        contactNo:        Number(editData.contactNo)       || 0,
        guardianContact:  Number(editData.guardianContact) || 0,
        fatherName:       editData.fatherName       || '',
        motherName:       editData.motherName        || '',
        permanentAddress: editData.permanentAddress  || {},
        temporaryAddress: editData.temporaryAddress  || {},
      };
      const res = await fetch(`http://localhost:8080/api/student/update/${rollNo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setStudentData({ ...editData });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save personal details:', err);
      alert('Could not save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  const handleChange = (field, value) => setEditData(prev => ({ ...prev, [field]: value }));

  const isFacultyProgram = FACULTY_PROGRAMS.includes(studentData.program);
  const advisorLabel     = isFacultyProgram ? "Faculty Advisor" : "Supervisor";
  const advisorValue     = isFacultyProgram ? studentData.facultyAdvisor : studentData.supervisor;
  const advisorEditField = isFacultyProgram ? "facultyAdvisor" : "supervisor";

  // Status badge config
  const vs = verificationStatus === true ? "verified"
           : verificationStatus === false ? "pending"
           : verificationStatus || "pending";

  const statusStyles = {
    pending:  { background: "rgba(234,179,8,0.12)",  color: "#a16207", border: "1px solid rgba(234,179,8,0.3)",  dot: "#eab308", label: "Pending"  },
    verified: { background: "rgba(34,197,94,0.12)",  color: "#15803d", border: "1px solid rgba(34,197,94,0.3)",  dot: "#22c55e", label: "Verified" },
    approved: { background: "rgba(34,197,94,0.12)",  color: "#15803d", border: "1px solid rgba(34,197,94,0.3)",  dot: "#22c55e", label: "Approved" },
    rejected: { background: "rgba(239,68,68,0.10)",  color: "#b91c1c", border: "1px solid rgba(239,68,68,0.3)",  dot: "#ef4444", label: "Rejected" },
  };
  const ss = statusStyles[vs] || statusStyles.pending;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .pds-root * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        .pds-edit-btn:hover { background: #4338ca !important; }
        .pds-save-btn:hover { background: #15803d !important; }
        .pds-cancel-btn:hover { background: #cbd5e1 !important; }
        .pds-showall-btn:hover { color: #3730a3 !important; }
        .pds-field-value { transition: background 0.2s; }
      `}</style>

      <div className="pds-root" style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 4px 24px rgba(99,102,241,0.08), 0 1px 4px rgba(0,0,0,0.06)",
        overflow: "hidden",
        border: "1px solid #e8eaf6",
      }}>

        {/* ── Header bar ── */}
        <div style={{
          padding: "22px 28px",
          borderBottom: "1px solid #eef0fa",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
        }}>
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: "0 0 4px" }}>
              Personal Details
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              View {edit ? "and manage " : ""}your profile information
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            {/* Status badge */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "5px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600",
              background: ss.background, color: ss.color, border: ss.border,
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: ss.dot, flexShrink: 0 }} />
              {ss.label}
            </span>

            {/* Edit / Save / Cancel */}
            {!isEditing ? (
              edit && (
                <button className="pds-edit-btn" onClick={handleEdit} style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  background: "#4f46e5", color: "#fff",
                  padding: "8px 18px", borderRadius: "8px",
                  fontSize: "13px", fontWeight: "600",
                  border: "none", cursor: "pointer", transition: "background 0.2s",
                }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              )
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="pds-save-btn" onClick={handleSave} disabled={isSaving} style={{
                  background: isSaving ? '#86efac' : '#16a34a', color: '#fff', padding: '8px 18px',
                  borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                  border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
                }}>{isSaving ? 'Saving…' : 'Save'}</button>
                <button className="pds-cancel-btn" onClick={handleCancel} style={{
                  background: "#e2e8f0", color: "#475569", padding: "8px 18px",
                  borderRadius: "8px", fontSize: "13px", fontWeight: "600",
                  border: "none", cursor: "pointer", transition: "background 0.2s",
                }}>Cancel</button>
              </div>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "24px 28px" }}>

          {/* Core 6-field grid — these fields are ALWAYS read-only, even in edit mode */}
          {isEditing && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '8px', padding: '8px 14px', marginBottom: '16px',
            }}>
              <span style={{ fontSize: '14px' }}>🔒</span>
              <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600' }}>
                Name, Roll No, Department, Program , Faculty Advisor , Semester and Batch cannot be changed by the Student.
              </span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>

            {/* Always read-only */}
            <DisplayField label="Student Name"  value={studentData.name} />
            <DisplayField label="Roll Number"   value={studentData.rollNo} />
            <DisplayField label="Department"    value={deptMap[studentData.department] || studentData.department} />
            <DisplayField label="Program"       value={studentData.program} />
            <DisplayField label="Batch / Year"  value={String(studentData.batch)} />

            {/* Current Semester — editable */}
           <DisplayField label="Current Semester" value={String(currentSemester || '')}
                  onChange={v => handleChange('currentSemester', parseInt(v))}
                  options={[1,2,3,4,5,6,7,8].map(s => ({ value: String(s), label: `Semester ${s}` }))} />
          </div>

          {/* ── Expandable "Show All" area ── */}
          <div style={{
            display: "grid",
            gridTemplateRows: expanded ? "1fr" : "0fr",
            transition: "grid-template-rows 0.4s cubic-bezier(.22,1,.36,1)",
          }}>
            <div style={{ overflow: "hidden" }}>
              <div style={{ paddingTop: "22px", display: "flex", flexDirection: "column", gap: "20px" }}>

                <SectionDivider label="Contact & Advisor" />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
                  {isEditing
                    ? <EditInput label="Contact Number" value={String(editData.contactNo)} type="tel"
                        placeholder="10-digit mobile"
                        onChange={v => handleChange('contactNo', v.replace(/\D/g,'').slice(0,10))} />
                    : <DisplayField label="Contact Number" value={String(studentData.contactNo)} />}

                  {/* FA/Supervisor — editable */}
                 <DisplayField label={advisorLabel} value={editData[advisorEditField]}
                        onChange={v => handleChange(advisorEditField, v)}
                        options={facultyList} />
                </div>

                <SectionDivider label="Guardian Information" />

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px" }}>
                  {isEditing
                    ? <EditInput label="Father's Name" value={editData.fatherName} onChange={v => handleChange("fatherName", v)} />
                    : <DisplayField label="Father's Name" value={studentData.fatherName} />}

                  {isEditing
                    ? <EditInput label="Mother's Name" value={editData.motherName} onChange={v => handleChange("motherName", v)} />
                    : <DisplayField label="Mother's Name" value={studentData.motherName} />}

                  {isEditing
                    ? <EditInput label="Guardian Contact" value={String(editData.guardianContact)} type="tel"
                        placeholder="10-digit mobile"
                        onChange={v => handleChange("guardianContact", v.replace(/\D/g,"").slice(0,10))} />
                    : <DisplayField label="Guardian Contact" value={String(studentData.guardianContact)} />}
                </div>

                <SectionDivider label="Addresses" />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <AddressBlock title="Permanent Address"      data={studentData.permanentAddress}
                    prefix="permanentAddress" isEditing={isEditing} editData={editData}
                    handleChange={handleChange} accentColor="#6366f1" />
                  <AddressBlock title="Temporary / Local Address" data={studentData.temporaryAddress}
                    prefix="temporaryAddress" isEditing={isEditing} editData={editData}
                    handleChange={handleChange} accentColor="#06b6d4" />
                </div>
              </div>
            </div>
          </div>

          {/* Show All / Show Less button */}
          {showAll && (
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-start" }}>
              <button
                className="pds-showall-btn"
                onClick={() => setExpanded(v => !v)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "13px", fontWeight: "600", color: "#4f46e5",
                  padding: "0", transition: "color 0.2s",
                }}
              >
                {expanded ? "Show Less" : "Show All Details"}
                <svg
                  width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ── Demo ────────────────────────────────────────────────────────────────────

// const SAMPLE = {
//   rollNo: "B230483CS", name: "PANKAJ R", batch: 2023,
//   contactNo: 9446332079, department: "CS", program: "B.Tech",
//   currentSemester: 6, facultyAdvisor: "Nirmal Kumar Boran", supervisor: "",
//   permanentAddress:  { line1: "Peace Mahal, opposite to kalpaka theatre", line2: "", city: "Kozhikode", state: "Kerala", country: "India", zip: "673007" },
//   temporaryAddress:  { line1: "Peace Mahal, opposite to kalpaka theatre", line2: "", city: "Kozhikode", state: "Kerala", country: "India", zip: "673007" },
//   fatherName: "Ramoji", motherName: "Sumathi", guardianContact: 8714243079,
//   verificationStatus: false, personalVerificationStatus: "rejected",
// };

export default function Demo() {
  const [studentData, setStudentData] = useState(SAMPLE);
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4c1d95 100%)", padding: "40px 24px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Page header — mirrors AMS portal style */}
        <div style={{
          background: "rgba(255,255,255,0.07)", backdropFilter: "blur(8px)",
          borderRadius: "14px", border: "1px solid rgba(255,255,255,0.12)",
          padding: "22px 28px", marginBottom: "20px",
        }}>
          <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: "700", margin: "0 0 4px", fontFamily: "Inter, sans-serif" }}>
            Personal Details
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", margin: 0, fontFamily: "Inter, sans-serif" }}>
            Track. Verify. Grow.
          </p>
        </div>

        <PersonalDetailsSection
          studentData={studentData}
          setStudentData={setStudentData}
          verificationStatus={studentData.personalVerificationStatus}
          edit={true}
          showAll={true}
        />
      </div>
    </div>
  );
}