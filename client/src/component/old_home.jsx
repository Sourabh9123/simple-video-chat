import { useState, useEffect, useRef } from "react";
import { json, useParams } from "react-router-dom";
import useWebSocket from "../Hooks/useWebsocket";

function Home() {
  const room_id = useParams("id");
  const url = `ws://localhost:8000/ws/chat/${room_id.id}/`;
  // const url = `ws://localhost:8000/ws/chat/peer/`;
  const [me, setMe] = useState(null);
  const [remoteUser, setRemoteUser] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const peerref = useRef();

  const { isConnected, messages, sendMessage, error } = useWebSocket(url);

  // const create_by = Math.floor(Math.random() * 100000);

  const handleCreateOffer = async () => {
    console.log("inside Offer Creation");
    const config = {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    };
    peerref.current = new RTCPeerConnection(config);

    // peerref.current.oniceconnectionstatechange = () => {
    //   console.log("ICE connection state:", peerref.current.iceConnectionState);
    // };

    // peerref.current.onconnectionstatechange = () => {
    //   console.log("Connection state:", peerref.current.connectionState);
    // };

    // Add event handler for ICE candidates
    // getiing ice from sturn/turn server sending it to another user

    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStream
      .getTracks()
      .forEach((track) => peerref.current.addTrack(track, localStream));
    // Attach local stream to the local video element
    localVideoRef.current.srcObject = localStream;
    setMe(localStream);

    peerref.current.onicecandidate = (event) => {
      console.log("inside ice candidate");
      if (event.candidate) {
        console.log("Generated ICE candidate:", event.candidate);
        sendMessage({
          type: "ice-candidate",
          message: { candidate: event.candidate },
          user_id: localStorage.getItem("user_id"),
        });
      }
    };

    // Create and send the offer
    const offer = await peerref.current.createOffer();
    await peerref.current.setLocalDescription(offer);

    await sendMessage({
      type: "offer",
      message: { offer: offer },
      user_id: localStorage.getItem("user_id"),
    });
    console.log("Offer created: by", localStorage.getItem("user_id"));
    console.log("Offer created:", offer);
  };

  const handleCreateAnswer = async () => {
    if (messages && messages.type === "offer") {
      console.log("Received offer:", messages.message.offer);

      const config = {
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      };
      peerref.current = new RTCPeerConnection(config);
      // Add event handler for ICE candidates
      if (messages.sender_user_id != localStorage.getItem("user_id")) {
        console.log("insde remote offer");
        if (peerref.current.signalingState === "stable") {
          console.log("Skipping setRemoteDescription, already stable.");
          return;
        } else {
          await peerref.current.setRemoteDescription(messages.message.offer);
        }
      }
      // getiing ice from sturn/turn server sending it to another user
      peerref.current.onicecandidate = (event) => {
        console.log("inside ice candidate");
        if (event.candidate) {
          console.log("Generated ICE candidate:", event.candidate);
          sendMessage({
            type: "ice-candidate",
            message: { candidate: event.candidate },
            user_id: localStorage.getItem("user_id"),
          });
        }
      };
    }
    peerref.current.ontrack = (event) => {
      console.log("inside of remote track");
      // Attach the remote stream to the remote video element

      remoteVideoRef.current.srcObject = event.streams[0];
      setRemoteUser(event.streams[0]);
    };
    // await peerref.current.setRemoteDescription(
    //   new RTCSessionDescription(messages.message.offer)
    // );
    console.log("before settong offer", messages.message.offer);

    // await peerref.current.setRemoteDescription(messages.message.offer);

    const answer = await peerref.current.createAnswer();
    await peerref.current.setLocalDescription(answer);
    sendMessage({
      type: "answer",
      message: { answer: answer },
      user_id: localStorage.getItem("user_id"),
    });
    console.log("Answer sent:", answer, localStorage.getItem("user_id"));
  };
  useEffect(() => {
    const current_user = localStorage.getItem("user_id");

    if (messages && messages.type === "ice-candidate") {
      if (messages.sender_user_id != current_user) {
        peerref.current.addIceCandidate(
          new RTCIceCandidate(messages.message.candidate)
        );
        console.log("Received ICE candidate:", messages.message.candidate);
      }
    }

    if (messages && messages.type === "answer") {
      // const current_user = localStorage.getItem("user_id");

      console.log("sender--", messages.sender_user_id);
      console.log("receiver--", current_user);
      console.log(messages.message.answer);

      if (messages.sender_user_id != current_user) {
        peerref.current.setRemoteDescription(messages.message.answer);

        console.log(
          "not a creator of  an answer  answer set to  ",
          current_user
        );
      }
      // peerref.current.setRemoteDescription(messages.message.answer);

      // console.log(
      //   "not a creator of  an answer  answer set to  ",
      //   current_user
      // );

      console.log("Received answer: ------------------", messages);

      if (messages && messages.type === "ice-candidate") {
        console.log("Received ICE candidate:", messages.message.candidate);
        peerref.current.addIceCandidate(
          new RTCIceCandidate(messages.message.candidate)
        );
      }

      // peerref.current.setRemoteDescription(messages.message.answer);

      // if (peerref.current.signalingState === "stable") {
      //   // console.warn("Cannot set offer: Connection is in stable state.");
      //   console.log("Cannot set offer: Connection is in stable state.");
      //   return;
      // }
    }

    // if (messages && messages.type === "answer") {
    //   console.log("Received answer:", messages.message.answer);

    //   if (peerref.current.signalingState === "have-local-offer") {
    //     peerref.current.setRemoteDescription(
    //       new RTCSessionDescription(messages.message.answer)
    //     );
    //   } else {
    //     console.warn(
    //       "Cannot set remote description for answer: Invalid signaling state",
    //       peerref.current.signalingState
    //     );
    //   }
    // }
  }, [messages]);
  // messages
  return (
    <>
      {" "}
      <div>
        {" "}
        <button onClick={handleCreateOffer}>Start video Call</button>
        <button onClick={handleCreateAnswer}>Join video Call</button>
        <h1>sourabh's chat app</h1>
      </div>
      <div style={{ display: "flex", gap: "20px" }}>
        <div>
          <video
            ref={localVideoRef}
            width="400"
            height="360"
            autoPlay
            playsInline
          />
        </div>
        <div>
          <video
            ref={remoteVideoRef}
            width="400"
            height="360"
            autoPlay
            playsInline
          />
          <h4>Remote Video</h4>
        </div>
      </div>
    </>
  );
}

export default Home;

// // const [websocket, setWebsocket] = useState("");
// //   const messageRef = useRef();

// //   const [mes, setMes] = useState({
// //     type: "chat_message",
// //     message: "this messages from frontend",
// //   });
// //   const room_id = useParams("id");
// //   console.log("id", room_id);

// //   console.log(mes);

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     setMes({ type: "chat_message", message: messageRef.current.value });
// //     messageRef.current.value = "";

// //     console.log(e);
// //   };

// //   // const socket = new WebSocket("ws://localhost:8000/ws/chat/");

// //   useEffect(() => {
// //     const socket = new WebSocket(`ws://localhost:8000/ws/chat/${room_id.id}/`);
// //     socket.onopen = () => {
// //       console.log("socket connection open");
// //       setWebsocket(socket);
// //     };
// //     socket.onmessage = (event) => {
// //       console.log(event);
// //       console.log("Message from server:", event.data);
// //       console.log("find type");
// //     };
// //     socket.onerror = (error) => {
// //       console.error("WebSocket error:", error);
// //     };
// //     socket.onclose = () => {
// //       console.log("WebSocket connection closed");
// //     };

// //     return () => {
// //       socket.close();
// //     };
// //   }, []);

// //   const createOffer = () => {
// //     websocket.send(
// //       JSON.stringify({
// //         type: "offer",
// //         message: "created offer",
// //       })
// //     );
// //   };

// //   // if (websocket && websocket.readyState === WebSocket.OPEN) {
// //   //   createOffer();
// //   // }

// //   const handleSendMessage = () => {
// //     if (websocket && websocket.readyState === WebSocket.OPEN) {
// //       // send_message = {
// //       //   type: "chat_message",
// //       //   message: JSON.stringify(mes),
// //       // };
// //       websocket.send(JSON.stringify(mes));
// //     } else {
// //       console.error("WebSocket is not open. Cannot send message.");
// //     }
// //   };
