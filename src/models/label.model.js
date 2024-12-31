import mongoose ,{Schema} from "mongoose";

const labelSchema = new Schema({
  name: {
    type: String,
    required: true 
    },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true }
});

export const Label = mongoose.model('Label', labelSchema);
