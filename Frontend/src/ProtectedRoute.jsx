import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

 
  if (!user) {
    return <Navigate to="/" replace />;
  }

  
  if (allowedRole && user.role !== allowedRole) {
    alert("Unauthorized access!");
    return <Navigate to="/" replace />;
  }

  
  return children;
};

export default ProtectedRoute;