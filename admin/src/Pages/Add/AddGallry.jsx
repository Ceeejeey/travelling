import React from 'react'
import { useState } from 'react'
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { backendUrl } from '../../App';
import { assets } from '../../assets/assets';

const AddGallry = ({token}) => {
    const [name,setname] =useState('');
    const [image,setimage]=useState(null)
    const [image1,setimage1]=useState(null)
    const [image2,setimage2]=useState(null)
    const [image3,setimage3]=useState(null)
    const [image4,setimage4]=useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!name ) {
          toast.error(" name  required.");
          return;
        }
    
        const formData = new FormData();
        formData.append('name', name);
        formData.append('image', image);
        formData.append('image1', image1);
        formData.append('image2', image2);
        formData.append('image3', image3);
        formData.append('image4', image4);
    
        try {
          const res = await axios.post(`${backendUrl}/api/gallery/add`, formData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
    
          if (res.data.success) {
            toast.success("gallery item added!");
            setname('');
            setimage(null);
            setimage1(null);
            setimage2(null);
            setimage3(null);
            setimage4(null);
            document.getElementById('includeImageInput').value = '';
          } else {
            toast.error(res.data.message || "Failed to add gallery item.");
          }
        } catch (err) {
          console.error(err);
          
        }
      };
    
  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
         <h2 className="text-xl font-bold mb-4">Add Gallery Images</h2>
         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
   
           {/* Name Field */}
           <div>
             <label className="block text-gray-700 mb-1"> Name</label>
             <input
               type="text"
               value={name}
               onChange={(e) => setname(e.target.value)}
               
               className="w-full border px-3 py-2 rounded-md outline-none"
               required
             />
           </div>
   
           {/* Image Upload */}
           <div>
             <label className="block text-gray-700 mb-1">Images</label><br/>
               <div className='grid grid-cols-5'>
             {/*-------------------image------------------- */}
             <label htmlFor="includeImageInput0" className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center w-28 h-28 hover:border-blue-500 transition duration-200">
               <img
                 className="w-full h-full object-cover"
                 src={image ? URL.createObjectURL(image) : assets.upload_area}
                 alt="Upload Area"
               />
               <input
                 type="file"
                 id="includeImageInput0"
                 hidden
                 accept="image/*"
                 onChange={(e) => setimage(e.target.files[0])}
                 required
               />
             </label>

             {/*-------------image1----------------- */}
                <label htmlFor="includeImageInput1" className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center w-28 h-28 hover:border-blue-500 transition duration-200">
               <img
                 className="w-full h-full object-cover"
                 src={image1 ? URL.createObjectURL(image1) : assets.upload_area}
                 alt="Upload Area"
               />
               <input
                 type="file"
                 id="includeImageInput1"
                 hidden
                 accept="image/*"
                 onChange={(e) => setimage1(e.target.files[0])}
                 required
               />
             </label>

             {/*---------------------imgage2------------------ */}
                <label htmlFor="includeImageInput2" className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center w-28 h-28 hover:border-blue-500 transition duration-200">
               <img
                 className="w-full h-full object-cover"
                 src={image2 ? URL.createObjectURL(image2) : assets.upload_area}
                 alt="Upload Area"
               />
               <input
                 type="file"
                 id="includeImageInput2"
                 hidden
                 accept="image/*"
                 onChange={(e) => setimage2(e.target.files[0])}
                 required
               />
             </label>
             {/*------------------------image3---------------------- */}
                <label htmlFor="includeImageInput3" className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center w-28 h-28 hover:border-blue-500 transition duration-200">
               <img
                 className="w-full h-full object-cover"
                 src={image3 ? URL.createObjectURL(image3) : assets.upload_area}
                 alt="Upload Area"
               />
               <input
                 type="file"
                 id="includeImageInput3"
                 hidden
                 accept="image/*"
                 onChange={(e) => setimage3(e.target.files[0])}
                 required
               />
             </label>
             {/*-------------------------image4--------------------- */}
                <label htmlFor="includeImageInput4" className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center w-28 h-28 hover:border-blue-500 transition duration-200">
               <img
                 className="w-full h-full object-cover"
                 src={image4 ? URL.createObjectURL(image4) : assets.upload_area}
                 alt="Upload Area"
               />
               <input
                 type="file"
                 id="includeImageInput4"
                 hidden
                 accept="image/*"
                 onChange={(e) => setimage4(e.target.files[0])}
                 required
               />
             </label>
           </div></div>
   
           {/* Submit */}
           <button
             type="submit"
             className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
           >
             Add Gallery
           </button>
         </form>
         <ToastContainer position="top-center" autoClose={3000} />
       </div>
  )
}

export default AddGallry