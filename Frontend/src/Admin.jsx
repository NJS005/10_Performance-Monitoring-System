import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react'; // Make sure to add Search and Loader2 to your lucide-react imports at the top!

function ManageFacultyScreen({ showModal, setShowModal, selectedItem, setSelectedItem }) {
  // 1. Setup State for Data, Loading, and Searching
  const [facultyData, setFacultyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Fetch Data on Component Mount
  const fetchFaculty = async () => {
    setIsLoading(true);
    try {
      // Adjust this URL to match your exact Spring Boot endpoint
      const response = await fetch('http://localhost:8080/api/users/all'); 
      if (response.ok) {
        const data = await response.json();
        setFacultyData(data);
      } else {
        console.error("Failed to fetch faculty");
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

 
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this faculty member?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/users/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
       
        setFacultyData(facultyData.filter(faculty => faculty.id !== id));
      } else {
        alert("Failed to delete user.");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
   
    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      department: e.target.department.value,
      role: "Faculty Advisor" // Force role for this screen
    };

    const isEditing = !!selectedItem;
    const url = isEditing 
      ? `http://localhost:8080/api/users/${selectedItem.id}` 
      : `http://localhost:8080/api/users`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchFaculty(); // Refresh the list
        setShowModal(null);
        setSelectedItem(null);
      } else {
        alert("Failed to save faculty member.");
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  
  const filteredFaculty = facultyData.filter(faculty => {
    const query = searchQuery.toLowerCase();
    return (
      (faculty.name && faculty.name.toLowerCase().includes(query)) ||
      (faculty.email && faculty.email.toLowerCase().includes(query)) ||
      (faculty.department && faculty.department.toLowerCase().includes(query))
    );
  });

  return (
    <>
      <div className="space-y-6">
        {/* Action Bar with Search and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-slate-900"
            />
          </div>

          <button
            onClick={() => { setShowModal('addFaculty'); setSelectedItem(null); }}
            className="flex w-full sm:w-auto items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Add Faculty</span>
          </button>
        </div>

        {/* Faculty Table */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">Department</th>
                  <th className="text-right px-6 py-4 text-sm font-bold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                
                {/* Loading State */}
                {isLoading && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
                      Loading faculty data...
                    </td>
                  </tr>
                )}

                {/* Empty Search Result State */}
                {!isLoading && filteredFaculty.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                      No faculty members found matching "{searchQuery}".
                    </td>
                  </tr>
                )}

                {/* Render Filtered Data */}
                {!isLoading && filteredFaculty.map((faculty, index) => (
                  <tr key={faculty.id} className="hover:bg-slate-50 transition-colors duration-150 animate-fadeInUp" style={{animationDelay: `${index * 0.05}s`}}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                          {faculty.name ? faculty.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <span className="font-medium text-slate-900">{faculty.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{faculty.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">
                        {faculty.department || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setSelectedItem(faculty); setShowModal('editFaculty'); }}
                          className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(faculty.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors duration-150"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal - Notice the onSubmit added to the form! */}
      {(showModal === 'addFaculty' || showModal === 'editFaculty') && (
        <Modal
          title={showModal === 'addFaculty' ? 'Add Faculty Member' : 'Edit Faculty Member'}
          onClose={() => { setShowModal(null); setSelectedItem(null); }}
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Name</label>
              <input
                type="text"
                name="name" // Added name attribute for form extraction
                placeholder="Enter faculty name"
                defaultValue={selectedItem?.name || ''}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                name="email" // Added name attribute
                placeholder="Enter email address"
                defaultValue={selectedItem?.email || ''}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Department</label>
              <select
                name="department" // Added name attribute
                defaultValue={selectedItem?.department || ''}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-slate-900"
              >
                <option value="">Select department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Engineering">Engineering</option>
                <option value="Biology">Biology</option>
              </select>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => { setShowModal(null); setSelectedItem(null); }}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {selectedItem ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}