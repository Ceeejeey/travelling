import React from 'react'

const RightCard = ({item}) => {
  
  return (
     <div className="  w-full md:w-1/3">
      <div className="sticky bg-green-100 p-4 rounded-xl shadow-lg shadow-green-800 space-y-6 border border-gray-200 self-start mt-10">
       
       

        {/* Duration */}
        <div>
          <h3 className="text-gray-600 text-sm">Duration</h3>
          <p className="text-gray-800 font-semibold text-base">{item.duration}</p>
        </div>

        {/* Booking Info */}
        <div className="text-sm">
          <p className="font-semibold text-black mb-1">Book before <span className="font-normal ml-2">{item.book_before}</span></p>
          <p className="font-semibold text-black">Stay between <span className="font-normal ml-2">{item.stay_between}</span></p>
        </div>

        {/* Price */}
        <div>
          <p className="text-2xl font-bold text-black">USD ${item.price}</p>
          <p className="text-sm text-gray-600">Per Person</p>
        </div>

        {/* Book Now Button */}
        <div className="flex items-center justify-between">
          <button className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition text-sm font-semibold">
            Book Now
          </button>
        
        </div>

        {/* Reply Note */}
        <p className="text-xs text-gray-500">*Our reply time is almost instant</p>

         <img src='https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg' alt='' className="w-1/2"/>
         
      </div>
        {/*--------------------more detail----------------------------- */}
       <div className="mt-10 ">
      <p className="prata-regular text-sm sm:text-xl mt-10 ">More Detail</p>
      <p className="inter-regular text-base sm:text-sm mt-10 letter-spacing: var(--tracking-wide)">{item.moreDetail}</p>
      </div>
      </div>
    
  )
}

export default RightCard