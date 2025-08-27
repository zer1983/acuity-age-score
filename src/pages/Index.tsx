import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to assessment page when accessing the root
    navigate("/assessment", { replace: true });
  }, [navigate]);

  return null;
};

export default Index;
