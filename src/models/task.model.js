import mongoose, {Schema} from "mongoose";

import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const taskSchema = new Schema({

    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        
    },
   
  category: {
     type: String,
      enum: ["work", "personal", "urgent" ,"others","","none"],
       default: "none" 
    },
    dueDate:{
        type:Date,
        
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    }

},{timestamps:true})

export const Task = mongoose.model("Task",taskSchema)
