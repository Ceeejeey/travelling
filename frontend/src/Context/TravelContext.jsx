import { createContext, useContext,useState } from "react";
import React from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";
// Create context
export const TravelContext = createContext();

// Create provider component
export const TravelContextProvider = ({ children }) => {

  const [addpackage,setaddpackage] =useState([]);
  const [addtrend,setaddtrend]=useState([]);
  const [addgallery,setaddgallery]= useState([]);

  const currency = "USD";
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  console.log("Backend URL from context:", backendUrl); // <-- ADD THIS
  console.log("Full API Request URL:", backendUrl  ); // <-- AND THIS
 
 
 const handleSpecial = () => {
    navigate("./");
    const scroll = document.getElementById("special-selection");
    if (scroll) {
      scroll.scrollIntoView({ behavior: "smooth" });
    }
  };


  return (
    <TravelContext.Provider value={{ currency ,handleSpecial , navigate,addpackage,setaddpackage,addtrend,setaddtrend,addgallery,setaddgallery}}>
      {children}
    </TravelContext.Provider>
  );
};

// Optional: custom hook for easier usage
export const useTravelContext = () => useContext(TravelContext);
