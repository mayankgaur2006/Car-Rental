import { useParams, useNavigate } from "react-router-dom";
import { dummyCarData, assets } from "../assets/assets";
import Loader from "../components/Loader";

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const car = dummyCarData.find(car => car._id === id);
  const currency = import.meta.env.VITE_CURRENCY;
  const handleSubmit = async (e) => {
    e.preventDefault();
  }

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2">
          <img
            src={car.image}
            alt=""
            className="w-full h-auto md:max-h-100 object-cover rounded-xl mb-6 shadow-md"
          />

          <div className="space-y-6">
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
                <div
                  key={text}
                  className="flex flex-col items-center bg-light p-4 rounded-lg"
                >
                  <img src={icon} alt="" className="h-5 mb-2" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="h-max sticky top-18 p-6 rounded-xl shadow-lg space-y-6 text-gray-500">
          <p className="flex items-center justify-between text-2xl font-semibold text-gray-800">
            {currency} {car.pricePerDay}<span className="text-base text-gray-400 font-normal"> per day </span> 
          </p>
          <hr className="border-borderColor my-6" />
            <div className="flex flex-col gap-2">
              <label htmlFor="pickup-date" > PickUp Date</label>
              <input type="date" className="border border-borderColor px-3 py-2 rounded-lg" required id="pickup-date" min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="return-date" > Return Date</label>
              <input type="date" className="border border-borderColor px-3 py-2 rounded-lg" required id="return-date" min={new Date().toISOString().split('T')[0]} />
            </div>
            <button className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dull transition all duration-300" type="submit">Book Now</button>
            <p className="text-sm text-center">
              No credit card required to reserve
            </p>
        </form>
        
      </div>
    </div>
  ) : (
    <Loader />
  );
};

export default CarDetails;