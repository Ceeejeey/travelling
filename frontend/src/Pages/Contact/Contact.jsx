import React from 'react'
import { assets } from '../../assets/Assest'
import { FaWhatsappSquare } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { IoLocationSharp } from "react-icons/io5";

const Contact = () => {
  return (
    <div className='flex flex-col sm:flex-row p-6 sm:p-10 gap-6 mt-20'>

      {/* Right Side - Image */}
      <div className='flex flex-col w-full sm:block sm:w-1/3'>
        <img 
          src={assets.contact} 
          alt='Contact Us' 
          className='w-full h-full object-cover rounded-lg shadow-md' 
        />
      </div>

      {/* Left Side - Contact Info */}
      <div className='flex flex-col w-full sm:w-2/3 gap-6 bg-green-100 rounded-lg p-6 shadow-lg'>

        {/* WhatsApp */}
        <div className='flex gap-4 items-center'>
          <FaWhatsappSquare className='text-green-700 text-3xl' />
          <div>
            <p className='text-lg font-semibold prata-regular'>WhatsApp Number</p>
            <p className='text-gray-600'>(+94) 785 897 048</p>
          </div>
        </div>

        {/* Email */}
        <div className='flex gap-4 items-center'>
          <MdEmail className='text-red-500 text-3xl' />
          <div>
            <p className='text-lg font-semibold prata-regular'>E-Mail</p>
            <p className='text-gray-600'>moderntravelerslanka@gmail.com</p>
          </div>
        </div>

        {/* Address */}
        <div className='flex gap-4 items-center'>
          <IoLocationSharp className='text-blue-700 text-3xl' />
          <div>
            <p className='text-lg font-semibold prata-regular'>Head Office</p>
            <p className='text-gray-600'>Polonnaruwa</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
