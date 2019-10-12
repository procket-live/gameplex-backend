const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    mobile: {
        type: String,
        require: true,
        unique: true,
    },
    gender: String,
    firebase_token: String,
    profile_image: String
});

module.exports = mongoose.model('User', userSchema);