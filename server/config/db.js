const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    try {
        await mongoose.connect(uri) {
            console.log('MongoDB connection succesful...');
        }
    } catch (error) {
        console.log('MongoDB connection failed!!!')
    }
}

module.exports = connectDB;