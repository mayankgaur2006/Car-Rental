import { Link } from "react-router-dom";
import {assets, dummyUserData } from "../../assets/assets";

const NavbarOwner = () => {
    const user = dummyUserData;
  return (
    <div className="mt-2 p-2 flex  items-center justify-between px-6 md:px-10 text-gray-500 border-b border-borderColor relative transition-all">
      <Link to='/'>
        <img src={assets.logo} alt="Logo" className="h-7"/>
      </Link>
      <p className="items-center">Welcome , {user.name || "Owner"}</p>
    </div>
  )
}

export default NavbarOwner
