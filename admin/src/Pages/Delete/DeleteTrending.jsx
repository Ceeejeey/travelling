import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { backendUrl } from '../../App';

const DeleteTrending = ({ token }) => {
  const [deleteName, setDeleteName] = useState('');

  const handleDelete = async () => {
    if (!deleteName.trim()) {
      toast.error('Please enter a name to delete.');
      return;
    }

    try {
      const res = await axios.delete(`${backendUrl}/api/trending/delete/${deleteName}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.success) {
        toast.success('Trending item deleted!');
        setDeleteName('');
      } else {
        toast.error(res.data.message || 'Failed to delete trending item.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting trending item.');
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-red-600">Delete Trending Item</h2>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={deleteName}
          onChange={(e) => setDeleteName(e.target.value)}
          placeholder="Enter name to delete"
          className="w-full border px-3 py-2 rounded-md outline-none"
        />
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
        >
          Delete Trending
        </button>
      </div>
      <ToastContainer position="top-center" autoClose={4000} />
    </div>
  );
};

export default DeleteTrending;
