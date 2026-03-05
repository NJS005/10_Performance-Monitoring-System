import LoginPage from "./Login"
import StudentDashboard from "./Student/StudentDashboard";
import { BrowserRouter , Routes, Route } from "react-router-dom";
import FacultyRoutes from "./faculty/Routes/facultyRoutes";
import FacultyLayout from "./faculty/layouts/FacultyLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/student" element={<StudentDashboard />} />

        <Route path="/faculty/*" element={<FacultyLayout />}>
          <Route path="*" element={<FacultyRoutes />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}