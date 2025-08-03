
import React, { useContext } from "react";
import { TravelContext } from "../../Context/TravelContext";

const TrendingCard = ({ item }) => {
    const {navigate} =useContext(TravelContext)
  return (
    <div className="px-4 sm:px-8 py-6 bg-gray-50 rounded-2xl shadow">
      <h2 className="text-xl sm:text-2xl font-bold prata-regular mb-6">Visiting Places</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        {item.map((includeItem, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
            onClick={()=>navigate(`/trending/${includeItem._id}`)}
          >
            <img
              src={includeItem.image}
              alt={includeItem.name}
              className="w-24 h-24 sm:w-full sm:h-42  object-contain mb-3"
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

export default TrendingCard;
