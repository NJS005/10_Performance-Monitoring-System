import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Loader2, X, Edit2, Database, Users, BookOpen, Building } from 'lucide-react';

// 1. THE BRAIN: This config object tells the UI how to render every table.
// Add a new block here, and the UI will automatically build the page for it!
const tableConfigs = {
  users: {
    name: "System Users",
    icon: <Users className="w-5 h-5" />,
    endpoint: "users",
    idField: "id",
    columns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "department", label: "Department" },
      { key: "designation", label: "Designation" },
      { key: "contactNo", label: "Contact No" }
    ],
    formFields: [
      { name: "name", label: "Full Name", type: "text", required: true },
      { name: "email", label: "Email Address", type: "email", required: true },
      { name: "role", label: "Role", type: "select", options: ["Admin", "Faculty Advisor", "Student"], required: true },
      { name: "department", label: "Department (Code)", type: "select", options: ["CS", "EC", "EE", "ME", "CE", "CH", "PE", "MT", "BT", "EP", "AR", "Admin/Staff"], required: false },
      { name: "designation", label: "Designation", type: "text", required: false },
      { name: "contactNo", label: "Contact No", type: "number", required: false }
    ]
  },
  faculty: {
    name: "Faculty",
    icon: <Users className="w-5 h-5" />,
    endpoint: "admin/faculty",
    idField: "id",
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "department", label: "Department" },
      { key: "designation", label: "Designation" },
      { key: "contactNo", label: "Contact No" }
    ],
    formFields: [
      { name: "name", label: "Full Name", type: "text", required: true },
      { name: "email", label: "Email Address", type: "email", required: true },
      { name: "department", label: "Department (Code)", type: "select", options: ["CS", "EC", "EE", "ME", "CE", "CH", "PE", "MT", "BT", "EP", "AR"], required: true },
      { name: "designation", label: "Designation", type: "text", required: true },
      { name: "contactNo", label: "Contact No", type: "number", required: true }
    ]
  },
  students: {
    name: "Students",
    icon: <BookOpen className="w-5 h-5" />,
    endpoint: "admin/students",
    idField: "rollNo", // Students use rollNo as their primary key
    columns: [
      { key: "rollNo", label: "Roll Number" },
      { key: "name", label: "Name" },
      { key: "department", label: "Department" },
      { key: "program", label: "Program" },
      { key: "batch", label: "Batch" },
      { key: "contactNo", label: "Contact No" },
      { key: "verificationStatus", label: "Verification" }
    ],
    formFields: [
      { name: "rollNo", label: "Roll Number", type: "text", required: true },
      { name: "name", label: "Full Name", type: "text", required: true },
      { name: "department", label: "Department Code", type: "select", options: ["CS", "EC", "EE", "ME", "CE", "CH", "PE", "MT", "BT", "EP", "AR"], required: true },
      { name: "program", label: "Program", type: "select", options: ["B.Tech", "B.Arch", "M.Tech", "PhD", "BSc", "MSc", "Integrated"], required: true },
      { name: "batch", label: "Batch Year", type: "number", required: true },
      { name: "contactNo", label: "Contact No", type: "number", required: true }
    ]
  },
  departments: {
    name: "Departments",
    icon: <Building className="w-5 h-5" />,
    endpoint: "admin/departments",
    idField: "id",
    columns: [
      { key: "code", label: "Dept Code" },
      { key: "name", label: "Department Name" }
    ],
    formFields: [
      { name: "code", label: "Department Code", type: "text", required: true },
      { name: "name", label: "Department Name", type: "text", required: true }
    ]
  },
  courses: {
    name: "Student Courses",
    icon: <BookOpen className="w-5 h-5" />,
    endpoint: "admin/courses",
    idField: "id",
    columns: [
      { key: "rollNo", label: "Roll Number" },
      { key: "courseCode", label: "Course Code" },
      { key: "semester", label: "Semester" },
      { key: "grade", label: "Grade" }
    ],
    formFields: [
      { name: "rollNo", label: "Roll Number", type: "text", required: true },
      { name: "courseCode", label: "Course Code", type: "text", required: true },
      { name: "semester", label: "Semester", type: "number", required: true },
      { name: "grade", label: "Grade", type: "text", required: true }
    ]
  },
  coursecatalog: {
    name: "Course Catalog",
    icon: <BookOpen className="w-5 h-5" />,
    endpoint: "admin/coursecatalog",
    idField: "courseCode",
    columns: [
      { key: "courseCode", label: "Course Code" },
      { key: "courseName", label: "Course Name" },
      { key: "courseType", label: "Type" },
      { key: "credit", label: "Credits" }
    ],
    formFields: [
      { name: "courseCode", label: "Course Code", type: "text", required: true },
      { name: "courseName", label: "Course Name", type: "text", required: true },
      { name: "courseType", label: "Course Type", type: "text", required: true },
      { name: "credit", label: "Credits", type: "number", required: true }
    ]
  },
  attendance: {
    name: "Attendance",
    icon: <Users className="w-5 h-5" />,
    endpoint: "admin/attendance",
    idField: "id",
    columns: [
      { key: "rollNo", label: "Roll Number" },
      { key: "courseName", label: "Course Name" },
      { key: "semester", label: "Semester" },
      { key: "slot", label: "Slot" },
      { key: "attendedClasses", label: "Attended" },
      { key: "totalClasses", label: "Total" },
      { key: "attendanceRequirement", label: "Req (%)" }
    ],
    formFields: [
      { name: "rollNo", label: "Roll Number", type: "text", required: true },
      { name: "semester", label: "Semester", type: "number", required: true },
      { name: "slot", label: "Slot", type: "text", required: true },
      { name: "courseName", label: "Course Name", type: "text", required: false },
      { name: "attendedClasses", label: "Attended Classes", type: "number", required: true },
      { name: "totalClasses", label: "Total Classes", type: "number", required: true },
      { name: "attendanceRequirement", label: "Attendance Req (%)", type: "number", required: true }
    ]
  },
  dailyattendance: {
    name: "Daily Attendance",
    icon: <Users className="w-5 h-5" />,
    endpoint: "admin/dailyattendance",
    idField: "id",
    columns: [
      { key: "rollNo", label: "Roll Number" },
      { key: "slot1", label: "Slot 1" },
      { key: "slot2", label: "Slot 2" },
      { key: "slot3", label: "Slot 3" },
      { key: "slot4", label: "Slot 4" },
      { key: "slot5", label: "Slot 5" },
      { key: "slot6", label: "Slot 6" }
    ],
    formFields: [
      { name: "rollNo", label: "Roll Number", type: "text", required: true }
    ]
  },
  cocurricular: {
    name: "Co-Curricular",
    icon: <Building className="w-5 h-5" />,
    endpoint: "admin/cocurricular",
    idField: "idd",
    columns: [
      { key: "rollNo", label: "Roll Number" },
      { key: "title", label: "Title" },
      { key: "type", label: "Type" },
      { key: "date", label: "Date" }
    ],
    formFields: [
      { name: "rollNo", label: "Roll Number", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "text", required: false },
      { name: "type", label: "Type", type: "text", required: true },
      { name: "certificateName", label: "Certificate Name", type: "text", required: false },
      { name: "date", label: "Date", type: "text", required: true }
    ]
  },
  courseverification: {
    name: "Course Verification",
    icon: <BookOpen className="w-5 h-5" />,
    endpoint: "admin/courseverification",
    idField: "id",
    columns: [
      { key: "rollNo", label: "Roll Number" },
      { key: "semester", label: "Semester" },
      { key: "verificationStatus", label: "Status" }
    ],
    formFields: [
      { name: "rollNo", label: "Roll Number", type: "text", required: true },
      { name: "semester", label: "Semester", type: "number", required: true },
      { name: "verificationStatus", label: "Status", type: "text", required: true }
    ]
  }
};

export default function AdminPanel() {
  // --- Core State ---
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- UI State ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const activeConfig = tableConfigs[activeTab];

  // --- API Helpers ---
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const fetchTableData = async () => {
    setIsLoading(true);
    try {
      // Dynamically calls /api/users, /api/students, etc.
      const res = await fetch(`http://localhost:8080/api/${activeConfig.endpoint}`, { headers: getHeaders() });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch data whenever the user clicks a different table in the sidebar
  useEffect(() => {
    fetchTableData();
    setSearchQuery('');
  }, [activeTab]);

  // Fetch dynamic departments on mount
  useEffect(() => {
    fetch('http://localhost:8080/api/public/departments')
      .then(res => res.ok ? res.json() : [])
      .then(deps => setDepartmentOptions(deps.map(d => d.code)))
      .catch(err => console.error("Error fetching departments:", err));
  }, []);

  // --- Action Handlers ---
  const handleDelete = async (record) => {
    const id = record[activeConfig.idField]; // Smartly grabs 'id' or 'rollNo'
    if (!window.confirm(`Are you sure you want to delete this ${activeConfig.name.slice(0, -1)}?`)) return;
    
    try {
      const res = await fetch(`http://localhost:8080/api/${activeConfig.endpoint}/${id}`, { 
        method: 'DELETE', headers: getHeaders() 
      });
      if (res.ok) {
        setData(data.filter(item => item[activeConfig.idField] !== id));
      } else {
        alert("Failed to delete record.");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Dynamically build the payload based on the config's formFields
    const formData = {};
    activeConfig.formFields.forEach(field => {
      formData[field.name] = e.target[field.name].value;
    });

    const isEditing = !!editingRecord;
    const id = isEditing ? editingRecord[activeConfig.idField] : '';
    const url = isEditing 
      ? `http://localhost:8080/api/${activeConfig.endpoint}/${id}` 
      : `http://localhost:8080/api/${activeConfig.endpoint}`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        fetchTableData();
        closeModal();
      } else {
        alert("Failed to save record.");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const openModal = (record = null) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  // --- Filtering ---
  const filteredData = data.filter(item => {
    if (!searchQuery) return true;
    // Search across all configured columns for the active table
    return activeConfig.columns.some(col => {
      const val = item[col.key];
      return val && val.toString().toLowerCase().includes(searchQuery.toLowerCase());
    });
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Header (simplified for brevity) */}
      <div className="lg:hidden fixed top-0 w-full bg-white shadow-sm z-20 p-4 flex justify-between">
        <h1 className="font-bold text-gray-900">Admin Panel</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>Menu</button>
      </div>

      {/* Dynamic Sidebar */}
      <aside className={`fixed top-0 left-0 z-30 h-screen transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} bg-white border-r border-gray-200 w-64 flex flex-col`}>
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">System Admin</h1>
        </div>
        <nav className="p-4 space-y-2">
          {Object.entries(tableConfigs).map(([key, config]) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === key ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {config.icon}
              <span className="font-medium">{config.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-8 pt-20 lg:pt-8 transition-all">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage {activeConfig.name}</h2>
            <p className="text-gray-500">View, add, edit, and delete records.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-sm transition-all font-semibold"
          >
            <Plus className="w-5 h-5" /> Add New
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative w-full sm:w-96">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Dynamic Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {activeConfig.columns.map(col => (
                    <th key={col.key} className="px-6 py-4 text-sm font-semibold text-gray-600">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan="100%" className="p-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan="100%" className="p-8 text-center text-gray-500">No records found.</td></tr>
                ) : (
                  filteredData.map((item, idx) => (
                    <tr key={item[activeConfig.idField] || idx} className="hover:bg-gray-50">
                      {activeConfig.columns.map(col => {
                        const val = item[col.key];
                        const displayVal = typeof val === 'object' && val !== null ? (val.name || val.code || JSON.stringify(val)) : val;
                        return (
                          <td key={col.key} className="px-6 py-4 text-gray-800">
                            {displayVal}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => openModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Dynamic Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {editingRecord ? 'Edit' : 'Add'} {activeConfig.name.slice(0, -1)}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {activeConfig.formFields.map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  
                  {field.type === 'select' ? (
                    <select
                      name={field.name}
                      defaultValue={editingRecord ? (typeof editingRecord[field.name] === 'object' && editingRecord[field.name] !== null ? (editingRecord[field.name].code || editingRecord[field.name].name) : editingRecord[field.name]) : ''}
                      required={field.required}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none"
                    >
                      <option value="">Select...</option>
                      {(field.name === 'department' ? departmentOptions : field.options).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      defaultValue={editingRecord ? (typeof editingRecord[field.name] === 'object' && editingRecord[field.name] !== null ? (editingRecord[field.name].code || editingRecord[field.name].name) : editingRecord[field.name]) : ''}
                      required={field.required}
                      // If editing a primary key (like rollNo), disable the input so they can't change it
                      disabled={editingRecord && field.name === activeConfig.idField}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  )}
                </div>
              ))}
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}