import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
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

    url: {
        type: String,
        required: [true, 'El campo "url" es obligatorio'],
        validate: {
            validator: function (v) {
                return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v) ||
                    /^https:\/\/drive\.google\.com\/(file\/d\/|uc\?export=view&id=)[a-zA-Z0-9_-]+/.test(v);
            },
            message: props => `${props.value} no es una URL válida!`
        }
    },

    altText: {
        type: String,
        required: [true, 'El campo "altText" es obligatorio'],
        trim: true,
        maxlength: [150, 'El texto alternativo no puede exceder los 150 caracteres']
    },

    isActive: {
        type: Boolean,
        default: true
    },

    order: {
        type: Number,
        required: [true, 'El campo "order" es obligatorio'],
        min: [0, 'El orden no puede ser menor que 0']
    },

    group: {
        type: String,
        required: [true, 'El campo "group" es obligatorio'],
        enum: {
            values: ['main_menu', 'hero_section', 'gallery', 'background'],
            message: 'Grupo no válido. Opciones: main_menu, hero_section, gallery, background'
        },
        default: 'main_menu'
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

imageSchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    if (this.url.includes('drive.google.com/file/d/')) {
        const fileId = this.url.match(/\/file\/d\/([^\/]+)/)[1];
        this.url = `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    next();
});

imageSchema.index({ group: 1, isActive: 1, order: 1 });

imageSchema.statics = {
    async findByGroup(group) {
        return await this.find({ group, isActive: true })
            .sort({ order: 1, createdAt: 1 })
            .lean();
    },

    async updateImageOrder(idsOrder) {
        const bulkOps = idsOrder.map((id, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { order: index + 1 } }
            }
        }));

        return await this.bulkWrite(bulkOps);
    }
};

imageSchema.methods.toJSON = function () {
    const image = this.toObject();
    delete image.__v;
    delete image.createdAt;
    delete image.updatedAt;
    return image;
};

const ImageModel = mongoose.model('imagescontent', imageSchema, 'imagescontent');

export default ImageModel;