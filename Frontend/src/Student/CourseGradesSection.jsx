import React, { useState } from 'react';

// ─── PDF helpers ──────────────────────────────────────────────────────────────

async function extractTextFromPDF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target.result);
        if (!window.pdfjsLib) { reject(new Error('pdf.js not loaded')); return; }
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        const pdf = await window.pdfjsLib.getDocument({ data: typedArray }).promise;
        let fullText = '';
        const page = await pdf.getPage(pdf.numPages);
        const content = await page.getTextContent();
        fullText += content.items.map((item) => item.str).join(' ') + '\n';
        resolve(fullText);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsArrayBuffer(file);
  });
}

function parseGradeCard(text) {
  const romanToInt = (r) => {
    const map = { I: 1, V: 5 };
    let result = 0;
    const s = r.toUpperCase();
    for (let i = 0; i < s.length; i++) {
      const curr = map[s[i]] ?? 0;
      const next = map[s[i + 1]] ?? 0;
      result += curr < next ? -curr : curr;
    }
    return result;
  };
  const semRomanMatch  = text.match(/Semester of Study\s*:\s*([IV]+)\b/i);
  const semArabicMatch = text.match(/Semester of Study\s*:\s*(\d+)/i);
  let semester = '';
  if (semRomanMatch)       semester = String(romanToInt(semRomanMatch[1]));
  else if (semArabicMatch) semester = semArabicMatch[1];

  const sgpaMatch = text.match(/SGPA\s*=\s*([\d.]+)/i);
  const cgpaMatch = text.match(/CGPA\s*=\s*([\d.]+)/i);
  const sgpa = sgpaMatch ? sgpaMatch[1] : '';
  const cgpa = cgpaMatch ? cgpaMatch[1] : '';

  const courseRegex = /([A-Z]{2,3}\d{4}[A-Z]?)\s+([\w\s&,()-]+?)\s+(\d)\s+([A-Z]{2,3})\s+([SABCDERFW])\b/g;
  const subjects = [];
  let match;
  while ((match = courseRegex.exec(text)) !== null) {
    if (match[2].toLowerCase().includes('grade point')) continue;
    subjects.push({ code: match[1].trim(), subject: match[2].trim(), credits: match[3], category: match[4].trim(), grade: match[5] });
  }
  return { semester, sgpa, cgpa, subjects };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ELECTIVE_CATEGORIES = ['EI', 'OE', 'HM', 'DA', 'AC', 'PE'];
const GRADE_OPTIONS = ['S', 'A', 'B', 'C', 'D', 'E'];

const GRADE_COLORS = {
  S: 'border-green-400 text-green-700 bg-green-50',
  A: 'border-blue-400 text-blue-700 bg-blue-50',
  B: 'border-cyan-400 text-cyan-700 bg-cyan-50',
  C: 'border-yellow-400 text-yellow-700 bg-yellow-50',
  D: 'border-orange-400 text-orange-700 bg-orange-50',
  E: 'border-red-400 text-red-700 bg-red-50',
};

const GRADE_BADGE_COLORS = {
  S: 'bg-green-100 text-green-800 border-green-300',
  A: 'bg-blue-100 text-blue-800 border-blue-300',
  B: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  C: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  D: 'bg-orange-100 text-orange-800 border-orange-300',
  E: 'bg-red-100 text-red-800 border-red-300',
};

// Shared sanitizer — strips HTML tags to prevent XSS via stored text
const sanitizeText = (str) => str.replace(/<[^>]*>/g, '').replace(/[<>"'`]/g, '');

// ─── Small reusable edit inputs ───────────────────────────────────────────────

const ECell = ({ value, onChange, type = 'text', placeholder = '' }) => (
  <input
    type={type}
    value={value ?? ''}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-2 py-1.5 text-sm border-2 border-indigo-200 rounded-lg
      focus:border-indigo-500 focus:outline-none bg-white transition-colors"
  />
);

const EGrade = ({ value, onChange }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className={`w-16 px-1 py-1.5 rounded-lg border-2 font-bold text-sm text-center
      cursor-pointer transition-all focus:outline-none ${GRADE_BADGE_COLORS[value] || 'border-gray-300 text-gray-700'}`}
  >
    {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
  </select>
);

// ─── Add New Course Row ───────────────────────────────────────────────────────

const AddCourseRow = ({ onAdd, nextId }) => {
  const blank = { code: '', name: '', credits: '3', grade: 'S', semester: '1', category: 'PC' };
  const [form, setForm] = useState(blank);
  const [forceElective, setForceElective] = useState(false);
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));
  // Derived: whether the current category is elective
  const isElective = forceElective;
  const canAdd = form.code.trim() && form.name.trim();

  const toggleType = () => {
    const next = !forceElective;
    setForceElective(next);
    // Auto-set a sensible default category code when toggling
    setForm(p => ({ ...p, category: next ? 'EI' : 'PC' }));
  };

  const handleAdd = () => {
    if (!canAdd) return;
    onAdd({
      id: nextId,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      credits: parseInt(form.credits) || 3,
      grade: form.grade,
      semester: parseInt(form.semester) || 1,
      category: form.category.trim().toUpperCase(),
      _isElective: isElective,
    });
    setForm(blank);
    setForceElective(false);
  };

  return (
    <div className="mt-5 p-4 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/40">
      <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Add New Course
      </p>

      <div className="grid grid-cols-12 gap-2 items-end">
        <div className="col-span-2">
          <p className="text-xs text-gray-400 font-semibold mb-1">Code</p>
          <ECell value={form.code} onChange={v => set('code', v)} placeholder="CS3001" />
        </div>
        <div className="col-span-3">
          <p className="text-xs text-gray-400 font-semibold mb-1">Course Name</p>
          <ECell value={form.name} onChange={v => set('name', v)} placeholder="Course Title" />
        </div>
        <div className="col-span-1">
          <p className="text-xs text-gray-400 font-semibold mb-1">Cr.</p>
          <ECell value={form.credits} onChange={v => set('credits', v)} type="number" placeholder="3" />
        </div>
        <div className="col-span-1">
          <p className="text-xs text-gray-400 font-semibold mb-1">Cat.</p>
          <ECell value={form.category} onChange={v => set('category', v)} placeholder="PC" />
        </div>
        <div className="col-span-1">
          <p className="text-xs text-gray-400 font-semibold mb-1">Sem</p>
          <ECell value={form.semester} onChange={v => set('semester', v)} type="number" placeholder="1" />
        </div>
        <div className="col-span-1">
          <p className="text-xs text-gray-400 font-semibold mb-1">Grade</p>
          <EGrade value={form.grade} onChange={v => set('grade', v)} />
        </div>
        <div className="col-span-3 flex flex-col gap-1.5 pb-0.5">
          {/* Core / Elective toggle */}
          <button
            type="button"
            onClick={toggleType}
            className={`w-full py-1 rounded-lg text-xs font-bold border-2 transition-colors ${
              isElective
                ? 'bg-purple-100 border-purple-400 text-purple-700 hover:bg-purple-200'
                : 'bg-indigo-100 border-indigo-400 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            {isElective ? '🔀 Elective (click to switch)' : '📘 Core (click to switch)'}
          </button>
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40
              disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── AutoFill Modal ───────────────────────────────────────────────────────────
// cosnt[]

function AutoFillModal({ onClose, onApply, existingCourses }) {
  const [step, setStep]                 = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError]               = useState(null);
  const [mappings, setMappings]         = useState([]);
  const [parsed, setParsed] = useState(null);
  
  const allExisting = [...existingCourses.core, ...existingCourses.elective];

  React.useEffect(() => {
    if (!window.pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      };
      document.head.appendChild(script);
    }
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { alert('Please upload a PDF file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('PDF is too large. Maximum allowed size is 5 MB.'); return; }
    setIsProcessing(true); setError(null);
    try {
      if (!window.pdfjsLib) await new Promise(res => setTimeout(res, 1500));
      const text = await extractTextFromPDF(file);
      const data = parseGradeCard(text);
      const autoMappings = data.subjects.map((s, idx) => {
        const match = allExisting.find(c =>
          c.name && (c.code.toLowerCase() === s.code.toLowerCase() ||
          c.name.toLowerCase().includes(s.subject.toLowerCase()))
        );
        return { parsedIndex: idx, courseId: match ? String(match.id) : '', grade: s.grade };
      });
      setParsed(data); setMappings(autoMappings); setStep(2);
    } catch (err) {
      console.error(err);
      setError('Could not process PDF. Make sure it is a text-based PDF (not scanned).');
    } finally { setIsProcessing(false); }
  };

  const updateMapping = (parsedIndex, field, value) =>
    setMappings(prev => prev.map(m => m.parsedIndex === parsedIndex ? { ...m, [field]: value } : m));

  const handleApply = () => { onApply({ mappings }, { ...parsed }); onClose(); };
  const matchedCount = mappings.filter(m => m.courseId).length;
  const newCount = mappings.length - matchedCount;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 1 ? '📄 Upload Grade Card PDF' : '✅ Review & Apply Grades'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {step === 1
                ? 'Upload your NIT Calicut grade card to auto-fill course grades'
                : `${matchedCount} matched · ${newCount} will be added as new`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <input type="file" accept="application/pdf" onChange={handleFileUpload}
              className="hidden" id="autofill-pdf-upload" disabled={isProcessing} />
            <label htmlFor="autofill-pdf-upload"
              className="flex flex-col items-center justify-center gap-4 w-full p-12 border-2 border-dashed
                border-indigo-300 rounded-2xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-500 transition-all duration-200">
              {isProcessing ? (
                <>
                  <svg className="w-12 h-12 text-indigo-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <p className="text-indigo-600 font-semibold text-lg">Processing PDF…</p>
                  <p className="text-gray-400 text-sm">Extracting grades from your grade card</p>
                </>
              ) : (
                <>
                  <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="text-center">
                    <p className="font-semibold text-gray-700 text-lg">Click to upload PDF grade card</p>
                    <p className="text-sm text-gray-400 mt-1">NIT Calicut grade cards supported</p>
                  </div>
                </>
              )}
            </label>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            <button onClick={onClose} className="w-full py-3 border rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        )}

        {step === 2 && parsed && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {[['Semester', parsed.semester ? `Sem ${parsed.semester}` : '—'], ['SGPA', parsed.sgpa || '—'], ['CGPA', parsed.cgpa || '—']].map(([label, val]) => (
                <div key={label} className="bg-indigo-50 rounded-xl p-3 text-center border border-indigo-100">
                  <p className="text-xs text-indigo-500 font-semibold uppercase mb-1">{label}</p>
                  <p className="text-xl font-bold text-indigo-700">{val}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-200 border border-green-400 inline-block" />Matched</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-200 border border-blue-400 inline-block" />Will be added as new</span>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {mappings.map((m) => {
                const s = parsed.subjects[m.parsedIndex];
                const isNew = !m.courseId;
                const willBeElective = ELECTIVE_CATEGORIES.includes(s.category || '');
                return (
                  <div key={m.parsedIndex} className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${isNew ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-semibold text-gray-800 truncate">{s.subject}</p>
                        {s.category && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${willBeElective ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>{s.category}</span>
                        )}
                        {isNew && <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold flex-shrink-0">+ New</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{s.code} · {s.credits} cr · Sem {parsed.semester}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <select value={m.courseId} onChange={e => updateMapping(m.parsedIndex, 'courseId', e.target.value)}
                      className="text-sm border rounded-lg px-2 py-1.5 bg-white w-44 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                      <option value="">➕ Add as new course</option>
                      {allExisting.map(c => <option key={c.id} value={String(c.id)}>{c.code} – {c.name}</option>)}
                    </select>
                    <select value={m.grade} onChange={e => updateMapping(m.parsedIndex, 'grade', e.target.value)}
                      className={`text-sm font-bold border-2 rounded-lg px-2 py-1.5 flex-shrink-0 w-16 text-center focus:outline-none ${GRADE_COLORS[m.grade] || 'border-gray-300 text-gray-700'}`}>
                      {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                );
              })}
              {mappings.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="font-medium">No subjects detected in PDF</p>
                  <p className="text-sm mt-1">Try editing grades manually instead</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 py-3 border rounded-xl font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleApply} disabled={mappings.length === 0}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors">
                Apply ({matchedCount} updated · {newCount} new)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main CourseGradesSection ─────────────────────────────────────────────────

export const CourseGradesSection = ({ courses, setCourses, getGradePoint, showSemester = 'all', rollNo, readOnly = false }) => {
  const [isEditing,         setIsEditing]         = useState(false);
  const [isDirty,           setIsDirty]           = useState(false);
  const [editCourses,       setEditCourses]       = useState(courses);
  const [uploadedPDF,       setUploadedPDF]       = useState(null);
  const [pdfFileName,       setPdfFileName]       = useState('');
  const [activeSemester,    setActiveSemester]    = useState(null);
  const [showAutoFillModal, setShowAutoFillModal] = useState(false);
  const [AutoFillData,       setAutoFillData]       = useState(null); 
  const [autoFillFlash,     setAutoFillFlash]     = useState([]);
  const [isSubmitting,      setIsSubmitting]      = useState(false);
  const [submitStatus,      setSubmitStatus]      = useState(null); // 'success' | 'error' | null
  const [fetchedPDFPath,    setFetchedPDFPath]    = useState(null);

  // When activeSemester changes, clear any locally-staged PDF so the user
  // can upload a fresh one for the new semester (server-side doc is re-fetched below)
  React.useEffect(() => {
    setUploadedPDF(null);
    setPdfFileName('');
  }, [activeSemester]);

  // When activeSemester or rollNo changes, fetch verification
  React.useEffect(() => {
    if (!rollNo || !activeSemester) return;
    const fetchVerification = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/student/courses/verification/${rollNo}?semester=${activeSemester}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.document) {
            setFetchedPDFPath(data.document);
            setPdfFileName('Existing Document.pdf');
            return;
          }
        }
        setFetchedPDFPath(null);
        setPdfFileName('');
      } catch (err) {
        console.error('Failed to fetch verification doc', err);
      }
    };
    fetchVerification();
  }, [rollNo, activeSemester]);


  // ── Semester helpers ───────────────────────────────────────────────────────
const getAllSemesters = () => {
  const all = [...(courses?.core || []), ...(courses?.elective || [])];
  return [...new Set(all.map(c => c.semester))].sort((a, b) => a - b);
};
  const allSemesters = getAllSemesters();
  // console.log('All semesters with courses:', allSemesters);
  // console.log()

  React.useEffect(() => {
    if (showSemester === 'all' && allSemesters.length > 0 && !activeSemester) {
      setActiveSemester(allSemesters[allSemesters.length - 1]);
    } else if (typeof showSemester === 'number') {
      setActiveSemester(showSemester);
    }
  }, [showSemester, JSON.stringify(allSemesters)]);

 const filterCoursesBySemester = (coursesData, semester) => {
  const safeCore     = coursesData?.core     || [];
  const safeElective = coursesData?.elective || [];

  const match = (c) => Number(c.semester) === Number(semester);

  if (showSemester === 'all' && semester) {
    return { core: safeCore.filter(match), elective: safeElective.filter(match) };
  } else if (typeof showSemester === 'number') {
    const matchFixed = (c) => Number(c.semester) === showSemester;
    return { core: safeCore.filter(matchFixed), elective: safeElective.filter(matchFixed) };
  }
  return { core: safeCore, elective: safeElective };
};
  // ── Edit handlers ──────────────────────────────────────────────────────────

  const handleEdit   = () => { setIsEditing(true); setIsDirty(false); setEditCourses(JSON.parse(JSON.stringify(courses))); };
  const handleSave = async () => {
    if (!isDirty) return;

    // Find courses that were in `courses` but are missing from `editCourses`
    const oldAll = [...(courses.core || []), ...(courses.elective || [])];
    const newAll = [...(editCourses.core || []), ...(editCourses.elective || [])];
    const newKeys = new Set(newAll.map(c => `${c.code}|${c.semester}`));

    const removed = oldAll.filter(c => !newKeys.has(`${c.code}|${c.semester}`));

    // Fire delete requests for each removed course
    for (const c of removed) {
      try {
        await fetch(
          `http://localhost:8080/api/student/courses/${rollNo}?courseCode=${encodeURIComponent(c.code)}&semester=${c.semester}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
      } catch (err) {
        console.error('Failed to delete course from DB:', err);
      }
    }

    setCourses(editCourses);
    setIsEditing(false);
    setIsDirty(false);
  };
  const handleCancel = () => { setEditCourses(JSON.parse(JSON.stringify(courses))); setIsEditing(false); setIsDirty(false); };

  // Change any field on an existing course
  const handleFieldChange = (categoryKey, courseId, field, value) => {
    setIsDirty(true);
    setEditCourses(prev => ({
      ...prev,
      [categoryKey]: prev[categoryKey].map(c =>
        c.id === courseId
          ? { ...c, [field]: (field === 'credits' || field === 'semester') ? (parseInt(value) || 0) : value }
          : c
      ),
    }));
  };

  // Delete a course while editing
  const handleDeleteCourse = (categoryKey, courseId) => {
    setIsDirty(true);
    setEditCourses(prev => ({
      ...prev,
      [categoryKey]: prev[categoryKey].filter(c => c.id !== courseId),
    }));
  };

  // Add brand-new course from AddCourseRow
  const handleAddCourse = ({ _isElective, ...course }) => {
    setIsDirty(true);
    setEditCourses(prev => ({
      ...prev,
      core:     _isElective ? prev.core                : [...prev.core,     course],
      elective: _isElective ? [...prev.elective, course] : prev.elective,
    }));
  };

  const nextId = () => {
    const all = [...(editCourses?.core || []), ...(editCourses?.elective || [])];
    return all.reduce((max, c) => Math.max(max, c.id || 0), 0) + 1;
  };

  // ── Auto-fill apply ────────────────────────────────────────────────────────

  const handleAutoFillApply = ({ mappings }, parsedData) => {
    setAutoFillData(parsedData);
    const pdfSemester = parsedData.semester ? parseInt(parsedData.semester) : null;
    setCourses((prevCourses) => {
      let newCore     = [...(prevCourses?.core     || [])];
      let newElective = [...(prevCourses?.elective || [])];
      const allExisting = [...newCore, ...newElective];
      let maxId = allExisting.reduce((max, c) => Math.max(max, c.id), 0);
      mappings.forEach((m) => {
        const parsedSubject = parsedData.subjects[m.parsedIndex];
        const grade = m.grade || parsedSubject.grade;
        if (m.courseId) {
          const id = parseInt(m.courseId);
          newCore     = newCore.map(c     => c.id === id ? { ...c, grade } : c);
          newElective = newElective.map(c => c.id === id ? { ...c, grade } : c);
        } else {
          maxId += 1;
          const isElective = ELECTIVE_CATEGORIES.includes(parsedSubject.category || '');
          const newCourse = { id: maxId, code: parsedSubject.code, name: parsedSubject.subject, credits: parseInt(parsedSubject.credits) || 3, grade, semester: pdfSemester || activeSemester || 1, category: parsedSubject.category || '' };
          if (isElective) newElective = [...newElective, newCourse];
          else            newCore     = [...newCore,     newCourse];
        }
      });
      return { core: newCore, elective: newElective };
    });
    setAutoFillFlash(parsedData.subjects.map(s => s.code));
    setTimeout(() => setAutoFillFlash([]), 2500);
    if (parsedData.semester && showSemester === 'all') setActiveSemester(parseInt(parsedData.semester));
  };

  // ── PDF upload for submission ──────────────────────────────────────────────

  const handlePDFUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { alert('Please upload a valid PDF file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('PDF is too large. Maximum allowed size is 5 MB.'); return; }
    setUploadedPDF(file); setPdfFileName(file.name);
  };
  const removePDF = () => { setUploadedPDF(null); setPdfFileName(''); };

  // ── Submit for Verification ───────────────────────────────────────────────
 
    
  const handleSubmit = async () => {
    if (!uploadedPDF && !fetchedPDFPath) {
      alert('Please attach a PDF grade card before submitting for verification.');
      return;
    }

    let cleanCoursesPayload;
    if (AutoFillData) {
      // Use the parsed PDF data if AutoFill was used
      cleanCoursesPayload = AutoFillData.subjects.map((item) => ({
        rollNo,
        semester: parseInt(AutoFillData.semester, 10),
        courseCode: item.code,
        courseName: item.subject,
        credit: parseInt(item.credits, 10),
        grade: item.grade,
        courseType: item.category
      }));
    } else {
      // Fallback: build from the currently displayed (filtered) courses
      const allDisplayed = [...(filtered.core || []), ...(filtered.elective || [])];
      if (allDisplayed.length === 0) {
        alert('No course data to submit. Please add courses or use Auto-fill first.');
        return;
      }
      cleanCoursesPayload = allDisplayed.map(c => ({
        rollNo,
        semester: activeSemester || c.semester,
        courseCode: c.code,
        courseName: c.name,
        credit: parseInt(c.credits, 10) || 0,
        grade: c.grade,
        courseType: c.category
      }));
    }
    console.log('Submitting courses:', cleanCoursesPayload);
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      // 1 — Course data as JSON
      const courseRes = await fetch(`http://localhost:8080/api/student/courses/${rollNo}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(cleanCoursesPayload),
      });
      if (!courseRes.ok) throw new Error(`Course submission failed: ${courseRes.status}`);

      // 2 — PDF if attached
      if (uploadedPDF) {
        const fd = new FormData();
        fd.append('pdf', uploadedPDF);
        fd.append('rollNo', rollNo || '');
        fd.append('semester', String(activeSemester || ''));
        const pdfRes = await fetch('http://localhost:8080/api/student/courses/upload-pdf', { 
          method: 'POST', 
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: fd 
        });
        if (!pdfRes.ok) throw new Error(`PDF upload failed: ${pdfRes.status}`);
      }

      setSubmitStatus('success');
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 4000);
      setAutoFillData(null);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────

  const calcStats = (list) => {
    let credits = 0, points = 0;
    list.forEach(c => { credits += c.credits; points += getGradePoint(c.grade) * c.credits; });
    return { totalCredits: credits, gpa: credits > 0 ? (points / credits).toFixed(2) : '0.00' };
  };

  const displayCourses = isEditing ? editCourses : courses;
  const filtered       = filterCoursesBySemester(displayCourses, activeSemester);
  const coreStats      = calcStats(filtered.core);
  const electiveStats  = calcStats(filtered.elective);

  // ── Render one category ────────────────────────────────────────────────────

  const renderCourseList = (categoryName, categoryKey, stats) => {
    const list = filtered[categoryKey];
    if (!isEditing && list.length === 0) return null;

    return (
      <div className="mb-6 last:mb-0">
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-200">
          <h4 className="text-xl font-bold text-gray-900">{categoryName}</h4>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600"><span className="font-semibold">{stats.totalCredits}</span> Credits</span>
            <span className="text-indigo-700 font-bold">GPA: {stats.gpa}</span>
          </div>
        </div>

        <div className="space-y-2">
          {list.map((course) => {
            const flashed = autoFillFlash.includes(course.code);

            if (isEditing) {
              return (
                <div key={course.id} className="rounded-lg border border-indigo-200 bg-white p-3 shadow-sm">
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400 font-semibold mb-1">Code</p>
                      <ECell value={course.code} onChange={v => handleFieldChange(categoryKey, course.id, 'code', v)} placeholder="CS3001" />
                    </div>
                    <div className="col-span-4">
                      <p className="text-xs text-gray-400 font-semibold mb-1">Course Name</p>
                      <ECell value={course.name} onChange={v => handleFieldChange(categoryKey, course.id, 'name', v)} placeholder="Course Title" />
                    </div>
                    <div className="col-span-1">
                      <p className="text-xs text-gray-400 font-semibold mb-1">Cr.</p>
                      <ECell value={String(course.credits)} onChange={v => handleFieldChange(categoryKey, course.id, 'credits', v)} type="number" />
                    </div>
                    <div className="col-span-1">
                      <p className="text-xs text-gray-400 font-semibold mb-1">Cat.</p>
                      <ECell value={course.category} onChange={v => handleFieldChange(categoryKey, course.id, 'category', v)} placeholder="PC" />
                    </div>
                    <div className="col-span-1">
                      <p className="text-xs text-gray-400 font-semibold mb-1">Sem</p>
                      <ECell value={String(course.semester)} onChange={v => handleFieldChange(categoryKey, course.id, 'semester', v)} type="number" />
                    </div>
                    <div className="col-span-1">
                      <p className="text-xs text-gray-400 font-semibold mb-1">Grade</p>
                      <EGrade value={course.grade} onChange={v => handleFieldChange(categoryKey, course.id, 'grade', v)} />
                    </div>
                    <div className="col-span-2 flex justify-end pb-0.5">
                      <button
                        onClick={() => handleDeleteCourse(categoryKey, course.id)}
                        title="Remove course"
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // Read-only display row
            return (
              <div key={course.id} className={`rounded-lg p-4 border transition-all duration-500
                ${flashed ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300 scale-[1.01]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-2">
                    <span className="font-mono text-sm font-bold text-indigo-700">{course.code}</span>
                  </div>
                  <div className="col-span-5 flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">{course.name}</span>
                    {flashed && <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-semibold animate-pulse">Auto-filled</span>}
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm font-semibold">
                      {course.credits} Credits
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`inline-flex items-center justify-center w-12 h-12 rounded-lg border-2 font-bold text-lg ${GRADE_BADGE_COLORS[course.grade] || 'border-gray-200 text-gray-700'}`}>
                      {course.grade}
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    <span className="text-xs text-gray-500">Sem {course.semester}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {isEditing && list.length === 0 && (
            <div className="text-center py-5 text-gray-400 border border-dashed border-gray-200 rounded-lg text-sm">
              No {categoryName.toLowerCase()} yet — add one below
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── JSX ────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl h-full flex flex-col">

      {/* Header - hide Edit/AutoFill if readOnly */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">Course Grades</h3>
          <p className="text-gray-500">Academic performance overview</p>
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && !isEditing && (
            <button onClick={() => setShowAutoFillModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Auto-fill PDF
            </button>
          )}
          {!readOnly && !isEditing && (
            <button onClick={handleEdit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
          {!readOnly && isEditing && (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!isDirty}
                className={`px-5 py-2 rounded-lg font-medium transition-colors ${
                  isDirty
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Save
              </button>
              <button onClick={handleCancel} className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg font-medium transition-colors">Cancel</button>
            </div>
          )}
        </div>
      </div>

      {/* Semester Tabs */}
      {showSemester === 'all' && allSemesters.length > 1 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg overflow-x-auto">
            {allSemesters.map(sem => (
              <button  onClick={() => setActiveSemester(sem)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200
                  ${activeSemester === sem ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}>
                Semester {sem}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Course list */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {!isEditing && filtered.core.length === 0 && filtered.elective.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-medium">No courses for this semester</p>
              <p className="text-sm">Use Auto-fill PDF or Edit to add grades manually</p>
            </div>
          </div>
        ) : (
          <>
            {renderCourseList('Core Courses',     'core',     coreStats)}
            {renderCourseList('Elective Courses', 'elective', electiveStats)}
            {/* Add new course row — only in edit mode, when list has content */}
            {isEditing && (filtered.core.length > 0 || filtered.elective.length > 0) && (
              <AddCourseRow onAdd={handleAddCourse} nextId={nextId()} />
            )}
          </>
        )}
        {/* Add new course row in edit mode when list is empty */}
        {isEditing && filtered.core.length === 0 && filtered.elective.length === 0 && (
          <AddCourseRow onAdd={handleAddCourse} nextId={nextId()} />
        )}
      </div>

        {/* Footer — only shown when NOT read-only */}
        {!readOnly && (
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">

          {/* PDF attach box */}
          <div className="bg-indigo-50 p-4 rounded-lg border-2 border-indigo-200">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Attach {showSemester === 'all' && activeSemester ? `Semester ${activeSemester}` : 'Current Semester'} Grade Card (PDF)
              <span className="text-red-500 text-xs font-bold">(Required)</span>
            </p>
          {!uploadedPDF && !fetchedPDFPath ? (
            <>
              <input type="file" accept="application/pdf" onChange={handlePDFUpload} className="hidden" id="pdf-upload" />
              <label htmlFor="pdf-upload"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border-2 border-dashed border-indigo-300
                  rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-indigo-700 font-medium">Click to attach PDF</span>
              </label>
            </>
          ) : (
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-300">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{pdfFileName}</p>
                  <p className="text-xs text-gray-500">
                     {fetchedPDFPath ? 'Currently saved verification document' : 'Will be sent with verification request'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {fetchedPDFPath && (
                  <button onClick={() => window.open(`http://localhost:8080/${fetchedPDFPath}`)} 
                    className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-colors font-semibold text-sm">
                    View Doc
                  </button>
                )}
                <button onClick={() => { removePDF(); setFetchedPDFPath(null); }} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">Required — your advisor will use this to verify your grades</p>
        </div>

          {/* Status banners */}
          {submitStatus === 'success' && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-semibold">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Submitted! Your advisor will review the grades shortly.
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Submission failed. Please try again or contact support.
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!uploadedPDF && !fetchedPDFPath)}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700
              disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-all
              duration-200 transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Submitting…
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {(!uploadedPDF && !fetchedPDFPath) ? 'Attach PDF to Submit' : `Submit for Verification${uploadedPDF ? ' (with PDF)' : ''}`}
              </>
            )}
          </button>
        </div>
        )}

      {/* Auto-fill modal */}
      {showAutoFillModal && (
        <AutoFillModal
          onClose={() => setShowAutoFillModal(false)}
          onApply={handleAutoFillApply }
          existingCourses={courses}
        />
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a5b4fc; }
      `}</style>
    </div>
  );
};