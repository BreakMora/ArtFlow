import mongoose from 'mongoose';

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
        enum: ['pending', 'active', 'cancelled', 'failed'],
        default: 'pending'
    },
    monto: {
        type: Number,
        required: true
    },
    payment_id: {
        type: String
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
    timestamps: true,
    versionKey: false
});

subscriptionSchema.index({ fan_id: 1, artist_id: 1 }, { unique: true, partialFilterExpression: { status: 'active' } });

const SubscriptionModel = mongoose.model("Subscription", subscriptionSchema);
export default SubscriptionModel;