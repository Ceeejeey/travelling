import React from 'react';

const SubTitle = ({ text1, text2 }) => {
  return (
    <div className='flex  items-center mt-3 sm:mt-10 py-4  prata-regular'>
      <p className="text-black text-center prata-regular text-lg sm:text-3xl">
        {text1}{'  '}
        <span className="text-gray-700 font-medium outfit-regular">
          {text2}
        </span>
      </p>
    </div>
  );
};

export default SubTitle;
