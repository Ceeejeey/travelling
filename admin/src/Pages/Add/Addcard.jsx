import React from 'react';
import { useNavigate } from 'react-router-dom';

const Addcard = ({token}) => {

const navigate=useNavigate();

  return (

    <div className='flex flex-col items-center justify-center p-4'>
    
      <div className='grid grid-cols-1 md:grid-cols-4 gap-8 w-full max-w-6xl'> 

        {/*--------------Main Pkg Details--------------------- */}
        <div
        onClick={()=>navigate('/addpkg')}
        className='w-full min-h-96 bg-emerald-900 shadow shadow-cyan-400 rounded-2xl flex items-center justify-center text-white text-3xl font-bold p-4 cursor-pointer'>
          <h1>PACKAGE DETAIL</h1>
        </div>

        {/*--------------Trending Places--------------------- */}
        <div
        onClick={()=>navigate('/addtrending')}
        className='w-full min-h-96 bg-emerald-900 shadow shadow-cyan-400 rounded-2xl flex items-center justify-center text-white text-3xl font-bold p-4 cursor-pointer'>
          <h1>TRENDING PLACES</h1>
        </div>


        {/*--------------Activity Include--------------------- */}
        <div
         onClick={()=>navigate('/addinclude')}
         className='w-full min-h-96 bg-emerald-900 shadow shadow-cyan-400 rounded-2xl flex items-center justify-center text-white text-3xl font-bold p-4 cursor-pointer'>
          <h1>Package includes </h1>
        </div>

    
    {/*----------------adding gallery------------------------ */}

     <div
         onClick={()=>navigate('/addgallery')}
         className='w-full min-h-96 bg-emerald-900 shadow shadow-cyan-400 rounded-2xl flex items-center justify-center text-white text-3xl font-bold p-4 cursor-pointer'>
          <h1>ADD GALLERY </h1>
        </div>

      </div>
      </div>
  );
};

export default Addcard;