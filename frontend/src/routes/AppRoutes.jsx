import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Login from "../screens/Login";
import Register from "../screens/Register";
import Home from "../screens/Home";
import Project from "../screens/Project";
import ProjectDetails from "../screens/ProjectDetails";
import AddUserToProject from "../screens/AddUserToProject";
import UserAuth from "../auth/UserAuth";
import Logout from "../screens/Logout";
import MemberList from "../screens/MemberList";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <UserAuth>
              <Home />
            </UserAuth>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path='"/logout"'
          element={
            <UserAuth>
              <Logout />
            </UserAuth>
          }
        />
        <Route
          path="/members"
          element={
            <UserAuth>
              <MemberList />
            </UserAuth>
          }
        />
        <Route
          path="/project"
          element={
            <UserAuth>
              <Project />
            </UserAuth>
          }
        />
        <Route
          path="/project-details"
          element={
            <UserAuth>
              <ProjectDetails />
            </UserAuth>
          }
        />
        <Route
          path="/add-user-to-project"
          element={
            <UserAuth>
              <AddUserToProject />
            </UserAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
