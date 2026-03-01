import { Import } from "lucide-react";
import LoginPage from "./Login"
import StudentDashboard from "./Student/StudentDashboard";
import { BrowserRouter , Routes, Route } from "react-router-dom";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/student" element={<StudentDashboard />} />
      </Routes>
    </BrowserRouter>

  )
}
