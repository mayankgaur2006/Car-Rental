import express from "express";
import { 
    changeBookingStatus, 
    checkAvailabilityofCar, 
    createBooking, 
    createPaymentOrder, 
    getOwnerBookings, 
    getUserBookings, 
    verifyPayment 
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityofCar);
bookingRouter.post('/create', protect, createBooking);
bookingRouter.post('/create-order', protect, createPaymentOrder);
bookingRouter.post('/verify-payment', protect, verifyPayment);
bookingRouter.get('/user', protect, getUserBookings);
bookingRouter.get('/owner', protect, getOwnerBookings);
bookingRouter.post('/change-status', protect, changeBookingStatus);

export default bookingRouter;