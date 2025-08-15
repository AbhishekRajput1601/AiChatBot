import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/user.context";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../config/axios";
import { toast } from "react-toastify";

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
      navigate("/projects");
      return;
    }
    setDescription(project.description || "");

    axios
      .get(`/projects/get-project/${project._id}`)
      .then((res) => setProject(res.data.project))
      .catch((err) => console.error(err));
  }, [project?._id, navigate]);

  const updateDescription = () => {
    setLoading(true);
    axios
      .put("/projects/update-description", {
        projectId: project._id,
        description,
      })
      .then(() => {
        setProject({ ...project, description });
        setIsEditingDescription(false);
        setLoading(false);
        toast.success("Description updated successfully!");
      })
      .catch(() => {
        setLoading(false);
        toast.error("Failed to update description.");
      });
  };

  const startChat = () => {
    navigate("/project", { state: { project } });
  };

  if (!project) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center text-gray-700 hover:text-blue-600 transition-colors text-lg"
          >
            <i className="ri-arrow-left-line mr-2 text-xl"></i>
            Back to Projects
          </button>
          <button
            onClick={startChat}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition flex items-center"
          >
            <i className="ri-chat-1-line mr-2"></i>
            Start Chat
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header Card */}
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-inner">
                  <i className="ri-folder-3-line"></i>
                </div>
                <div className="ml-5">
                  <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                  <p className="text-gray-500 mt-1">
                    Collaborative Development Project
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {project.users?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Collaborators</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">Active</div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
              </div>
            </div>

            {/* Project Description */}
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Project Description
                </h2>
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
                <>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="5"
                    placeholder="Add a description for your project..."
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => {
                        setDescription(project.description || "");
                        setIsEditingDescription(false);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={updateDescription}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-700 leading-relaxed">
                  {description || (
                    <span className="text-gray-400 italic">
                      No description yet. Click edit to add one.
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Team Members */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Team Members
              </h2>
              <div className="space-y-3">
                {project.users && project.users.length > 0 ? (
                  project.users.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.name?.charAt(0) || member.email?.charAt(0)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-900">
                          {member.name || "Developer"}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <i className="ri-team-line text-4xl mb-2"></i>
                    <p>No team members yet</p>
                  </div>
                )}
              </div>

              {/* Project Owner */}
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
