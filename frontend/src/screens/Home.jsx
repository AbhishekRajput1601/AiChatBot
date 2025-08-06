import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user, setUser } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("projects"); // "projects" or "users"
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navigate = useNavigate();

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
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const fetchProjects = () => {
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
    navigate("/login");
  };

  const deleteProject = (projectId) => {
    axios
      .delete(`/projects/delete/${projectId}`)
      .then((res) => {
        console.log(res.data.message || "Project deleted successfully");
        fetchProjects(); // Refresh the projects list after deletion
      })
      .catch((err) => {
        console.error(
          "Error deleting project:",
          err.response?.data || err.message
        );
      });
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

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
    <div className="min-h-screen p-1 bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gray-100 shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-blue-700">CodeMate</h1>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setActiveTab("projects")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "projects"
                    ? "bg-blue-100 text-blue-700 text-xl font-bold"
                    : "text-black hover:text-gray-700 text-xl font-bold"
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "users"
                    ? "bg-blue-100 text-blue-700 text-xl font-bold"
                    : "text-black hover:text-gray-700 text-xl font-bold"
                }`}
              >
                Users
              </button>
            </div>

            {/* User Profile Section */}
            <div className="relative user-dropdown">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <i className="ri-user-fill text-white"></i>
                </div>
                <span className="hidden md:block text-gray-700 font-medium">
                  {user?.email || "User"}
                </span>
                <i
                  className={`ri-arrow-down-s-line text-gray-400 transition-transform ${
                    isUserDropdownOpen ? "rotate-180" : ""
                  }`}
                ></i>
              </button>

              {/* User Dropdown */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div className="font-medium">{user?.name || "User"}</div>
                    <div className="text-gray-500">{user?.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <i className="ri-logout-box-line mr-2"></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Action Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {activeTab === "projects" ? "My Projects" : "All Users"}
            </h1>
            <p className="text-gray-600 mt-1 font-bold text-lg">
              {activeTab === "projects"
                ? "Manage and create your collaborative projects"
                : "Connect with other developers"}
            </p>
          </div>

          {activeTab === "projects" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <i className="ri-add-line mr-2"></i>
              New Project
            </button>
          )}
        </div>

        {/* Content Based on Active Tab */}
        {activeTab === "projects" ? (
          /* Projects Section */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <i className="ri-folder-line text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No projects yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Get started by creating your first project
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Project
                </button>
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project._id}
                  className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
                >
                  <div
                    onClick={() => navigate(`/project-details`, { state: { project } })}
                    className="cursor-pointer p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xl font-semibold text-gray-800 truncate">
                        {project.name}
                      </h2>
                      <i className="ri-folder-3-line text-blue-500 text-xl"></i>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <i className="ri-team-line mr-2"></i>
                      <span>
                        {project.users.length} collaborator
                        {project.users.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center text-gray-500 text-xs">
                      <i className="ri-time-line mr-1"></i>
                      <span>Last updated recently</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project._id);
                    }}
                    className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete project"
                  >
                    <i className="ri-delete-bin-line text-sm"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Users Section */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <i className="ri-user-line text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No users found
                </h3>
                <p className="text-gray-500">
                  Check back later for more developers
                </p>
              </div>
            ) : (
              users.map((userItem) => (
                <div
                  key={userItem._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 p-6 cursor-pointer"
                  onClick={() =>
                    navigate("/add-user-to-project", {
                      state: { user: userItem },
                    })
                  }
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                      <i className="ri-user-fill text-white text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {userItem.name || "Developer"}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 truncate w-full">
                      {userItem.email}
                    </p>
                    <div className="flex items-center text-gray-500 text-xs">
                      <i className="ri-circle-fill text-green-400 mr-2 text-xs"></i>
                      <span>Active</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Create New Project
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <form onSubmit={createProject}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <i className="ri-add-line mr-2"></i>
                  Create
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
