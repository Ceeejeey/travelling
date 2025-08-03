import React, { useContext } from 'react'
import AboutLankaHome from '../About/AboutLankaHome'
import Hero from '../../Components/Hero'
import Title from '../../Components/Title'
import SubTitle from '../../Components/SubTitle'
import Trending from '../../Components/Trending'
import Steps from './Steps'
import Packages from '../../Components/Packages'
import WhoAreWe from '../About/WhoAreWe'




const Home = () => {
 
  return (
    <div>
      <Hero/>
      <Title text1={'About'} text2={'Sri Lanka'}/>
      <AboutLankaHome/>
      <SubTitle text1={'Trending'} text2={'Now'}/>
      <Trending/>
      <Steps/>
       <SubTitle text1={'Best'} text2={'Packeges'}/>
       <Packages/>
        <Title text1={'Who'} text2={'Are We'}/>
        <WhoAreWe id={"special-selection"}/>
        
    </div>
  )
}

export default Home