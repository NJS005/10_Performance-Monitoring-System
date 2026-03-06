import LoginPage from "./Login"
import StudentDashboard from "./Student/StudentDashboard";
import { BrowserRouter , Routes, Route } from "react-router-dom";
import FacultyRoutes from "./faculty/Routes/facultyRoutes";
import FacultyLayout from "./faculty/layouts/FacultyLayout";
import AdminLayout from './admin/layout/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>
        <Route path="/faculty/*" element={<FacultyLayout />}>
          <Route path="*" element={<FacultyRoutes />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}