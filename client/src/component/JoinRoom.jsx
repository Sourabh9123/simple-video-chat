import React from "react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";

function JoinRoom() {
  const room_ref = useRef();
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e);
    console.log(room_ref.current.value);
    navigate(`/room/${room_ref.current.value}/`);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        Enter Room name To Join
        <input ref={room_ref}></input>
      </form>
      <Login />
    </div>
  );
}

export default JoinRoom;
