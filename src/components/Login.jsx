import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setIsLogin }) {
  const initialUsername = localStorage.getItem("userUsername") || "";
  const initialPassword = localStorage.getItem("userPassword") || "";

  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState(initialPassword);

  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const clearList = () => {
    setUsername("");
    setPassword("");
  };

  const logIn = () => {
    setErrorMessage("");

    const registeredUsername = localStorage.getItem("userUsername");
    const registeredPassword = localStorage.getItem("userPassword");

    if (!username || !password) {
      setErrorMessage("Username and password are required");
      return;
    }

    if (!registeredUsername) {
      setErrorMessage("No registered account found. Please register first.");
      return;
    }

    if (username === registeredUsername && password === registeredPassword) {
      setErrorMessage("Login successful!");

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentUser", username);
      window.dispatchEvent(new Event("storage"));

      navigate("/home");
    } else {
      setErrorMessage("Invalid username or password.");
    }
  };

  const deleteAccount = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This will permanently delete your username, password, and top score.",
    );

    if (confirmed) {
      localStorage.removeItem("userUsername");
      localStorage.removeItem("userPassword");
      localStorage.removeItem("topScore");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUser");

      setErrorMessage("Account deleted successfully!");

      setTimeout(() => {
        setUsername("");
        setPassword("");
        setIsLogin(false);
      }, 1500);
    }
  };

  return (
    <div className="content">
      <img src="/pokeball.svg" alt="Pokeball" className="pokeball-decoration" />
      <h1 className="title">Login</h1>
      <div className="content-2">
        <div className="input-form">
          <div className="inputs">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="input"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input"
            />
          </div>
        </div>

        {errorMessage && (
          <p
            className={`message ${errorMessage.includes("successful") ? "success" : "error"}`}
          >
            {errorMessage}
          </p>
        )}

        <div className="buttons">
          <button onClick={logIn} className="btn">
            Log in
          </button>
          <button onClick={clearList} className="btn">
            Clear
          </button>
        </div>

        <div className="switch-box">
          <p className="switch-login-p">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className="btn log-in"
            >
              Register
            </button>
          </p>
        </div>

        <div className="delete-account-section">
          <button onClick={deleteAccount} className="delete-account-btn">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
