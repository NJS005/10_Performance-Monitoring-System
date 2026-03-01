import React, { useState, useEffect } from 'react';

/** * Attendance Tracker Component * * Implements timetable-based attendance tracking with two batch options: * - Morning Batch (Institute Slots 1) * - Evening Batch (Institute Slots 2) * * Features: * - Visual timetable layout with proportional slot sizing * - Editable course names for each slot (edit mode only) * - Enable/disable courses (edit mode only) * - Custom attendance percentage requirements per course (edit mode only) * - Present/Absent marking * - Attendance percentage calculation * - Warning/danger states for attendance shortage */

// Time slot definitions with durations in hours
const TIME_SLOTS_MORNING = [
  { time: '08:00-09:00', duration: 1 },
  { time: '09:00-10:00', duration: 1 },
  { time: '10:00-11:00', duration: 1 },
  { time: '11:00-12:00', duration: 1 },
  { time: '12:00-01:00', duration: 1 },
  { time: '01:00-02:00', duration: 1 },
  { time: '02:00-05:00', duration: 3 },
  { time: '05:00-06:00', duration: 1 }
];

const TIME_SLOTS_EVENING = [
  { time: '08:00-09:00', duration: 1 },
  { time: '09:00-12:00', duration: 3 },
  { time: '12:00-01:00', duration: 1 },
  { time: '01:00-02:00', duration: 1 },
  { time: '02:00-03:00', duration: 1 },
  { time: '03:00-04:00', duration: 1 },
  { time: '04:00-05:00', duration: 1 },
  { time: '05:00-06:00', duration: 1 }
];

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

// Simplified timetable structure for Morning Batch
const DEFAULT_MORNING_TIMETABLE = {
  MON: ['F', 'A1', 'B1', 'C1', 'D1', 'BREAK', 'P1', 'G'],
  TUE: ['H', 'B1', 'C1', 'D1', 'E1', 'BREAK', 'Q1', 'F'],
  WED: ['G', 'C1', 'D1', 'E1', 'A1', 'BREAK', 'R1', 'H'],
  THU: ['F', 'D1', 'E1', 'A1', 'B1', 'BREAK', 'S1', 'G'],
  FRI: ['H', 'E1', 'A1', 'B1', 'C1', 'BREAK', 'T1', 'F']
};

// Simplified timetable structure for Evening Batch
const DEFAULT_EVENING_TIMETABLE = {
  MON: ['F', 'P2', 'BREAK', 'D2', 'A2', 'B2', 'C2', 'G'],
  TUE: ['H', 'Q2', 'BREAK', 'E2', 'B2', 'C2', 'D2', 'F'],
  WED: ['G', 'R2', 'BREAK', 'A2', 'C2', 'D2', 'E2', 'H'],
  THU: ['F', 'S2', 'BREAK', 'B2', 'D2', 'E2', 'A2', 'G'],
  FRI: ['H', 'T2', 'BREAK', 'C2', 'E2', 'A2', 'B2', 'F']
};

// Helper function to get current week's dates
const getWeekDates = () => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Calculate offset to get to Monday
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  
  const dates = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + mondayOffset + i);
    dates.push(date);
  }
  
  return dates;
};

// Format date as "DD/MM"
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
};

export const AttendanceTracker = ({ courses }) => {
  const [selectedBatch, setSelectedBatch] = useState('morning');
  const [timetable, setTimetable] = useState({});
  const [attendanceData, setAttendanceData] = useState({});
  const [courseSettings, setCourseSettings] = useState({});
  const [isEditingTimetable, setIsEditingTimetable] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [weekDates, setWeekDates] = useState([]);

  const TIME_SLOTS = selectedBatch === 'morning' ? TIME_SLOTS_MORNING : TIME_SLOTS_EVENING;

  // Initialize week dates
  useEffect(() => {
    setWeekDates(getWeekDates());
  }, []);

  // Initialize timetable and attendance data
  useEffect(() => {
    const defaultTimetable = selectedBatch === 'morning' ? DEFAULT_MORNING_TIMETABLE : DEFAULT_EVENING_TIMETABLE;
    const initialTimetable = {};
    const initialAttendance = {};

    DAYS.forEach(day => {
      initialTimetable[day] = [...defaultTimetable[day]];
      initialAttendance[day] = Array(10).fill(null).map(() => ({ attended: 0, total: 0 }));
    });

    setTimetable(initialTimetable);
    setAttendanceData(initialAttendance);

    // Initialize course settings
    initializeCourseSettings(initialTimetable);
  }, [selectedBatch]);

  // Initialize course settings (enabled status and required percentage)
  const initializeCourseSettings = (tt) => {
    const uniqueCourses = new Set();
    DAYS.forEach(day => {
      tt[day]?.forEach(slot => {
        if (slot && slot !== 'BREAK' && slot.trim() !== '') {
          uniqueCourses.add(slot);
        }
      });
    });

    const settings = {};
    uniqueCourses.forEach(course => {
      if (!courseSettings[course]) {
        settings[course] = { enabled: true, requiredPercentage: 75, displayName: course };
      } else {
        settings[course] = courseSettings[course];
      }
    });

    setCourseSettings(settings);
  };

  // Update timetable cell
  const updateTimetableCell = (day, slotIndex, value) => {
    const newTimetable = { ...timetable };
    const oldValue = newTimetable[day][slotIndex];
    newTimetable[day][slotIndex] = value;
    setTimetable(newTimetable);

    // Update course settings if new course added
    if (value && value !== 'BREAK' && value.trim() !== '' && !courseSettings[value]) {
      setCourseSettings(prev => ({
        ...prev,
        [value]: { enabled: true, requiredPercentage: 75, displayName: value }
      }));
    }
  };

  // Toggle attendance for a slot
  const toggleAttendance = (day, slotIndex) => {
    const course = timetable[day][slotIndex];
    if (!course || course === 'BREAK' || course.trim() === '' || !courseSettings[course]?.enabled) {
      return;
    }

    const newAttendanceData = { ...attendanceData };
    const slot = newAttendanceData[day][slotIndex];

    if (slot.total === 0) {
      slot.total = 1;
      slot.attended = 1;
    } else if (slot.attended === slot.total) {
      slot.attended = 0;
    } else {
      slot.total = 0;
      slot.attended = 0;
    }

    setAttendanceData(newAttendanceData);
  };

  // Toggle course enabled/disabled
  const toggleCourseEnabled = (course) => {
    if (!isEditingTimetable) return;

    setCourseSettings(prev => ({
      ...prev,
      [course]: { ...prev[course], enabled: !prev[course].enabled }
    }));
  };

  // Update course required percentage
  const updateRequiredPercentage = (course, percentage) => {
    if (!isEditingTimetable) return;

    const validPercentage = Math.max(0, Math.min(100, parseInt(percentage) || 0));
    setCourseSettings(prev => ({
      ...prev,
      [course]: { ...prev[course], requiredPercentage: validPercentage }
    }));
  };

  // Update course display name
  const updateCourseDisplayName = (course, newName) => {
    if (!isEditingTimetable) return;

    setCourseSettings(prev => ({
      ...prev,
      [course]: { ...prev[course], displayName: newName }
    }));
  };

  // Calculate attendance percentage for a course
  const calculateCourseAttendance = (slotCode) => {
    let totalClasses = 0;
    let attendedClasses = 0;

    DAYS.forEach(day => {
      timetable[day]?.forEach((slot, index) => {
        if (slot === slotCode) {
          totalClasses += attendanceData[day][index].total;
          attendedClasses += attendanceData[day][index].attended;
        }
      });
    });

    const percentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 100;
    const required = courseSettings[slotCode]?.requiredPercentage || 75;

    return {
      percentage: percentage.toFixed(1),
      attended: attendedClasses,
      total: totalClasses,
      shortage: percentage < required,
      required: required
    };
  };

  // Get attendance status for rendering
  const getAttendanceStatus = (day, slotIndex) => {
    const course = timetable[day]?.[slotIndex];
    const data = attendanceData[day]?.[slotIndex];

    if (!course || course === 'BREAK' || course.trim() === '') return 'break';
    if (!courseSettings[course]?.enabled) return 'disabled';
    if (!data || data.total === 0) return 'none';
    if (data.attended === data.total) return 'present';
    return 'absent';
  };

  // Status color classes
  const statusColors = {
    none: 'bg-gray-100 border-gray-300',
    present: 'bg-green-100 border-green-400',
    absent: 'bg-red-100 border-red-400',
    break: 'bg-gray-200 border-gray-400',
    disabled: 'bg-gray-300 border-gray-500'
  };

  // Get unique courses from timetable (filter out disabled courses when not editing)
  const getUniqueCourses = () => {
    const uniqueSlots = new Set();
    DAYS.forEach(day => {
      timetable[day]?.forEach(slot => {
        if (slot && slot !== 'BREAK' && slot.trim() !== '') {
          uniqueSlots.add(slot);
        }
      });
    });
    
    const coursesArray = Array.from(uniqueSlots).sort();
    
    // Filter out disabled courses if not in edit mode
    if (!isEditingTimetable) {
      return coursesArray.filter(course => courseSettings[course]?.enabled !== false);
    }
    
    return coursesArray;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Attendance Tracker</h2>
        <p className="text-gray-600">Timetable-based attendance monitoring</p>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        {/* Edit Timetable Button */}
        <button
          onClick={() => setIsEditingTimetable(!isEditingTimetable)}
          className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
            isEditingTimetable
              ? 'bg-green-600 text-white hover:bg-green-700 transition-smooth duration-300'
              : 'bg-gray-600 text-white hover:bg-gray-700 transition-smooth duration-300'
          }`}
        >
          {isEditingTimetable ? 'Done Editing' : 'Edit Timetable'}
        </button>

        {/* Batch Selector */}
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedBatch('morning')}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedBatch === 'morning'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Morning
          </button>
          <button
            onClick={() => setSelectedBatch('evening')}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedBatch === 'evening'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Evening
          </button>
        </div>
      </div>

      {/* Course Settings Panel */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Settings</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {getUniqueCourses().map(course => {
            const settings = courseSettings[course] || { enabled: true, requiredPercentage: 75, displayName: course };
            const attendance = calculateCourseAttendance(course);

            return (
              <div
                key={course}
                className={`p-2 rounded-lg border-2 transition-all ${
                  settings.enabled
                    ? attendance.shortage
                      ? attendance.percentage >= 85
                        ? 'bg-green-50 border-green-300'
                        : 'bg-yellow-50 border-yellow-300'
                      : 'bg-gray-100 border-gray-300 opacity-60'
                    : 'bg-gray-100 border-gray-300 opacity-60'
                }`}
              >
                {/* Course Name - Editable only in edit mode */}
                <div className="mb-1.5">
                  <input
                    type="text"
                    value={settings.displayName}
                    onChange={(e) => updateCourseDisplayName(course, e.target.value)}
                    disabled={!isEditingTimetable}
                    className={`w-full font-bold text-xs text-gray-900 bg-white px-1.5 py-0.5 rounded border border-gray-300 focus:border-indigo-500 focus:outline-none ${
                      !isEditingTimetable ? 'cursor-not-allowed bg-gray-50' : ''
                    }`}
                    placeholder="Course name"
                  />
                  <div className="text-[10px] text-gray-500 mt-0.5">Slot: {course}</div>
                </div>

                {/* Attendance Display */}
                <div className="mb-1.5">
                  <div
                    className={`text-xl font-bold ${
                      attendance.shortage ? 'text-red-600' : attendance.percentage >= 85 ? 'text-green-700' : 'text-yellow-700'
                    }`}
                  >
                    {attendance.percentage}%
                  </div>
                  <div className="text-[10px] text-gray-600">{attendance.attended}/{attendance.total} classes</div>
                </div>

                {/* Required Percentage Input - Editable only in edit mode */}
                <div className="mb-1.5">
                  <label className="text-[10px] text-gray-600 block mb-0.5">Required %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.requiredPercentage}
                    onChange={(e) => updateRequiredPercentage(course, e.target.value)}
                    disabled={!isEditingTimetable}
                    className={`w-full px-1.5 py-0.5 border border-gray-300 rounded text-xs focus:border-indigo-500 focus:outline-none ${
                      !isEditingTimetable ? 'cursor-not-allowed bg-gray-50' : ''
                    }`}
                  />
                </div>

                {/* Enable/Disable Toggle - Only works in edit mode */}
                <button
                  onClick={() => toggleCourseEnabled(course)}
                  disabled={!isEditingTimetable}
                  className={`w-full py-1 rounded-lg font-medium text-[10px] transition-all duration-200 ${
                    !isEditingTimetable
                      ? 'bg-gray-400 cursor-not-allowed text-white hidden transition-smooth duration-300'
                      : settings.enabled
                      ? 'bg-red-600 hover:bg-red-700 text-white transition-smooth duration-300'
                      : 'bg-green-600 hover:bg-green-700 text-white transition-smooth duration-300'
                  }`}
                >
                  {settings.enabled ? 'Disable Course' : 'Enable Course'}
                </button>

                {/* Shortage Warning */}
                {settings.enabled && attendance.shortage && (
                  <div className="mt-1.5 p-1 bg-red-100 border border-red-300 rounded text-[10px] text-red-700 font-medium">
                    ⚠ Below {settings.requiredPercentage}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header Row */}
          <div className="flex border-b-2 border-gray-300 bg-gray-100">
            <div className="w-24 flex-shrink-0 p-2 font-bold text-center border-r-2 border-gray-300">
              DAY
            </div>
            {TIME_SLOTS.map((slot, index) => (
              <div
                key={index}
                className="p-2 text-center font-semibold text-sm border-r border-gray-200"
                style={{ flex: slot.duration }}
              >
                {slot.time.split('-')[0]}
              </div>
            ))}
          </div>

          {/* Timetable Rows */}
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="flex border-b border-gray-200 hover:bg-gray-50">
              {/* Day Label with Date */}
              <div className="w-24 flex-shrink-0 p-2 font-bold text-center border-r-2 border-gray-300 bg-gray-50">
                <div>{day}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {weekDates[dayIndex] ? formatDate(weekDates[dayIndex]) : ''}
                </div>
              </div>

              {/* Time Slots */}
              <div className="flex flex-1">
                {timetable[day]?.map((slot, slotIndex) => {
                  const status = getAttendanceStatus(day, slotIndex);
                  const isBreak = slot === 'BREAK';
                  const isEmpty = !slot || slot.trim() === '';
                  const isDisabled = status === 'disabled';
                  const duration = TIME_SLOTS[slotIndex]?.duration || 1;

                  return (
                    <div
                      key={slotIndex}
                      className={`p-2 border-r border-gray-200 cursor-pointer transition-all ${
                        statusColors[status]
                      } hover:opacity-80`}
                      style={{ flex: duration }}
                      onClick={() => !isEditingTimetable && !isBreak && !isEmpty && !isDisabled && toggleAttendance(day, slotIndex)}
                    >
                      {isEditingTimetable ? (
                        <input
                          type="text"
                          value={slot}
                          onChange={(e) => updateTimetableCell(day, slotIndex, e.target.value.toUpperCase())}
                          className="w-full h-full text-center font-bold text-sm border-2 border-indigo-400 rounded focus:outline-none focus:border-indigo-600"
                          placeholder="Slot"
                        />
                      ) : (
                        <>
                          <div className="text-center font-bold text-sm">
                            {isBreak ? '🍽️' : courseSettings[slot]?.displayName || slot}
                          </div>
                          {!isBreak && !isEmpty && !isDisabled && status !== 'none' && (
                            <div className={`text-xs text-center mt-1 font-semibold ${status === 'present' ? 'text-green-700' : 'text-red-700'}`}>
                              {status === 'present' ? '✓ P' : '✗ A'}
                            </div>
                          )}
                          {isDisabled && (
                            <div className="text-xs text-center mt-1 text-gray-600 font-medium">Disabled</div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 border-2 border-green-400 rounded"></div>
          <span>Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-100 border-2 border-red-400 rounded"></div>
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-100 border-2 border-gray-300 rounded"></div>
          <span>Not Marked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 border-2 border-gray-400 rounded"></div>
          <span>Break</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-300 border-2 border-gray-500 rounded"></div>
          <span>Disabled</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>How to use:</strong> Click "Edit Timetable" to customize course slots, rename courses, set required percentages, and enable/disable courses. Click on any time slot to mark attendance (present → absent → reset). Course settings can only be modified in edit mode.
        </p>
      </div>
    </div>
  );
};