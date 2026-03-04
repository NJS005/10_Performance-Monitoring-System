import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Upload, Book, Target, Calendar, MessageCircle, Bell, User, 
  ChevronRight, ChevronLeft, TrendingUp, AlertCircle, CheckCircle, Clock, 
  Edit3, X, Plus, Award, Send, FileText, Loader
} from 'lucide-react';
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;


const INITIAL_USER = {
  name: '',
  studentId: '',
  department: '',
  semester: '',
  email: 'neeraj_b230456cs@nitc.ac.in', 
  profileComplete: false
};

const INITIAL_ACTIVITIES = [
  { id: 1, title: 'HackFort 2025', category: 'Competition', semester: 5, description: 'Won 2nd place in national hackathon', status: 'approved', proof: 'cert.pdf', remarks: '' },
  { id: 2, title: 'AI Workshop', category: 'Workshop', semester: 5, description: '3-day workshop on Transformers', status: 'pending', proof: 'ticket.jpg', remarks: '' },
  { id: 3, title: 'Debate Club', category: 'Club', semester: 4, description: 'Member of core committee', status: 'rejected', proof: 'letter.pdf', remarks: 'Proof document is blurry' }
];

const INITIAL_SUBJECTS = [
  { code: 'CS601', name: 'Database Systems' },
  { code: 'CS602', name: 'AI/ML' },
  { code: 'CS603', name: 'Software Eng' }
];

// --- PDF PARSING UTILITIES ---
const extractTextFromPDF = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();


    let lastY = null;
    let pageText = '';

    content.items.forEach(item => {
      if (lastY === null || Math.abs(item.transform[5] - lastY) > 2) {
        pageText += '\n';
        lastY = item.transform[5];
      }
      pageText += item.str + ' ';
    });

    fullText += pageText + '\n';
  }

  return fullText;
};

const parseGradeCard = (text) => {
  const result = {
    semester: null,
    sgpa: null,
    cgpa: null,
    subjects: []
  };

  const semMap = { I:1, II:2, III:3, IV:4, V:5, VI:6, VII:7, VIII:8 };
  const semMatch = text.match(
    /Semester of Study\s*[:\-]?\s*(I{1,3}|IV|V?I{0,3})/i
  );
  if (semMatch) result.semester = semMap[semMatch[1]];

  const sgpaMatch = text.match(/SGPA\s*[:=]\s*([\d.]+)/i);
  const cgpaMatch = text.match(/CGPA\s*[:=]\s*([\d.]+)/i);
  if (sgpaMatch) result.sgpa = parseFloat(sgpaMatch[1]);
  if (cgpaMatch) result.cgpa = parseFloat(cgpaMatch[1]);

  const lines = text.split('\n');

  const rowRegex =
    /^[A-Z]{2}\d{4}E\s+(.+?)\s+(\d+)\s+(PC|IC|EI|OE|PE|DA)\s+([SABCDEFR])$/;

  lines.forEach(line => {
    const clean = line.replace(/\s+/g, ' ').trim();
    const m = clean.match(rowRegex);
    if (m) {
      result.subjects.push({
        subject: m[1],        
        credits: Number(m[2]),
        grade: m[4]
      });
    }
  });

  return result;
};



// --- MAIN COMPONENT ---
export default function StudentPortal() {
  const [user, setUser] = useState(INITIAL_USER);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const profileComplete = localStorage.getItem('profileComplete');
    if (profileComplete === 'true') {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser) setUser(savedUser);
    } else {
      setShowProfileModal(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {showProfileModal && (
        <ProfileCompletionModal 
          user={user} 
          setUser={setUser} 
          setShowProfileModal={setShowProfileModal} 
        />
      )}
      
      <Header 
        user={user} 
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onEditProfile={() => setShowProfileModal(true)} 
      />
      
      <div className="flex h-[calc(100vh-72px)]">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
          {activeTab === 'overview' && <Overview user={user} />}
          {activeTab === 'grades' && <GradeManagement />}
          {activeTab === 'attendance' && <AdvancedAttendanceTracker />}
          {activeTab === 'cocurricular' && <CoCurricularEvents />}
          {activeTab === 'calculator' && <TargetCalculator />}
          {activeTab === 'chatbot' && <AcademicChatbot />}
        </main>
      </div>
    </div>
  );
}

// --- 1. PROFILE MODAL ---
function ProfileCompletionModal({ user, setUser, setShowProfileModal }) {
  const [formData, setFormData] = useState({ 
    name: '', 
    studentId: '', 
    department: '', 
    semester: '',
    parentName: '',
    contactNo: '',
    address: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user.profileComplete) {
      setFormData({
        name: user.name || '',
        studentId: user.studentId || '',
        department: user.department || '',
        semester: user.semester || '',
        parentName: user.parentName || '',
        contactNo: user.contactNo || '',
        address: user.address || ''
      });
    } else if (user?.email) {
      const emailPart = user.email.split('@')[0];
      const parts = emailPart.split('_');
      
      if (parts.length >= 2) {
        setFormData(prev => ({
          ...prev,
          name: parts[0].charAt(0).toUpperCase() + parts[0].slice(1),
          studentId: parts[1].toUpperCase()
        }));
      }
    }
  }, [user]);

  const validate = () => {
    let errs = {};
    if (!formData.name) errs.name = "Name is required";
    
    const idPattern = /^[BPM]\d{6}CS$/i; 
    if (!formData.studentId || !idPattern.test(formData.studentId)) {
      errs.studentId = "Format: [B/P/M] + 6 digits + CS";
    }

    if (!formData.parentName) errs.parentName = "Parent Name is required";
    
    if (!formData.contactNo) {
        errs.contactNo = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contactNo)) {
        errs.contactNo = "Invalid Number (10 digits)";
    }

    if (!formData.address) errs.address = "Address is required";
    if (!formData.department) errs.department = "Required";
    if (!formData.semester) errs.semester = "Required";
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const updatedUser = { ...user, ...formData, profileComplete: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('profileComplete', 'true');
      setShowProfileModal(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {user.profileComplete && (
          <button 
            onClick={() => setShowProfileModal(false)}
            className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X size={20} className="text-gray-600"/>
          </button>
        )}

        <h2 className="text-3xl font-bold mb-2 text-gray-900">
          {user.profileComplete ? 'Edit Profile' : 'Complete Profile'}
        </h2>
        <p className="text-gray-500 mb-6">
          Please ensure all personal and academic details are accurate.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="text-sm font-semibold text-gray-700">Full Name</label>
               <input 
                  type="text" 
                  value={formData.name}
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
               />
               {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name}</span>}
             </div>

             <div>
               <label className="text-sm font-semibold text-gray-700">Student ID (Roll No)</label>
               <input 
                  type="text" 
                  value={formData.studentId}
                  placeholder="e.g. B220123CS" 
                  className={`w-full border p-3 rounded-xl uppercase font-mono ${errors.studentId ? 'border-red-500' : ''}`}
                  onChange={e => setFormData({...formData, studentId: e.target.value.toUpperCase()})} 
               />
               {errors.studentId && <span className="text-red-500 text-xs mt-1">{errors.studentId}</span>}
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="text-sm font-semibold text-gray-700">Parent/Guardian Name</label>
               <input 
                  type="text" 
                  value={formData.parentName}
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" 
                  onChange={e => setFormData({...formData, parentName: e.target.value})} 
               />
               {errors.parentName && <span className="text-red-500 text-xs mt-1">{errors.parentName}</span>}
             </div>

             <div>
               <label className="text-sm font-semibold text-gray-700">Contact Number</label>
               <input 
                  type="tel" 
                  maxLength={10}
                  placeholder="9876543210"
                  value={formData.contactNo}
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" 
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData({...formData, contactNo: val});
                  }} 
               />
               {errors.contactNo && <span className="text-red-500 text-xs mt-1">{errors.contactNo}</span>}
             </div>
           </div>

           <div>
             <label className="text-sm font-semibold text-gray-700">Permanent Address</label>
             <textarea 
                rows="2"
                value={formData.address}
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none" 
                onChange={e => setFormData({...formData, address: e.target.value})} 
             />
             {errors.address && <span className="text-red-500 text-xs mt-1">{errors.address}</span>}
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-sm font-semibold text-gray-700">Department</label>
               <select 
                className="w-full border p-3 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 outline-none" 
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
               >
                 <option value="">Select</option>
                 <option>CSE</option><option>ECE</option><option>ME</option><option>EE</option><option>CE</option>
               </select>
               {errors.department && <span className="text-red-500 text-xs">{errors.department}</span>}
             </div>
             <div>
               <label className="text-sm font-semibold text-gray-700">Semester</label>
               <select 
                className="w-full border p-3 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 outline-none" 
                value={formData.semester}
                onChange={e => setFormData({...formData, semester: e.target.value})}
               >
                 <option value="">Select</option>
                 {[1,2,3,4,5,6,7,8].map(num => <option key={num} value={num}>{num}</option>)}
               </select>
               {errors.semester && <span className="text-red-500 text-xs">{errors.semester}</span>}
             </div>
           </div>

           <button type="submit" className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-4 rounded-xl font-bold mt-4 transition-all active:scale-95 shadow-lg shadow-purple-200">
             {user.profileComplete ? 'Update Changes' : 'Save & Continue'}
           </button>
        </form>
      </div>
    </div>
  );
}

// --- 2. HEADER ---
function Header({ user, showNotifications, setShowNotifications, onEditProfile }) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-40 shadow-sm flex justify-between items-center">
       <div className="flex items-center gap-3">
          <div className="bg-[#7c3aed] p-2 rounded-lg text-white">
            <Book size={24} />
          </div>
          <span className="text-2xl font-bold text-[#7c3aed]">StudentPortal</span>
       </div>
       <div className="flex items-center gap-4">
          <div className="relative cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors" onClick={() => setShowNotifications(!showNotifications)}>
             <Bell className="text-gray-600" size={22} />
             <span className="absolute top-1 right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">3</span>
          </div>
          
          <div 
            onClick={onEditProfile}
            className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full text-purple-700 font-medium border border-purple-100 cursor-pointer hover:bg-purple-100 hover:shadow-md transition-all group"
          >
             <User size={18} />
             <span>{user.name || 'Student'}</span>
             <Edit3 size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
          </div>
       </div>
    </header>
  );
}

// --- 3. SIDEBAR ---
function Sidebar({ activeTab, setActiveTab, mobileMenuOpen }) {
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: <TrendingUp size={20} /> },
    { id: 'grades', label: 'Grade Cards', icon: <Upload size={20} /> },
    { id: 'attendance', label: 'Attendance', icon: <Calendar size={20} /> },
    { id: 'cocurricular', label: 'Co-Curricular', icon: <Award size={20} /> },
    { id: 'calculator', label: 'CGPA Calculator', icon: <Target size={20} /> },
    { id: 'chatbot', label: 'Academic Guide', icon: <MessageCircle size={20} /> }
  ];

  return (
    <aside className={`w-64 bg-[#2e1065] text-white p-6 transition-transform duration-300 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:relative h-full z-30 shadow-2xl`}>
      <nav className="space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === item.id 
                ? 'bg-white/10 text-white shadow-inner border border-white/20' 
                : 'text-purple-200 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <div className="absolute bottom-8 left-6 right-6 p-4 bg-[#4c1d95] rounded-2xl border border-[#5b21b6]">
        <p className="text-xs text-purple-300 font-medium uppercase tracking-wider mb-1">Current Session</p>
        <p className="text-sm text-white font-bold">Feb 2026 - Jun 2026</p>
      </div>
    </aside>
  );
}

// --- 4. DASHBOARD OVERVIEW ---
function Overview({ user }) {
  const cgpaData = [ { semester: 'S1', cgpa: 7.8 }, { semester: 'S2', cgpa: 8.2 }, { semester: 'S3', cgpa: 8.5 }, { semester: 'S4', cgpa: 8.1 }, { semester: 'S5', cgpa: 8.6 } ];
  
  return (
    <div className="space-y-8 animate-fadeIn">
      <h1 className="text-3xl font-bold text-gray-900">Academic Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><TrendingUp /></div>
          <div><p className="text-sm text-gray-500">Current CGPA</p><h3 className="text-3xl font-bold text-gray-900">8.42</h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Calendar /></div>
          <div><p className="text-sm text-gray-500">Attendance</p><h3 className="text-3xl font-bold text-gray-900">82%</h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><Clock /></div>
          <div><p className="text-sm text-gray-500">Pending Actions</p><h3 className="text-3xl font-bold text-gray-900">1</h3></div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Performance Trajectory</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cgpaData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="semester" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
            <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Line type="monotone" dataKey="cgpa" stroke="#7c3aed" strokeWidth={4} dot={{r: 6, fill: '#7c3aed', strokeWidth: 2, stroke: '#fff'}} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- 5. CO-CURRICULAR WITH PDF UPLOAD ---
function CoCurricularEvents() {
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', category: '', semester: '5', description: '', proof: null });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEdit = (activity) => {
    setFormData({ 
      title: activity.title, 
      category: activity.category, 
      semester: activity.semester, 
      description: activity.description,
      proof: null 
    });
    setEditingId(activity.id);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setIsProcessing(true);
    setUploadedFile(file);

    try {
      const extractedText = await extractTextFromPDF(file);
      const parsedData = parseCoCurricularCertificate(extractedText);
      
      // Auto-fill form with parsed data
      setFormData(prev => ({
        ...prev,
        title: parsedData.title || prev.title,
        category: parsedData.category || prev.category,
        description: parsedData.description || prev.description,
        proof: file.name
      }));
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF. Please fill in details manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setActivities(activities.map(a => a.id === editingId ? { ...a, ...formData, status: 'pending', remarks: '' } : a));
    } else {
      const newActivity = { ...formData, id: Date.now(), status: 'pending', remarks: '' };
      setActivities([newActivity, ...activities]);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setUploadedFile(null);
    setFormData({ title: '', category: '', semester: '5', description: '', proof: null });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Co-Curricular Activities</h1>
          <p className="text-gray-500">Manage your extra-curricular portfolio</p>
        </div>
        <button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-6 py-3 bg-[#7c3aed] text-white rounded-xl font-semibold hover:bg-[#6d28d9] transition-all">
          <Plus size={18} /> Add Activity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map(activity => (
          <div key={activity.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${activity.category === 'Competition' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                <Award size={24} />
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                activity.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>{activity.status}</div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{activity.title}</h3>
            <p className="text-sm text-gray-500 mb-3">{activity.category} • Sem {activity.semester}</p>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{activity.description}</p>
            {activity.proof && (
              <div className="mb-4 flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                <FileText size={14} />
                <span className="truncate">{activity.proof}</span>
              </div>
            )}
            {activity.status === 'rejected' && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100 text-xs text-red-800">
                <strong>Remark:</strong> {activity.remarks}
              </div>
            )}
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <button onClick={() => handleEdit(activity)} disabled={activity.status === 'approved'} className="flex-1 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg disabled:opacity-50">Edit</button>
              <button className="flex-1 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8">
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Activity' : 'New Activity'}</h2>
            
            {/* PDF Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Certificate (PDF)
              </label>
              <div className="relative">
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="cert-upload"
                />
                <label 
                  htmlFor="cert-upload"
                  className="flex items-center justify-center gap-3 w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="animate-spin text-purple-600" size={20} />
                      <span className="text-gray-600">Processing PDF...</span>
                    </>
                  ) : uploadedFile ? (
                    <>
                      <FileText className="text-green-600" size={20} />
                      <span className="text-gray-700 font-medium">{uploadedFile.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="text-gray-400" size={20} />
                      <span className="text-gray-600">Click to upload PDF certificate</span>
                    </>
                  )}
                </label>
              </div>
              {uploadedFile && (
                <p className="text-xs text-green-600 mt-2">✓ Details auto-filled from certificate</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                required 
                placeholder="Activity Title" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" 
              />
              <div className="grid grid-cols-2 gap-4">
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})} 
                  className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Category</option>
                  <option>Competition</option>
                  <option>Workshop</option>
                  <option>Club</option>
                  <option>Volunteer</option>
                </select>
                <select 
                  value={formData.semester} 
                  onChange={e => setFormData({...formData, semester: e.target.value})} 
                  className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>
              </div>
              <textarea 
                required 
                placeholder="Description" 
                rows="3" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
              />
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setUploadedFile(null);
                  }} 
                  className="flex-1 py-3 border rounded-xl font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-[#7c3aed] text-white rounded-xl font-semibold hover:bg-[#6d28d9]"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- 6. ADVANCED ATTENDANCE ---
function AdvancedAttendanceTracker() {
  const [mode, setMode] = useState('calendar'); 
  const [timetable, setTimetable] = useState({
    'Monday': { '09:00': 'CS601', '10:00': 'CS602' },
    'Tuesday': { '11:00': 'CS603', '09:00': 'CS601' },
    'Wednesday': { '14:00': 'CS602' },
    'Thursday': { '10:00': 'CS601' },
    'Friday': { '09:00': 'CS603' }
  });
  const [attendanceLog, setAttendanceLog] = useState({
    '2026-02-03': { '09:00': 'present', '10:00': 'present' },
    '2026-02-04': { '11:00': 'absent', '09:00': 'present' }
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const subjects = INITIAL_SUBJECTS;
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00'];

  const toggleTimetableSlot = (day, time) => {
    const currentSub = timetable[day]?.[time];
    let nextSub = '';
    if (!currentSub) nextSub = subjects[0].code;
    else {
      const idx = subjects.findIndex(s => s.code === currentSub);
      nextSub = (idx === subjects.length - 1) ? null : subjects[idx + 1].code;
    }
    setTimetable(prev => ({ ...prev, [day]: { ...prev[day], [time]: nextSub } }));
  };

  const markAttendance = (dateStr, time, status) => {
    setAttendanceLog(prev => ({ ...prev, [dateStr]: { ...prev[dateStr], [time]: status } }));
  };

  const calculateStats = () => {
    const stats = {};
    subjects.forEach(s => stats[s.code] = { name: s.name, total: 0, attended: 0 });
    Object.keys(attendanceLog).forEach(date => {
       Object.keys(attendanceLog[date]).forEach(time => {
          const dateObj = new Date(date);
          const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dateObj.getDay()];
          const code = timetable[dayName]?.[time];
          if (code && stats[code]) {
             if (attendanceLog[date][time] !== 'cancelled') {
               stats[code].total += 1;
               if (attendanceLog[date][time] === 'present') stats[code].attended += 1;
             }
          }
       });
    });
    return stats;
  };
  const stats = calculateStats();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-gray-900">Attendance</h1><p className="text-gray-500">Track classes & Timetable</p></div>
        <div className="bg-white p-1 rounded-xl border flex">
           {['setup', 'calendar', 'stats'].map(m => (
             <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize ${mode === m ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}>{m}</button>
           ))}
        </div>
      </div>

      {mode === 'setup' && (
        <div className="bg-white rounded-2xl shadow-sm border p-6 overflow-x-auto">
          <h2 className="font-bold mb-4">Weekly Timetable Setup</h2>
          <div className="min-w-[700px]">
             <div className="grid grid-cols-6 gap-2 mb-2 font-bold text-gray-500 text-center"><div>Time</div>{daysOfWeek.map(d => <div key={d}>{d}</div>)}</div>
             {timeSlots.map(time => (
               <div key={time} className="grid grid-cols-6 gap-2 mb-2">
                  <div className="flex items-center justify-center font-mono text-xs text-purple-600 bg-purple-50 rounded-lg">{time}</div>
                  {daysOfWeek.map(day => (
                     <div key={day+time} onClick={() => toggleTimetableSlot(day, time)} className={`h-12 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer hover:ring-2 ring-purple-200 ${timetable[day]?.[time] ? 'bg-[#5b6ba8] text-white' : 'bg-gray-50 text-gray-300 border border-dashed'}`}>
                       {timetable[day]?.[time] || '+'}
                     </div>
                  ))}
               </div>
             ))}
          </div>
        </div>
      )}

      {mode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex justify-between mb-4"><h2 className="font-bold text-lg">February 2026</h2><div className="flex gap-2"><button><ChevronLeft/></button><button><ChevronRight/></button></div></div>
              <div className="grid grid-cols-7 gap-3">
                 {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center font-bold text-gray-300">{d}</div>)}
                 {[...Array(28)].map((_, i) => {
                    const day = i + 1;
                    const dateStr = `2026-02-${day.toString().padStart(2, '0')}`;
                    const dateObj = new Date(2026, 1, day);
                    const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dateObj.getDay()];
                    const hasClasses = timetable[dayName] && Object.keys(timetable[dayName]).length > 0;
                    return (
                       <button key={day} disabled={!hasClasses} onClick={() => setSelectedDate(dateStr)} className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${selectedDate === dateStr ? 'bg-purple-600 text-white' : hasClasses ? 'bg-white border hover:shadow-md' : 'bg-gray-50 text-gray-300'}`}>
                          <span className="font-bold">{day}</span>
                          {hasClasses && <div className="flex gap-0.5 mt-1">{Object.keys(timetable[dayName]).map(t => <div key={t} className={`w-1 h-1 rounded-full ${attendanceLog[dateStr]?.[t] === 'present' ? 'bg-green-500' : attendanceLog[dateStr]?.[t] === 'absent' ? 'bg-red-500' : 'bg-gray-300'}`} />)}</div>}
                       </button>
                    )
                 })}
              </div>
           </div>
           <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="font-bold mb-4">{selectedDate ? `Classes on ${selectedDate}` : 'Select a date'}</h2>
              {selectedDate ? (
                 <div className="space-y-3">
                    {Object.entries(timetable[['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date(selectedDate).getDay()]] || {}).map(([time, code]) => (
                       <div key={time} className="p-3 bg-gray-50 rounded-xl border">
                          <div className="flex justify-between mb-2"><span className="font-bold">{code}</span><span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{time}</span></div>
                          <div className="flex gap-2">
                             <button onClick={() => markAttendance(selectedDate, time, 'present')} className={`flex-1 py-1 rounded text-xs font-bold ${attendanceLog[selectedDate]?.[time] === 'present' ? 'bg-green-500 text-white' : 'bg-white border'}`}>Present</button>
                             <button onClick={() => markAttendance(selectedDate, time, 'absent')} className={`flex-1 py-1 rounded text-xs font-bold ${attendanceLog[selectedDate]?.[time] === 'absent' ? 'bg-red-500 text-white' : 'bg-white border'}`}>Absent</button>
                          </div>
                       </div>
                    ))}
                 </div>
              ) : <p className="text-gray-400 text-sm text-center mt-10">No date selected</p>}
           </div>
        </div>
      )}

      {mode === 'stats' && (
        <div className="grid grid-cols-3 gap-6">
           {Object.keys(stats).map(code => {
              const { total, attended } = stats[code];
              const pct = total === 0 ? 0 : ((attended / total) * 100).toFixed(1);
              return (
                 <div key={code} className="bg-white p-6 rounded-2xl shadow-sm border">
                    <div className="flex justify-between mb-2"><h3 className="font-bold">{code}</h3><span className={`${pct < 75 ? 'text-red-600' : 'text-green-600'} font-bold`}>{pct}%</span></div>
                    <div className="w-full bg-gray-100 h-2 rounded-full mb-3"><div style={{width: `${pct}%`}} className={`h-full rounded-full ${pct < 75 ? 'bg-red-500' : 'bg-green-500'}`} /></div>
                    <div className="text-xs text-gray-500 flex justify-between"><span>Attended: {attended}</span><span>Total: {total}</span></div>
                 </div>
              )
           })}
        </div>
      )}
    </div>
  );
}


// --- 7. GRADE MANAGEMENT WITH PDF UPLOAD ---
function GradeManagement() {
  const [showModal, setShowModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [grades, setGrades] = useState([
    
  ]);
  const handleView = (grade) => {
  setViewData(grade);    
  setShowModal(true);  
};


  const handleGradeSubmit = (newGrade) => {
    setGrades([newGrade, ...grades]);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Grades</h1>
        <button onClick={() => { setViewData(null);setShowModal(true);} } className="flex items-center gap-2 px-6 py-3 bg-[#7c3aed] text-white rounded-xl font-semibold hover:bg-[#6d28d9]">
          <Plus size={18} /> Upload Grade Card
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Semester</th>
              <th className="p-4">SGPA</th>
              <th className="p-4">CGPA</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g, idx) => (
              <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4">Sem {g.semester}</td>
                <td className="p-4 font-mono">{g.sgpa}</td>
                <td className="p-4 font-mono">{g.cgpa}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    g.status==='approved'?'bg-green-100 text-green-700':
                    g.status==='rejected'?'bg-red-100 text-red-700':
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {g.status}
                  </span>
                </td>
                <td className="p-4">
                       <button
                          onClick={() => handleView(g)}
                          className="text-[#7c3aed] font-medium hover:underline"
                        >
                          View
                        </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
     {showModal && (
  <UploadGradeCardModal
    onClose={() => {
      setShowModal(false);
      setViewData(null); // cleanup
    }}
    onSubmit={handleGradeSubmit}
    viewData={viewData}   
  />
)}

    </div>
  );
}
function UploadGradeCardModal({ onClose, onSubmit, viewData }) {
  const isViewMode = !!viewData;

  const [step, setStep] = useState(isViewMode ? 2 : 1);
  const [data, setData] = useState(viewData || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setIsProcessing(true);
    setUploadedFile(file);

    try {
      const extractedText = await extractTextFromPDF(file);
      const parsedData = parseGradeCard(extractedText);

      if (parsedData.subjects.length === 0) {
        alert('Subjects could not be auto-detected. Please verify manually.');
      }

      setData(parsedData);
      setStep(2);
    } catch (err) {
      console.error(err);
      setError('Failed to process PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    const gradeCard = {
      semester: Number(data.semester),
      sgpa: Number(data.sgpa),
      cgpa: Number(data.cgpa),
      subjects: data.subjects,
      status: 'pending'
    };

    onSubmit(gradeCard);
    onClose();
  };

  const updateSubject = (index, field, value) => {
    const updated = [...data.subjects];
    updated[index][field] = value;
    setData({ ...data, subjects: updated });
  };

  const addSubject = () => {
    setData({
      ...data,
      subjects: [...data.subjects, { subject: '', credits: '', grade: '' }]
    });
  };

  const removeSubject = (index) => {
    setData({
      ...data,
      subjects: data.subjects.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">

        <h2 className="text-2xl font-bold mb-4">
          {isViewMode ? 'View Grade Card' : step === 1 ? 'Upload Grade Card' : 'Verify Extracted Data'}
        </h2>

        {/* STEP 1 – UPLOAD */}
        {step === 1 && !isViewMode && (
          <div className="space-y-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="grade-upload"
              disabled={isProcessing}
            />
            <label
              htmlFor="grade-upload"
              className="flex flex-col items-center justify-center gap-3 w-full p-10 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50"
            >
              {isProcessing ? (
                <>
                  <Loader className="animate-spin text-purple-600" size={40} />
                  <p>Processing PDF...</p>
                </>
              ) : (
                <>
                  <Upload size={40} className="text-gray-400" />
                  <p className="font-medium">Click to upload PDF grade card</p>
                </>
              )}
            </label>

            <button
              onClick={onClose}
              className="w-full py-3 border rounded-xl font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}

        {/* STEP 2 – REVIEW / VIEW */}
        {step === 2 && data && (
          <div className="space-y-4">

            <div className="grid grid-cols-3 gap-4">
              {['semester', 'sgpa', 'cgpa'].map((field) => (
                <div key={field}>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    {field.toUpperCase()}
                  </label>
                  <input
                    disabled={isViewMode}
                    className="w-full border p-3 rounded-lg"
                    value={data[field] || ''}
                    onChange={(e) => setData({ ...data, [field]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-gray-500">Subjects</span>
                {!isViewMode && (
                  <button
                    onClick={addSubject}
                    className="text-xs text-purple-600 font-semibold"
                  >
                    + Add Subject
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {data.subjects.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      disabled={isViewMode}
                      className="flex-1 border p-2 rounded-lg"
                      value={s.subject}
                      onChange={(e) => updateSubject(i, 'subject', e.target.value)}
                      placeholder="Subject"
                    />
                    <input
                      disabled={isViewMode}
                      className="w-24 border p-2 rounded-lg"
                      value={s.grade}
                      onChange={(e) => updateSubject(i, 'grade', e.target.value)}
                      placeholder="Grade"
                    />
                    {!isViewMode && (
                      <button
                        onClick={() => removeSubject(i)}
                        className="px-3 text-red-600"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 border rounded-xl font-semibold hover:bg-gray-50"
              >
                Close
              </button>

              {!isViewMode && (
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-[#7c3aed] text-white rounded-xl font-semibold hover:bg-[#6d28d9]"
                >
                  Submit for Review
                </button>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}


// --- 8. CALCULATOR ---
function TargetCalculator() {
  const [formData, setFormData] = useState({ 
    currentCGPA: 8.25, 
    creditsCompleted: 120, 
    currentSemesterCredits: 24, 
    targetCGPA: 8.50 
  });
  const [result, setResult] = useState(null);

  const calculate = () => {
    const { currentCGPA, creditsCompleted, currentSemesterCredits, targetCGPA } = formData;
    const req = ((targetCGPA * (creditsCompleted + currentSemesterCredits)) - (currentCGPA * creditsCompleted)) / currentSemesterCredits;
    setResult({ val: req.toFixed(2), feasible: req <= 10 });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border animate-fadeIn">
      <h1 className="text-2xl font-bold mb-6">Target Planner</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="space-y-4">
          <div><label className="text-sm font-bold text-gray-500">Current CGPA</label><input type="number" step="0.01" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none transition-all" value={formData.currentCGPA} onChange={e => setFormData({...formData, currentCGPA: parseFloat(e.target.value)})} /></div>
          <div><label className="text-sm font-bold text-gray-500">Completed Credits</label><input type="number" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none transition-all" value={formData.creditsCompleted} onChange={e => setFormData({...formData, creditsCompleted: parseInt(e.target.value)})} /></div>
          <div><label className="text-sm font-bold text-gray-500">Current Sem Credits</label><input type="number" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none transition-all" value={formData.currentSemesterCredits} onChange={e => setFormData({...formData, currentSemesterCredits: parseInt(e.target.value)})} /></div>
          <div><label className="text-sm font-bold text-gray-500">Target CGPA</label><input type="number" step="0.01" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none transition-all" value={formData.targetCGPA} onChange={e => setFormData({...formData, targetCGPA: parseFloat(e.target.value)})} /></div>
          <button onClick={calculate} className="w-full bg-[#7c3aed] text-white py-3 rounded-xl font-bold mt-2 hover:bg-[#6d28d9] transition-colors">Calculate Required SGPA</button>
        </div>
        <div className="flex flex-col">
          {result ? (
            <div className={`h-full flex flex-col items-center justify-center p-6 rounded-2xl text-center transition-all animate-scaleIn ${result.feasible ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
              <div className={`p-4 rounded-full mb-4 ${result.feasible ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {result.feasible ? <CheckCircle size={48} /> : <AlertCircle size={48} />}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2">{result.feasible ? 'Target Achievable' : 'Mathematically Impossible'}</p>
              <div className="text-6xl font-extrabold tracking-tighter mb-2">{result.val}</div>
              <p className="text-sm opacity-80 max-w-[200px] leading-relaxed">SGPA required in this semester to hit <strong>{formData.targetCGPA}</strong></p>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 p-6 min-h-[300px]">
              <Target size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">Enter your academic details to calculate the required performance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 9. CHATBOT ---
function AcademicChatbot() {
  const [msgs, setMsgs] = useState([{ sender: 'bot', text: 'Hello! I analyzed your grades. You seem to be strong in Programming but struggled a bit in Math. How can I assist?' }]);
  const [input, setInput] = useState('');

  const send = () => {
    if(!input) return;
    setMsgs([...msgs, { sender: 'user', text: input }]);
    setTimeout(() => {
      setMsgs(prev => [...prev, { sender: 'bot', text: 'Based on your history, I recommend taking "Advanced Algorithms" as an elective to boost your CGPA.' }]);
    }, 1000);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-sm border overflow-hidden animate-fadeIn">
      <div className="p-4 border-b bg-gray-50 font-bold text-gray-700">Academic AI Assistant</div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
         {msgs.map((m, i) => (
           <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-4 rounded-2xl ${m.sender === 'user' ? 'bg-[#7c3aed] text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                 {m.text}
              </div>
           </div>
         ))}
      </div>
      <div className="p-4 border-t flex gap-2">
         <input className="flex-1 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-200" placeholder="Ask for advice..." value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && send()} />
         <button onClick={send} className="bg-[#7c3aed] text-white p-3 rounded-xl hover:bg-[#6d28d9] transition-colors"><Send size={20} /></button>
      </div>
    </div>
  );
}