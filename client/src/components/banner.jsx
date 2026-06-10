import { assets } from "../assets/assets";
const banner = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-start items-center justify-between px-8 min-md:pl-14 pt-10 bg-gradient-to-r from-[#0558FE] to-[#A9CFFF] max-w-6xl mx-3 md:mx-auto rounded-2xl overflow-hidden ">
      <div className="text-white">
        <h2 className="text-3xl font-medium">Own a Luxury Car Today!</h2>
        <p className="mt-2">Experience the thrill of driving a premium vehicle at competitive rates.</p>
        <p className="max-w-130">Book now and enjoy exclusive deals!</p>
        <button className="mt-4 bg-white text-primary py-2 px-6 rounded-lg hover:bg-slate-100 transition-all text-sm cursor-pointer ">List Your Car</button>
      </div>
      <img src={assets.banner_car_image} alt="car" className="" />
    </div>
    
  )
}

export default banner
