import React, { useContext } from 'react'

import { Link } from 'react-router-dom'
import { TravelContext } from '../../Context/TravelContext'

const CustomizedPackage = () => {

    const {currency , navigate,addpackage,setaddpackage} =useContext(TravelContext)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 mt-40 mb-20">
     {addpackage.map((item, index) => (
          <div key={index} className="px-2"  >
            <Link to={`/package/${item.name}`}>
            <div
              className="h-64 bg-cover bg-center rounded-xl relative overflow-hidden cursor-pointer"
              style={{ backgroundImage: `url(${item.image})` }}
            >
              <div className="absolute inset-0 flex items-end justify-center text-black text-center p-4">
                <div className="w-full bg-green-300/80 px-4 py-3 rounded-b-2xl">
                  <p className="text-xl sm:text-[22px] font-semibold tracking-wide leading-snug prata-regular">
                    {item.name}
                  </p>
                  <div className="flex justify-between text-sm sm:text-base font-medium mt-1 inter-regular">
                    <span>
                      {currency}
                      {item.price}
                    </span>
                    <span>For {item.duration}</span>
                  </div>
                </div>
              </div>
            </div>
            </Link>
          </div>
        ))}
  </div>
  )
}

export default CustomizedPackage