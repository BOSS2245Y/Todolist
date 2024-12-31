import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const addTask = asyncHandler(async(req,res) =>{
    const { title , description, category, dueDate } = req.body

    if(!title || !description){
        throw new ApiError(400, "title and description are required")
    }

    const users = await User.findById(req.user?._id).select("-password -refreshToken")
    if(!users){
        throw new ApiError(400,"Login to add task ")
    }

    const task = await Task.create({
        title,
        description,
        category,
        dueDate,
        owner:users

    })

    if(!task){
        throw new ApiError(400,"cannot add task something went wrong")
    }

    return res.status(201).json(new ApiResponse(200,task,"task added successfully"))

})

const deleteTask= asyncHandler(async(req,res) =>{
 const { id } = req.params
 
 if(!mongoose.Types.ObjectId.isValid(id)){
    throw new ApiError(400,"taskId is required")
 }

 const task = await Task.findByIdAndDelete(id)
 if(!task){
    throw new ApiError(400,"error while deleting")
 }

 return res.status(200).json(new ApiResponse(200,{},"task deleted successfully"))

})

const updateTask = asyncHandler(async(req,res) =>{
    const { id} = req.params
    if(!id){
        throw new ApiError(400,"taskId is required")
    }
    const {title,description,category,dueDate}= req.body
    if(!title ||!description){
        throw new ApiError(400,"title and desc are required ")
    }

    const task = await Task.findByIdAndUpdate(id,
        {
            $set:{
                title,
                description,
                category,
                dueDate
            }
        },{new:true , validateBeforesave:false}
    )

    if(!task){
        throw new ApiError(401,"error while updating")
    }

    return res.status(201).json(new ApiResponse(200,task,"task updated successfully"))
})

const getAllTasks = asyncHandler(async(req,res) =>{

    const allTask = await Task.find({owner:req.user?._id})
    if(!allTask){
        throw new ApiError(400,"error while fetching tasklist")
    }

    return res.status(201).json(new ApiResponse(200,allTask,"tasklist fetched successfully"))
})






export {
    addTask,
    deleteTask,
    updateTask,
    getAllTasks
}