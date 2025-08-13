import { useParams } from "react-router-dom";
import React, { useContext } from "react";
import { FaRegHeart } from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";
import { TravelContext } from "../../Context/TravelContext";
import RightCard from "./RightCard";
import PackageCard from "./PackageCard";
import TrendingCard from "./TrendingCard";
import { v4 as uuidv4 } from 'uuid';

const Package = () => {
  const { addpackage, addtrend, navigate } = useContext(TravelContext);


  // ✅ Get package name from URL and decode it
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);

  // ✅ Show loading if packages are not fetched yet
  if (!addpackage || addpackage.length === 0) {
    return (
      <div className="mt-40 text-center text-gray-500">
        Loading package details...
      </div>
    );
  }

  // ✅ Find matching package (case-insensitive)
  const item = addpackage.find(
    (pkg) => pkg.name.toLowerCase() === decodedName.toLowerCase()
  );
  
  const uniqueKey = item?.id || uuidv4();
  // ✅ Show error if package not found
  if (!item) {
    return (
      <div className="mt-40 text-center text-red-500">Package not found</div>
    );
  }

  //  Filter visiting places from trending list
  const places = addtrend.filter((plc) =>
    item.visitingPlaces?.some(
      (placeName) => plc.name.toLowerCase() === placeName.toLowerCase()
    )
  );

  return (
    <div className="mt-32 flex flex-col md:flex-row px-6 gap-6">
      {/* ---------------- Left Side ---------------- */}
      <div className="w-full md:w-2/3 flex flex-col gap-6">
        <h2 className="text-xl sm:text-4xl font-bold ml-4 prata-regular flex items-center gap-3">
          <IoMdArrowBack
            className="size-4 sm:size-8 cursor-pointer"
            onClick={() => navigate("/")}
          />
          {item.name}
        </h2>

        {/* Main Image */}
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-96 rounded-2xl shadow-2xl object-cover"
        />

        {/* Sub Images Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[item.image1, item.image2, item.image3]
            .filter(Boolean) // ✅ Ensures only valid images are rendered
            .map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${item.name}-sub-${index}`}
                className="w-full h-32 object-cover rounded-xl shadow"
              />
            ))}
        </div>

        {/* Visiting Places */}
        {item.visitingPlaces && places.length > 0 && (
          <TrendingCard item={places} />
        )}

        {/* Hotel Facilities */}
        <div className="border border-gray-200 rounded-2xl shadow px-4 sm:px-8 py-6 mb-10 bg-white">
          <h2 className="text-xl sm:text-2xl font-bold prata-regular mb-6">
            Hotel 
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {item.hotel?.map((facility, index) => (
              <p
                key={index}
                className="text-gray-700 text-sm sm:text-lg inter-regular flex items-center gap-2"
              >
                <FaRegHeart className="text-red-700" />
                {facility}
              </p>
            ))}
          </div>
        </div>

        {/* Include Into Package */}
        <PackageCard item={item} />
      </div>

      {/* ---------------- Right Side ---------------- */}
      <RightCard key={uniqueKey} item={item} />
    </div>
  );
};

export default Package;
