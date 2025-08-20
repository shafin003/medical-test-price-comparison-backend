import express from 'express';
import {
	createHospital,
	getAllHospitals,
	getHospitalById,
	updateHospitalById,
	deleteHospitalById,
	findHospitalsByLocation,
	findHospitalsByDepartment,
	findNearbyHospitals,
} from '../controllers/HospitalController.js';

const router = express.Router();

// --- Custom Search Routes ---


// IMPORTANT: These must be defined before the general '/:id' route
// to avoid "location" being interpreted as an ID.

// Route to find hospitals by city and optional division
// Example: GET /api/hospitals/location?city=Dhaka
router.get('/location', findHospitalsByLocation);

// Route to find hospitals by a specific department
// Example: GET /api/hospitals/department?department=Cardiology
router.get('/department', findHospitalsByDepartment);

// Route to find nearby hospitals
// Example: GET /api/hospitals/nearby?lat=23.777176&lng=90.399452
router.get('/nearby', findNearbyHospitals);


// --- Standard CRUD Routes ---

// Route for getting all hospitals and creating a new hospital
router.route('/').get(getAllHospitals).post(createHospital);

// Route for getting, updating, and deleting a single hospital by its ID
router.route('/:id').get(getHospitalById).put(updateHospitalById).delete(deleteHospitalById).patch(updateHospitalById);

export default router;
