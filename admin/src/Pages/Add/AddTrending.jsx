import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { backendUrl } from '../../App';

const AddTrending = ({ token }) => {
  const [name, setName] = useState('');
  const [subname, setSubname] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error('Main image is required!');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('subname', subname);
    formData.append('description', description);
    formData.append('image', image);

    // Correct field names matching backend
    if (image1) formData.append('image1', image1);
    if (image2) formData.append('image2', image2);
    if (image3) formData.append('image3', image3);
    if (image4) formData.append('image4', image4);

    try {
      const response = await axios.post(`${backendUrl}/api/trending/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Trending item added successfully!');
        setName('');
        setSubname('');
        setDescription('');
        setImage(null);
        setImage1(null);
        setImage2(null);
        setImage3(null);
        setImage4(null);

        // Reset file inputs
        document.getElementById('mainImageInput').value = '';
        document.getElementById('subImageInput1').value = '';
        document.getElementById('subImageInput2').value = '';
        document.getElementById('subImageInput3').value = '';
        document.getElementById('subImageInput4').value = '';
      } else {
        toast.error(response.data.message || 'Failed to add item.');
      }
    } catch (error) {
      toast.error('Error uploading item');
      console.error(error);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Add Trending Item</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <label className="block text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded-md outline-none"
          />
        </div>

        {/* Subname */}
        <div>
          <label className="block text-gray-700 mb-1">Subname</label>
          <input
            type="text"
            value={subname}
            onChange={(e) => setSubname(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded-md outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded-md outline-none min-h-[80px]"
          />
        </div>

        {/* Main Image */}
        <div>
          <label className="block text-gray-700 mb-1">Main Image</label>
          <input
            type="file"
            id="mainImageInput"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="border px-3 py-2 rounded-md w-full"
            required
          />
        </div>

        {/* Sub Images */}
        <div>
          <label className="block text-gray-700 mb-1">Sub Images</label>
          <div className="flex flex-col gap-2">
            <input
              id="subImageInput1"
              type="file"
              accept="image/*"
              onChange={(e) => setImage1(e.target.files[0])}
              className="border px-3 py-2 rounded-md"
            />
            <input
              id="subImageInput2"
              type="file"
              accept="image/*"
              onChange={(e) => setImage2(e.target.files[0])}
              className="border px-3 py-2 rounded-md"
            />
            <input
              id="subImageInput3"
              type="file"
              accept="image/*"
              onChange={(e) => setImage3(e.target.files[0])}
              className="border px-3 py-2 rounded-md"
            />
            <input
              id="subImageInput4"
              type="file"
              accept="image/*"
              onChange={(e) => setImage4(e.target.files[0])}
              className="border px-3 py-2 rounded-md"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Add Trending
        </button>
      </form>
      <ToastContainer position="top-center" autoClose={4000} />
    </div>
  );
};

export default AddTrending;
