import { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { loadRazorpayScript } from '../utils/razorpay';

const MyBookings = () => {
  const { axios, user, currency } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [payingBookingId, setPayingBookingId] = useState(null);

  const fetchMyBookings = async () => {
    try {
      const { data } = await axios.get('/api/booking/user');
      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePayNow = async (booking) => {
    try {
      setPayingBookingId(booking._id);
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Failed to load Razorpay. Please check your connection.");
        setPayingBookingId(null);
        return;
      }

      const { data } = await axios.post('/api/booking/create-order', {
        bookingId: booking._id,
      });

      if (!data.success) {
        toast.error(data.message || "Unable to initiate payment");
        setPayingBookingId(null);
        return;
      }

      const options = {
        key: data.key_id,
        amount: data.order.amount,
        currency: data.order.currency || "INR",
        name: `${booking.car?.brand || 'Car'} ${booking.car?.model || 'Rental'}`,
        description: `Payment for booking #${booking._id.slice(-6)}`,
        order_id: data.order.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#2563EB",
        },
        handler: async (response) => {
          try {
            const verifyRes = await axios.post('/api/booking/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
            });

            if (verifyRes.data.success) {
              toast.success(verifyRes.data.message || "Payment successful!");
              fetchMyBookings();
            } else {
              toast.error(verifyRes.data.message || "Payment verification failed");
            }
          } catch (err) {
            toast.error(err.message);
          }
        },
        modal: {
          ondismiss: () => {
            toast("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPayingBookingId(null);
    }
  };

  useEffect(() => {
    user && fetchMyBookings();
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="px-6 md:px-16 lg:px-24 xl:px-32 mt-16 text-sm max-w-7xl"
    >
      <Title
        title="My Bookings"
        subTitle="View and manage all your car bookings and payments"
        align="left"
      />

      <div>
        {bookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            You don't have any bookings yet.
          </div>
        ) : (
          bookings.map((booking, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              key={booking._id}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 first:mt-12"
            >
              <div className="md:col-span-1">
                <div className="rounded-md overflow-hidden mb-3 bg-gray-100">
                  <img
                    src={booking.car?.image || assets.main_car}
                    alt=""
                    className="w-full h-auto aspect-video object-cover"
                  />
                </div>
                <p className="text-lg font-medium mt-2">
                  {booking.car?.brand || 'Car'} {booking.car?.model || 'Rental'}
                </p>
                <p className="text-gray-500">
                  {booking.car?.year || ''} {booking.car?.location || ''}
                </p>
              </div>

              <div className="md:col-span-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="px-3 py-1.5 bg-light rounded text-xs font-medium">
                    Booking #{index + 1}
                  </p>
                  <p
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-400/15 text-green-600'
                        : booking.status === 'cancelled'
                        ? 'bg-red-400/15 text-red-600'
                        : 'bg-yellow-400/15 text-yellow-700'
                    }`}
                  >
                    Status: {booking.status}
                  </p>
                  <p
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      booking.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    Payment: {booking.paymentStatus === 'paid' ? 'Paid (Razorpay)' : 'Pending'}
                  </p>
                </div>

                <div className="flex items-start gap-2 mt-4">
                  <img
                    src={assets.calendar_icon_colored}
                    alt=""
                    className="h-4 w-4 mt-1"
                  />
                  <div>
                    <p className="text-gray-500">Rental Period</p>
                    <p>
                      {booking.pickupDate ? booking.pickupDate.split('T')[0] : 'N/A'} to{' '}
                      {booking.returnDate ? booking.returnDate.split('T')[0] : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 mt-3">
                  <img
                    src={assets.location_icon_colored || assets.calendar_icon_colored}
                    alt=""
                    className="h-4 w-4 mt-1"
                  />
                  <div>
                    <p className="text-gray-500">Pick-up Location</p>
                    <p>{booking.car?.location || 'Location details unavailable'}</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 flex flex-col justify-between gap-4 text-right">
                <div className="text-sm text-gray-500">
                  <p>Total Price</p>
                  <h1 className="text-2xl font-semibold text-primary">
                    {currency}{booking.price}
                  </h1>
                  <p className="text-xs text-gray-400 mt-1">
                    Booked on {booking.createdAt ? booking.createdAt.split('T')[0] : 'N/A'}
                  </p>
                </div>

                {booking.paymentStatus !== 'paid' && booking.status !== 'cancelled' && (
                  <button
                    disabled={payingBookingId === booking._id}
                    onClick={() => handlePayNow(booking)}
                    className="w-full bg-primary hover:bg-primary-dull text-white py-2 px-4 rounded-lg font-medium transition cursor-pointer disabled:opacity-50 text-xs"
                  >
                    {payingBookingId === booking._id ? "Opening..." : "Pay Now with Razorpay"}
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default MyBookings;
