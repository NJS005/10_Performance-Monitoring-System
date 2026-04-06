import React, { useState, useEffect } from 'react';
import icon from '../assets/edit.png'; 

export const TargetCGPACalculator = ({ currentCGPA, courses, getGradePoint }) => {
  const calculateTotalCredits = () => {
    const allCourses = [...courses.core, ...courses.elective];
    return allCourses.reduce((sum, course) => sum + course.credits, 0);
  };

  const [totalCreditsCompleted, setTotalCreditsCompleted] = useState(calculateTotalCredits());
  const [displayedCGPA, setDisplayedCGPA] = useState(currentCGPA);
  const [upcomingCredits, setUpcomingCredits] = useState(20);
  const [targetCGPA, setTargetCGPA] = useState(9.0);
  const [result, setResult] = useState(null);

 
  const calculateRequiredSGPA = () => {
   
    const currentTotalPoints = displayedCGPA * totalCreditsCompleted;
    

    const totalCreditsAfter = totalCreditsCompleted + upcomingCredits;
    
   
    const requiredTotalPoints = targetCGPA * totalCreditsAfter;
    
   
    const pointsNeeded = requiredTotalPoints - currentTotalPoints;
    
    
    const requiredSGPA = upcomingCredits > 0 ? pointsNeeded / upcomingCredits : 0;

    return {
      requiredSGPA: requiredSGPA.toFixed(2),
      isAchievable: requiredSGPA >= 0 && requiredSGPA <= 10,
      pointsNeeded: pointsNeeded.toFixed(2),
      totalCreditsAfter
    };
  };

  const handleCalculate = () => {
    const calculationResult = calculateRequiredSGPA();
    setResult(calculationResult);
  };

  
  useEffect(() => {
    if (currentCGPA > 0 && totalCreditsCompleted > 0 && upcomingCredits > 0 && targetCGPA > 0) {
      handleCalculate();
    }
  }, [displayedCGPA, totalCreditsCompleted, upcomingCredits, targetCGPA]);

  
  const getGradeRecommendation = (requiredSGPA) => {
    const sgpa = parseFloat(requiredSGPA);
    if (sgpa >= 9.5) return { grade: 'S', color: 'green', message: 'You need mostly S grades' };
    if (sgpa >= 8.5) return { grade: 'A', color: 'blue', message: 'You need mostly A grades' };
    if (sgpa >= 7.5) return { grade: 'B', color: 'cyan', message: 'You need mostly B grades' };
    if (sgpa >= 6.5) return { grade: 'C', color: 'yellow', message: 'You need mostly C grades' };
    if (sgpa >= 5.5) return { grade: 'D', color: 'orange', message: 'You need mostly D grades' };
    if (sgpa >= 4.5) return { grade: 'E', color: 'red', message: 'You need mostly E grades' };
    return { grade: 'R', color: 'rose', message: 'Minimum passing grades required' };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
   
   
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Target CGPA Calculator</h3>
        <p className="text-gray-500 dark:text-gray-400">Plan your academic performance for upcoming semesters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
     
        <div className="space-y-6">
        
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center justify-between mb-4">
              
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
              Current CGPA
            </label>    
            </div>
            <div className="flex items-baseline gap-2">
              <input
                type="number"
                value={displayedCGPA}
                step="0.01"
                max="10"
                onChange={(e) => setDisplayedCGPA(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-lg font-semibold dark:text-white"
                min="0"
              />
            </div>
          </div>

         
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
              Total Credits Completed
            </label>
            <input
              type="number"
              value={totalCreditsCompleted}
              onChange={(e) => setTotalCreditsCompleted(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-lg font-semibold dark:text-white"
              min="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Credits earned from all completed semesters</p>
          </div>

         
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
              Credits for Upcoming Semester
            </label>
            <input
              type="number"
              value={upcomingCredits}
              onChange={(e) => setUpcomingCredits(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-lg font-semibold dark:text-white"
              min="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total credits you plan to take next semester</p>
          </div>

         
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 block">
              Target CGPA
            </label>
            <input
              type="number"
              step="0.1"
              value={targetCGPA}
              onChange={(e) => setTargetCGPA(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors duration-200 text-lg font-semibold dark:text-white"
              min="0"
              max="10"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The CGPA you want to achieve (max 10.00)</p>
          </div>
        </div>

      
        <div className="flex flex-col justify-center">
          {result ? (
            <div className="space-y-6">
              {result.isAchievable ? (
                <>
               
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-300 shadow-lg">
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 text-center">
                      Required SGPA for Next Semester
                    </p>
                    <div className="text-center">
                      <span className="text-6xl font-bold text-green-700">{result.requiredSGPA}</span>
                      <p className="text-lg text-gray-600 mt-2">out of 10.00</p>
                    </div>
                  </div>

               
                  {(() => {
                    const recommendation = getGradeRecommendation(result.requiredSGPA);
                    const colorClasses = {
                      green: 'from-green-50 to-emerald-50 border-green-300 text-green-800',
                      blue: 'from-blue-50 to-cyan-50 border-blue-300 text-blue-800',
                      cyan: 'from-cyan-50 to-sky-50 border-cyan-300 text-cyan-800',
                      yellow: 'from-yellow-50 to-amber-50 border-yellow-300 text-yellow-800',
                      orange: 'from-orange-50 to-red-50 border-orange-300 text-orange-800',
                      red: 'from-red-50 to-pink-50 border-red-300 text-red-800',
                      rose: 'from-rose-50 to-pink-50 border-rose-300 text-rose-800'
                    };

                    return (
                      <div className={`bg-gradient-to-br rounded-xl p-6 border-2 ${colorClasses[recommendation.color]}`}>
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center border-2 ${colorClasses[recommendation.color].split(' ')[2]}`}>
                              <span className="text-2xl font-bold">{recommendation.grade}</span>
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-lg mb-1">Performance Target</p>
                            <p className="text-sm">{recommendation.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

            
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Grade Points Needed:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{result.pointsNeeded}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Total Credits After:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{result.totalCreditsAfter}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
             
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 border-2 border-red-300">
                  <div className="text-center">
                    <svg className="w-20 h-20 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-xl font-bold text-red-800 mb-2">Target Not Achievable</p>
                    <p className="text-gray-700">
                      The required SGPA of <span className="font-bold">{result.requiredSGPA}</span> exceeds the maximum possible (10.00)
                    </p>
                    <p className="text-sm text-gray-600 mt-4">
                      Consider setting a more realistic target CGPA or increasing the number of credits for the upcoming semester
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="font-medium text-lg">Enter your targets</p>
                <p className="text-sm">Fill in the fields to calculate required SGPA</p>
              </div>
            </div>
          )}
        </div>
      </div>

    
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors duration-200 flex items-center gap-2">
            <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Calculation Formula & Grade Mapping
          </summary>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p className="font-mono">CGPA = Σ(Credit × Grade Point) / Σ(Credits)</p>
            <div className="flex flex-wrap gap-4 mt-3 justify-center">
              <div><span className="font-bold">S</span> = 10</div>
              <div><span className="font-bold">A</span> = 9</div>
              <div><span className="font-bold">B</span> = 8</div>
              <div><span className="font-bold">C</span> = 7</div>
              <div><span className="font-bold">D</span> = 6</div>
              <div><span className="font-bold">E</span> = 5</div>
              <div><span className="font-bold">R</span> = 4</div>
              <div><span className="font-bold">F</span> = 0</div>
              <div><span className="font-bold">W</span> = 0</div>
              <div><span className="font-bold">I</span> = 0</div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};