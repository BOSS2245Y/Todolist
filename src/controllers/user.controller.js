import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose  from "mongoose"
import jwt from "jsonwebtoken"

const registerUser = asyncHandler(async(req,res) => {
     //get user details from frontend
    //validation - not empty
    //check if user already exits : username, email
    
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    // return res
    const { username, email, password } = req.body;

    if (
        [ email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const exitedUser = await User.findOne(
        {
            $or:[{username},{email}]
        }
    )

    if (exitedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const user = await User.create(
        {
            username,
            email,
            password,
            
        }
    )
    const createdUser = await User.findById(user._id)
        .select(
            "-password -refreshToken"
        )
        if (!createdUser) {
            throw new ApiError(500, "Something went user while registering the user");
    
        }
    
        return res.status(201).json(
            new ApiResponse(200, createdUser, "User register Successfully")
        )


})

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh access token ")
    }
}

const loginUser = asyncHandler(async(req,res) => {
    const {usernameOrEmail, password} = req.body
    if(!usernameOrEmail || !password){
        throw new ApiError(400,"all fields are required")
    }

    const user = await User.findOne(
        {
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        }
    )
    if(!user){
        throw new ApiError(400,"user not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")



    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'

    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, {
                user: loggedInUser, accessToken, refreshToken
            }, "User logged in successfully"
            )
        ) 
})

const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'

    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out "))


})




export {
    registerUser,
    loginUser,
    logoutUser
}