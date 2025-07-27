import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    publication_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Publication', required: true 
    },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', required: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    }
}, {
    versionKey: false, // quita el campo __v
    timestamps: true, // mongoose maneja automáticamente createdAt y updatedAt
});

const CommentModel = mongoose.model("Comment", commentSchema);

export default CommentModel;