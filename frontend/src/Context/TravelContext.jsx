import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

/**
 * @typedef {Object} Package
 * @property {string} name
 * @property {number} price
 * @property {string} duration
 * @property {string} image
 * @property {string} book_before
 * @property {string} stay_between
 * @property {string} moreDetail
 */

/**
 * @typedef {Object} Trend
 * @property {string} id
 * @property {string} title
 * @property {string} image
 */

/**
 * @typedef {Object} Gallery
 * @property {string} id
 * @property {string} image
 * @property {string} caption
 */

/**
 * @typedef {Object} TravelContextType
 * @property {string} currency
 * @property {(newCurrency: string) => void} setCurrency
 * @property {() => void} handleSpecial
 * @property {import('react-router-dom').NavigateFunction} navigate
 * @property {Package[]} addpackage
 * @property {(packages: Package[]) => void} setaddpackage
 * @property {Trend[]} addtrend
 * @property {(trends: Trend[]) => void} setaddtrend
 * @property {Gallery[]} addgallery
 * @property {(galleries: Gallery[]) => void} setaddgallery
 */

export const TravelContext = createContext(/** @type {TravelContextType | null} */ (null));

/**
 * Sanitizes a package name by trimming whitespace and removing special characters
 * @param {string} name
 * @returns {string}
 */
const sanitizePackageName = (name) => {
  if (!name) return '';
  return name.trim().replace(/[^a-zA-Z0-9\s-]/g, '');
};

/**
 * Validates a package object
 * @param {Package} pkg
 * @returns {boolean}
 */
const isValidPackage = (pkg) => {
  return pkg && typeof pkg.name === 'string' && pkg.name.trim() !== '' && typeof pkg.price === 'number';
};

/**
 * @param {{ children: React.ReactNode }} props
 */
export const TravelContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // Initialize states with localStorage fallback
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'USD');
  const [addpackage, setaddpackage] = useState(() => {
    try {
      const saved = localStorage.getItem('addpackage');
      const packages = saved ? JSON.parse(saved) : [];
      // Validate and sanitize packages
      return packages
        .filter(isValidPackage)
        .map((pkg) => ({ ...pkg, name: sanitizePackageName(pkg.name) }));
    } catch (error) {
      console.error('Error parsing addpackage from localStorage:', error);
      return [];
    }
  });
  const [addtrend, setaddtrend] = useState(() => {
    try {
      const saved = localStorage.getItem('addtrend');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error parsing addtrend from localStorage:', error);
      return [];
    }
  });
  const [addgallery, setaddgallery] = useState(() => {
    try {
      const saved = localStorage.getItem('addgallery');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error parsing addgallery from localStorage:', error);
      return [];
    }
  });

  // Persist states to localStorage
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('addpackage', JSON.stringify(addpackage));
  }, [addpackage]);

  useEffect(() => {
    localStorage.setItem('addtrend', JSON.stringify(addtrend));
  }, [addtrend]);

  useEffect(() => {
    localStorage.setItem('addgallery', JSON.stringify(addgallery));
  }, [addgallery]);

  // Fetch data if states are empty
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (addpackage.length === 0) {
          const response = await axios.get(`${backendUrl}/api/packages/pkgdetail`);
          const sanitizedPackages = response.data
            .filter(isValidPackage)
            .map((pkg) => ({ ...pkg, name: sanitizePackageName(pkg.name) }));
          setaddpackage(sanitizedPackages);
          toast.success('Packages loaded successfully');
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        toast.error('Failed to load packages. Please try again.');
      }

      try {
        if (addtrend.length === 0) {
          const response = await axios.get(`${backendUrl}/api/trending/trenddata`);
          setaddtrend(response.data);
          toast.success('Trends loaded successfully');
        }
      } catch (error) {
        console.error('Error fetching trends:', error);
        toast.error('Failed to load trends. Please try again.');
      }

      try {
        if (addgallery.length === 0) {
          const response = await axios.get(`${backendUrl}/api/gallery/gallerydata`);
          setaddgallery(response.data);
          toast.success('Gallery loaded successfully');
        }
      } catch (error) {
        console.error('Error fetching gallery:', error);
        toast.error('Failed to load gallery. Please try again.');
      }
    };

    fetchData();
  }, []);

  // Navigation to special selection section
  const handleSpecial = () => {
    navigate('/');
    const scroll = document.getElementById('special-selection');
    if (scroll) {
      scroll.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dynamic currency setter
  const handleSetCurrency = (newCurrency) => {
    if (['USD', 'EUR', 'GBP', 'INR'].includes(newCurrency)) {
      setCurrency(newCurrency);
      toast.info(`Currency changed to ${newCurrency}`);
    } else {
      toast.error('Unsupported currency');
    }
  };

  return (
    <TravelContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
        handleSpecial,
        navigate,
        addpackage,
        setaddpackage,
        addtrend,
        setaddtrend,
        addgallery,
        setaddgallery,
      }}
    >
      {children}
    </TravelContext.Provider>
  );
};

// Custom hook for easier context usage
export const useTravelContext = () => {
  const context = useContext(TravelContext);
  if (!context) {
    throw new Error('useTravelContext must be used within a TravelContextProvider');
  }
  return context;
};