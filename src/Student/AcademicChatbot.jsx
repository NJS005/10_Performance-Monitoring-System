import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, TrendingUp, BookOpen, Target, Lightbulb } from 'lucide-react';

/**
 * AI Academic Chatbot Component - Frontend Only (No API)
 * 
 * Implements: FR-BOT-01, FR-BOT-02
 * - Analyzes academic history to identify weaknesses
 * - Suggests electives based on past performance
 * - Provides constructive criticism and guidance
 * 
 * Note: Uses intelligent rule-based responses, no external API calls
 */
const AcademicChatbot = ({ courses, studentData, currentCGPA, getGradePoint }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chatbot with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 1,
        type: 'bot',
        content: `Hi ${studentData.name.split(' ')[0]}! 👋 I'm your AI Academic Advisor.

I can help you with:
• 📊 Analyze your academic performance
• 🎯 Identify areas for improvement  
• 📚 Suggest electives based on your strengths
• 💡 Provide study strategies
• 🚀 Answer questions about your courses

What would you like to know?`,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length, studentData.name]);

  // Analyze student's academic performance
  const analyzePerformance = () => {
    const allCourses = [...courses.core, ...courses.elective];
    
    // Performance metrics
    const performanceByGrade = allCourses.reduce((acc, course) => {
      acc[course.grade] = (acc[course.grade] || 0) + 1;
      return acc;
    }, {});

    // Weak subjects (grade < B)
    const weakSubjects = allCourses.filter(c => getGradePoint(c.grade) < 8);

    // Strong subjects (grade >= A)
    const strongSubjects = allCourses.filter(c => getGradePoint(c.grade) >= 9);

    // Calculate semester-wise performance
    const semesterPerformance = {};
    allCourses.forEach(course => {
      if (!semesterPerformance[course.semester]) {
        semesterPerformance[course.semester] = { totalPoints: 0, totalCredits: 0 };
      }
      semesterPerformance[course.semester].totalPoints += getGradePoint(course.grade) * course.credits;
      semesterPerformance[course.semester].totalCredits += course.credits;
    });

    Object.keys(semesterPerformance).forEach(sem => {
      const data = semesterPerformance[sem];
      data.sgpa = (data.totalPoints / data.totalCredits).toFixed(2);
    });

    // Calculate trend
    const semesters = Object.keys(semesterPerformance).sort((a, b) => a - b);
    let trend = 'stable';
    if (semesters.length >= 2) {
      const latest = parseFloat(semesterPerformance[semesters[semesters.length - 1]].sgpa);
      const previous = parseFloat(semesterPerformance[semesters[semesters.length - 2]].sgpa);
      trend = latest > previous + 0.2 ? 'improving' : latest < previous - 0.2 ? 'declining' : 'stable';
    }

    return {
      allCourses,
      performanceByGrade,
      weakSubjects,
      strongSubjects,
      semesterPerformance,
      trend,
      totalCredits: allCourses.reduce((sum, c) => sum + c.credits, 0)
    };
  };

  // Generate intelligent response based on question
  const generateResponse = (question) => {
    const lowerQuestion = question.toLowerCase();
    const analysis = analyzePerformance();

    // Elective recommendations
    if (lowerQuestion.includes('elective') || lowerQuestion.includes('recommend') || lowerQuestion.includes('suggest course')) {
      const strongSubjects = analysis.strongSubjects.map(c => c.name);
      const hasMachineLearning = analysis.allCourses.some(c => c.name.toLowerCase().includes('machine learning'));
      const hasDatabase = analysis.allCourses.some(c => c.name.toLowerCase().includes('database'));
      const hasNetworks = analysis.allCourses.some(c => c.name.toLowerCase().includes('network'));
      
      let recommendations = `Based on your excellent performance in **${strongSubjects.slice(0, 2).join('** and **')}**, here are my top elective recommendations:\n\n`;

      if (analysis.strongSubjects.some(c => c.name.includes('Algorithm') || c.name.includes('Data Structure'))) {
        recommendations += `🎯 **Machine Learning & AI**\n- Leverages your strong algorithmic foundation\n- Grade ${hasMachineLearning ? 'S' : 'A/S'} achievable based on your performance\n- High industry demand\n\n`;
        recommendations += `🎯 **Competitive Programming**\n- Perfect fit for your algorithm skills\n- Enhances problem-solving abilities\n\n`;
      }

      if (hasDatabase) {
        recommendations += `🎯 **Big Data Analytics**\n- Builds on your database knowledge\n- Practical applications in modern systems\n\n`;
        recommendations += `🎯 **Data Science**\n- Combines databases with analytics\n- Excellent career prospects\n\n`;
      }

      if (hasNetworks) {
        recommendations += `🎯 **Cloud Computing**\n- Extends your networking knowledge\n- Industry-relevant skills\n\n`;
        recommendations += `🎯 **Distributed Systems**\n- Advanced networking concepts\n- Great for systems engineering roles\n\n`;
      }

      recommendations += `Your current CGPA of **${currentCGPA}** shows you're ready for challenging electives. Pick courses that align with your career goals! 🚀`;
      
      return recommendations;
    }

    // Performance analysis
    if (lowerQuestion.includes('perform') || lowerQuestion.includes('doing') || lowerQuestion.includes('analysis') || lowerQuestion.includes('how am i')) {
      let response = `📊 **Academic Performance Analysis**\n\n`;
      response += `**Current CGPA:** ${currentCGPA}/10.00 - `;
      
      const cgpaNum = parseFloat(currentCGPA);
      if (cgpaNum >= 9.0) response += 'Outstanding! 🌟\n\n';
      else if (cgpaNum >= 8.5) response += 'Excellent! ✨\n\n';
      else if (cgpaNum >= 8.0) response += 'Very Good! 👍\n\n';
      else if (cgpaNum >= 7.0) response += 'Good! 📈\n\n';
      else response += 'Fair - Room for improvement! 💪\n\n';

      response += `**Grade Distribution:**\n`;
      Object.entries(analysis.performanceByGrade).sort((a, b) => getGradePoint(b[0]) - getGradePoint(a[0])).forEach(([grade, count]) => {
        response += `• ${grade} grade: ${count} ${count === 1 ? 'course' : 'courses'}\n`;
      });

      response += `\n**Your Strengths:**\n`;
      if (analysis.strongSubjects.length > 0) {
        analysis.strongSubjects.forEach(course => {
          response += `✓ ${course.name} - Grade ${course.grade}\n`;
        });
      } else {
        response += `You're performing well overall! Keep up the consistency.\n`;
      }

      if (analysis.weakSubjects.length > 0) {
        response += `\n**Areas for Improvement:**\n`;
        analysis.weakSubjects.forEach(course => {
          response += `→ ${course.name} - Grade ${course.grade} (could improve to A/S)\n`;
        });
      }

      response += `\n**Performance Trend:** Your grades are **${analysis.trend}** `;
      response += analysis.trend === 'improving' ? '📈 - Great momentum!' : analysis.trend === 'declining' ? '⚠️ - Need to refocus' : '➡️ - Maintain consistency';

      return response;
    }

    // Improvement strategies
    if (lowerQuestion.includes('improve') || lowerQuestion.includes('better') || lowerQuestion.includes('study') || lowerQuestion.includes('weak')) {
      let response = '';
      
      if (analysis.weakSubjects.length === 0) {
        response = `🎉 **Excellent News!**\n\nYou don't have any subjects below B grade - outstanding performance!\n\n**To maintain and enhance your excellence:**\n\n`;
        response += `✓ **Challenge Yourself:** Take advanced electives that push your boundaries\n\n`;
        response += `✓ **Depth over Breadth:** Master topics deeply rather than surface learning\n\n`;
        response += `✓ **Real-World Projects:** Apply concepts through hands-on projects\n\n`;
        response += `✓ **Peer Teaching:** Teaching others reinforces your own understanding\n\n`;
        response += `✓ **Research Opportunities:** Explore undergraduate research in your strong areas\n\n`;
        response += `With your current CGPA of ${currentCGPA}, aim for 9.5+ by targeting S grades! 🎯`;
      } else {
        response = `💡 **Personalized Improvement Plan**\n\n`;
        response += `I've identified these areas needing attention:\n\n`;
        
        analysis.weakSubjects.forEach((course, index) => {
          response += `**${index + 1}. ${course.name}** (Grade ${course.grade})\n`;
          
          // Subject-specific advice
          if (course.name.toLowerCase().includes('operating system') || course.name.toLowerCase().includes('os')) {
            response += `• Review: Process scheduling, memory management, file systems\n`;
            response += `• Practice: Coding system calls and process synchronization\n`;
          } else if (course.name.toLowerCase().includes('network')) {
            response += `• Master: Protocol layers (TCP/IP, OSI model)\n`;
            response += `• Practice: Network configuration and packet analysis\n`;
          } else if (course.name.toLowerCase().includes('database')) {
            response += `• Focus on: SQL query optimization and normalization\n`;
            response += `• Practice: Design real-world database schemas\n`;
          } else {
            response += `• Review fundamental concepts and core principles\n`;
            response += `• Practice problems from textbook and online resources\n`;
          }
          response += `\n`;
        });

        response += `**General Study Strategies:**\n\n`;
        response += `📚 **Active Learning:** Don't just read - solve problems actively\n\n`;
        response += `👥 **Study Groups:** Join peers who excel in these subjects\n\n`;
        response += `🎯 **Office Hours:** Utilize faculty guidance for challenging topics\n\n`;
        response += `⏰ **Consistent Schedule:** Daily 1-2 hours on weak subjects\n\n`;
        response += `With focused effort, you can bring these to A/S grades and push your CGPA above ${(parseFloat(currentCGPA) + 0.5).toFixed(2)}! 🚀`;
      }

      return response;
    }

    // CGPA/Grade specific questions
    if (lowerQuestion.includes('cgpa') || lowerQuestion.includes('gpa') || lowerQuestion.includes('grade point')) {
      let response = `📊 **CGPA Analysis**\n\n`;
      response += `**Current CGPA:** ${currentCGPA}/10.00\n`;
      response += `**Total Credits:** ${analysis.totalCredits}\n\n`;

      response += `**Semester-wise Performance:**\n`;
      const semesters = Object.keys(analysis.semesterPerformance).sort((a, b) => a - b);
      semesters.forEach(sem => {
        const sgpa = analysis.semesterPerformance[sem].sgpa;
        response += `• Semester ${sem}: SGPA ${sgpa}\n`;
      });

      const cgpaNum = parseFloat(currentCGPA);
      response += `\n**Assessment:** `;
      if (cgpaNum >= 9.0) {
        response += `Outstanding performance! You're in the top tier. 🌟\n\n`;
        response += `**Next Goal:** Maintain 9.0+ and aim for department topper status!`;
      } else if (cgpaNum >= 8.0) {
        response += `Very strong performance! 💪\n\n`;
        response += `**Next Goal:** Target 9.0+ CGPA by securing more S grades in upcoming semesters.`;
      } else if (cgpaNum >= 7.0) {
        response += `Good foundation! Room for growth. 📈\n\n`;
        response += `**Next Goal:** Focus on getting A/S grades to push above 8.0.`;
      } else {
        response += `Building momentum needed! 🎯\n\n`;
        response += `**Next Goal:** Target B+ and A grades to reach 7.5+.`;
      }

      return response;
    }

    // Semester/Progress questions
    if (lowerQuestion.includes('semester') || lowerQuestion.includes('progress') || lowerQuestion.includes('trend')) {
      let response = `📈 **Semester-wise Progress Analysis**\n\n`;
      
      const semesters = Object.keys(analysis.semesterPerformance).sort((a, b) => a - b);
      semesters.forEach(sem => {
        const data = analysis.semesterPerformance[sem];
        const semCourses = analysis.allCourses.filter(c => c.semester === parseInt(sem));
        response += `**Semester ${sem}:** SGPA ${data.sgpa}\n`;
        response += `Courses: ${semCourses.map(c => c.code).join(', ')}\n\n`;
      });

      response += `**Overall Trend:** Your performance is **${analysis.trend}**\n\n`;
      
      if (analysis.trend === 'improving') {
        response += `🎉 Excellent! You're building momentum. Keep:\n`;
        response += `• Maintaining current study habits\n`;
        response += `• Challenging yourself with harder courses\n`;
        response += `• Staying consistent with this upward trajectory`;
      } else if (analysis.trend === 'declining') {
        response += `⚠️ Time to reassess! Action items:\n`;
        response += `• Identify what changed (course difficulty, time management?)\n`;
        response += `• Seek help early for challenging subjects\n`;
        response += `• Review and adjust study strategies`;
      } else {
        response += `➡️ Consistent performance. To excel further:\n`;
        response += `• Push for S grades in your strong subjects\n`;
        response += `• Take on more challenging electives\n`;
        response += `• Engage in projects for deeper learning`;
      }

      return response;
    }

    // Career/Future questions
    if (lowerQuestion.includes('career') || lowerQuestion.includes('job') || lowerQuestion.includes('future') || lowerQuestion.includes('placement')) {
      const strongAreas = analysis.strongSubjects.map(c => c.name);
      let response = `🚀 **Career Path Recommendations**\n\n`;
      response += `Based on your strengths in **${strongAreas.slice(0, 2).join('** and **')}**:\n\n`;

      if (strongAreas.some(s => s.includes('Algorithm') || s.includes('Data Structure'))) {
        response += `💼 **Software Development Engineer**\n`;
        response += `Companies: Google, Amazon, Microsoft, Meta\n`;
        response += `Focus: Advanced algorithms, system design\n\n`;
      }

      if (strongAreas.some(s => s.includes('Machine Learning') || s.includes('AI'))) {
        response += `🤖 **Machine Learning Engineer**\n`;
        response += `Companies: OpenAI, DeepMind, NVIDIA\n`;
        response += `Focus: Deep learning, NLP, computer vision\n\n`;
      }

      if (strongAreas.some(s => s.includes('Database') || s.includes('Data'))) {
        response += `📊 **Data Scientist / Engineer**\n`;
        response += `Companies: Netflix, Uber, Airbnb\n`;
        response += `Focus: Big data, analytics, ML pipelines\n\n`;
      }

      if (strongAreas.some(s => s.includes('Network') || s.includes('Cloud'))) {
        response += `☁️ **Cloud/DevOps Engineer**\n`;
        response += `Companies: AWS, Azure, GCP teams\n`;
        response += `Focus: Infrastructure, distributed systems\n\n`;
      }

      response += `**Preparation Tips:**\n`;
      response += `• Build projects showcasing your strong areas\n`;
      response += `• Contribute to open-source in relevant domains\n`;
      response += `• Practice coding on LeetCode/Codeforces\n`;
      response += `• Network on LinkedIn and GitHub\n\n`;
      response += `Your CGPA of ${currentCGPA} is competitive for top companies! 💪`;

      return response;
    }

    // Target CGPA questions
    if (lowerQuestion.includes('target') || lowerQuestion.includes('reach') || lowerQuestion.includes('achieve 9') || lowerQuestion.includes('get to')) {
      const targetCGPA = lowerQuestion.includes('9.5') ? 9.5 : lowerQuestion.includes('9') ? 9.0 : 8.5;
      const currentNum = parseFloat(currentCGPA);
      const gap = targetCGPA - currentNum;

      let response = `🎯 **Path to ${targetCGPA} CGPA**\n\n`;
      response += `**Current:** ${currentCGPA}\n`;
      response += `**Target:** ${targetCGPA}\n`;
      response += `**Gap:** ${gap.toFixed(2)} points\n\n`;

      if (gap <= 0) {
        response += `🎉 You've already achieved this target! Aim even higher - go for ${(targetCGPA + 0.5).toFixed(1)}!`;
      } else if (gap <= 0.3) {
        response += `✅ **Very Achievable!**\n\n`;
        response += `**Strategy:**\n`;
        response += `• Secure A grades in remaining core courses\n`;
        response += `• Target S grades in electives aligned with your strengths\n`;
        response += `• Focus deeply on ${3 - analysis.weakSubjects.length} subjects per semester\n\n`;
        response += `With consistent effort, you'll reach ${targetCGPA} within 2 semesters! 🚀`;
      } else if (gap <= 0.7) {
        response += `💪 **Challenging but Possible!**\n\n`;
        response += `**Strategy:**\n`;
        response += `• Aim for A/S grades in ALL remaining courses\n`;
        response += `• Immediately improve weak areas (see "How can I improve?")\n`;
        response += `• Consider retaking courses with C/D grades if allowed\n`;
        response += `• Engage actively in class - understanding > memorizing\n\n`;
        response += `Timeline: 3-4 semesters of sustained excellence needed. You can do this! 💯`;
      } else {
        response += `⚠️ **Requires Significant Effort**\n\n`;
        response += `The gap is substantial. More realistic intermediate target: **${(currentNum + 0.5).toFixed(2)}**\n\n`;
        response += `**Staged Approach:**\n`;
        response += `1. First achieve ${(currentNum + 0.3).toFixed(2)} (6 months)\n`;
        response += `2. Then push to ${(currentNum + 0.5).toFixed(2)} (1 year)\n`;
        response += `3. Finally target ${targetCGPA} (2 years)\n\n`;
        response += `Focus on getting mostly A grades consistently. Every semester counts! 📚`;
      }

      return response;
    }

    // Default helpful response
    return `I can help you with many things! Try asking:\n\n💡 **"What electives should I take?"**\n→ Get personalized course recommendations\n\n📊 **"How am I performing?"**\n→ Detailed performance analysis\n\n📈 **"How can I improve my grades?"**\n→ Targeted improvement strategies\n\n🎯 **"How can I reach 9.0 CGPA?"**\n→ Actionable plan to hit your goals\n\n🚀 **"What career paths fit my strengths?"**\n→ Career guidance based on performance\n\nWhat would you like to explore?`;
  };

  // Handle sending message
  const handleSendMessage = () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuestion = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay for more realistic chat experience
    setTimeout(() => {
      const botResponse = generateResponse(currentQuestion);
      
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay 1-2 seconds
  };

  // Quick action buttons
  const quickActions = [
    { 
      label: 'Suggest Electives', 
      question: 'What electives should I take based on my performance?',
      icon: <BookOpen size={14} />
    },
    { 
      label: 'Analyze Performance', 
      question: 'Analyze my academic performance and identify weak areas',
      icon: <TrendingUp size={14} />
    },
    { 
      label: 'Improvement Tips', 
      question: 'How can I improve my grades?',
      icon: <Lightbulb size={14} />
    },
    { 
      label: 'Career Advice', 
      question: 'What career paths align with my strengths?',
      icon: <Target size={14} />
    }
  ];

  const handleQuickAction = (question) => {
    setInputMessage(question);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group z-50"
        >
          <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
            Ask me anything! 💡
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border-2 border-purple-200">
          {/* Chat Header */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Academic Advisor</h3>
                <p className="text-xs text-purple-100">Always here to help! 🎓</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white border-2 border-gray-200 text-gray-800 shadow-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-purple-100' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-gray-600 ml-1">Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && !isTyping && (
            <div className="px-4 py-3 bg-white border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2 font-semibold">Quick Questions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleQuickAction(action.question);
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    className="text-xs px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium flex items-center gap-2 border border-purple-200 hover:border-purple-300"
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm transition-all"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="px-4 py-3 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AcademicChatbot;