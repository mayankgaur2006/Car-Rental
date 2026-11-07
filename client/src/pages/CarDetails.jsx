import { useParams, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import Loader from "../components/Loader";
import { useAppContext } from "../context/AppContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {motion} from 'motion/react';
import { loadRazorpayScript } from "../utils/razorpay";

const CarDetails = () => {
  const { id } = useParams();

  const { cars , axios , pickupDate , setPickupDate, returnDate , setReturnDate , currency, user, setShowLogin} = useAppContext()
  const navigate = useNavigate();

  const [car,setCar] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to book a car");
      setShowLogin(true);
      return;
    }

    try{
      setIsProcessing(true);
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Failed to load Razorpay checkout. Please check your network connection.");
        setIsProcessing(false);
        return;
      }

      const {data} = await axios.post('/api/booking/create',{
        car: id,
        pickupDate,
        returnDate
      })

      if(!data.success){
        toast.error(data.message)
        setIsProcessing(false);
        return;
      }

      // If Razorpay order is returned, launch checkout
      if(data.order && data.key_id){
        const options = {
          key: data.key_id,
          amount: data.order.amount,
          currency: data.order.currency || "INR",
          name: `${car.brand} ${car.model}`,
          description: `Car Rental Booking (${pickupDate} to ${returnDate})`,
          order_id: data.order.id,
          prefill: {
            name: user.name || "",
            email: user.email || ""
          },
          theme: {
            color: "#2563EB"
          },
          handler: async (response) => {
            try {
              const verifyRes = await axios.post('/api/booking/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: data.booking._id
              });
              if(verifyRes.data.success){
                toast.success(verifyRes.data.message || "Payment successful & booking confirmed!");
              } else {
                toast.error(verifyRes.data.message || "Payment verification failed");
              }
              navigate('/my-bookings');
            } catch(err) {
              toast.error(err.message);
              navigate('/my-bookings');
            }
          },
          modal: {
            ondismiss: () => {
              toast("Payment window closed. You can complete payment anytime in My Bookings.");
              navigate('/my-bookings');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.success(data.message || "Booking created!");
        navigate('/my-bookings');
      }
    }
    catch(error){
      toast.error(error.message)
    }
    finally{
      setIsProcessing(false);
    }
  }
  useEffect(()=>{
    setCar(cars.find(car => car._id === id))
  },[cars , id])

  return car ? (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 mt-16">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 mb-6 cursor-pointer"
      >
        <img
          src={assets.arrow_icon}
          alt=""
          className="rotate-180 opacity-65"
        />
        Back
      </button>

      <motion.div 
        initial={{opacity: 0 , y:30}}
        animate={{opacity: 1 , y:0}}
        transition={{ duration: 0.6}}

        className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2">
          <motion.img
            initial={{opacity: 0 , scale:0.98}}
            animate={{opacity: 1 , scale:1}}
            transition={{ duration: 0.5 }}    

            src={car.image}
            alt=""
            className="w-full h-auto md:max-h-100 object-cover rounded-xl mb-6 shadow-md"
          />

          <motion.div 
            initial={{opacity: 0 }}
            animate={{opacity: 1 }}
            transition={{ duration: 0.5 , delay: 0.2}}    

            className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">
                {car.brand} {car.model}
              </h1>

              <p className="text-gray-500 text-lg">
                {car.category} {car.year}
              </p>
            </div>

            <hr className="border-borderColor my-6" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  icon: assets.users_icon,
                  text: `${car.seating_capacity} Seats`,
                },
                {
                  icon: assets.fuel_icon,
                  text: car.fuel_type,
                },
                {
                  icon: assets.car_icon,
                  text: car.transmission,
                },
                {
                  icon: assets.location_icon,
                  text: car.location,
                },
              ].map(({ icon, text }) => (
                <motion.div
                  initial={{opacity: 0 , y:10}}
                  animate={{opacity: 1 , y:0}}
                  transition={{ duration: 0.4}}

                  key={text}
                  className="flex flex-col items-center bg-light p-4 rounded-lg"
                >
                  <img src={icon} alt="" className="h-5 mb-2" />
                  {text}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>



        <motion.form 
          initial={{opacity: 0 , y:30}}
          animate={{opacity: 1 , y:0}}
          transition={{ duration: 0.6 , delay: 0.3}}
          
          onSubmit={handleSubmit} className="h-max sticky top-18 p-6 rounded-xl shadow-lg space-y-6 text-gray-500">
          <p className="flex items-center justify-between text-2xl font-semibold text-gray-800">
            {currency} {car.pricePerDay}<span className="text-base text-gray-400 font-normal"> per day </span> 
          </p>
          <hr className="border-borderColor my-6" />
            <div className="flex flex-col gap-2">
              <label htmlFor="pickup-date" > PickUp Date</label>
              <input value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} type="date" className="border border-borderColor px-3 py-2 rounded-lg" required id="pickup-date" min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="return-date" > Return Date</label>
              <input value={returnDate} onChange={(e) => setReturnDate(e.target.value)}  type="date" className="border border-borderColor px-3 py-2 rounded-lg" required id="return-date" min={new Date().toISOString().split('T')[0]} />
            </div>
            <button 
              disabled={isProcessing} 
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dull transition all duration-300 disabled:opacity-50 cursor-pointer" 
              type="submit">
              {isProcessing ? "Processing..." : "Pay & Book Now"}
            </button>
            <p className="text-xs text-center text-gray-400">
              ⚡ Secure online payment powered by Razorpay (UPI, Cards, Netbanking)
            </p>
        </motion.form>
        
      </motion.div>
    </div>
  ) : (
    <Loader />
  );
};

export default CarDetails;