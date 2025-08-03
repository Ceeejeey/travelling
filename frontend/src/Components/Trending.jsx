import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React, { useContext,useEffect } from "react";
import Slider from "react-slick";
import { TravelContext } from "../Context/TravelContext";
import axios from "axios";
import { BACKEND_URL } from "../App";

const Trending= () => {

  const {navigate,addtrend,setaddtrend} =useContext(TravelContext);

   useEffect(()=>{
      axios
      .get(`${BACKEND_URL}/api/trending/trenddata`)
      .then((res)=>setaddtrend(res.data))
      .catch((err) => console.error(err));
  
    },[])
  const settings = {
    dots: false,
    arrows: true,
    autoplay: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <div className="px-4 py-10">
      <Slider {...settings}>
        {addtrend. map((item, index) => (
          <div key={index} className="px-2" onClick={()=>navigate(`/trending/${item.name}`)}>
            <div
              className="h-64 bg-cover bg-center rounded-xl flex items-end p-4 text-white"
              style={{ backgroundImage: `url(${item.image})` }}
            >
              <div className="bg-black/50 p-2 rounded w-full">
                <p className="text-sm font-semibold">{item.name}</p>
                <span className="text-xs">{item.subname}</span>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Trending;
