import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);

  const navigate = useNavigate();

  function createProject(e) {
      e.preventDefault();
      console.log({ projectName });

      axios.post('/projects/create', {
          name: projectName,
      })
          .then((res) => {
              console.log(res);
              setIsModalOpen(false);
              setProjectName(''); // Clear the input field
              fetchProjects(); // Refresh the projects list
          })
          .catch((error) => {
              console.log(error);
          });
  }

  const fetchProjects = () => {
     console.log(user._id);
     
      axios.get(`/projects/allProjects/${user._id}`)
          .then((res) => {
              setProjects(res.data.projects);
          })
          .catch(err => {
              console.log(err);
          });
  };

  const deleteProject = (projectId) => {
      axios
        .delete(`/projects/delete/${projectId}`)
        .then((res) => {
          console.log(res.data.message || 'Project deleted successfully');
          fetchProjects(); // Refresh the projects list after deletion
        })
        .catch((err) => {
          console.error('Error deleting project:', err.response?.data || err.message);
        });
  };

  useEffect(() => {
      fetchProjects();
  }, []);

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name || 'Developer'}!</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          + New Project
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project._id}
            className="relative p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
          >
            <div
              onClick={() => navigate(`/project`, { state: { project } })}
              className="cursor-pointer"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-2">{project.name}</h2>
              <p className="text-gray-600">
                <i className="ri-user-line"></i> Collaborators: {project.users.length}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the project navigation
                deleteProject(project._id);
              }}
              className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Project</h2>
            <form onSubmit={createProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
