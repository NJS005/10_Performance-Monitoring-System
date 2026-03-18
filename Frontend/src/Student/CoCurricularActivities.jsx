import React, { useState } from 'react';

export const CoCurricularActivities = ({ rollNo }) => {
  const [activities, setActivities] = useState([]);

  React.useEffect(() => {
    // Fetch existing activities from backend
    const fetchActivities = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/student/cocurricular/${rollNo}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setActivities(data);
      }
      catch (error) {
        console.error('Error fetching activities:', error);
      }
    }
    fetchActivities();
  }, [rollNo]);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'club',
    certificate: null,
    certificateName: '',
    date: ''
  });

  // Activity types with icons and colors
  const activityTypes = [
    { value: 'club', label: 'Club', color: 'indigo', icon: '👥' },
    { value: 'competition', label: 'Competition', color: 'red', icon: '🏆' },
    { value: 'quiz', label: 'Quiz', color: 'yellow', icon: '❓' },
    { value: 'workshop', label: 'Workshop', color: 'blue', icon: '🔧' },
    { value: 'seminar', label: 'Seminar', color: 'green', icon: '🎤' },
    { value: 'sports', label: 'Sports', color: 'orange', icon: '⚽' },
    { value: 'cultural', label: 'Cultural', color: 'purple', icon: '🎭' },
    { value: 'volunteer', label: 'Volunteer', color: 'pink', icon: '🤝' },
    { value: 'others', label: 'Others', color: 'gray', icon: '📌' }
  ];

  // Get activity type details
  const getActivityType = (typeValue) => {
    return activityTypes.find(t => t.value === typeValue) || activityTypes[activityTypes.length - 1];
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle certificate upload
  const handleCertificateUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setFormData(prev => ({
          ...prev,
          certificate: file,
          certificateName: file.name
        }));
      } else {
        alert('Please upload a PDF or image file');
      }
    }
  };

  // Remove certificate
  const removeCertificate = () => {
    setFormData(prev => ({
      ...prev,
      certificate: null,
      certificateName: ''
    }));
  };

  // Add new activity
const handleAddActivity = () => {
  if (!formData.title.trim() || !formData.description.trim()) {
    alert('Please fill in title and description');
    return;
  }

  const duplicate = activities.some(
    activity => activity.title.trim().toLowerCase() === formData.title.trim().toLowerCase()
  );

  if (duplicate) {
    alert(`An activity with the title "${formData.title}" already exists.`);
    return;
  }

  const newActivity = {
    id: Date.now(),
    ...formData,
    date: formData.date || new Date().toISOString().split('T')[0]
  };

  setActivities(prev => [newActivity, ...prev]);
  resetForm();
};

  const handleSubmit = async () => {
    try {
      // 1. Pre-upload all certificate files
      const updatedActivities = await Promise.all(activities.map(async (item) => {
        let certUrl = item.certificate;
        if (item.certificate instanceof File) {
          const fd = new FormData();
          fd.append('file', item.certificate);
          const res = await fetch(`http://localhost:8080/api/student/upload/cocurricular`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: fd
          });
          if (!res.ok) throw new Error("File upload failed");
          certUrl = await res.text();
        }
        return { ...item, certificate: certUrl };
      }));

      // 2. Map payload with returned local URLs
      const payload = updatedActivities.map(item => ({
        rollNo: rollNo,
        title: item.title,
        description: item.description,
        type: item.type,
        certificateName: item.certificateName,
        date: item.date,
        certificate: item.certificate || ""
      }));

      console.log('Submitting activities with payload:', payload);
      const response = await fetch(`http://localhost:8080/api/student/cocurricular/${rollNo}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Submission failed: ${response.status}`);

      console.log('Successfully submitted!');
      alert('Activities submitted successfully!');
      
      // Update state so users can immediately click "View Document" using the fetched DB URL
      setActivities(updatedActivities);

    } catch (error) {
      console.error('Error submitting activities:', error);
      alert('Failed to submit activities. Please try again.');
    }
  };

  // Start editing an activity
  const handleEditActivity = (activity) => {
    setEditingId(activity.id);
    setFormData({
      title: activity.title,
      description: activity.description,
      type: activity.type,
      certificate: activity.certificate,
      certificateName: activity.certificateName,
      date: activity.date
    });
    setIsAdding(false);
  };

  // Save edited activity
  const handleSaveEdit = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in title and description');
      return;
    }

    setActivities(prev => prev.map(activity =>
      activity.id === editingId
        ? { ...activity, ...formData }
        : activity
    ));
    resetForm();
  };

  // Delete activity
  const handleDeleteActivity = async (title) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      console.log(`Attempting to delete activity with title: ${title} for rollNo: ${rollNo}`);
      try {
        const response = await fetch(`http://localhost:8080/api/student/cocurricular/${rollNo}?title=${encodeURIComponent(title)}`, {
          method: "DELETE",
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error(`Delete failed: ${response.status}`);

        setActivities(prev => prev.filter(activity => activity.title !== title));

      } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Failed to delete activity. Please try again.');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'club',
      certificate: null,
      certificateName: '',
      date: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  // Helper to open the saved document in a new tab
  const handleViewCertificate = (certificatePath) => {
    if (!certificatePath || typeof certificatePath !== 'string') {
      alert("Please submit the activity first to view the certificate.");
      return;
    }
    window.open(`http://localhost:8080/${certificatePath}`, '_blank');
  };

  // Color classes for activity types
  const getColorClasses = (color) => {
    const colorMap = {
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      red: 'bg-red-100 text-red-800 border-red-300',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      green: 'bg-green-100 text-green-800 border-green-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300',
      purple: 'bg-purple-100 text-purple-800 border-purple-300',
      pink: 'bg-pink-100 text-pink-800 border-pink-300',
      gray: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">Co-Curricular Activities</h3>
          <p className="text-gray-500">Document your achievements and participation</p>
        </div>

        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Activity
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            {editingId ? 'Edit Activity' : 'Add New Activity'}
          </h4>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Activity Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., IEEE Student Chapter - Core Member"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
              />
            </div>

            {/* Activity Type */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Activity Type *
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {activityTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => handleInputChange('type', type.value)}
                    className={`
                      px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all duration-200
                      flex items-center justify-center gap-2
                      ${formData.type === type.value
                        ? getColorClasses(type.color) + ' shadow-md'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                      }
                    `}
                  >
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your role, achievements, and key learnings..."
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length} characters
              </p>
            </div>

            {/* Certificate Upload */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Certificate (Optional)
              </label>

              {!formData.certificateName ? (
                <div className="relative">
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleCertificateUpload}
                    className="hidden"
                    id="certificate-upload"
                  />
                  <label
                    htmlFor="certificate-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200"
                  >
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-gray-600 font-medium">Upload Certificate (PDF or Image)</span>
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border-2 border-green-300">
                  <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">{formData.certificateName}</p>
                      <p className="text-xs text-gray-500">Certificate selected</p>
                    </div>
                  </div>
                  <button
                    onClick={removeCertificate}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Remove certificate"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={editingId ? handleSaveEdit : handleAddActivity}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors duration-200"
              >
                {editingId ? 'Save Changes' : 'Add Activity'}
              </button>
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-lg font-bold transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activities List */}
      {activities.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-lg font-medium">No activities added yet</p>
          <p className="text-gray-400 text-sm mt-2">Click "Add Activity" to document your achievements</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map(activity => {
            const activityType = getActivityType(activity.type);

            return (
              <div
                key={activity.id}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-bold text-gray-900">{activity.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 flex items-center gap-1 ${getColorClasses(activityType.color)}`}>
                        <span>{activityType.icon}</span>
                        <span>{activityType.label}</span>
                      </span>
                    </div>
                    {activity.date && (
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(activity.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {/* <button
                      onClick={() => handleEditActivity(activity)}
                      className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors duration-200"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button> */}
                    <button
                      onClick={() => handleDeleteActivity(activity.title)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-4 leading-relaxed">{activity.description}</p>

                {/* Certificate Badge & View Button */}
                {activity.certificateName && (
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200 w-fit">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Certificate: {activity.certificateName}</span>
                    </div>

                    {/* Only show "View" if it's a fetched string from the DB, not a pending File upload */}
                    {typeof activity.certificate === 'string' && (
                      <button
                        onClick={() => handleViewCertificate(activity.certificate, activity.certificateName)}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 underline transition-colors"
                      >
                        View Document
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Button */}
      {activities.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-[1.02] shadow-lg">
            Submit All Activities for Verification
          </button>
        </div>
      )}
    </div>
  );
};