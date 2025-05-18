const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'username must be at least 3 characters'],
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: [5, 'password must be at least 5 characters'],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: [5, 'email must be at least 5 characters'],
        lowercase: true
    },
    profileImage: {
        type: String
    },
    boards: {
        type: Array,
        default: []
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "post"
        }
    ]
});

module.exports = mongoose.model("user", userSchema);