import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';

const Home = () => {
  const { user, setUser } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("projects"); // "projects" or "users"
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  function createProject(e) {
    e.preventDefault();
    console.log({ projectName });

    axios
      .post("/projects/create", {
        name: projectName,
      })
      .then((res) => {
        console.log(res);
        setIsModalOpen(false);
        setProjectName(""); // Clear the input field
        fetchProjects(); // Refresh the projects list
        toast.success("Project created successfully!");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Failed to create project. Please try again.");
      });
  }

  const fetchProjects = () => {
    if (!user || !user._id) return;
    
    console.log(user._id);

    axios
      .get(`/projects/allProjects/${user._id}`)
      .then((res) => {
        setProjects(res.data.projects);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchUsers = () => {
    axios
      .get("/users/all")
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const deleteProject = (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }
    
    axios
      .delete(`/projects/delete/${projectId}`)
      .then((res) => {
        console.log(res.data.message || "Project deleted successfully");
        fetchProjects(); // Refresh the projects list after deletion
        toast.success("Project deleted successfully!");
      })
      .catch((err) => {
        console.error(
          "Error deleting project:",
          err.response?.data || err.message
        );
        toast.error("Failed to delete project. Please try again.");
      });
  };

  useEffect(() => {
    if (user && user._id) {
      fetchProjects();
      fetchUsers();
    }
  }, [user]);

  // Handle activeTab from navigation state
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserDropdownOpen && !event.target.closest(".user-dropdown")) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Modern Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <i className="ri-code-s-slash-line text-white text-xl"></i>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CodeMate
              </h1>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setActiveTab("projects")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "projects"
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <i className="ri-folder-line mr-2"></i>
                Projects
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "users"
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <i className="ri-team-line mr-2"></i>
                Developers
              </button>
            </div>

            {/* User Profile Section */}
            <div className="relative user-dropdown">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.name || user?.email?.split('@')[0] || "User"}
                  </div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <i
                  className={`ri-arrow-down-s-line text-gray-400 transition-transform ${
                    isUserDropdownOpen ? "rotate-180" : ""
                  }`}
                ></i>
              </button>

              {/* User Dropdown */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user?.email?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user?.name || user?.email?.split('@')[0] || "User"}</div>
                        <div className="text-sm text-gray-500">{user?.email}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/")}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                  >
                    <i className="ri-home-line mr-3"></i>
                    Home
                  </button>
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                  >
                    <i className="ri-user-settings-line mr-3"></i>
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                  >
                    <i className="ri-logout-box-line mr-3"></i>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user?.name || user?.email?.split('@')[0] || 'Developer'}</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {activeTab === "projects" 
                ? "Build amazing projects with your team. Collaborate, code, and create together." 
                : "Connect with talented developers and grow your network."}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <i className="ri-folder-3-line text-2xl text-blue-600"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{projects.length}</h3>
                  <p className="text-gray-600">Active Projects</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <i className="ri-team-line text-2xl text-green-600"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{users.length}</h3>
                  <p className="text-gray-600">Developers</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <i className="ri-code-s-slash-line text-2xl text-purple-600"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {projects.reduce((total, project) => total + project.users.length, 0)}
                  </h3>
                  <p className="text-gray-600">Collaborations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {activeTab === "projects" && (
            <div className="text-center mb-8">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                <i className="ri-add-line mr-3 text-xl"></i>
                Create New Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Content Based on Active Tab */}
        {activeTab === "projects" ? (
          /* Projects Section */
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
              <div className="flex items-center space-x-4">
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Projects</option>
                  <option>Recent</option>
                  <option>Most Active</option>
                </select>
              </div>
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
                  Create your first project and invite your team to start collaborating on amazing ideas.
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
                    className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/project-details`, { state: { project } })}
                  >
                    {/* Project Header */}
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
                        {project.description || "No description available for this project."}
                      </p>
                    </div>

                    {/* Project Stats */}
                    <div className="px-6 pb-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-500">
                          <i className="ri-team-line mr-2"></i>
                          <span>{project.users.length} member{project.users.length !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <i className="ri-time-line mr-2"></i>
                          <span>2 days ago</span>
                        </div>
                      </div>
                    </div>

                    {/* Project Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {project.users.slice(0, 3).map((user, index) => (
                            <div
                              key={user._id || index}
                              className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-2 border-white flex items-center justify-center"
                            >
                              <span className="text-xs text-white font-medium">
                                {user.email?.charAt(0).toUpperCase() || 'U'}
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

                    {/* Hover Effect Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-300 pointer-events-none"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Users Section */
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Developer Community</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Search developers..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-user-add-line text-4xl text-gray-400"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  No developers found
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  It looks like you're the first one here! Invite your team members to start collaborating.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {users.map((userItem) => (
                  <div
                    key={userItem._id}
                    className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
                    onClick={() =>
                      navigate("/add-user-to-project", {
                        state: { user: userItem },
                      })
                    }
                  >
                    <div className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                          <span className="text-white font-bold text-xl">
                            {userItem.name?.charAt(0).toUpperCase() || userItem.email?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {userItem.name || userItem.email?.split('@')[0] || "Developer"}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 truncate w-full">
                          {userItem.email}
                        </p>

                        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 mb-4">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span>Online</span>
                          </div>
                          <div className="flex items-center">
                            <i className="ri-code-line mr-1"></i>
                            <span>{userItem.role || "Developer"}</span>
                          </div>
                        </div>

                        <button className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                          Add to Project
                        </button>
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-300 pointer-events-none"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Enhanced Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
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
                Start your next amazing project and invite your team to collaborate.
              </p>
            </div>

            {/* Modal Content */}
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
    </div>
  );
};

export default Home;