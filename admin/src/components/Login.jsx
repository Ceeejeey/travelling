import React, { useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Login = ({ settoken }) => {
  
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');

  const onSubmitHandler = async (e) => {

    e.preventDefault();

    try {
      
      const response = await axios.post(backendUrl + '/api/admin/login', {
        email,
        password,
      });

      if (response.data.success) {
        settoken(response.data.token);
        toast.success(response.data.message); 
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Login error:', error); 
     
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message); 
      } else 
        
        {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center w-full bg-gray-100 font-inter'>
      <div className='bg-white shadow-lg rounded-xl px-8 py-8 max-w-md w-full'>
        <h1 className='text-3xl font-bold text-center text-gray-800 mb-6'>Admin Login</h1>
        <form onSubmit={onSubmitHandler}>
          <div className='mb-5'>
            <label htmlFor="email" className='block text-sm font-medium text-gray-700 mb-2'>Email Address</label>
            <input
              id="email"
              onChange={(e) => setemail(e.target.value)}
              className='rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200'
              type='email'
              placeholder='your@gmail.com'
              value={email} 
              required
            />
          </div>

          <div className='mb-6'>
            <label htmlFor="password" className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
            <input
              id="password"
              onChange={(e) => setpassword(e.target.value)}
              className='rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200'
              type='password'
              placeholder='Enter password'
              value={password} 
              required
            />
          </div>
          <button
            className='w-full px-4 py-2 text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 shadow-md'
            type='submit'
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
