import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/user.context";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../config/axios";

const ProjectDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [project, setProject] = useState(location.state?.project || null);
  const [description, setDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!project) {
      navigate("/");
      return;
    }
    setDescription(project.description || "");
    
    // Fetch project details with populated users
    axios
      .get(`/projects/get-project/${project._id}`)
      .then((res) => {
        setProject(res.data.project);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [project?._id, navigate]);

  const updateDescription = () => {
    setLoading(true);
    axios
      .put("/projects/update-description", {
        projectId: project._id,
        description: description,
      })
      .then((res) => {
        setProject({ ...project, description: description });
        setIsEditingDescription(false);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const startChat = () => {
    navigate("/project", { state: { project } });
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-black hover:text-gray-800 transition-colors text-lg"
            >
              <i className="ri-arrow-left-line mr-2 text-2xl"></i>
            <strong> Back to Projects</strong> 
            </button>
            <button
              onClick={startChat}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <i className="ri-chat-1-line mr-2"></i>
              Start Chat
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Info Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <i className="ri-folder-3-line text-white text-2xl"></i>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                  <p className="text-gray-600 mt-1">
                    Collaborative Development Project
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{project.users?.length || 0}</div>
                  <div className="text-sm text-gray-600">Collaborators</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">Active</div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
              </div>
            </div>

            {/* Project Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Project Description</h2>
                {!isEditingDescription && (
                  <button
                    onClick={() => setIsEditingDescription(true)}
                    className="text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    <i className="ri-edit-line mr-1"></i>
                    Edit
                  </button>
                )}
              </div>
              
              {isEditingDescription ? (
                <div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="6"
                    placeholder="Add a description for your project..."
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => {
                        setDescription(project.description || "");
                        setIsEditingDescription(false);
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={updateDescription}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-700">
                  {description || (
                    <span className="text-gray-400 italic">
                      No description added yet. Click edit to add one.
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Start Chat Button - Center */}
            <div className="flex justify-center">
              <button
                onClick={startChat}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 flex items-center text-lg font-semibold"
              >
                <i className="ri-chat-1-line mr-3 text-xl"></i>
                Start Collaborative Chat
              </button>
            </div>
          </div>

          {/* Team Members Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h2>
              
              <div className="space-y-3">
                {project.users && project.users.length > 0 ? (
                  project.users.map((member) => (
                    <div key={member._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                        <i className="ri-user-fill text-white"></i>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {member.name || "Developer"}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {member.email}
                        </div>
                      </div>
                      <div className="flex items-center text-green-500">
                        <i className="ri-circle-fill text-xs"></i>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <i className="ri-team-line text-4xl mb-2"></i>
                    <p>No team members yet</p>
                  </div>
                )}
              </div>

              {/* Project Creator Info */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Project Owner:</span>
                  <div className="mt-1 flex items-center">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-2">
                      <i className="ri-crown-fill text-white text-xs"></i>
                    </div>
                    <span>{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
