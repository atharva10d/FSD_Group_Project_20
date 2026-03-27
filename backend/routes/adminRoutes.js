const express = require('express');
const router = express.Router();
const { 
    addFlight, updateFlight, deleteFlight, getReports,
    getAllUsers, updateUser, deleteUser,
    getAllReservations,
    backupDatabase, restoreDatabase 
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/flights', protect, admin, addFlight);
router.put('/flights/:id', protect, admin, updateFlight);
router.delete('/flights/:id', protect, admin, deleteFlight);

router.get('/reports', protect, admin, getReports);

router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id', protect, admin, updateUser);
router.delete('/users/:id', protect, admin, deleteUser);

router.get('/reservations', protect, admin, getAllReservations);

router.get('/backup', protect, admin, backupDatabase);
router.post('/restore', protect, admin, restoreDatabase);

module.exports = router;
