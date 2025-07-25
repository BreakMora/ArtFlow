import mongoose from "mongoose";

const publicationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'El título es requerido'],
        trim: true,
        maxlength: [75, 'El título no puede exceder los 100 caracteres']
    },
    description: {
        type: String,
        required: [true, 'La descripción es requerida'],
        trim: true,
        maxlength: [200, 'La descripción no puede exceder los 200 caracteres']
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    multimedia: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Multimedia'
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'deleted'],
        default: 'active'
    }
}, {
    timestamps: true, // mongoose maneja automáticamente createdAt y updatedAt
    versionKey: false // quita el campo __v
});

const PublicationModel = mongoose.model('Publication', publicationSchema, 'publications');

export default PublicationModel;