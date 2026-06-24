import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
export async function signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "ALL field are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use,please use a different email" });
    }

    const idx = Math.floor(Math.random() * 1000) + 1;
    const randomAvatar = `https://i.pravatar.cc/${idx}`;

    const newUser = await User.create({
      email,
      password,
      fullName,
      profilePic: randomAvatar
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created: ${newUser.fullName}`);
    
   } catch (error) {
    console.error("Error creating Stream user in signup controller:", error);
   }
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
    
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    })

    res.status(201).json({ success: true, user: newUser });


  } catch (error) {
    console.error("Error during signup controller", error);
    res.status(500).json({ message: "Server error during signup" });
  }
}

export async function login(req, res) {

  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user=await User.findOne({email});
    if(!user){
      return res.status(401).json({message:"Invalid email or password"});
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" },
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ success: true, user });

  } catch (error) {
    console.log("Error in login contoller", error.message);
    res.status(500).json({ message: "Server error during login" });
  }
}

export async function logout(req, res) {
  res.clearCookie("jwt")
  res.status(200).json({ success: true,message:"Logout successfully" });
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;
    
    if (!fullName || !bio|| !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }
    const updatedUser = await User.findByIdAndUpdate(userId, {
      ...req.body,
      isOnboarded: true,
    }, { new: true })
    
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    
    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
      console.log(`Stream user updated: ${updatedUser.fullName}`);
    } catch (StreamError) {
      console.error("Error updating Stream user in onboarding controller:", StreamError.message);
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error in onboarding controller", error);
    res.status(500).json({ message: "Server error during onboarding" });
  }
}


