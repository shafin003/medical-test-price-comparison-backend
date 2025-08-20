import Hospitals from '../models/Hospitals.js';
import createError from 'http-errors';

/**
 * @desc    Create a new hospital
 * @route   POST /api/hospitals
 * @access  Private/Admin
 */
const createHospital = async (req, res) => {
	// Mongoose validation errors will be caught automatically by Express 5's async error handler
	const newHospital = new Hospitals(req.body);
	const savedHospital = await newHospital.save();
	res.status(201).json(savedHospital);
};

/**
 * @desc    Get all hospitals with filtering, searching, and pagination
 * @route   GET /api/hospitals
 * @access  Public
 */
const getAllHospitals = async (req, res) => {
	const { city, division, hospital_type, verified, featured, search, page = 1, limit = 10 } = req.query;
	const query = {};

	if (city) query.city = { $regex: new RegExp(city, 'i') };
	if (division) query.division = { $regex: new RegExp(division, 'i') };
	if (hospital_type) query.hospital_type = hospital_type;
	if (verified) query.verified = verified === 'true';
	if (featured) query.featured = featured === 'true';
	if (search) query.$text = { $search: search };

	const hospitals = await Hospitals.find(query)
		.limit(limit * 1)
		.skip((page - 1) * limit)
		.exec();

	const count = await Hospitals.countDocuments(query);

	res.status(200).json({
		hospitals,
		totalPages: Math.ceil(count / limit),
		currentPage: parseInt(page),
	});
};

/**
 * @desc    Get a single hospital by ID
 * @route   GET /api/hospitals/:id
 * @access  Public
 */
const getHospitalById = async (req, res) => {
	const hospital = await Hospitals.findById(req.params.id);

	if (!hospital) {
		// Throws an error that will be caught by the central error handler
		throw createError(404, `Hospital not found with id of ${req.params.id}`);
	}

	res.status(200).json(hospital);
};

/**
 * @desc    Update a hospital by ID
 * @route   PUT /api/hospitals/:id
 * @access  Private/Admin
 */
const updateHospitalById = async (req, res) => {
	const updatedHospital = await Hospitals.findByIdAndUpdate(req.params.id, req.body, {
		new: true, // Return the modified document
		runValidators: true, // Run schema validators on update
	});

	if (!updatedHospital) {
		throw createError(404, `Hospital not found with id of ${req.params.id}`);
	}

	res.status(200).json(updatedHospital);
};

/**
 * @desc    Delete a hospital by ID
 * @route   DELETE /api/hospitals/:id
 * @access  Private/Admin
 */
const deleteHospitalById = async (req, res) => {
	const deletedHospital = await Hospitals.findByIdAndDelete(req.params.id);

	if (!deletedHospital) {
		throw createError(404, `Hospital not found with id of ${req.params.id}`);
	}

	res.status(200).json({ message: 'Hospital deleted successfully' });
};

/**
 * @desc    Find hospitals by location (city and optional division)
 * @route   GET /api/hospitals/location
 * @access  Public
 */
const findHospitalsByLocation = async (req, res) => {
	const { city, division } = req.query;
	if (!city) {
		throw createError(400, 'City is a required query parameter.');
	}
	const hospitals = await Hospitals.findByLocation(city, division);
	res.status(200).json(hospitals);
};

/**
 * @desc    Find hospitals by department
 * @route   GET /api/hospitals/department
 * @access  Public
 */
const findHospitalsByDepartment = async (req, res) => {
	const { department } = req.query;
	if (!department) {
		throw createError(400, 'Department is a required query parameter.');
	}
	const hospitals = await Hospitals.findByDepartment(department);
	res.status(200).json(hospitals);
};

/**
 * @desc    Find nearby hospitals using custom static method
 * @route   GET /api/hospitals/nearby
 * @access  Public
 */
const findNearbyHospitals = async (req, res) => {
	const { lat, lng, maxDistance } = req.query;
	if (!lat || !lng) {
		throw createError(400, 'Latitude (lat) and longitude (lng) are required query parameters.');
	}
	const hospitals = await Hospitals.findNearby(
		parseFloat(lat),
		parseFloat(lng),
		maxDistance ? parseInt(maxDistance) : 5000 // Default distance 5km
	);
	res.status(200).json(hospitals);
};

export {
	createHospital,
	getAllHospitals,
	getHospitalById,
	updateHospitalById,
	deleteHospitalById,
	findHospitalsByLocation,
	findHospitalsByDepartment,
	findNearbyHospitals,
};
