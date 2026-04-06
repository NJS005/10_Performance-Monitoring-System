import React, { useState, useEffect } from 'react';

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

const DEFAULT_MORNING_TIMETABLE = {
  MON: ['F', 'A1', 'B1', 'C1', 'D1', 'BREAK', 'P1', 'G'],
  TUE: ['H', 'B1', 'C1', 'D1', 'E1', 'BREAK', 'Q1', 'F'],
  WED: ['G', 'C1', 'D1', 'E1', 'A1', 'BREAK', 'R1', 'H'],
  THU: ['F', 'D1', 'E1', 'A1', 'B1', 'BREAK', 'S1', 'G'],
  FRI: ['H', 'E1', 'A1', 'B1', 'C1', 'BREAK', 'T1', 'F']
};

const DEFAULT_EVENING_TIMETABLE = {
  MON: ['F', 'P2', 'BREAK', 'D2', 'A2', 'B2', 'C2', 'G'],
  TUE: ['H', 'Q2', 'BREAK', 'E2', 'B2', 'C2', 'D2', 'F'],
  WED: ['G', 'R2', 'BREAK', 'A2', 'C2', 'D2', 'E2', 'H'],
  THU: ['F', 'S2', 'BREAK', 'B2', 'D2', 'E2', 'A2', 'G'],
  FRI: ['H', 'T2', 'BREAK', 'C2', 'E2', 'A2', 'B2', 'F']
};

const getWeekDates = () => {
  const today = new Date();
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const dates = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + mondayOffset + i);
    dates.push(date);
  }
  return dates;
};

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
};

const getTodayDayName = () => {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[new Date().getDay()];
};

export const AttendanceTracker = ({ courses, rollNo }) => {
  const [selectedBatch, setSelectedBatch] = useState('morning');
  const [timetable, setTimetable] = useState({});
  const [attendanceData, setAttendanceData] = useState({});
  const [courseSettings, setCourseSettings] = useState({});
  const [isEditingTimetable, setIsEditingTimetable] = useState(false);
  const [weekDates, setWeekDates] = useState([]);
  const [dbRecordsMap, setDbRecordsMap] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  // Mobile: which day card is expanded
  const [expandedDay, setExpandedDay] = useState(null);

  const TIME_SLOTS = selectedBatch === 'morning' ? TIME_SLOTS_MORNING : TIME_SLOTS_EVENING;
  const todayDay = getTodayDayName();

  useEffect(() => {
    setWeekDates(getWeekDates());
    // Auto-expand today on mobile
    setExpandedDay(todayDay);
  }, []);

  useEffect(() => {
    const defaultTimetable =
      selectedBatch === 'morning' ? DEFAULT_MORNING_TIMETABLE : DEFAULT_EVENING_TIMETABLE;
    const initialTimetable = {};
    const initialAttendance = {};
    DAYS.forEach(day => {
      initialTimetable[day] = [...defaultTimetable[day]];
      initialAttendance[day] = Array(10).fill(null).map(() => ({ attended: 0, total: 0 }));
    });
    setTimetable(initialTimetable);
    setAttendanceData(initialAttendance);
    initializeCourseSettings(initialTimetable);
  }, [selectedBatch]);

  const initializeCourseSettings = (tt) => {
    const uniqueCourses = new Set();
    DAYS.forEach(day => {
      tt[day]?.forEach(slot => {
        if (slot && slot !== 'BREAK' && slot.trim() !== '') uniqueCourses.add(slot);
      });
    });
    const settings = {};
    uniqueCourses.forEach(course => {
      settings[course] = courseSettings[course] || {
        enabled: true,
        requiredPercentage: 75,
        displayName: course
      };
    });
    setCourseSettings(settings);
  };

  const updateTimetableCell = (day, slotIndex, value) => {
    const newTimetable = { ...timetable };
    newTimetable[day][slotIndex] = value;
    setTimetable(newTimetable);
    if (value && value !== 'BREAK' && value.trim() !== '' && !courseSettings[value]) {
      setCourseSettings(prev => ({
        ...prev,
        [value]: { enabled: true, requiredPercentage: 75, displayName: value }
      }));
    }
  };

  useEffect(() => {
    if (!rollNo || Object.keys(timetable).length === 0) return;
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/student/attendance/${rollNo}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          const recordsBySlot = {};
          data.forEach(record => { recordsBySlot[record.slot] = record; });
          setDbRecordsMap(recordsBySlot);

          const newAttendance = {};
          DAYS.forEach(day => {
            newAttendance[day] = Array(10).fill(null).map(() => ({ attended: 0, total: 0 }));
          });
          data.forEach(record => {
            timetable[todayDay]?.forEach((slot, index) => {
              if (slot === record.slot) {
                newAttendance[todayDay][index] = {
                  attended: record.attendedClasses,
                  total: record.totalClasses
                };
              }
            });
          });
          setAttendanceData(newAttendance);
          setCourseSettings(prev => {
            const updated = { ...prev };
            data.forEach(record => {
              if (updated[record.slot]) {
                updated[record.slot] = {
                  ...updated[record.slot],
                  displayName: record.courseName || record.slot,
                  requiredPercentage: record.attendanceRequirement ?? updated[record.slot].requiredPercentage,
                  enabled: record.isEnabled === 0 ? false : (updated[record.slot].enabled ?? true)
                };
              }
            });
            return updated;
          });
        }
      } catch (err) {
        console.error('Failed to fetch attendance', err);
      }
    };
    fetchAttendance();
  }, [timetable, rollNo]);

  const toggleAttendance = (day, slotIndex) => {
    const course = timetable[day][slotIndex];
    if (!course || course === 'BREAK' || course.trim() === '' || !courseSettings[course]?.enabled) return;
    if (day !== todayDay) return;
    const newAttendanceData = { ...attendanceData };
    const slot = newAttendanceData[day][slotIndex];
    if (slot.total === 0) { slot.total = 1; slot.attended = 1; }
    else if (slot.attended === slot.total) { slot.attended = 0; }
    else { slot.total = 0; slot.attended = 0; }
    setAttendanceData(newAttendanceData);
  };

  const toggleCourseEnabled = (course) => {
    if (!isEditingTimetable) return;
    setCourseSettings(prev => ({
      ...prev,
      [course]: { ...prev[course], enabled: !prev[course].enabled }
    }));
  };

  const updateRequiredPercentage = (course, percentage) => {
    if (!isEditingTimetable) return;
    const validPercentage = Math.max(0, Math.min(100, parseInt(percentage) || 0));
    setCourseSettings(prev => ({
      ...prev,
      [course]: { ...prev[course], requiredPercentage: validPercentage }
    }));
  };

  const updateCourseDisplayName = (course, newName) => {
    if (!isEditingTimetable) return;
    setCourseSettings(prev => ({
      ...prev,
      [course]: { ...prev[course], displayName: newName }
    }));
  };

  const calculateCourseAttendance = (slotCode) => {
    let totalClasses = 0, attendedClasses = 0;
    DAYS.forEach(day => {
      timetable[day]?.forEach((slot, index) => {
        if (slot === slotCode) {
          totalClasses += attendanceData[day]?.[index]?.total || 0;
          attendedClasses += attendanceData[day]?.[index]?.attended || 0;
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
      required
    };
  };

  const getAttendanceStatus = (day, slotIndex) => {
    const course = timetable[day]?.[slotIndex];
    const data = attendanceData[day]?.[slotIndex];
    if (!course || course === 'BREAK' || course.trim() === '') return 'break';
    if (!courseSettings[course]?.enabled) return 'disabled';
    if (day !== todayDay) return 'other_day';
    if (!data || data.total === 0) return 'none';
    if (data.attended === data.total) return 'present';
    return 'absent';
  };

  const statusColors = {
    none: 'bg-gray-100 border-gray-300',
    present: 'bg-green-100 border-green-400',
    absent: 'bg-red-100 border-red-400',
    break: 'bg-gray-200 border-gray-400',
    disabled: 'bg-gray-300 border-gray-500',
    other_day: 'bg-gray-50 border-gray-200 opacity-50'
  };

  // Mobile status colors (pill-style)
  const mobileStatusStyle = {
    none: 'bg-gray-100 border border-gray-300 text-gray-600',
    present: 'bg-green-100 border border-green-400 text-green-800',
    absent: 'bg-red-100 border border-red-400 text-red-800',
    break: 'bg-gray-200 border border-gray-300 text-gray-500',
    disabled: 'bg-gray-200 border border-gray-400 text-gray-400',
    other_day: 'bg-gray-50 border border-gray-200 text-gray-400'
  };

  const findSem = (rollNo) => {
    const joinYear = 2000 + parseInt(rollNo.substring(1, 3));
    if (isNaN(joinYear)) return 1;
    const now = new Date();
    const currentYear = now.getFullYear();
    const month = now.getMonth() + 1;
    let sem = (currentYear - joinYear) * 2;
    if (month >= 7) sem += 1;
    return Math.max(1, sem);
  };

  const getUniqueCourses = () => {
    const uniqueSlots = new Set();
    DAYS.forEach(day => {
      timetable[day]?.forEach(slot => {
        if (slot && slot !== 'BREAK' && slot.trim() !== '') uniqueSlots.add(slot);
      });
    });
    const coursesArray = Array.from(uniqueSlots).sort();
    if (!isEditingTimetable) {
      return coursesArray.filter(course => courseSettings[course]?.enabled !== false);
    }
    return coursesArray;
  };

  const saveAttendance = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    const courseTotals = {};
    DAYS.forEach(day => {
      timetable[day]?.forEach((slot, index) => {
        if (!slot || slot === 'BREAK') return;
        if (!courseTotals[slot]) courseTotals[slot] = { attended: 0, total: 0 };
        courseTotals[slot].attended += attendanceData[day]?.[index]?.attended || 0;
        courseTotals[slot].total += attendanceData[day]?.[index]?.total || 0;
      });
    });
    const sem = findSem(rollNo);
    const payload = Object.keys(courseTotals)
      .filter(slot => {
        const t = courseTotals[slot];
        return t.attended != null && t.total != null;
      })
      .map(slot => {
        const existing = dbRecordsMap[slot];
        return {
          ...(existing?.id !== undefined ? { id: existing.id } : {}),
          rollNo,
          slot,
          courseName: courseSettings[slot]?.displayName || slot,
          semester: sem,
          attendanceRequirement: courseSettings[slot]?.requiredPercentage ?? 75,
          attendedClasses: Number(courseTotals[slot].attended) || 0,
          totalClasses: Number(courseTotals[slot].total) || 0,
          isEnabled: courseSettings[slot]?.enabled === false ? 0 : 1
        };
      });

    const todayClasses = [];
    const tday = getTodayDayName();
    timetable[tday]?.forEach((slot, index) => {
      if (slot && slot !== 'BREAK' && slot.trim() !== '') {
        const data = attendanceData[tday]?.[index];
        todayClasses.push(data && data.total > 0 ? data.attended === data.total : null);
      }
    });
    while (todayClasses.length < 6) todayClasses.push(null);
    const dailyPayload = {
      slot1: todayClasses[0], slot2: todayClasses[1], slot3: todayClasses[2],
      slot4: todayClasses[3], slot5: todayClasses[4], slot6: todayClasses[5]
    };

    try {
      const res = await fetch(`http://localhost:8080/api/student/attendance/${rollNo}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Save failed');
      await fetch(`http://localhost:8080/api/student/daily-attendance/${rollNo}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dailyPayload)
      });
      const saved = await res.json().catch(() => null);
      if (Array.isArray(saved)) {
        const updatedMap = {};
        saved.forEach(record => { updatedMap[record.slot] = record; });
        setDbRecordsMap(updatedMap);
      }
      setSaveStatus('success');
    } catch (err) {
      console.error('Failed to save attendance', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 bg-white rounded-xl shadow-lg">

      {/* ── Header ── */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Attendance Tracker</h2>
        <p className="text-sm sm:text-base text-gray-600">Timetable-based attendance monitoring</p>
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-between items-center mb-4 sm:mb-6">
        <button
          onClick={() => setIsEditingTimetable(!isEditingTimetable)}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm min-h-[44px] ${
            isEditingTimetable
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          {isEditingTimetable ? '✓ Done Editing' : '✎ Edit Timetable'}
        </button>

        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setSelectedBatch('morning')}
            className={`px-4 sm:px-6 py-2 font-medium transition-all duration-200 text-sm min-h-[44px] ${
              selectedBatch === 'morning'
                ? 'bg-indigo-600 text-white shadow-inner'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            ☀ Morning
          </button>
          <button
            onClick={() => setSelectedBatch('evening')}
            className={`px-4 sm:px-6 py-2 font-medium transition-all duration-200 text-sm min-h-[44px] border-l border-gray-200 ${
              selectedBatch === 'evening'
                ? 'bg-indigo-600 text-white shadow-inner'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            🌙 Evening
          </button>
        </div>
      </div>

      {/* ── Course Settings Panel ── */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Course Settings</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {getUniqueCourses().map(course => {
            const settings = courseSettings[course] || { enabled: true, requiredPercentage: 75, displayName: course };
            const attendance = calculateCourseAttendance(course);
            return (
              <div
                key={course}
                className={`p-2 rounded-lg border-2 transition-all ${
                  settings.enabled
                    ? attendance.shortage
                      ? 'bg-yellow-50 border-yellow-300'
                      : 'bg-green-50 border-green-300'
                    : 'bg-gray-100 border-gray-300 opacity-60'
                }`}
              >
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
                <div className="mb-1.5">
                  <div className={`text-xl font-bold ${
                    attendance.shortage ? 'text-red-600' : 'text-green-700'
                  }`}>
                    {attendance.percentage}%
                  </div>
                  <div className="text-[10px] text-gray-600">{attendance.attended}/{attendance.total} classes</div>
                </div>
                <div className="mb-1.5">
                  <label className="text-[10px] text-gray-600 block mb-0.5">Required %</label>
                  <input
                    type="number"
                    min="0" max="100"
                    value={settings.requiredPercentage}
                    onChange={(e) => updateRequiredPercentage(course, e.target.value)}
                    disabled={!isEditingTimetable}
                    className={`w-full px-1.5 py-0.5 border border-gray-300 rounded text-xs focus:border-indigo-500 focus:outline-none ${
                      !isEditingTimetable ? 'cursor-not-allowed bg-gray-50' : ''
                    }`}
                  />
                </div>
                {isEditingTimetable && (
                  <button
                    onClick={() => toggleCourseEnabled(course)}
                    className={`w-full py-1 rounded-lg font-medium text-[10px] transition-all duration-200 ${
                      settings.enabled
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {settings.enabled ? 'Disable' : 'Enable'}
                  </button>
                )}
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

      {/* ══════════════════════════════════════════════════════
          TIMETABLE — Mobile: vertical cards  |  Desktop: grid
          ══════════════════════════════════════════════════════ */}

      {/* ── MOBILE timetable (< md) ── */}
      <div className="md:hidden space-y-3 mb-4">
        {DAYS.map((day, dayIndex) => {
          const isToday = day === todayDay;
          const isExpanded = expandedDay === day;

          return (
            <div
              key={day}
              className={`rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                isToday
                  ? 'border-indigo-400 shadow-md shadow-indigo-100'
                  : 'border-gray-200'
              }`}
            >
              {/* Day header — tap to expand */}
              <button
                className={`w-full flex items-center justify-between px-4 py-3 text-left min-h-[52px] transition-colors ${
                  isToday ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setExpandedDay(isExpanded ? null : day)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-base">{day}</span>
                  {isToday && (
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Today
                    </span>
                  )}
                  {weekDates[dayIndex] && (
                    <span className={`text-xs ${isToday ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {formatDate(weekDates[dayIndex])}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Slots list — shown when expanded */}
              {isExpanded && (
                <div className="divide-y divide-gray-100">
                  {timetable[day]?.map((slot, slotIndex) => {
                    const status = getAttendanceStatus(day, slotIndex);
                    const isBreak = slot === 'BREAK';
                    const isEmpty = !slot || slot.trim() === '';
                    const isDisabled = status === 'disabled';
                    const isOtherDay = status === 'other_day';
                    const timeSlot = TIME_SLOTS[slotIndex];
                    const canTap = isToday && !isBreak && !isEmpty && !isDisabled && !isEditingTimetable;

                    return (
                      <div
                        key={slotIndex}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                          canTap ? 'cursor-pointer active:bg-gray-50' : ''
                        } ${isBreak ? 'bg-gray-50' : ''}`}
                        onClick={() => canTap && toggleAttendance(day, slotIndex)}
                      >
                        {/* Time label */}
                        <div className="flex-shrink-0 w-28">
                          <span className="text-xs font-mono text-gray-500">{timeSlot?.time}</span>
                          {timeSlot?.duration > 1 && (
                            <span className="ml-1 text-[10px] text-indigo-400">×{timeSlot.duration}h</span>
                          )}
                        </div>

                        {/* Slot content */}
                        {isEditingTimetable ? (
                          <input
                            type="text"
                            value={slot}
                            onChange={(e) => updateTimetableCell(day, slotIndex, e.target.value.toUpperCase())}
                            className="flex-1 text-center font-bold text-sm border-2 border-indigo-400 rounded px-2 py-1 focus:outline-none focus:border-indigo-600"
                            placeholder="Slot"
                          />
                        ) : (
                          <div className="flex-1 flex items-center justify-between gap-2">
                            <span className={`font-semibold text-sm ${
                              isBreak ? 'text-gray-400' :
                              isOtherDay ? 'text-gray-400' :
                              isDisabled ? 'text-gray-400' :
                              'text-gray-800'
                            }`}>
                              {isBreak ? '🍽️ Break' : courseSettings[slot]?.displayName || slot}
                            </span>

                            {/* Status badge */}
                            {!isBreak && !isEmpty && (
                              <span className={`flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${mobileStatusStyle[status]}`}>
                                {status === 'present' && '✓ Present'}
                                {status === 'absent' && '✗ Absent'}
                                {status === 'none' && isToday && 'Tap to mark'}
                                {status === 'none' && !isToday && 'Not marked'}
                                {status === 'disabled' && 'Disabled'}
                                {status === 'other_day' && '—'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── DESKTOP timetable (≥ md) ── */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 mb-4 sm:mb-6">
        <div className="inline-block min-w-full">
          {/* Header Row */}
          <div className="flex border-b-2 border-gray-300 bg-gray-100">
            <div className="w-20 lg:w-24 flex-shrink-0 p-2 font-bold text-center text-xs lg:text-sm border-r-2 border-gray-300 flex items-center justify-center">
              DAY
            </div>
            {TIME_SLOTS.map((slot, index) => (
              <div
                key={index}
                className="p-1.5 lg:p-2 text-center font-semibold text-xs border-r border-gray-200"
                style={{ flex: slot.duration, minWidth: `${slot.duration * 52}px` }}
              >
                <div>{slot.time.split('-')[0]}</div>
                {slot.duration > 1 && (
                  <div className="text-[9px] text-indigo-500 font-normal">({slot.duration}h)</div>
                )}
              </div>
            ))}
          </div>

          {/* Day Rows */}
          {DAYS.map((day, dayIndex) => {
            const isToday = day === todayDay;
            return (
              <div
                key={day}
                className={`flex border-b border-gray-200 ${isToday ? 'bg-indigo-50/40' : 'hover:bg-gray-50/60'}`}
              >
                {/* Day label */}
                <div className={`w-20 lg:w-24 flex-shrink-0 p-1.5 lg:p-2 font-bold text-center border-r-2 flex flex-col justify-center items-center gap-0.5 ${
                  isToday ? 'bg-indigo-100 border-indigo-400' : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className={`text-xs lg:text-sm font-bold ${isToday ? 'text-indigo-700' : 'text-gray-700'}`}>{day}</div>
                  {isToday && (
                    <div className="text-[9px] font-semibold text-indigo-500 uppercase tracking-wide">Today</div>
                  )}
                  <div className="text-[10px] text-gray-400">
                    {weekDates[dayIndex] ? formatDate(weekDates[dayIndex]) : ''}
                  </div>
                </div>

                {/* Slots */}
                <div className="flex flex-1">
                  {timetable[day]?.map((slot, slotIndex) => {
                    const status = getAttendanceStatus(day, slotIndex);
                    const isBreak = slot === 'BREAK';
                    const isEmpty = !slot || slot.trim() === '';
                    const isDisabled = status === 'disabled';
                    const isOtherDay = status === 'other_day';
                    const duration = TIME_SLOTS[slotIndex]?.duration || 1;

                    return (
                      <div
                        key={slotIndex}
                        className={`p-1.5 lg:p-2 border-r border-gray-200 transition-all flex flex-col items-center justify-center ${statusColors[status]} ${
                          isToday && !isBreak && !isEmpty && !isDisabled
                            ? 'cursor-pointer hover:opacity-80 active:scale-95'
                            : 'cursor-default'
                        }`}
                        style={{ flex: duration, minWidth: `${duration * 52}px` }}
                        onClick={() =>
                          !isEditingTimetable && !isBreak && !isEmpty && !isDisabled && !isOtherDay
                            ? toggleAttendance(day, slotIndex)
                            : undefined
                        }
                      >
                        {isEditingTimetable ? (
                          <input
                            type="text"
                            value={slot}
                            onChange={(e) => updateTimetableCell(day, slotIndex, e.target.value.toUpperCase())}
                            className="w-full h-full text-center font-bold text-xs border-2 border-indigo-400 rounded focus:outline-none focus:border-indigo-600 py-1"
                            placeholder="Slot"
                          />
                        ) : (
                          <>
                            <div className={`text-center font-bold text-xs ${isOtherDay ? 'text-gray-400' : ''}`}>
                              {isBreak ? '🍽️' : courseSettings[slot]?.displayName || slot}
                            </div>
                            {!isBreak && !isEmpty && !isDisabled && !isOtherDay && status !== 'none' && (
                              <div className={`text-[10px] text-center mt-0.5 font-semibold ${
                                status === 'present' ? 'text-green-700' : 'text-red-700'
                              }`}>
                                {status === 'present' ? '✓' : '✗'}
                              </div>
                            )}
                            {isDisabled && (
                              <div className="text-[9px] text-center mt-0.5 text-gray-500">Off</div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-2 sm:gap-4 justify-center text-xs sm:text-sm mb-4 sm:mb-6">
        {[
          { color: 'bg-green-100 border-green-400', label: 'Present' },
          { color: 'bg-red-100 border-red-400', label: 'Absent' },
          { color: 'bg-gray-100 border-gray-300', label: 'Not Marked' },
          { color: 'bg-gray-200 border-gray-400', label: 'Break' },
          { color: 'bg-gray-300 border-gray-500', label: 'Disabled' },
          { color: 'bg-gray-100 border-gray-200 opacity-50', label: 'Other Day' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex-shrink-0 ${color}`} />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Instructions ── */}
      <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm text-blue-900 leading-relaxed">
          <strong>How to use:</strong> Click "Edit Timetable" to customize slots, rename courses, set required percentages, and enable/disable courses.{' '}
          <span className="md:hidden">Tap a day to expand it, then tap any slot in <strong>today's</strong> row to mark attendance.</span>
          <span className="hidden md:inline">Click on any slot in <strong>today's row</strong> to mark attendance (present → absent → reset). Other days are view-only.</span>
        </p>
      </div>

      {/* ── Submit ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
        {saveStatus === 'success' && (
          <span className="text-green-600 font-medium text-sm text-center sm:text-left">
            ✓ Attendance saved successfully!
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="text-red-600 font-medium text-sm text-center sm:text-left">
            ✗ Failed to save. Please try again.
          </span>
        )}
        <button
          onClick={saveAttendance}
          disabled={isSaving}
          className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-md text-sm min-h-[48px] ${
            isSaving
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
          }`}
        >
          {isSaving ? 'Saving…' : 'Submit Attendance'}
        </button>
      </div>
    </div>
  );
};