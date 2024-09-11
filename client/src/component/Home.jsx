import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import useWebSocket from "../Hooks/useWebSocket";

function Home() {
  const location = useLocation();
  const { username } = location.state || {};
  const [users, setUsers] = useState([]);
  const url = `ws://localhost:8000/ws/chat/`;
  const { isConnected, messages, sendMessage } = useWebSocket(url);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const [current_user] = useState(username);

  const ICE_SERVERS = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    if (isConnected) {
      initializeMedia();
      sendMessage({ type: "new_user_joined", messsage: username });
    }
  }, [isConnected]);

  const createOffer = async () => {
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    sendMessage({ type: "offer", message: offer, from: current_user });
  };

  const handleReceiveOffer = async (offer, from) => {
    if (current_user !== from) {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      sendMessage({
        type: "answer",
        message: answer,
        from: current_user,
      });
      console.log("offer received and send answer to server", answer);
      console.log("curr ", current_user, " from  ", from);
    }
  };

  const handleReceiveAnswer = async (answer, from) => {
    if (peerConnection.current.signalingState === "stable") {
      console.warn(
        "Connection is already in stable state, cannot set remote description."
      );
      return;
    }
    console.log("inside answer block receving ", answer);
    if (current_user !== from) {
      console.log("answer from user and set to remote description", answer);
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    }
  };

  const handleICECandidate = async (candidate, from) => {
    if (current_user !== from) {
      // console.log(
      //   candidate,
      //   "ice ---------------------------------- receiving"
      // );
      // await peerConnection.current.addIceCandidate(
      //   new RTCIceCandidate(candidate)
      // );

      if (
        !peerConnection.current.remoteDescription ||
        !peerConnection.current.remoteDescription.type
      ) {
        return;
      }

      try {
        console.log(
          candidate,
          "ice ---------------------------------- receiving"
        );
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    }
  };

  const initializeMedia = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideoRef.current.srcObject = localStream;
    peerConnection.current = new RTCPeerConnection(ICE_SERVERS);
    console.log(peerConnection.current);
    localStream
      .getTracks()
      .forEach((track) => peerConnection.current.addTrack(track, localStream));

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage({
          type: "ice-candidate",
          message: event.candidate,
          from: current_user,
        });
      }
    };

    peerConnection.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };
  };

  useEffect(() => {
    if (messages) {
      switch (messages.type) {
        case "offer":
          handleReceiveOffer(messages.message, messages.from_user);
          break;
        case "answer":
          handleReceiveAnswer(messages.message, messages.from_user);
          break;
        case "ice-candidate":
          handleICECandidate(messages.message, messages.from_user);
          break;
        case "new_user_joined":
          setUsers([...users, messages.username]);
          break;
        default:
          break;
      }
    }
  }, [messages]);

  return (
    <div>
      <video ref={localVideoRef} autoPlay muted style={{ width: "300px" }} />
      <video
        ref={remoteVideoRef}
        autoPlay
        style={{ width: "300px", marginLeft: "30px" }}
        muted
      />
      <button onClick={createOffer}>Start Call</button>
    </div>
  );
}

export default Home;
