import React, { useContext, useState, useEffect } from "react";
import HomeNavbar from "./HomeNavbar";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProjectsPage = () => {
  const { user, setUser } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  }

  function createProject(e) {
    e.preventDefault();
    axios
      .post("/projects/create", { name: projectName })
      .then(() => {
        setIsModalOpen(false);
        setProjectName("");
        fetchProjects();
        toast.success("Project created successfully!");
      })
      .catch(() => {
        toast.error("Failed to create project. Please try again.");
      });
  }

  const fetchProjects = () => {
    if (!user || !user._id) return;
    axios
      .get(`/projects/allProjects/${user._id}`)
      .then((res) => setProjects(res.data.projects))
      .catch(() => {});
  };

  const deleteProject = (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    axios
      .delete(`/projects/delete/${projectId}`)
      .then(() => {
        fetchProjects();
        toast.success("Project deleted successfully!");
      })
      .catch(() => {
        toast.error("Failed to delete project. Please try again.");
      });
  };

  useEffect(() => {
    if (user && user._id) fetchProjects();
  }, [user]);

  return (
    <>
      <HomeNavbar
        user={user}
        handleLogout={handleLogout}
        isUserDropdownOpen={isUserDropdownOpen}
        setIsUserDropdownOpen={setIsUserDropdownOpen}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 py-10 ">
        {/* Heading & Create Button Row */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-blue-600">Your Projects</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-sm"
          >
            <i className="ri-add-line mr-2"></i>
            Create Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-folder-add-line text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to start coding?
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create your first project and invite your team to start
              collaborating on amazing ideas.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              <i className="ri-add-line mr-2"></i>
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="group relative bg-white rounded-2xl shadow-lg border-2  hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden border-blue-300"
                onClick={() =>
                  navigate(`/project-details`, { state: { project } })
                }
              >
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <i className="ri-folder-3-line text-xl text-white"></i>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(project._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete project"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                    {project.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description ||
                      "No description available for this project."}
                  </p>
                </div>
                <div className="px-6 pb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500">
                      <i className="ri-team-line mr-2"></i>
                      <span>
                        {project.users.length} member
                        {project.users.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t  border-1 border-blue-500 ">
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {project.users.slice(0, 3).map((user, index) => (
                        <div
                          key={user._id || index}
                          className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-2 border-blue-500 flex items-center justify-center "
                        >
                          <span className="text-xs text-white font-medium">
                            {user.email?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      ))}
                      {project.users.length > 3 && (
                        <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-gray-600 font-medium">
                            +{project.users.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:text-purple-600 transition-colors">
                      <span>Open Project</span>
                      <i className="ri-arrow-right-line ml-1 transform group-hover:translate-x-1 transition-transform"></i>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <i className="ri-folder-add-line text-xl"></i>
                  </div>
                  <h2 className="text-xl font-bold">Create New Project</h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <p className="mt-2 text-blue-100">
                Start your next amazing project and invite your team to
                collaborate.
              </p>
            </div>
            <form onSubmit={createProject} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Project Name
                </label>
                <div className="relative">
                  <i className="ri-folder-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter an awesome project name..."
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <i className="ri-add-line mr-2"></i>
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectsPage;
