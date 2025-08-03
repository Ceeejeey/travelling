import React, { useState } from "react";


const AboutLankaHome = () => {
  const [aboutOpen, setaboutOpen] = useState(false);
  return (
    <div className="px-4 sm:px-8 md:px-8 lg:px-8 py-10  max-w-6xl mx-auto text-gray-800 leading-relaxed text-justify outfit-regular ">
      <p className="text-sm sm:text-base">
        Nestled like a teardrop in the vast Indian Ocean, Sri Lanka dazzles
        travelers with its endless diversity—from golden beaches and misty
        mountains to ancient ruins and vibrant city life. The country’s rich
        tapestry of history is woven with tales of kingdoms, temples, and
        colonial charm, while its natural wonders—like the lush rainforests of
        Sinharaja or the serene lakes of Kandy—offer soul-soothing experiences.
        Whether you're riding the scenic train to Ella, marveling at the
        Sigiriya rock fortress, or sipping Ceylon tea at a hilltop plantation,
        every corner promises awe and enchantment.
      </p>

      {aboutOpen ? (
        <p onClick={()=>setaboutOpen(false)} className="text-sm sm:text-base">
          Tourism in Sri Lanka is more than sightseeing—it's a warm embrace.
          Visitors are welcomed with genuine hospitality, flavorful cuisine, and
          spirited festivals that celebrate the island's multi-ethnic identity.
          Wildlife lovers can spot elephants, leopards, and exotic birds in the
          country's many national parks, while spiritual seekers find
          tranquility in ancient Buddhist temples and sacred sites. As an
          emerging travel hotspot, Sri Lanka offers world-class experiences with
          an authentic touch, making it the kind of place that stays in your
          heart long after you’ve left.
        </p>
      ) : (
        <div className="flex justify-center mt-4">
          <p
            onClick={() => setaboutOpen(true)}
            className="text-sm sm:text-base py-1 px-4 bg-gray-600 text-white w-fit hover:bg-gray-700 rounded cursor-pointer" 
          >
            See more...
          </p>
        </div>
      )}
    </div>
  );
};

export default AboutLankaHome;
