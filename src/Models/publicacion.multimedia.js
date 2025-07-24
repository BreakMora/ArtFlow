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
    title: {
        type: String,
        required: [true, 'El título del archivo multimedia es requerido'],
        trim: true,
    },
    format: {
        type: String,
        required: [true, 'El formato del archivo multimedia es requerido'],
        trim: true,
        enum: ['jpg', 'png', 'gif', 'mp4', 'avi', 'mp3', 'wav']
    }
}, {
    timestamps: true, // mongoose maneja automáticamente createdAt y updatedAt
    versionKey: false // quita el campo __v
});


const MultimediaModel = mongoose.model('Multimedia', multimediaSchema, 'multimedia');

export default MultimediaModel;