import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import LoadingSpinner from "../../shared/components/LoadingSpinner";

const ProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Loading session..." />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
