import mongoose from "mongoose";
import UserRole from './userRole.js';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'El apellido es requerido'],
        trim: true
    },
    username: {
        type: String,
        required: [true, 'El nombre de usuario es requerido'],
        trim: true,
        unique: true,
        lowercase: true
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Por favor ingrese un email válido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        select: false // No se devuelve en las consultas por defecto
    },
    gender: {
        type: String,
        enum: ['Masculino', 'Femenino', 'otro'],
        required: true
    },
    birthDate: {
        type: Date,
        required: [true, 'La fecha de nacimiento es requerida']
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    }
}, {
    timestamps: true, // mongoose maneja automáticamente createdAt y updatedAt
    versionKey: false // quita el campo __v
});

// obtiene el rol de la persona que ah iniciado sesion
userSchema.methods.getRole = async function() {
    try {
        const userRoles = await UserRole.find({ userId: this._id }).populate({ path: 'roleId', select: 'name -_id' });
        return userRoles.map(ur => ur.roleId.name);
    } catch (error) {
        console.error('Error al obtener roles:', error);
    }
}

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Middleware para hashear antes de guardar
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model('User', userSchema);
export default User;
