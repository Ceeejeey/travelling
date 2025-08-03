import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { backendUrl } from '../../App';

const DeleteInclude = ({ token }) => {
  const [deleteName, setDeleteName] = useState('');

  const handleDelete = async () => {
    if (!deleteName) {
      toast.error("Please enter a name to delete.");
      return;
    }

    try {
      const res = await axios.delete(`${backendUrl}/api/include/delete/${deleteName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        toast.success("Include item deleted successfully!");
        setDeleteName('');
      } else {
        toast.error(res.data.message || "Failed to delete include item.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting.");
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-red-600">Delete Include Item</h2>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={deleteName}
          onChange={(e) => setDeleteName(e.target.value)}
          placeholder="Enter include name to delete"
          className="w-full border px-3 py-2 rounded-md outline-none"
        />
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
        >
          Delete Include
        </button>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default DeleteInclude;
