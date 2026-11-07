import jwt from "jsonwebtoken";
import User from "../models/user.js"

export const protect = async (req , res ,next)=> {
    let token = req.headers.authorization || req.headers.token;
    if(!token){
        return res.json({success: false , message: "Not Authorized"})
    }
    try{
        if(token.startsWith("Bearer ")){
            token = token.slice(7).trim();
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = typeof decoded === "string" ? decoded : (decoded.id || decoded._id);

        if(!userId){
            return res.json({success: false , message: "Not Authorized"})
        }

        req.user = await User.findById(userId).select("-password");
        if(!req.user){
            return res.json({success: false , message: "User not found"});
        }
        next();
    }
    catch(error){
        return res.json({success: false , message: "Not Authorized"})
    }
}
