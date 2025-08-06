import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { UserContext } from "../context/user.context";

const AddUserToProject = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const selectedUser = location.state?.user;

  useEffect(() => {
    if (!selectedUser) {
      navigate("/");
      return;
    }
    // Fetch all projects for the current user
    axios
      .get(`/projects/allProjects/${user._id}`)
      .then((res) => setProjects(res.data.projects))
      .catch((err) => console.log(err));
  }, [user, selectedUser, navigate]);

  const handleAdd = () => {
    if (!selectedProjectId) return;
    setLoading(true);
    axios
      .put("/projects/add-user", {
        projectId: selectedProjectId,
        users: [selectedUser._id],
      })
      .then(() => {
        setLoading(false);
        navigate(-1); // Go back
      })
      .catch((err) => {
        setLoading(false);
        alert("Failed to add user to project");
        console.log(err);
      });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Add User to Project</h2>
        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-2">
            <i className="ri-user-fill text-white text-2xl"></i>
          </div>
          <div className="text-lg font-semibold">{selectedUser?.name || "Developer"}</div>
          <div className="text-gray-500 text-sm">{selectedUser?.email}</div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Select Project</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">-- Select a project --</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAdd}
          disabled={!selectedProjectId || loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add to Project"}
        </button>
        <button
          onClick={() => navigate(-1)}
          className="w-full mt-2 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddUserToProject;
