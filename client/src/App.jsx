import { useState, useEffect } from "react";
import Root from "./component/Root";
import "./App.css";
import {
  RouterProvider,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import JoinRoom from "./component/JoinRoom";
import Home from "./component/Home";
import Login from "./component/Login";
function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="" element={<Root />}>
        {/* <Route path="/" element={<JoinRoom />} /> */}
        <Route path="/" element={<Login />} />

        {/* <Route path="/room/:id" element={<Home />} /> */}
        <Route path="/ws/call/" element={<Home />} />
      </Route>
    )
  );
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
