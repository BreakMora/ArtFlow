import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
    key: {
        type: String,
        unique: true,
        required: [true, 'El campo "key" es obligatorio'],
        trim: true,
        index: true,
        validate: {
            validator: function (v) {
                return /^[a-z0-9_]+$/.test(v);
            },
            message: 'La clave debe contener solo letras minúsculas, números y guiones bajos'
        }
    },
    
    value: {
        type: String,
        required: [true, 'El campo "value" es obligatorio'],
        trim: true
    },

    isActive: {
        type: Boolean,
        default: true
    },

    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

contentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

contentSchema.statics = {
    async findByKey(key) {
        return await this.findOne({ key, isActive: true }).lean();
    }
};

contentSchema.methods.toJSON = function () {
    const content = this.toObject();
    delete content.__v;
    delete content.createdAt;
    delete content.updatedAt;
    return content;
};

const ContentModel = mongoose.model('textcontent', contentSchema, 'textcontent');

export default ContentModel;