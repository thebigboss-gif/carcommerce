"use client";

import { useState } from "react";

const initialProfiles = [
  {
    name: "Admin",
    description: "Administrator with full permissions",
    has_admin_permission: true,
    has_buy_permission: true,
    has_sell_permission: true,
    has_listing_permission: true,
  },
  {
    name: "Buyer",
    description: "User with permission to buy only",
    has_admin_permission: false,
    has_buy_permission: true,
    has_sell_permission: false,
    has_listing_permission: false,
  },
  {
    name: "Seller",
    description: "User with permission to sell",
    has_admin_permission: false,
    has_buy_permission: false,
    has_sell_permission: true,
    has_listing_permission: true,
  },
  {
    name: "Agent",
    description: "Used car agent with buy, sell, and listing permissions",
    has_admin_permission: false,
    has_buy_permission: true,
    has_sell_permission: true,
    has_listing_permission: true,
  },
];

export default function Profiles() {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [newProfile, setNewProfile] = useState({
    name: "",
    description: "",
    has_admin_permission: false,
    has_buy_permission: false,
    has_sell_permission: false,
    has_listing_permission: false,
  });
  const [editingProfile, setEditingProfile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setNewProfile({ ...newProfile, [name]: val });
  };

  const addProfile = () => {
    setProfiles([...profiles, { ...newProfile, id: profiles.length + 1 }]);
    setNewProfile({
      name: "",
      description: "",
      has_admin_permission: false,
      has_buy_permission: false,
      has_sell_permission: false,
      has_listing_permission: false,
    });
  };

  const deleteProfile = (name) => {
    setProfiles(profiles.filter((profile) => profile.name !== name));
  };

  const startEditing = (profile) => {
    setEditingProfile(profile);
  };

  const saveProfile = () => {
    setProfiles(
      profiles.map((profile) =>
        profile.name === editingProfile.name ? editingProfile : profile
      )
    );
    setEditingProfile(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setEditingProfile({ ...editingProfile, [name]: val });
  };

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 text-neon-red">
      {/* Page Header */}
      <h1 className="text-2xl font-extrabold mb-8 uppercase tracking-widest">
        User Profiles
      </h1>

      {/* Gallery for displaying profiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full md:w-4/5">
        {profiles
          .filter((profile) => profile.name !== "Admin") // Exclude Admin profile
          .map((profile) => (
            <div
              key={profile.name}
              className="bg-gray-700 text-white p-4 rounded-lg shadow-lg flex flex-col items-center"
            >
              <h3 className="text-xl font-bold">{profile.name}</h3>
              <p>{profile.description}</p>
              <div className="flex justify-around mt-4 w-full">
                <button
                  onClick={() => startEditing(profile)}
                  className="bg-yellow-500 text-black px-2 py-1 rounded hover:bg-yellow-600 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProfile(profile.name)}
                  className="bg-red-500 text-black px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          <div
              className="bg-gray-700 text-white p-4 rounded-lg shadow-lg flex flex-col items-center"
            >
              <h3 className="text-xl font-bold">Add New Profile</h3>
              <p>Click here to add new profile</p>
              <div className="flex justify-around mt-4 w-full">
                <button
                  onClick=""
                  className="bg-yellow-500 text-black px-2 py-1 rounded hover:bg-yellow-600 mr-2"
                >
                  Add
                </button>
                <button
                  onClick=""
                  className="bg-red-500 text-black px-2 py-1 rounded hover:bg-red-600"
                >
                  Add
                </button>
              </div>
            </div>
      </div>
    </div>
  );
}
