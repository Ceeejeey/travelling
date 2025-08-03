import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { IoReorderThreeOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5"; // Close icon
import { assets } from "../assets/Assest";
import { TravelContext } from "../Context/TravelContext";
import { useContext } from "react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { handleSpecial } = useContext(TravelContext);
  const {navigate} =useContext(TravelContext)

  return (
    <div className="bg-white shadow-md top-0 left-0 w-full fixed z-50 prata-regular">
      {/*------------------- PC View -------------------*/}
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center prata-regular">
        <Link to="./">
          <img src={assets.logo} alt="logo" className="w-16" />
        </Link>

        <ul className="hidden sm:flex gap-16 text-xl text-gray-700">
          <li>
            <NavLink
              to="./"
              className="flex flex-col items-center gap-1 hover:text-green-700"
            >
              <p className="gap-8">Home</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/"
              className="flex flex-col items-center gap-1 hover:text-green-700"
            >
              <p className="gap-8" onClick={handleSpecial}>
                About us
              </p>
              <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/gallery"
              className="flex flex-col items-center gap-1 hover:text-green-700"
            >
              <p className="gap-8">Gallery</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className="flex flex-col items-center gap-1 hover:text-green-700"
            >
              <p className="gap-8">Contact</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
            </NavLink>
          </li>
        </ul>

        <div className="hidden md:flex items-end gap-6">
          <button 
          onClick={()=>navigate('/cutompage')}
          className="py-2 px-4 bg-green-600 rounded-xl hover:bg-green-800 text-sm text-white outfit-regular cursor-pointer">
            Customize Packages
          </button>
        </div>

        {/*------------------- Hamburger Icon -------------------*/}
        <div className="md:hidden">
          <IoReorderThreeOutline
            size={28}
            className="text-gray-800 cursor-pointer"
            onClick={() => setIsOpen(true)}
          />
        </div>
      </div>

      {/*------------------- Mobile Menu -------------------*/}
      <div
        className={`fixed top-0 right-0 h-full bg-white transition-all duration-300 z-50 ${
          isOpen ? "w-2/4" : "w-0 overflow-hidden"
        }`}
      >
        <div className="flex flex-col text-gray-600 h-full">
          <div className="flex justify-between items-center p-4 border-b">
            <p className="font-bold text-lg">Menu</p>
            <IoClose
              size={24}
              className="cursor-pointer"
              onClick={() => setIsOpen(false)}
            />
          </div>
          <div className="flex flex-col gap-4 p-4 text-md">
            <NavLink to="./" onClick={() => setIsOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/gallery" onClick={() => setIsOpen(false)}>
              Collection
            </NavLink>
            <NavLink
              to="./"
              onClick={() => {
                setIsOpen(false);
                handleSpecial();
              }}
            >
              About
            </NavLink>
            <NavLink to="/contact" onClick={() => setIsOpen(false)}>
              Contact
            </NavLink>
            <button
            onClick={()=>{navigate('/cutompage'); setIsOpen(false)}}
            className="mt-2 w-32 py-1 px-1 bg-green-600 rounded-sm hover:bg-green-800 text-white text-sm outfit-regular">
              Customize Packages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
