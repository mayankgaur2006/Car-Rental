import crypto from "crypto";
import booking from "../models/booking.js";
import Car from "../models/car.js";
import razorpayInstance from "../configs/razorpay.js";

export const checkAvailability = async (car, pickupDate, returnDate) => {
    const bookings = await booking.find({
        car,
        status: { $ne: "cancelled" },
        pickupDate: { $lte: returnDate },
        returnDate: { $gte: pickupDate },
    });
    return bookings.length === 0;
};

export const checkAvailabilityofCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body;
        const cars = await Car.find({ location, isAvailable: true });

        const availableCarsPromises = cars.map(async (car) => {
            const isAvailable = await checkAvailability(car._id, pickupDate, returnDate);
            return { ...car._doc, isAvailable: isAvailable };
        });

        let availableCars = await Promise.all(availableCarsPromises);
        availableCars = availableCars.filter((car) => car.isAvailable === true);

        res.json({ success: true, availableCars });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { car, pickupDate, returnDate } = req.body;

        if (!car || !pickupDate || !returnDate) {
            return res.json({ success: false, message: "Please provide all booking details" });
        }

        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);

        if (isNaN(picked.getTime()) || isNaN(returned.getTime())) {
            return res.json({ success: false, message: "Invalid dates provided" });
        }

        if (returned < picked) {
            return res.json({ success: false, message: "Return date cannot be earlier than pickup date" });
        }

        const isAvailable = await checkAvailability(car, pickupDate, returnDate);
        if (!isAvailable) {
            return res.json({ success: false, message: "Car is not Available for these dates" });
        }

        const carData = await Car.findById(car);
        if (!carData) {
            return res.json({ success: false, message: "Car not found" });
        }

        const diffTime = returned.getTime() - picked.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const noOfDays = Math.max(1, diffDays);
        const price = carData.pricePerDay * noOfDays;

        const newBooking = await booking.create({
            car,
            owner: carData.owner,
            user: _id,
            pickupDate,
            returnDate,
            price,
            status: "pending",
            paymentStatus: "pending",
        });

        // Initialize Razorpay order if Razorpay credentials exist
        let razorpayOrder = null;
        if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
            try {
                const options = {
                    amount: Math.round(price * 100), // amount in paise
                    currency: "INR",
                    receipt: newBooking._id.toString(),
                    notes: {
                        bookingId: newBooking._id.toString(),
                        userId: _id.toString(),
                        carId: car.toString(),
                    },
                };
                razorpayOrder = await razorpayInstance.orders.create(options);
                newBooking.razorpayOrderId = razorpayOrder.id;
                await newBooking.save();
            } catch (rzpErr) {
                console.error("Razorpay order creation error:", rzpErr.message);
            }
        }

        res.json({
            success: true,
            message: "Booking Created",
            booking: newBooking,
            order: razorpayOrder,
            key_id: process.env.RAZORPAY_KEY_ID || "",
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const createPaymentOrder = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId } = req.body;

        const bookingData = await booking.findById(bookingId).populate("car");
        if (!bookingData) {
            return res.json({ success: false, message: "Booking not found" });
        }

        if (bookingData.user.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Not Authorized" });
        }

        if (bookingData.paymentStatus === "paid") {
            return res.json({ success: false, message: "Booking already paid" });
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.json({ success: false, message: "Razorpay credentials not configured on server" });
        }

        const options = {
            amount: Math.round(bookingData.price * 100),
            currency: "INR",
            receipt: bookingData._id.toString(),
            notes: {
                bookingId: bookingData._id.toString(),
                userId: _id.toString(),
            },
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);
        bookingData.razorpayOrderId = razorpayOrder.id;
        await bookingData.save();

        res.json({
            success: true,
            order: razorpayOrder,
            booking: bookingData,
            key_id: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { _id } = req.user;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
            return res.json({ success: false, message: "Missing payment verification parameters" });
        }

        const signData = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(signData)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.json({ success: false, message: "Payment verification failed: Invalid signature" });
        }

        const bookingData = await booking.findById(bookingId);
        if (!bookingData) {
            return res.json({ success: false, message: "Booking not found" });
        }

        bookingData.paymentStatus = "paid";
        bookingData.status = "confirmed";
        bookingData.razorpayOrderId = razorpay_order_id;
        bookingData.razorpayPaymentId = razorpay_payment_id;
        await bookingData.save();

        res.json({ success: true, message: "Payment verified successfully and booking confirmed!" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const getUserBookings = async (req, res) => {
    try {
        const { _id } = req.user;
        const bookings = await booking.find({ user: _id }).populate("car");
        bookings.sort((a, b) => b.createdAt - a.createdAt);
        res.json({ success: true, bookings });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const getOwnerBookings = async (req, res) => {
    try {
        if (req.user.role != "owner") {
            return res.json({ success: false, message: "Not Authorized" });
        }

        const bookings = await booking
            .find({ owner: req.user._id })
            .populate("car user")
            .select("-user.password");

        bookings.sort((a, b) => b.createdAt - a.createdAt);

        res.json({ success: true, bookings });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const changeBookingStatus = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId, status } = req.body;
        const bookings = await booking.findById(bookingId);
        if (!bookings) {
            return res.json({ success: false, message: "Booking not found" });
        }
        if (bookings.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Not Authorized" });
        }

        bookings.status = status;
        await bookings.save();
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
