import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { assets } from "../../assets/assets";
import { backendUrl } from "../../App";

const Addpkg = ({ token }) => {
  const [mainImage, setMainImage] = useState(null);
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [moreDetail, setMoreDetail] = useState("");

  const [visitingPlaces, setVisitingPlaces] = useState("");
  const [includes, setIncludes] = useState("");
  const [hotel, setHotel] = useState("");
  const [bookBefore, setBookBefore] = useState("");
  const [stayBetween, setStayBetween] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("duration", duration);
      formData.append("description", description);
      formData.append("moreDetail", moreDetail);
      formData.append(
        "visitingPlaces",
        JSON.stringify(
          visitingPlaces
            .split(",")
            .map((i) => i.trim())
            .filter((i) => i !== "")
        )
      );
      formData.append(
        "includes",
        JSON.stringify(
          includes
            .split(",")
            .map((i) => i.trim())
            .filter((i) => i !== "")
        )
      );
      formData.append(
        "hotel",
        JSON.stringify(
          hotel
            .split(",")
            .map((i) => i.trim())
            .filter((i) => i !== "")
        )
      );
      formData.append("book_before", bookBefore);
      formData.append("stay_between", stayBetween);

      if (!mainImage) {
        toast.error("Main package image is required.");
        return;
      }
      formData.append("image", mainImage);
      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);

      const response = await axios.post(`${backendUrl}/api/package/add`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success(response.data.message || "Package added successfully!");
        setName("");
        setPrice("");
        setDuration("");
        setDescription("");
        setMoreDetail("");
        setVisitingPlaces("");
        setIncludes("");
        setHotel("");
        setBookBefore("");
        setStayBetween("");
        setMainImage(null);
        setImage1(null);
        setImage2(null);
        setImage3(null);

        document.getElementById("mainImageInput").value = "";
        document.getElementById("imageInput1").value = "";
        document.getElementById("imageInput2").value = "";
        document.getElementById("imageInput3").value = "";
      } else {
        toast.error(response.data.message || "Failed to add package");
      }
    } catch (error) {
      toast.error("Error adding package");
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-lg rounded-2xl border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
        Add New Package
      </h2>

      <form onSubmit={onSubmitHandler} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Main Image */}
        <div className="col-span-2">
          <p className="mb-2 font-medium text-gray-700">Main Package Image</p>
          <label
            htmlFor="mainImageInput"
            className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center w-40 h-40 hover:border-blue-500 transition"
          >
            <img
              src={mainImage ? URL.createObjectURL(mainImage) : assets.upload_area}
              className="w-full h-full object-cover rounded-md"
            />
            <input
              type="file"
              id="mainImageInput"
              hidden
              accept="image/*"
              onChange={(e) => setMainImage(e.target.files[0])}
              required
            />
          </label>
        </div>

        {/* Additional Images */}
        <div className="col-span-2">
          <p className="mb-2 font-medium text-gray-700">Additional Images (Max 3)</p>
          <div className="flex gap-4 flex-wrap">
            {[setImage1, setImage2, setImage3].map((setter, index) => {
              const img = [image1, image2, image3][index];
              return (
                <label
                  key={index}
                  htmlFor={`imageInput${index + 1}`}
                  className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center w-28 h-28 hover:border-blue-500 transition"
                >
                  <img
                    src={img ? URL.createObjectURL(img) : assets.upload_area}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <input
                    type="file"
                    id={`imageInput${index + 1}`}
                    hidden
                    accept="image/*"
                    onChange={(e) => setter(e.target.files[0])}
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Name */}
        <div>
          <p className="mb-2 text-gray-700 font-medium">Package Name</p>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Price */}
        <div>
          <p className="mb-2 text-gray-700 font-medium">Price</p>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded-md"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        {/* Duration */}
        <div>
          <p className="mb-2 text-gray-700 font-medium">Duration</p>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded-md"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>

        {/* Visiting Places */}
        <div>
          <p className="mb-2 text-gray-700 font-medium">Visiting Places</p>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded-md"
            value={visitingPlaces}
            onChange={(e) => setVisitingPlaces(e.target.value)}
            required
          />
        </div>

        {/* Includes */}
        <div>
          <p className="mb-2 text-gray-700 font-medium">Includes</p>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded-md"
            value={includes}
            onChange={(e) => setIncludes(e.target.value)}
            required
          />
        </div>

        {/* Hotel */}
        <div>
          <p className="mb-2 text-gray-700 font-medium">Hotel</p>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded-md"
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
            required
          />
        </div>

        {/* Book Before */}
        <div>
          <p className="mb-2 text-gray-700 font-medium">Book Before</p>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded-md"
            value={bookBefore}
            onChange={(e) => setBookBefore(e.target.value)}
            required
          />
        </div>

        {/* Stay Between */}
        <div>
          <p className="mb-2 text-gray-700 font-medium">Stay Between</p>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded-md"
            value={stayBetween}
            onChange={(e) => setStayBetween(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="col-span-2">
          <p className="mb-2 text-gray-700 font-medium">Short Description</p>
          <textarea
            className="w-full border px-3 py-2 rounded-md min-h-[80px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* More Detail */}
        <div className="col-span-2">
          <p className="mb-2 text-gray-700 font-medium">More Detail</p>
          <textarea
            className="w-full border px-3 py-2 rounded-md min-h-[120px]"
            value={moreDetail}
            onChange={(e) => setMoreDetail(e.target.value)}
          />
        </div>

        {/* Submit */}
        <div className="col-span-2 flex justify-center">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
          >
            Add Package
          </button>
        </div>
      </form>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default Addpkg;
