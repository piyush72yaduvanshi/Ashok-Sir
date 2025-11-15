import React, { useEffect, useState } from "react";
import api from "../config/api"; // adjust path as needed
import { motion } from "framer-motion";

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        setProfileData(res.data.data);
      } catch (err) {
        console.error(err);
        setError("❌ Failed to fetch profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="loader border-4 border-indigo-300 border-t-indigo-700 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );

  if (error)
    return (
      <div className="h-screen flex items-center justify-center text-red-600 font-semibold text-lg">
        {error}
      </div>
    );

  const { profile, createdFranchises, createdUsers, stats } = profileData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-100 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl rounded-2xl p-6 max-w-5xl mx-auto mb-8"
      >
        <h1 className="text-3xl font-extrabold text-indigo-700 text-center mb-4">
          👤 Profile Overview
        </h1>

        <div className="grid md:grid-cols-2 gap-6 text-gray-700">
          <div>
            <p>
              <span className="font-semibold">Name:</span> {profile?.name}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {profile?.email}
            </p>
            <p>
              <span className="font-semibold">Mobile:</span> {profile?.mobileNo}
            </p>
          </div>
          <div>
            <p>
              <span className="font-semibold">Role:</span> {profile?.role}
            </p>
            <p>
              <span className="font-semibold">Verified:</span>{" "}
              {profile?.isVerified ? (
                <span className="text-green-600 font-medium">Yes ✅</span>
              ) : (
                <span className="text-red-500 font-medium">No ❌</span>
              )}
            </p>
            <p>
              <span className="font-semibold">Active:</span>{" "}
              {profile?.isActive ? (
                <span className="text-green-600 font-medium">Active</span>
              ) : (
                <span className="text-red-500 font-medium">Inactive</span>
              )}
            </p>
          </div>
        </div>

        <p className="text-gray-500 text-sm mt-3 text-center">
          Account Created:{" "}
          {new Date(profile?.createdAt).toLocaleString("en-IN")}
        </p>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl mx-auto mb-10 grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        {[
          {
            label: "Total Franchises",
            value: stats?.totalFranchises,
            color: "bg-indigo-500",
          },
          {
            label: "Active Franchises",
            value: stats?.activeFranchises,
            color: "bg-green-500",
          },
          {
            label: "Total Users",
            value: stats?.totalUsers,
            color: "bg-purple-500",
          },
          {
            label: "Active Users",
            value: stats?.activeUsers,
            color: "bg-blue-500",
          },
          {
            label: "Verified Users",
            value: stats?.verifiedUsers,
            color: "bg-pink-500",
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`${item.color} text-white rounded-xl p-4 text-center shadow-lg`}
          >
            <p className="text-lg font-semibold">{item.label}</p>
            <p className="text-2xl font-bold mt-1">{item.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Created Franchises */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6 mb-10"
      >
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">
          🏢 Created Franchises
        </h2>

        {createdFranchises?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-indigo-100 text-gray-700">
                  <th className="p-3 text-left">Business Name</th>
                  <th className="p-3 text-left">Owner</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">City</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {createdFranchises.map((f) => (
                  <tr
                    key={f._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3">{f.businessName}</td>
                    <td className="p-3">{f.ownerName}</td>
                    <td className="p-3">{f.email}</td>
                    <td className="p-3">{f.phone}</td>
                    <td className="p-3">{f.city}</td>
                    <td className="p-3">
                      {f.isActive ? (
                        <span className="text-green-600 font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="text-red-500 font-medium">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center">No franchises found.</p>
        )}
      </motion.div>

      {/* Created Users */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6"
      >
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">
          👥 Created Users
        </h2>

        {createdUsers?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-indigo-100 text-gray-700">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Mobile</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Verified</th>
                  <th className="p-3 text-left">Active</th>
                </tr>
              </thead>
              <tbody>
                {createdUsers.map((u) => (
                  <tr key={u._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.mobileNo}</td>
                    <td className="p-3">{u.role}</td>
                    <td className="p-3">
                      {u.isVerified ? (
                        <span className="text-green-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-red-500 font-medium">No</span>
                      )}
                    </td>
                    <td className="p-3">
                      {u.isActive ? (
                        <span className="text-green-600 font-medium">Active</span>
                      ) : (
                        <span className="text-red-500 font-medium">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center">No users found.</p>
        )}
      </motion.div>
    </div>
  );
};

export default ProfilePage;
