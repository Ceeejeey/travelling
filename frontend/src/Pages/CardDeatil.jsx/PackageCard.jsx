import React, { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../App";

const PackageCard = ({ item }) => {
  const [includeData, setIncludeData] = useState([]);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/include/includedata`)
      .then((res) => setIncludeData(res.data))
      .catch((err) => console.error(err));
  }, []);

  // ✅ Filter using fetched includeData
  const places = includeData.filter((plc) =>
    item.includes?.some(
      (name) => plc.name.toLowerCase() === name.toLowerCase()
    )
  );

  return (
    <div className="px-4 sm:px-8 py-6 bg-gray-50 rounded-2xl shadow">
      <h2 className="text-xl sm:text-2xl font-bold prata-regular mb-6">
        Include Into Package
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        {places?.map((includeItem, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            <img
              src={includeItem.image}
              alt={includeItem.name}
              className="w-24 h-24 sm:w-full sm:h-auto object-contain mb-3"
            />
            <p className="text-gray-700 text-sm sm:text-base text-center inter-regular">
              {includeItem.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackageCard;
