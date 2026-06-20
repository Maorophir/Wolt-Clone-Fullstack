const mongoose = require('mongoose');
const addressSchema = require('./addressSchema');

// The main User Schema acts as a strict blueprint for our MongoDB database.
const userSchema = new mongoose.Schema({
    // username must be a string, is required, and must be completely unique in the DB.
    username: { type: String, required: true, unique: true },
    
    // displayName and password are required strings
    displayName: { type: String, required: true },
    password: { type: String, required: true },
    
    // profileImage is optional, so we don't set 'required'
    profileImage: { type: String },
    
    // isBusinessOwner is a boolean that defaults to false if not provided
    isBusinessOwner: { type: Boolean, default: false },
    
    // addresses is an array of our addressSchema defined above
    addresses: [addressSchema]
}, 
// The timestamps option automatically adds 'createdAt' and 'updatedAt' fields!
{ timestamps: true });

// We compile the Schema into a Model called 'User' and export it.
// This gives us access to MongoDB methods like User.find() or new User().
module.exports = mongoose.model('User', userSchema);
