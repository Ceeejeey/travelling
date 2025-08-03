import React from 'react'
import {Routes,Route} from 'react-router-dom'
import Addpkg from './Pages/Add/Addpkg'
import { useState,useEffect } from 'react';
import {ToastContainer} from 'react-toastify'
import Login from '../src/components/Login'
import Sidebar from '../src/components/Sidebar'
import Navbar from '../src/components/Navbar'
import Addcard from './Pages/Add/Addcard';
import AddGallery from './Pages/Add/AddGallry';
import Deletecard from './Pages/Delete/Deletecard';
import AddTrending from './Pages/Add/AddTrending';
import AddInclude from './Pages/Add/AddInclude';
import DeletePkg from './Pages/Delete/DeletePkg';
import DeleteInclude from './Pages/Delete/DleteInclude';
import DeleteTrending from './Pages/Delete/DeleteTrending';


export const backendUrl = import.meta.env.VITE_BACKEND_URL;
function App() {

  const [token, settoken] = useState(localStorage.getItem('token') || '');

  

   useEffect(()=>{
    localStorage.setItem('token',token)
  },[token])

  return (
    <div>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      
      />
      {token === "" ? (
        <Login settoken={settoken} />
      ) : (
        <>
          <Navbar settoken={settoken} />
          <hr className="bg-gray-200" />
          <div className="flex w-full">
            <Sidebar />

            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
              <Routes>
                <Route path="/addpkg" element={<Addpkg token={token}/>} />
                <Route path="/addtrending" element={<AddTrending token={token}/>} />
                <Route path="/addinclude" element={<AddInclude token={token}/>} />
                <Route path="/addcard" element={<Addcard token={token}/>} />
                <Route path="/deletecard" element={<Deletecard token={token}/>} />
                <Route path="/deletepkg" element={<DeletePkg token={token}/>} />
                <Route path="/deleteinclude" element={<DeleteInclude token={token}/>} />
                <Route path="/deletetrending" element={<DeleteTrending token={token}/>} />
                <Route path="/addgallery" element={<AddGallery token={token}/>} />
              
                
              </Routes>
            </div>
          </div>
        </>
      )}
      
    </div>
  )
}

export default App
