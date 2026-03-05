import { Routes, Route } from "react-router-dom";
import FacultyDashboard from "../features/faculty/pages/FacultyDashboard";
import StudentsPage from "../features/faculty/pages/StudentsPage";
import StudentReviewPage from "../features/faculty/pages/StudentReviewPage";

const FacultyRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<FacultyDashboard />} />
      <Route path="students" element={<StudentsPage />} />
      <Route path="pending" element={<StudentsPage />} />
      <Route path="review/:studentId" element={<StudentReviewPage />} />
    </Routes>
  );
};

export default FacultyRoutes;