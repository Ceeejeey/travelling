import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaEnvelope, FaPhone } from 'react-icons/fa';
import {assets} from '../assets/Assest';

const Footer = () => {
  return (
    <footer className="bg-green-200 text-gray-900 px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* Logo and Company */}
        <div>
          <img src={assets.logo} alt="logo" className="w-12 sm:w-24 mb-2" />
          <p className="text-sm text-gray-900">Explore Lanka Travels</p>
          <p className="text-sm text-gray-800 mt-1">© {new Date().getFullYear()} All rights reserved.</p>
        </div>

        {/* Navigation Links */}
        <div className=" hidden sm:flex flex-col gap-2">
          <h4 className="font-semibold text-lg mb-2">Quick Links</h4>
          <Link to="/" className="text-sm text-gray-800 hover:text-white">Home</Link>
          <Link to="/" className="text-sm text-gray-800 hover:text-white">About Us</Link>
          <Link to="/" className="text-sm text-gray-800 hover:text-white">Gallery</Link>
          <Link to="/" className="text-sm text-gray-800 hover:text-white">Contact</Link>
        </div>

        {/* Follow Us */}
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold text-lg mb-2">Follow Us</h4>
          <div className="flex gap-4 ">
            <a href="#" className="hover:text-green-400  size-4 sm:size-10"><FaFacebookF /></a>
            <a href="#" className="hover:text-pink-400  size-4 sm:size-10"><FaInstagram /></a>
            <a href="#" className="hover:text-blue-400  size-4 sm:size-10"><FaTwitter /></a>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold text-lg mb-2">Contact</h4>
          <p className="flex items-center gap-2 text-sm text-gray-800"><FaEnvelope /> explorelanka@gmail.com</p>
          <p className="flex items-center gap-2 text-sm text-gray-800"><FaPhone /> +94 71 234 5678</p>
          <p className="text-sm text-gray-800">123, Colombo Road, Kandy, Sri Lanka</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
