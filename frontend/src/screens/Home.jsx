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
                onClick={() => navigate("/projects")}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              >
                <i className="ri-folder-line mr-2"></i>
                Projects
              </button>
              <button
                onClick={() => navigate("/developers")}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50"
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
      <section className="relative text-center py-20 px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {user?.name || user?.email?.split('@')[0] || "Developer"}
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
          Collaborate, code, and create together. Manage your projects and connect with other developers in one place.
        </p>
       <h2 className="text-lg text-gray-600 max-w-2xl mx-auto mb-4"> Place where developers unite and collaborate together</h2>

      </section>

      {/* Feature Section */}
      <section className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: "ri-folder-line",
            title: "Organize Projects",
            desc: "Manage all your coding projects in one place with ease."
          },
          {
            icon: "ri-team-line",
            title: "Collaborate Easily",
            desc: "Invite teammates and work together in real time."
          },
          {
            icon: "ri-code-s-slash-line",
            title: "Grow Skills",
            desc: "Learn from others and improve your coding abilities."
          }
        ].map((feature, idx) => (
          <div
            key={idx}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-transform hover:-translate-y-2"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <i className={`${feature.icon} text-white text-2xl`}></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </section>

    </div>
  );
};

export default Home;