"use client";

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../authorization/AuthContext";
import { ReloginModal } from '../../../components/ReloginModal';
import axios from "axios";

export default function ProfileManagement() {
  const { access_token } = useContext(AuthContext); // Access the token and user data
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [rowSelectedProfile, setRowSelectedProfile] = useState(null);
  const [isRowModalOpen, setIsRowModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProfile, setNewProfile] = useState({
    name: "",
    description: "",
    has_admin_permission: false,
    has_buy_permission: false,
    has_sell_permission: false,
    has_listing_permission: false,
  });
  const [editingProfile, setEditingProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedProfileForSuspension, setSelectedProfileForSuspension] = useState(null);
  const [suspendDuration, setSuspendDuration] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendInvalidMessage, setSuspendInvalidMessage] = useState('');
  const [nameSearchTerm, setNameSearchTerm] = useState("");
  const [descriptionSearchTerm, setDescriptionSearchTerm] = useState("");
  
  const [error, setError] = useState('');

  const handleShowSuspendModal = (profile) => {
    setSelectedProfileForSuspension(profile);
    setShowSuspendModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setNewProfile({ ...newProfile, [name]: val });
  };


  const toggleProfileDetails = async (profile) => {
    try {
      const response = await axios.get("http://localhost:5000/api/profiles/view_profile", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: {
          name: profile.name,
        },
      });
  
      // Set the fetched profile details to `rowSelectedProfile`
      setRowSelectedProfile(response.data.profile);
      setIsRowModalOpen(true); // Open the modal
    } catch (error) {
      console.error("Error fetching profile details:", error);
    }
  };
  

  const addProfile = async () => {
    try {
      setIsLoading(true); // Add loading state while creating profile
      
      // Make API call to create the new profile
      const response = await axios.post(
        "http://localhost:5000/api/profiles/create_profile",
        newProfile,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
  
      // Fetch the updated list of profiles after creating new one
      await fetchProfiles();
  
      // Show success message
      setSuccessMessage('Profile created successfully');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
  
      // Reset form and close modal
      setShowModal(false);
      setNewProfile({
        name: "",
        description: "",
        has_admin_permission: false,
        has_buy_permission: false,
        has_sell_permission: false,
        has_listing_permission: false,
      });
  
    } catch (error) {
        if (error.response && error.response.status === 401) {
          setShowLoginModal(true); // Show login modal if 401 error occurs
      } else {
        console.error("Error adding profile:", error);
        // Show error message to user
        setError('Failed to create profile. Please try again.');
        setTimeout(() => {
          setError('');
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (profile) => {
    setEditingProfile({ ...profile }); // Create a copy to edit
  };

  const saveProfile = async () => {
    try {
      const updatedProfile = {
        name: editingProfile.name,
        description: editingProfile.description,
        has_buy_permission: editingProfile.has_buy_permission,
        has_sell_permission: editingProfile.has_sell_permission,
        has_listing_permission: editingProfile.has_listing_permission,
      };
  
      const response = await axios.post(
        "http://localhost:5000/api/profiles/update_profile",
        updatedProfile,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
  
      if (response.status === 200) {
        // Update the local state with the updated profile
        setProfiles(profiles.map(profile => 
          profile.name === editingProfile.name ? {
            ...profile,
            ...updatedProfile
          } : profile
        ));
  
        // Show success message
        setSuccessMessage('Profile updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
        
        // Close the edit modal
        setEditingProfile(null);
  
        // Refresh the profiles list
        fetchProfiles();
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
          setShowLoginModal(true); // Show login modal if 401 error occurs
      } else {
        console.error("Error saving profile:", error);
        alert(error.response?.data?.error || "An error occurred while saving the profile.");
      }
    }
  };
  
  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/profiles/search_profile",
        { name: nameSearchTerm, description: descriptionSearchTerm },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      setProfiles(response.data.profile_list || []);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setShowLoginModal(true); // Show login modal if 401 error occurs
      } else {
        console.error("Error fetching profiles:", error);
        setError('Failed to fetch profiles. Please try again.');
        setTimeout(() => {
          setError('');
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  
  useEffect(() => {
    fetchProfiles();
  }, [nameSearchTerm, descriptionSearchTerm, access_token]);
  

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setEditingProfile({ ...editingProfile, [name]: val });
  };

  const handleSuspendProfile = async () => {
    if (!suspendDuration || !suspendReason || !selectedProfileForSuspension) {
      setSuspendInvalidMessage('Please fill in all fields.');
      setTimeout(() => setSuspendInvalidMessage(''), 3000);
      return;
    }
  
    try {
      const response = await axios.post(
        'http://localhost:5000/api/suspension/suspend_profile',
        {
          profile: selectedProfileForSuspension.name, 
          days: suspendDuration,
          reason: suspendReason,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
  
      if (response.data.success) {
        setSuspendInvalidMessage('');
        setSuspendDuration('');
        setSuspendReason('');
        setShowSuspendModal(false);
        setSuccessMessage(`All users with the ${selectedProfileForSuspension.name} profile have been suspended.`);
      } else {
        setSuspendInvalidMessage('Failed to suspend users by profile.');
      }
    } catch (error) {
      console.error('Error suspending profile:', error);
      setSuspendInvalidMessage('Error suspending profile.');
    }
  };
  

  return (
    <div className="flex flex-col items-center p-8 bg-[#0e0e17] rounded">
      {/* Add the success message here, right after the opening div */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50 transition-opacity duration-500">
          {successMessage}
        </div>
      )}

      {/* Relogin modal */}
      {showLoginModal && (
        <ReloginModal onClose={() => setShowLoginModal(false)} />
      )}

      <h1 className="text-4xl font-rajdhaniBold mb-5 uppercase text-white">
        User Profiles
      </h1>

      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          placeholder="Search by Name"
          value={nameSearchTerm}
          onChange={(e) => setNameSearchTerm(e.target.value)}
          className="p-2 rounded bg-[#0b0b12] text-white font-rajdhaniMedium placeholder-gray-400 border-2 border-[#f75049]/30 hover:border-[#f75049] hover:bg-[#231218] focus:border-[#f75049] focus:bg-[#692728] active:bg-[#a43836] active:border-[#f75049] transition-all duration-200 active:duration-50 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Search by Description"
          value={descriptionSearchTerm}
          onChange={(e) => setDescriptionSearchTerm(e.target.value)}
          className="p-2 rounded bg-[#0b0b12] text-white font-rajdhaniMedium placeholder-gray-400 border-2 border-[#f75049]/30 hover:border-[#f75049] hover:bg-[#231218] focus:border-[#f75049] focus:bg-[#692728] active:bg-[#a43836] active:border-[#f75049] transition-all duration-200 active:duration-50 focus:outline-none"
        />
      </div>
      

        {isLoading ? (
          // Loading State Table
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[#231218] border-2 border-[#f75049]">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-2 border-[#f75049] font-rajdhaniBold text-white">Profile Name</th>
                  <th className="py-2 px-4 border-2 border-[#f75049] font-rajdhaniBold text-white">Description</th>
                  <th className="py-2 px-4 border-2 border-[#f75049] font-rajdhaniBold text-white">Buy Permission</th>
                  <th className="py-2 px-4 border-2 border-[#f75049] font-rajdhaniBold text-white">Sell Permission</th>
                  <th className="py-2 px-4 border-2 border-[#f75049] font-rajdhaniBold text-white">Listing Permission</th>
                  <th className="py-2 px-4 border-2 border-[#f75049] font-rajdhaniBold text-red-500">Suspend</th>
                  <th className="py-2 px-4 border-2 border-[#f75049] font-rajdhaniBold text-green-500">Update</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-500"></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="min-w-full bg-[#0b0b12] border-2 border-[#f75049]">
            <thead>
              <tr>
                <th className="py-2 px-4 border-2 border-[#f75049] font-rajdhaniBold text-white">Profile Name</th>
                <th className="py-2 px-4 border-2 border-[#f75049] font-rajdhaniBold text-white">Description</th>
                <th className="py-2 px-4 border-2 border-[#f75049] font-rajdhaniBold text-white">Buy Permission</th>
                <th className="py-2 px-4 border-2 border-[#f75049] font-rajdhaniBold text-white">Sell Permission</th>
                <th className="py-2 px-4 border-2 border-[#f75049] font-rajdhaniBold text-white">Listing Permission</th>
                <th className="py-2 px-4 border-2 border-[#f75049] font-rajdhaniBold text-red-500">Suspend</th>
                <th className="py-2 px-4 border-2 border-[#f75049] font-rajdhaniBold text-green-500">Update</th>
              </tr>
            </thead>
            <tbody>
            {profiles && profiles.length > 0 ? (
            profiles.map((profile) => (
              <tr 
                key={profile.name} 
                className="hover:bg-[#692728] cursor-pointer"
                onClick={() => toggleProfileDetails(profile)}
              >
                <td className="py-2 px-4 border-2 border-[#f75049] font-rajdhaniSemiBold text-[#e2e2ef]">{profile.name}</td>
                <td className="py-2 px-4 border-2 border-[#f75049] font-rajdhaniSemiBold text-[#e2e2ef]">{profile.description}</td>
                <td className="py-2 px-4 border-2 border-[#f75049] font-rajdhaniSemiBold text-[#e2e2ef]">{profile.has_buy_permission ? "✓" : "✕"}</td>
                <td className="py-2 px-4 border-2 border-[#f75049] font-rajdhaniSemiBold text-[#e2e2ef]">{profile.has_sell_permission ? "✓" : "✕"}</td>
                <td className="py-2 px-4 border-2 border-[#f75049] font-rajdhaniSemiBold text-[#e2e2ef]">{profile.has_listing_permission ? "✓" : "✕"}</td>
                <td className="py-2 px-2 border-2 border-[#f75049] font-rajdhaniSemiBold text-[#e2e2ef]" onClick={(e) => e.stopPropagation()}>
                  {profile.name !== 'admin' && (
                    <button
                      onClick={() => handleShowSuspendModal(profile)}
                      className="bg-[#f75049] text-[#e2e2ef] p-2 text-lg rounded w-full h-10 flex items-center justify-center"
                    >
                      🚫
                    </button>
                  )}
                </td>
                <td className="py-2 px-2 border-2 border-[#f75049]" onClick={(e) => e.stopPropagation()}>
                  {profile.name !== 'admin' && (
                    <button
                      onClick={() => startEditing(profile)}
                      className="bg-[#1ded83] text-[#e2e2ef] p-2 text-lg rounded w-full h-10 flex items-center justify-center"
                    >
                      ✎
                    </button>
                  )}
                </td>
              </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" className="bg-[#231218] py-2 px-4 border-2 font-rajdhaniBold border-[#f75049] text-center text-[#f75049]">
              No profiles found.
            </td>
          </tr>
        )}
            </tbody>
          </table>
        </div>
        )}
      <button
        onClick={() => setShowModal(true)}
        className="mt-5 p-2 rounded bg-[#1ded83]/10 text-[#1ded83] font-rajdhaniSemiBold border-2 border-[#1ded83]/30 hover:border-[#1ded83] hover:bg-[#1ded83]/25 focus:border-[#1ded83] focus:bg-[#1ded83]/40 active:bg-[#1ded83]/70 active:border-[#1ded83] transition-all duration-200 active:duration-50 focus:outline-none"
      >
        Add Profile
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-[#0e0e17] border-2 border-[#f75049] p-8 rounded shadow-xl w-96">
            <h2 className="text-3xl font-rajdhaniBold mb-6 text-white">Add New Profile</h2>
            
            <div className="space-y-4">
              {/* Profile Name Input */}
              <input
                type="text"
                name="name"
                placeholder="Profile Name"
                value={newProfile.name}
                onChange={handleChange}
                className="w-full p-3 rounded bg-[#0b0b12] text-lg text-white font-rajdhaniMedium placeholder-gray-400 border-2 border-[#f75049]/30 hover:border-[#f75049] hover:bg-[#231218] focus:border-[#f75049] focus:bg-[#692728] active:bg-[#a43836] active:border-[#f75049] transition-all duration-200 active:duration-50 focus:outline-none"
              />

              {/* Description Input */}
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={newProfile.description}
                onChange={handleChange}
                className="w-full p-3 rounded bg-[#0b0b12] text-lg text-white font-rajdhaniMedium placeholder-gray-400 border-2 border-[#f75049]/30 hover:border-[#f75049] hover:bg-[#231218] focus:border-[#f75049] focus:bg-[#692728] active:bg-[#a43836] active:border-[#f75049] transition-all duration-200 active:duration-50 focus:outline-none"
              />

              {/* Permissions */}
              <div className="space-y-3 mt-4">

                <label className="flex items-center space-x-3 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_buy_permission"
                    checked={newProfile.has_buy_permission}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-[#f75049] text-[#f75049] focus:ring-0 focus:ring-offset-0 cursor-pointer bg-[#0b0b12]"
                  />
                  <span className="text-[#e2e2ef] text-lg font-rajdhaniMedium">Has Buy Permission</span>
                </label>

                <label className="flex items-center space-x-3 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_sell_permission"
                    checked={newProfile.has_sell_permission}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer bg-gray-700"
                  />
                  <span className="text-[#e2e2ef] text-lg font-rajdhaniMedium">Has Sell Permission</span>
                </label>

                <label className="flex items-center space-x-3 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_listing_permission"
                    checked={newProfile.has_listing_permission}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer bg-gray-700"
                  />
                  <span className="text-[#e2e2ef] text-lg font-rajdhaniMedium">Has Listing Permission</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-3 mt-6">
                <button
                  onClick={addProfile}
                  className="px-6 py-2 rounded bg-[#2570d4]/10 text-[#2570d4] font-rajdhaniSemiBold border-2 border-[#2570d4]/30 hover:border-[#2570d4] hover:bg-[#2570d4]/25 focus:border-[#2570d4] focus:bg-[#2570d4]/40 active:bg-[#2570d4]/70 active:border-[#2570d4] transition-all duration-200 active:duration-50 focus:outline-none"
                >
                  Create Profile
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 rounded bg-[#f75049]/10 text-[#f75049] font-rajdhaniSemiBold border-2 border-[#f75049]/30 hover:border-[#f75049] hover:bg-[#f75049]/25 focus:border-[#f75049] focus:bg-[#f75049]/40 active:bg-[#f75049]/70 active:border-[#f75049] transition-all duration-200 active:duration-50 focus:outline-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 -z-10"></div>
        </div>
      )}

      {editingProfile && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-[#0e0e17] border-2 border-[#f75049] p-8 rounded shadow-xl w-96">
            <h2 className="text-3xl font-rajdhaniBold mb-6 text-white">Edit Profile</h2>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  value={editingProfile.name}
                  onChange={handleEditChange}
                  className="w-full p-3 rounded bg-[#0b0b12] text-lg text-white font-rajdhaniMedium placeholder-gray-400 border-2 border-[#f75049]/30 hover:border-[#f75049] hover:bg-[#231218] focus:border-[#f75049] focus:bg-[#692728] active:bg-[#a43836] active:border-[#f75049] transition-all duration-200 active:duration-50 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="description"
                  value={editingProfile.description}
                  onChange={handleEditChange}
                  className="w-full p-3 rounded bg-[#0b0b12] text-lg text-white font-rajdhaniMedium placeholder-gray-400 border-2 border-[#f75049]/30 hover:border-[#f75049] hover:bg-[#231218] focus:border-[#f75049] focus:bg-[#692728] active:bg-[#a43836] active:border-[#f75049] transition-all duration-200 active:duration-50 focus:outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 text-white">
                  <input
                    type="checkbox"
                    name="has_buy_permission"
                    checked={editingProfile.has_buy_permission}
                    onChange={handleEditChange}
                    className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-[#e2e2ef] text-lg font-rajdhaniMedium">Has Buy Permission</span>
                </label>
                <label className="flex items-center space-x-3 text-white">
                  <input
                    type="checkbox"
                    name="has_sell_permission"
                    checked={editingProfile.has_sell_permission}
                    onChange={handleEditChange}
                    className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-[#e2e2ef] text-lg font-rajdhaniMedium">Has Sell Permission</span>
                </label>
                <label className="flex items-center space-x-3 text-white">
                  <input
                    type="checkbox"
                    name="has_listing_permission"
                    checked={editingProfile.has_listing_permission}
                    onChange={handleEditChange}
                    className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-[#e2e2ef] text-lg font-rajdhaniMedium">Has Listing Permission</span>
                </label>
              </div>
            </div>
            <div className="flex justify-center space-x-3 mt-6">
              <button
                onClick={saveProfile}
                className="px-6 py-2 rounded bg-[#2570d4]/10 text-[#2570d4] font-rajdhaniSemiBold border-2 border-[#2570d4]/30 hover:border-[#2570d4] hover:bg-[#2570d4]/25 focus:border-[#2570d4] focus:bg-[#2570d4]/40 active:bg-[#2570d4]/70 active:border-[#2570d4] transition-all duration-200 active:duration-50 focus:outline-none"
              >
                Save Profile
              </button>
              <button
                onClick={() => setEditingProfile(null)}
                className="px-6 py-2 rounded bg-[#f75049]/10 text-[#f75049] font-rajdhaniSemiBold border-2 border-[#f75049]/30 hover:border-[#f75049] hover:bg-[#f75049]/25 focus:border-[#f75049] focus:bg-[#f75049]/40 active:bg-[#f75049]/70 active:border-[#f75049] transition-all duration-200 active:duration-50 focus:outline-none"
              >
                Cancel
              </button>
            </div>
          </div>
          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 -z-10"></div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && selectedProfileForSuspension && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-[#0e0e17] border-2 border-[#f75049] p-8 rounded shadow-xl w-96">
            <h2 className="text-xl font-rajdhaniBold mb-4 text-white">
              Suspend {selectedProfileForSuspension.name} for how long?
            </h2>

            {/* Duration Input */}
            <input
              type="number"
              min="1"
              value={suspendDuration}
              onChange={(e) => setSuspendDuration(e.target.value)}
              className="w-full p-3 rounded bg-[#0b0b12] text-lg text-white font-rajdhaniMedium placeholder-gray-400 border-2 border-[#f75049]/30 hover:border-[#f75049] hover:bg-[#231218] focus:border-[#f75049] focus:bg-[#692728] active:bg-[#a43836] active:border-[#f75049] transition-all duration-200 active:duration-50 focus:outline-none"
              placeholder="Enter duration in days"
            />

            {/* Reason Input */}
            <input
              type="text"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="mt-3 w-full p-3 rounded bg-[#0b0b12] text-lg text-white font-rajdhaniMedium placeholder-gray-400 border-2 border-[#f75049]/30 hover:border-[#f75049] hover:bg-[#231218] focus:border-[#f75049] focus:bg-[#692728] active:bg-[#a43836] active:border-[#f75049] transition-all duration-200 active:duration-50 focus:outline-none"
              placeholder="Enter suspension reason"
            />

            {/* Error Message */}
            {suspendInvalidMessage && (
              <p className="text-red-500 mb-4">{suspendInvalidMessage}</p>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3 mt-5">
              <button
                onClick={() => {
                  handleSuspendProfile();
                }}
                className="px-6 py-2 rounded bg-[#2570d4]/10 text-[#2570d4] font-rajdhaniSemiBold border-2 border-[#2570d4]/30 hover:border-[#2570d4] hover:bg-[#2570d4]/25 focus:border-[#2570d4] focus:bg-[#2570d4]/40 active:bg-[#2570d4]/70 active:border-[#2570d4] transition-all duration-200 active:duration-50 focus:outline-none"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSuspendDuration('');
                  setSuspendReason('');
                  setSuspendInvalidMessage('');
                }}
                className="px-6 py-2 rounded bg-[#f75049]/10 text-[#f75049] font-rajdhaniSemiBold border-2 border-[#f75049]/30 hover:border-[#f75049] hover:bg-[#f75049]/25 focus:border-[#f75049] focus:bg-[#f75049]/40 active:bg-[#f75049]/70 active:border-[#f75049] transition-all duration-200 active:duration-50 focus:outline-none"
              >
                Cancel
              </button>
            </div>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-50 -z-10"></div>
        </div>
      )}


    {/*Profile Details Modal*/}
    {isRowModalOpen && rowSelectedProfile && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-[#0e0e17] border-2 border-[#f75049] p-8 rounded shadow-xl w-96">
          <h2 className="text-xl font-rajdhaniBold mb-4">Profile Details</h2>
          <div className="space-y-3">
            <p className="flex justify-between border-b border-gray-600 pb-2">
              <span className="font-rajdhaniSemiBold">Name:</span> 
              <span className="font-rajdhaniMedium">{rowSelectedProfile.name}</span>
            </p>
            <p className="flex justify-between border-b border-gray-600 pb-2">
              <span className="font-rajdhaniSemiBold">Description:</span> 
              <span className="font-rajdhaniMedium">{rowSelectedProfile.description}</span>
            </p>
            <p className="flex justify-between border-b border-gray-600 pb-2">
              <span className="font-rajdhaniSemiBold">Buy Permission:</span> 
              <span className={rowSelectedProfile.has_buy_permission ? "text-green-500" : "text-red-500"}>
                {rowSelectedProfile.has_buy_permission ? "✓" : "✕"}
              </span>
            </p>
            <p className="flex justify-between border-b border-gray-600 pb-2">
              <span className="font-rajdhaniSemiBold">Sell Permission:</span> 
              <span className={rowSelectedProfile.has_sell_permission ? "text-green-500" : "text-red-500"}>
                {rowSelectedProfile.has_sell_permission ? "✓" : "✕"}
              </span>
            </p>
            <p className="flex justify-between pb-2">
              <span className="font-rajdhaniSemiBold">Listing Permission:</span> 
              <span className={rowSelectedProfile.has_listing_permission ? "text-green-500" : "text-red-500"}>
                {rowSelectedProfile.has_listing_permission ? "✓" : "✕"}
              </span>
            </p>
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              onClick={() => setIsRowModalOpen(false)} 
              className="px-6 py-2 rounded bg-[#f75049]/10 text-[#f75049] font-rajdhaniBold border-2 border-[#f75049]/30 hover:border-[#f75049] hover:bg-[#f75049]/25 focus:border-[#f75049] focus:bg-[#f75049]/40 active:bg-[#f75049]/70 active:border-[#f75049] transition-all duration-200 active:duration-50 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
