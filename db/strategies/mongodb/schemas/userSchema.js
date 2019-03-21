const Mongoose = require('mongoose')
const options = {
    timestamps: true
}
const userSchema = new Mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: [{
        type: String,
        ref: 'authentication'
    }]
}, options)
module.exports = Mongoose.model('authentication', userSchema)