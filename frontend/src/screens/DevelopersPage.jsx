import React, { useContext, useState, useEffect } from "react";
import HomeNavbar from "./HomeNavbar";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";

const DevelopersPage = () => {
  const { user, setUser } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  }

  const fetchUsers = () => {
    axios
      .get("/users/all")
      .then((res) => setUsers(res.data.users))
      .catch(() => {});
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <HomeNavbar
        user={user}
        handleLogout={handleLogout}
        isUserDropdownOpen={isUserDropdownOpen}
        setIsUserDropdownOpen={setIsUserDropdownOpen}
      />
      <main className="max-w-7xl mx-auto px-4 py-8   sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-blue-600">
            Developer Community
          </h2>
          <div className="flex items-center space-x-4">
            
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
              It looks like you're the first one here! Invite your team members
              to start collaborating.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map((userItem) => (
              <div
                key={userItem._id}
                className="group bg-white rounded-xl shadow-lg border border-blue-400 100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden "
                onClick={() =>
                  navigate("/add-user-to-project", {
                    state: { user: userItem },
                  })
                }
              >
                <div className="p-2">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                      <span className="text-white font-bold text-xl">
                        {userItem.name?.charAt(0).toUpperCase() ||
                          userItem.email?.charAt(0).toUpperCase() ||
                          "U"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {userItem.name ||
                        userItem.email?.split("@")[0] ||
                        "Developer"}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 truncate w-full">
                      {userItem.email}
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 mb-4">
                      <div className="flex items-center">
                      </div>
                      <div className="flex items-center">
                        <i className="ri-code-line mr-1"></i>
                        <span className="font-bold">{userItem.role || "Developer"}</span>
                      </div>
                    </div>
                    <button className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                      Add to Project
                    </button>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default DevelopersPage;
