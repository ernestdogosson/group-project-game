import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import AuthPage from "./pages/Auth";
import PokemonGame from "./pages/PokemonGame";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem("isLoggedIn");
      const username = localStorage.getItem("currentUser");

      if (loggedIn === "true" && username) {
        setIsAuthenticated(true);
        setCurrentUser(username);
      } else {
        setIsAuthenticated(false);
        setCurrentUser("");
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    setIsAuthenticated(false);
    setCurrentUser("");
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/home" replace /> : <AuthPage />
          }
        />

        <Route
          path="/home"
          element={
            isAuthenticated ? (
              <PokemonGame currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
