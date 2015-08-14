var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var userSchema = new Schema({
    // The firstname of the user
    firstname: {
        type: String,
        required: true
    },
    // The lastname of the user
    lastname: {
        type: String,
        required: true
    },
    // When the user was created
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    }
});

// Assign the schema to a collection
mongoose.model('User', userSchema);
