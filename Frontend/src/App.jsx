import LoginPage from "./Login"
import { GoogleOAuthProvider } from '@react-oauth/google';
import StudentDashboard from "./Student/StudentDashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FacultyRoutes from "./faculty/Routes/facultyRoutes";
import FacultyLayout from "./faculty/layouts/FacultyLayout";
import AdminLayout from './admin/layout/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import ProtectedRoute from "./ProtectedRoute"; 
import StudentDetailCollection from "./Student/StudentDetails";

export default function App() {
  return (
    <GoogleOAuthProvider clientId="750796996880-c4875choh43f78urk1d5gt06orqln9q1.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<LoginPage />} />

          {/* Protected Student Route */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRole="Student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/details" 
            element={
              <ProtectedRoute allowedRole="Student">
                <StudentDetailCollection />
              </ProtectedRoute>
            } 
          />

          {/* Protected Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRole="Admin">
                <AdminLayout >
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Protected Faculty Routes */}
          <Route 
            path="/faculty/*" 
            element={
              //<ProtectedRoute allowedRole="Faculty Advisor">
                <FacultyLayout />
              //</ProtectedRoute>
              
            }
          >
            <Route path="*" element={<FacultyRoutes />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}