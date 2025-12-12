import React, { useState, useEffect } from "react";
import Login from "../components/Login.jsx";
import "../Auth.css";

function AuthPage() {

    const [isLogin, setIsLogin] = useState(false);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [errorMessage, setErrorMessage] = useState('');

    const validatePassword = (pwd) => {
        if (pwd.length < 8) {
            return "Password must be at least 8 characters long";
        }
        return ""; // Empty string = no error
    };

    const addUser = () => {
        setErrorMessage("");

        if (!username || !password) {
            setErrorMessage("Username and password are required");
            return;
        }

        const validationError = validatePassword(password);
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        localStorage.setItem('userUsername', username);
        localStorage.setItem('userPassword', password);

        setErrorMessage("Registration successful! You can now log in.");
        setIsLogin(true);
    };

/*     const clearList = () => {
        setUsername('');
        setPassword('');
        if (!isLogin) {
            localStorage.removeItem("userUsername");
            localStorage.removeItem("userPassword");
        }
    }; */

    if (isLogin) {
        return (
            <div>
                <Login setIsLogin={setIsLogin} />
            </div>
        );
    }

    return (
        <div className="content">
            <h1 className="title">Create an account</h1>
            <br />

            <div className="content-2">

                <div className="input-form">

                    <div className="inputs">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            className="input" />

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="input" />
                    </div>

                    <div className="buttons">
                        <button onClick={addUser} className="btn">Register</button>
                    </div>

                </div>

                {errorMessage && (
                    <p className={`message ${errorMessage.includes("successful") ? "success" : "error"}`}>
                        {errorMessage}
                    </p>
                )}

                <div className="switch-box">
                    <p className="switch-login-p">
                        Already have an account?{" "}

                        <a
                            href="#"
                            className="link"
                            onClick={(e) => {
                                e.preventDefault(); // Prevents the default browser link behavior
                                setIsLogin(true);
                            }}
                        >
                            Log in
                        </a>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default AuthPage;