import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { TravelContext } from "../../Context/TravelContext";
import { BACKEND_URL } from "../../App";

const Gallery = () => {
  const categoryList = ["all", "Ella", "polonnaruwa", "Galle", "Kandy", "Dambulla", "Colombo"];
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { addgallery, setaddgallery } = useContext(TravelContext);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/gallery/gallerydata`)
      .then((res) => setaddgallery(res.data))
      .catch((err) => console.log(err));
  }, []);

  // ✅ Filter images
  const filteredGallery =
    selectedCategory === "all"
      ? addgallery
      : addgallery.filter((item) => item.name === selectedCategory);

  return (
    <div className="mt-32 p-4">
      {/* Category Buttons */}
      <div className="flex flex-row flex-wrap gap-4 sm:gap-6 mb-6">
        {categoryList.map((cat, index) => (
          <div
            key={index}
            onClick={() => setSelectedCategory(cat)}
            className={`py-1 px-3 sm:w-[120px] text-center rounded cursor-pointer prata-regular font-semibold ${
              selectedCategory === cat ? "bg-green-700 text-white" : "bg-green-300 text-black"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </div>
        ))}
      </div>

      {/* Gallery Images */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredGallery.map((item, index) => (
          <React.Fragment key={index}>
            {item.image && (
              <img src={item.image} alt={item.category} className="w-full h-auto rounded shadow fade-in" />
            )}
            {item.image1 && (
              <img src={item.image1} alt={item.category} className="w-full h-auto rounded shadow fade-in" />
            )}
            {item.image2 && (
              <img src={item.image2} alt={item.category} className="w-full h-auto rounded shadow fade-in" />
            )}
            {item.image3 && (
              <img src={item.image3} alt={item.category} className="w-full h-auto rounded shadow fade-in" />
            )}
            {item.image4 && (
              <img src={item.image4} alt={item.category} className="w-full h-auto rounded shadow fade-in" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
