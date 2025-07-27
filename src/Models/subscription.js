import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    fan_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    artist_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true, // mongoose maneja automáticamente createdAt y updatedAt
    versionKey: false // quita el campo __v
});

// Asegura que no haya duplicados de suscripciones entre el mismo fan y artista
subscriptionSchema.index({ fan_id: 1, artist_id: 1 }, { unique: true }); 

const SubscriptionModel = mongoose.model("Subscription", subscriptionSchema);
export default SubscriptionModel;