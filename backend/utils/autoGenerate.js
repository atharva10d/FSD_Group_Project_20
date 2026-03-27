const Flight = require('../models/Flight');

const routes = [
    { source: 'Pune', destination: 'Mumbai' },
    { source: 'Mumbai', destination: 'Delhi' },
    { source: 'Delhi', destination: 'Bangalore' },
    { source: 'Bangalore', destination: 'Chennai' },
    { source: 'Hyderabad', destination: 'Pune' }
];

const airlines = ['AeroServe Airlines', 'Global Airways', 'SkyHigh', 'Oceanic Air', 'Eagle Flights'];

const generateRandomFlights = async () => {
    try {
        const count = await Flight.countDocuments();
        if (count > 10) {
            console.log('Database already heavily populated with flights. Skipping auto-seed.');
            return;
        }

        console.log('Generating default flights automatically...');
        const numFlights = Math.floor(Math.random() * 11) + 20; // 20 to 30 flights
        const flightsToInsert = [];

        // March 28, 2026 to April 30, 2026
        const startDate = new Date('2026-03-28T00:00:00Z').getTime();
        const endDate = new Date('2026-04-30T23:59:59Z').getTime();

        for (let i = 0; i < numFlights; i++) {
            const route = routes[Math.floor(Math.random() * routes.length)];
            const airline = airlines[Math.floor(Math.random() * airlines.length)];
            const flightNumber = `${airline.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`;
            
            const randomTime = startDate + Math.random() * (endDate - startDate);
            const departureTime = new Date(randomTime);
            // Arrival is 2 to 6 hours later
            const arrivalTime = new Date(departureTime.getTime() + (Math.floor(Math.random() * 5) + 2) * 60 * 60 * 1000);

            const totalSeats = Math.floor(Math.random() * 100) + 150; // 150 to 250 seats
            const price = Math.floor(Math.random() * 300) + 150;

            flightsToInsert.push({
                flightNumber,
                airline,
                source: route.source,
                destination: route.destination,
                departureTime,
                arrivalTime,
                totalSeats,
                availableSeats: totalSeats,
                price,
                status: 'Scheduled'
            });
        }

        await Flight.insertMany(flightsToInsert);
        console.log(`${numFlights} default flights securely seeded between 28 Mar 2026 - 30 Apr 2026.`);
    } catch (error) {
        console.error('Error auto-generating flights:', error.message);
    }
};

module.exports = generateRandomFlights;
