import mongoose from "mongoose";

const multimediaSchema = new mongoose.Schema({
    publication_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Publication',
        required: true
    },
    url: {
        type: String,
        required: [true, 'La URL del archivo multimedia es requerida'],
        trim: true
    },
    type: {
        type: String,
        enum: ['image', 'video', 'audio'],
        required: [true, 'El tipo de archivo multimedia es requerido']
    }
});