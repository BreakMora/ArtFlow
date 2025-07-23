import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ['admin', 'artista', 'fan'],
        required: true,
        unique: true
    },
    permissions: {
        type: [String],
        required: true
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    versionKey: false
});

const Role = mongoose.model('Role', roleSchema);
export default Role;