import { useState } from 'react'
import Navbar from './components/Navbar'
import {Route,useLocation,Routes } from 'react-router-dom';
import Home from './pages/Home';
import Footer from './components/Footer';
// import Cars from './pages/Cars';
import CarDetails from './pages/CarDetails';
// import MyBookings from './pages/MyBookings';
const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const isOwnerPath = useLocation().pathname.startsWith('/owner');
  return (

    <div>
      {!isOwnerPath && <Navbar setShowLogin={setShowLogin}/>}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/car-details/:id" element={<CarDetails />} />
        {/* <Route path="/cars" element={<Cars />} />
        
        <Route path="/my-bookings" element={<MyBookings />} /> */}

      </Routes>
      {!isOwnerPath &&  <Footer />}
     
    </div>
  )
}

export default App
