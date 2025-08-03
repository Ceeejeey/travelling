import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { backendUrl } from '../../App';

const DeletePkg = ({ token }) => {
  const [name, setName] = useState('');

  const handleDelete = async () => {
    if (!name) {
      toast.warning("Please enter a package name to delete.");
      return;
    }

    try {
      const response = await axios.delete(`${backendUrl}/api/package/delete/${encodeURIComponent(name)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message || "Package deleted successfully!");
        setName('');
      } else {
        toast.error(response.data.message || "Package not found.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      if (error.response) {
        toast.error(error.response.data.message || `Server error: ${error.response.status}`);
      } else {
        toast.error("Something went wrong.");
      }
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg w-full max-w-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Delete Package</h2>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter package name to delete"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md outline-none"
        />
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
        >
          Delete Package
        </button>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default DeletePkg;
