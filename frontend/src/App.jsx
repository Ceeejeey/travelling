import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home/Home';
import Navbar from './Components/Navbar'
import Footer from './Components/Footer';
import Gallery from './Pages/Gallery/Gallery';
import Contact from './Pages/Contact/Contact';
import Package from './Pages/CardDeatil.jsx/Package';
import Trending from './Pages/Trending/Trending';
import CustomizedPackage from './Pages/CustomizedPackage/CustomizedPackage';
import Success from './Pages/AfterPayments/PaymentSuccess';
import { TravelContext } from './Context/TravelContext';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const App = () => {
  return (
    <div>
      <Navbar/>
      
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/gallery' element={<Gallery/>}/>
        <Route path='/contact' element={<Contact/>}/>
        <Route path='/package/:name' element={<Package/>}/>
        <Route path='/trending/:name' element={<Trending/>}/>
        <Route path='/custompage' element={<CustomizedPackage/>}/>
        <Route path='/success' element={<Success/>}/>
      </Routes>
      
      <Footer/>
    </div>
  )
}

export default App