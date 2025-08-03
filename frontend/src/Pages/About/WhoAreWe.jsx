import React, { useState } from 'react'
import {assets} from '../../assets/Assest'
import { Link } from 'react-router-dom'

const WhoAreWe = ({id}) => {
       const [aboutOpen, setaboutOpen] =useState(false);
  return (
    <div id={id}>
    <div className='flex flex-col sm:flex sm:flex-row'>

        {/*----------------------left side------------------------------- */}
        <div className='hidden  sm:flex sm:w-[1/2]'>
          <img src={assets.logo} alt='' className='w-full'/>
           
        </div>
        {/*---------------------right side------------------------------- */}
        <div className='mt-5 sm:mt-10 sm:w-[1/2] px-4 sm:py-6'>

           <h1 className='text-sm sm:text-xl prata-regular mt-5'>WHO WE ARE ?</h1>
            <p className='text-sm sm:text-lg  mt-5  outfit-regular'>
                  
Welcome to Modern Travelers Lanka! We provide service for all of you who want to travel with new experiences in the new world.  We live in the city of Polonnaruwa in Sri Lanka, where our headquarters is located. Our goal is to provide you all with an unforgettable travel experience.
                  </p>
            <p className='text-sm sm:text-m mt-5 justify-center '>
                   _Join us for a different experience ♡_
                  </p>
                
            
              
                {aboutOpen ? (
                  <div onClick={()=>setaboutOpen(false)} className='mt-4 flex flex-col mb-2'>
                    <p className='mt-2 text-sm sm:text-xl prata-regular font-bold'>Why We are Special?</p>
                    <p className='text-base sm:text-m inter-regular mt-2'>-We have a wide range of packages to suit your budget..</p>
                    <p className='text-base sm:text-m inter-regular mt-2'>-We have a professional team also they are graduated in      Sri Lanka Tourism industry.</p>
                    <p className='text-base sm:text-m inter-regular mt-2'>-We offer 24/7 customer support to our clients.</p>
                    <p className='text-base sm:text-m inter-regular mt-2'>-We have Qualified Drivers and Staff.</p>
                    <p className='text-base sm:text-m inter-regular mt-2'>-We give  100% Value for Money</p>

              </div>

                ):(
                  <div className="flex justify-center mt-4">
                         <p
                  onClick={()=>setaboutOpen(true)}
                 className='mt-10 text-sm sm:text-base py-1 px-4 bg-gray-600 text-white w-fit hover:bg-gray-700 rounded mb-4 cursor-pointer'>
                  See more...
                </p>
                  </div>
                )}
               
               
        </div>


        
    </div></div>
  )
}

export default WhoAreWe