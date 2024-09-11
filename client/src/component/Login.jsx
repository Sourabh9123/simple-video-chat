import React from "react";
import axios from "axios";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  // Create refs for username and password inputs
  const usernameRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const username = usernameRef.current.value;
    console.log("username in login page", username);
    navigate("/ws/call/", { state: { username } });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username:</label>
        <input type="text" id="username" ref={usernameRef} required />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}

export default Login;
