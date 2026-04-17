const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log('Connected to MongoDB');
    const existing = await User.findOne({ email: 'admin@aeroserve.com' });
    if (!existing) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        await User.create({ name: 'System Admin', email: 'admin@aeroserve.com', password: hashedPassword, role: 'admin' });
        console.log('Admin user created: email: admin@aeroserve.com, password: admin123');
    } else {
        console.log('Admin already exists.');
    }
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
