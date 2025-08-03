import React from 'react'
import { assets } from '../assets/Assest'

const Hero = () => {
  return (
    <div className='flex flex-col sm:flex-row border border-gray-400 prata-regular mt-16 sm:mt-2'>
    {/*hero left side */}
    <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0'>
      <div className='text-[#414141'>
        <div className='flex items-center gap-2'>
     <p className='w-8 md:w-11 h-[2px] bg-[#414141]'></p>
     <p className='font-medium text-xl md:test-base'>A WORLD OF ENDLESS TRAVEL POSSIBILITIES</p>
        </div>
              <h1 className=' prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed '>Modern Travelers Lanka</h1>
              <div className='flex items-center gap-2'>
             
                  <p className='w-8 md:w11 h-[1px] bg-[#414141]'></p>
              </div>
    
      </div>
    </div>
    {/*right side */}
    <img src={assets.Hero} alt='' className='w-full sm:w-1/2'/>
    </div>
  )
}

export default Hero