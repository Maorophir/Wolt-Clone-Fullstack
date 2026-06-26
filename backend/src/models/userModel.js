const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
    
    // isAdmin allows global CRUD operations across the platform
    isAdmin: { type: Boolean, default: false },
    
    // addresses is an array of our addressSchema defined above
    addresses: [addressSchema],
    
    // favorites is an array of Restaurant references
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }]
}, 
// The timestamps option automatically adds 'createdAt' and 'updatedAt' fields!
{ timestamps: true });

// Pre-save hook to hash passwords before saving to the database
userSchema.pre('save', async function() {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// We compile the Schema into a Model called 'User' and export it.
// This gives us access to MongoDB methods like User.find() or new User().
module.exports = mongoose.model('User', userSchema);
