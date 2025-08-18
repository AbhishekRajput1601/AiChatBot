import React, { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "../context/user.context";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import Markdown from "markdown-to-jsx";
import hljs from "highlight.js";
import { getWebContainer } from "../config/webContainer";
import { toast } from 'react-toastify';

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  React.useEffect(() => {
    if (ref.current && props.className?.includes("lang-") && window.hljs) {
      window.hljs.highlightElement(ref.current);

      // hljs won't reprocess the element unless this attribute is removed
      ref.current.removeAttribute("data-highlighted");
    }
  }, [props.className, props.children]);

  return <code {...props} ref={ref} />;
}

const Project = () => {
  const location = useLocation();

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [selectedUserIdToRemove, setSelectedUserIdToRemove] = useState(
    new Set()
  );
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState("");
  const { user } = useContext(UserContext);
  const messageBox = React.createRef();

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({});

  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);

  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);

  const [runProcess, setRunProcess] = useState(null);
  const [userChangeTrigger, setUserChangeTrigger] = useState(false);

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }

      return newSelectedUserId;
    });
  };

  const handleRemoveUserClick = (id) => {
    setSelectedUserIdToRemove((prev) => {
      const updated = new Set(prev);
      updated.has(id) ? updated.delete(id) : updated.add(id);
      return updated;
    });
  };

  function addCollaborators() {
    if (selectedUserId.size === 0) {
      toast.warning("Please select at least one user to add.");
      return;
    }
    
    axios
      .put("/projects/add-user", {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        console.log(res.data);
        setIsModalOpen(false);
        setSelectedUserId(new Set());
        setUserChangeTrigger((prev) => !prev);
        toast.success("Users added to project successfully!");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to add users to project. Please try again.");
      });
  }

  function removeCollaborators() {
    if (selectedUserIdToRemove.size === 0) {
      toast.warning("Please select at least one user to remove.");
      return;
    }
    
    if (!window.confirm("Are you sure you want to remove selected users from this project?")) {
      return;
    }
    
    axios
      .put("/projects/remove-user", {
        projectId: location.state.project._id,
        users: Array.from(selectedUserIdToRemove),
      })
      .then((res) => {
        console.log(res.data);
        setIsRemoveModalOpen(false);
        setSelectedUserIdToRemove(new Set());
        setUserChangeTrigger((prev) => !prev);
        toast.success("Users removed from project successfully!");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to remove users from project. Please try again.");
      });
  }

  const send = () => {
    if (!message.trim()) return;

    const messageData = {
      message,
      sender: user,
    };

    // Send message via socket
    sendMessage("project-message", messageData);
    
    // Add message to local state immediately for better UX
    setMessages((prevMessages) => [...prevMessages, messageData]);
    
    // Save message to backend
    axios
      .post("/projects/add-message", {
        projectId: project._id,
        message: message,
      })
      .then((res) => {
        console.log("Message saved to backend");
      })
      .catch((err) => {
        console.error("Failed to save message:", err);
        toast.error("Failed to save message");
      });
    
    setMessage("");
  };

  const loadMessages = async () => {
    try {
      const response = await axios.get(`/projects/messages/${project._id}`);
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  function WriteAiMessage(message) {
    const messageObject = JSON.parse(message);

    return (
      <div className="ai-message-container w-full overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-100 rounded-lg p-4 shadow-lg border border-gray-700 w-full">
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
              <i className="ri-sparkling-line text-xs text-white"></i>
            </div>
            <span className="text-sm font-medium text-purple-300">AI Assistant Response</span>
          </div>
          <div className="prose prose-invert prose-sm max-w-none overflow-hidden break-words">
            <Markdown
              children={messageObject.text}
              options={{
                overrides: {
                  code: SyntaxHighlightedCode,
                  pre: {
                    component: ({ children, ...props }) => (
                      <pre {...props} className="bg-gray-800 border border-gray-600 rounded-md p-3 overflow-x-auto text-sm">
                        {children}
                      </pre>
                    ),
                  },
                  h1: { props: { className: "text-lg font-bold text-white mb-2 break-words" } },
                  h2: { props: { className: "text-md font-semibold text-gray-200 mb-2 break-words" } },
                  h3: { props: { className: "text-sm font-medium text-gray-300 mb-1 break-words" } },
                  p: { props: { className: "text-gray-100 leading-relaxed mb-2 break-words whitespace-pre-wrap" } },
                  ul: { props: { className: "text-gray-100 ml-4 mb-2 break-words" } },
                  ol: { props: { className: "text-gray-100 ml-4 mb-2 break-words" } },
                  li: { props: { className: "mb-1 break-words" } },
                  a: { props: { className: "text-blue-400 hover:text-blue-300 underline break-all" } },
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeSocket(project._id);

    if (!webContainer) {
      getWebContainer().then((container) => {
        setWebContainer(container);
        console.log("container started");
      });
    }

    // Load existing messages when component mounts
    loadMessages();

    receiveMessage("project-message", (data) => {
      console.log(data);

      if (data.sender._id == "ai") {
        const message = JSON.parse(data.message);

        console.log(message);

        webContainer?.mount(message.fileTree);

        if (message.fileTree) {
          setFileTree(message.fileTree || {});
        }
        
        // Save AI message to backend
        axios
          .post("/projects/add-message", {
            projectId: project._id,
            message: data.message,
            senderId: "ai", // Special sender ID for AI
          })
          .then((res) => {
            console.log("AI message saved to backend");
          })
          .catch((err) => {
            console.error("Failed to save AI message:", err);
          });
        
        setMessages((prevMessages) => [...prevMessages, data]); // Update messages state
      } else {
        // Only add to local state if it's not from the current user (to avoid duplicates)
        if (data.sender._id !== user._id.toString()) {
          setMessages((prevMessages) => [...prevMessages, data]); // Update messages state
        }
      }
    });

    axios
      .get(`/projects/get-project/${location.state.project._id}`)
      .then((res) => {
        console.log(res.data.project);

        setProject(res.data.project);
        setFileTree(res.data.project.fileTree || {});
      });

    axios
      .get("/users/all")
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`/projects/get-project/${location.state.project._id}`)
      .then((res) => {
        setProject(res.data.project);
      })
      .catch((err) => console.log(err));
  }, [userChangeTrigger]);

  function saveFileTree(ft) {
    axios
      .put("/projects/update-file-tree", {
        projectId: project._id,
        fileTree: ft,
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function scrollToBottom() {
    messageBox.current.scrollTop = messageBox.current.scrollHeight;
  }

  const openAddUserModal = () => {
    setIsModalOpen(true);
    setIsRemoveModalOpen(false);
    setIsSidePanelOpen(false);
  };

  const openRemoveUserModal = () => {
    setIsRemoveModalOpen(true);
    setIsModalOpen(false);
    setIsSidePanelOpen(false);
  };

  const openSidePanel = () => {
    setIsSidePanelOpen(true);
    setIsModalOpen(false);
    setIsRemoveModalOpen(false);
  };

  return (
    <main className="h-screen w-screen flex bg-gray-100 overflow-hidden">
      <section className="left relative flex flex-col h-screen min-w-96 max-w-96 bg-white border-r border-gray-200 shadow-lg flex-shrink-0">
        {/* Modern Header */}
        <header className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white sticky top-0 z-10 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-code-s-slash-line text-lg"></i>
            </div>
            <div>
              <h1 className="font-semibold text-lg truncate max-w-32">{project.name}</h1>
              <p className="text-xs text-white/80">{project.users?.length || 0} members</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={openAddUserModal}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Add User"
            >
              <i className="ri-user-add-line text-lg"></i>
            </button>
            <button 
              onClick={openRemoveUserModal}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Remove User"
            >
              <i className="ri-user-unfollow-line text-lg"></i>
            </button>
            <button 
              onClick={openSidePanel} 
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="View Members"
            >
              <i className="ri-group-line text-lg"></i>
            </button>
          </div>
        </header>

        {/* Chat Messages Area */}
        <div className="conversation-area flex-grow flex flex-col h-full relative bg-gray-50 min-w-0 overflow-hidden">
          <div
            ref={messageBox}
            className="message-box p-4 flex-grow flex flex-col gap-3 overflow-auto scrollbar-hide min-w-0"
            style={{ paddingBottom: '80px' }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <i className="ri-chat-3-line text-2xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">No messages yet</h3>
                <p className="text-gray-500 text-sm">Start the conversation by sending a message!</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isCurrentUser = msg.sender._id == user._id.toString();
                const isAI = msg.sender._id === "ai";
                
                return (
                  <div
                    key={index}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}
                  >
                    <div className={`max-w-[75%] min-w-0 ${isAI ? 'max-w-[90%]' : ''}`}>
                      {/* Sender Info */}
                      {!isCurrentUser && (
                        <div className="flex items-center mb-1 ml-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white mr-2 flex-shrink-0 ${
                            isAI ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                          }`}>
                            {isAI ? <i className="ri-robot-line"></i> : <i className="ri-user-fill"></i>}
                          </div>
                          <span className="text-xs text-gray-600 font-medium truncate">
                            {isAI ? 'AI Assistant' : msg.sender.email}
                          </span>
                        </div>
                      )}
                      
                      {/* Message Bubble */}
                      <div className={`p-3 rounded-2xl shadow-sm word-wrap break-words ${
                        isCurrentUser 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                          : isAI
                            ? 'bg-white border border-gray-200'
                            : 'bg-white border border-gray-200'
                      } ${isCurrentUser ? 'rounded-br-md' : 'rounded-bl-md'}`}>
                        {isAI ? (
                          <div className="prose prose-sm max-w-none overflow-hidden">
                            {WriteAiMessage(msg.message)}
                          </div>
                        ) : (
                          <p className={`text-sm leading-relaxed break-words whitespace-pre-wrap ${isCurrentUser ? 'text-white' : 'text-gray-800'}`}>
                            {msg.message}
                          </p>
                        )}
                        
                        {/* Timestamp */}
                        <div className={`text-xs mt-2 ${
                          isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Modern Input Field */}
          <div className="input-area absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-3 bg-gray-50 rounded-full p-2 border border-gray-200 focus-within:border-blue-500 transition-colors">
              <div className="flex-grow flex items-center">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && message.trim() && send()}
                  className="flex-grow bg-transparent border-none outline-none px-3 py-2 text-gray-700 placeholder-gray-500"
                  type="text"
                  placeholder="Type your message..."
                />
              </div>
              <button 
                onClick={send}
                disabled={!message.trim()}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  message.trim() 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transform hover:scale-105' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <i className="ri-send-plane-fill text-sm"></i>
              </button>
            </div>
          </div>
        </div>
        {/* Modern Side Panel */}
        <div
          className={`sidePanel w-full h-full flex flex-col bg-white absolute transition-all duration-300 ease-in-out ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0 shadow-xl z-20`}
        >
          <header className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <i className="ri-team-line text-lg"></i>
              </div>
              <h1 className="font-semibold text-lg">Team Members</h1>
            </div>
            <button
              onClick={() => setIsSidePanelOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          </header>
          
          <div className="flex-grow overflow-auto">
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Active Members ({project.users?.length || 0})
                </h3>
              </div>
              
              <div className="space-y-3">
                {project.users &&
                  project.users.map((collaborator, index) => (
                    <div 
                      key={collaborator._id || index} 
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                          {collaborator.name ? collaborator.name.charAt(0).toUpperCase() : collaborator.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {collaborator.name || 'Team Member'}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">
                          {collaborator.email}
                        </p>
                        <div className="flex items-center mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-xs text-green-600 font-medium">Active now</span>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                          <i className="ri-more-2-line text-lg"></i>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="right bg-white flex-grow h-full flex shadow-lg">
        <div className="explorer h-full max-w-64 min-w-52 bg-gray-50 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <i className="ri-folder-line mr-2 text-blue-500"></i>
              Project Files
            </h3>
          </div>
          <div className="file-tree w-full">
            {Object.keys(fileTree).length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <i className="ri-file-line text-2xl mb-2 block"></i>
                <p className="text-sm">No files yet</p>
              </div>
            ) : (
              Object.keys(fileTree).map((file, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentFile(file);
                    setOpenFiles([...new Set([...openFiles, file])]);
                  }}
                  className={`tree-element w-full text-left p-3 px-4 flex items-center space-x-2 hover:bg-blue-50 transition-colors border-l-4 ${
                    currentFile === file ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                  }`}
                >
                  <i className="ri-file-text-line text-gray-500"></i>
                  <span className="text-sm font-medium text-gray-700 truncate">{file}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="code-editor flex flex-col flex-grow h-full">
          <div className="top flex justify-between w-full bg-white border-b border-gray-200">
            <div className="files flex">
              {openFiles.map((file, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFile(file)}
                  className={`open-file p-3 px-4 flex items-center space-x-2 text-sm font-medium border-b-2 transition-colors ${
                    currentFile === file 
                      ? 'border-blue-500 text-blue-600 bg-blue-50' 
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <i className="ri-file-text-line text-xs"></i>
                  <span className="truncate">{file}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const newOpenFiles = openFiles.filter(f => f !== file);
                      setOpenFiles(newOpenFiles);
                      if (currentFile === file && newOpenFiles.length > 0) {
                        setCurrentFile(newOpenFiles[newOpenFiles.length - 1]);
                      } else if (newOpenFiles.length === 0) {
                        setCurrentFile(null);
                      }
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </button>
                </button>
              ))}
            </div>

            <div className="actions flex items-center space-x-2 p-3">
              <button
                onClick={async () => {
                  await webContainer.mount(fileTree);

                  const installProcess = await webContainer.spawn("npm", [
                    "install",
                  ]);

                  installProcess.output.pipeTo(
                    new WritableStream({
                      write(chunk) {
                        console.log(chunk);
                      },
                    })
                  );

                  if (runProcess) {
                    runProcess.kill();
                  }

                  let tempRunProcess = await webContainer.spawn("npm", [
                    "start",
                  ]);

                  tempRunProcess.output.pipeTo(
                    new WritableStream({
                      write(chunk) {
                        console.log(chunk);
                      },
                    })
                  );

                  setRunProcess(tempRunProcess);

                  webContainer.on("server-ready", (port, url) => {
                    console.log(port, url);
                    setIframeUrl(url);
                  });
                }}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <i className="ri-play-fill"></i>
                <span>Run Project</span>
              </button>
            </div>
          </div>
          <div className="bottom flex flex-grow max-w-full overflow-hidden">
            {currentFile && fileTree[currentFile] ? (
              <div className="code-editor-area h-full overflow-auto flex-grow bg-gray-900 text-gray-100 relative">
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                    {currentFile}
                  </span>
                </div>
                <pre className="h-full p-6 font-mono text-sm leading-relaxed">
                  <code
                    className="block h-full outline-none bg-transparent"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updatedContent = e.target.innerText;
                      const ft = {
                        ...fileTree,
                        [currentFile]: {
                          file: {
                            contents: updatedContent,
                          },
                        },
                      };
                      setFileTree(ft);
                      saveFileTree(ft);
                    }}
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlight(
                        "javascript",
                        fileTree[currentFile].file.contents
                      ).value,
                    }}
                    style={{
                      whiteSpace: "pre-wrap",
                      paddingBottom: "25rem",
                      counterSet: "line-numbering",
                      lineHeight: "1.6",
                    }}
                  />
                </pre>
              </div>
            ) : (
              <div className="flex-grow flex items-center justify-center bg-gray-50 text-gray-500">
                <div className="text-center">
                  <i className="ri-file-text-line text-4xl mb-4 text-gray-300"></i>
                  <h3 className="text-lg font-medium mb-2">No file selected</h3>
                  <p className="text-sm">Select a file from the explorer to start editing</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {iframeUrl && webContainer && (
          <div className="flex min-w-96 flex-col h-full border-l border-gray-200 bg-white">
            <div className="flex items-center bg-gray-50 border-b border-gray-200 p-3">
              <div className="flex items-center space-x-2 flex-grow">
                <i className="ri-global-line text-gray-500"></i>
                <input
                  type="text"
                  onChange={(e) => setIframeUrl(e.target.value)}
                  value={iframeUrl}
                  className="flex-grow px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter URL..."
                />
              </div>
              <button 
                onClick={() => setIframeUrl(null)}
                className="ml-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Close preview"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <iframe 
              src={iframeUrl} 
              className="w-full h-full bg-white"
              title="Preview"
            />
          </div>
        )}
      </section>

      {/* Modern Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-auto">
            <header className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="ri-user-add-line text-lg"></i>
                </div>
                <h2 className="text-xl font-semibold">Add Team Members</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </header>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 text-sm">
                  Select users to add to your project. Selected members will be able to collaborate on this project.
                </p>
              </div>
              
              <div className="max-h-96 overflow-auto space-y-2">
                {users && users.map((user) => (
                  <div
                    key={user._id}
                    className={`relative flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedUserId.has(user._id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => handleUserClick(user._id)}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-900">
                        {user.name || 'Team Member'}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    {selectedUserId.has(user._id) && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <i className="ri-check-line text-white text-sm"></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={addCollaborators}
                  disabled={selectedUserId.size === 0}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                    selectedUserId.size > 0
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Add {selectedUserId.size > 0 ? `(${selectedUserId.size})` : ''} Member{selectedUserId.size !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Remove User Modal */}
      {isRemoveModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <header className="flex justify-between items-center p-6 bg-gradient-to-r from-red-500 to-red-600 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="ri-user-unfollow-line text-lg"></i>
                </div>
                <h2 className="text-xl font-semibold">Remove Team Members</h2>
              </div>
              <button 
                onClick={() => setIsRemoveModalOpen(false)} 
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </header>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 text-sm">
                  Select team members to remove from this project. This action cannot be undone.
                </p>
              </div>
              
              <div className="max-h-96 overflow-auto space-y-2">
                {project.users && project.users.map((u) => (
                  <div
                    key={u._id}
                    className={`relative flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedUserIdToRemove.has(u._id)
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => handleRemoveUserClick(u._id)}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {u.name ? u.name.charAt(0).toUpperCase() : u.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-900">
                        {u.name || 'Team Member'}
                      </h3>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                    {selectedUserIdToRemove.has(u._id) && (
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <i className="ri-close-line text-white text-sm"></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setIsRemoveModalOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={removeCollaborators}
                  disabled={selectedUserIdToRemove.size === 0}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                    selectedUserIdToRemove.size > 0
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Remove {selectedUserIdToRemove.size > 0 ? `(${selectedUserIdToRemove.size})` : ''} Member{selectedUserIdToRemove.size !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;