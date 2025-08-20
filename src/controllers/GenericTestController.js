import GenericTest from '../models/GenericTest.js';
import { validationResult } from 'express-validator';

class GenericTestController {
	// Get all medical tests with filtering and pagination
	static async getAllTests(req, res) {
		try {
			const page = parseInt(req.query.page) || 1;
			const limit = parseInt(req.query.limit) || 10;
			const skip = (page - 1) * limit;

			// Build filter object
			const filter = {};

			if (req.query.test_category) {
				filter.test_category = req.query.test_category.toLowerCase();
			}

			if (req.query.fasting_required !== undefined) {
				filter.fasting_required = req.query.fasting_required === 'true';
			}

			if (req.query.gender_specific) {
				filter.gender_specific = req.query.gender_specific.toLowerCase();
			}

			if (req.query.keywords) {
				const keywords = req.query.keywords.split(',').map((k) => k.trim().toLowerCase());
				filter.keywords = { $in: keywords };
			}

			if (req.query.aliases) {
				const aliases = req.query.aliases.split(',').map((a) => a.trim());
				filter.aliases = { $in: aliases };
			}

			if (req.query.symptoms) {
				const symptoms = req.query.symptoms.split(',');
				filter.common_symptoms = { $in: symptoms };
			}

			// Build sort object
			let sort = {};
			if (req.query.sort) {
				const sortField = req.query.sort;
				const sortOrder = req.query.order === 'desc' ? -1 : 1;
				sort[sortField] = sortOrder;
			} else {
				sort = { name: 1 }; // Default sort by name ascending
			}

			const tests = await GenericTest.find(filter).sort(sort).skip(skip).limit(limit).lean();

			const totalCount = await GenericTest.countDocuments(filter);
			const totalPages = Math.ceil(totalCount / limit);

			res.status(200).json({
				success: true,
				data: tests,
				pagination: {
					currentPage: page,
					totalPages,
					totalCount,
					hasNext: page < totalPages,
					hasPrev: page > 1,
				},
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: 'Error fetching medical tests',
				error: error.message,
			});
		}
	}

	// Get medical test by ID
	static async getTestById(req, res) {
		try {
			const test = await GenericTest.findById(req.params.id);

			if (!test) {
				return res.status(404).json({
					success: false,
					message: 'Medical test not found',
				});
			}

			res.status(200).json({
				success: true,
				data: test,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: 'Error fetching medical test',
				error: error.message,
			});
		}
	}

	// Create new medical test
	static async createTest(req, res) {
		try {
			// Check for validation errors
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Validation failed',
					errors: errors.array(),
				});
			}

			const test = new GenericTest(req.body);
			await test.save();

			res.status(201).json({
				success: true,
				message: 'Medical test created successfully',
				data: test,
			});
		} catch (error) {
			if (error.name === 'ValidationError') {
				return res.status(400).json({
					success: false,
					message: 'Validation error',
					error: error.message,
				});
			}

			res.status(500).json({
				success: false,
				message: 'Error creating medical test',
				error: error.message,
			});
		}
	}

	// Update medical test
	static async updateTest(req, res) {
		try {
			// Check for validation errors
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Validation failed',
					errors: errors.array(),
				});
			}

			const test = await GenericTest.findByIdAndUpdate(req.params.id, req.body, {
				new: true,
				runValidators: true,
			});

			if (!test) {
				return res.status(404).json({
					success: false,
					message: 'Medical test not found',
				});
			}

			res.status(200).json({
				success: true,
				message: 'Medical test updated successfully',
				data: test,
			});
		} catch (error) {
			if (error.name === 'ValidationError') {
				return res.status(400).json({
					success: false,
					message: 'Validation error',
					error: error.message,
				});
			}

			res.status(500).json({
				success: false,
				message: 'Error updating medical test',
				error: error.message,
			});
		}
	}

	// Delete medical test
	static async deleteTest(req, res) {
		try {
			const test = await GenericTest.findByIdAndDelete(req.params.id);

			if (!test) {
				return res.status(404).json({
					success: false,
					message: 'Medical test not found',
				});
			}

			res.status(200).json({
				success: true,
				message: 'Medical test deleted successfully',
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: 'Error deleting medical test',
				error: error.message,
			});
		}
	}

	// Search medical tests by keywords
	static async searchTests(req, res) {
		try {
			const searchTerm = req.query.q;

			if (!searchTerm) {
				return res.status(400).json({
					success: false,
					message: 'Search term is required',
				});
			}

			const page = parseInt(req.query.page) || 1;
			const limit = parseInt(req.query.limit) || 10;
			const skip = (page - 1) * limit;

			const tests = await GenericTest.searchByKeywords(searchTerm).skip(skip).limit(limit);

			const totalCount = await GenericTest.searchByKeywords(searchTerm).countDocuments();

			res.status(200).json({
				success: true,
				data: tests,
				pagination: {
					currentPage: page,
					totalPages: Math.ceil(totalCount / limit),
					totalCount,
				},
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: 'Error searching medical tests',
				error: error.message,
			});
		}
	}

	// Get tests by category
	static async getTestsByCategory(req, res) {
		try {
			const { category } = req.params;
			const page = parseInt(req.query.page) || 1;
			const limit = parseInt(req.query.limit) || 10;
			const skip = (page - 1) * limit;

			const tests = await GenericTest.findByCategory(category).skip(skip).limit(limit);

			const totalCount = await GenericTest.countDocuments({
				test_category: category.toLowerCase(),
			});

			res.status(200).json({
				success: true,
				data: tests,
				pagination: {
					currentPage: page,
					totalPages: Math.ceil(totalCount / limit),
					totalCount,
				},
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: 'Error fetching tests by category',
				error: error.message,
			});
		}
	}

	// Get tests by symptoms
	static async getTestsBySymptoms(req, res) {
		try {
			const symptoms = req.query.symptoms?.split(',') || [];

			if (symptoms.length === 0) {
				return res.status(400).json({
					success: false,
					message: 'At least one symptom is required',
				});
			}

			const page = parseInt(req.query.page) || 1;
			const limit = parseInt(req.query.limit) || 10;
			const skip = (page - 1) * limit;

			const tests = await GenericTest.find({
				common_symptoms: { $in: symptoms },
			})
				.skip(skip)
				.limit(limit)
				.sort({ name: 1 });

			const totalCount = await GenericTest.countDocuments({
				common_symptoms: { $in: symptoms },
			});

			res.status(200).json({
				success: true,
				data: tests,
				pagination: {
					currentPage: page,
					totalPages: Math.ceil(totalCount / limit),
					totalCount,
				},
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: 'Error fetching tests by symptoms',
				error: error.message,
			});
		}
	}

	// Get test summary
	static async getTestSummary(req, res) {
		try {
			const test = await GenericTest.findById(req.params.id);

			if (!test) {
				return res.status(404).json({
					success: false,
					message: 'Medical test not found',
				});
			}

			const summary = test.getSummary();

			res.status(200).json({
				success: true,
				data: summary,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: 'Error fetching test summary',
				error: error.message,
			});
		}
	}

	// Get tests requiring fasting
	static async getFastingTests(req, res) {
		try {
			const page = parseInt(req.query.page) || 1;
			const limit = parseInt(req.query.limit) || 10;
			const skip = (page - 1) * limit;

			const tests = await GenericTest.find({ fasting_required: true }).sort({ name: 1 }).skip(skip).limit(limit);

			const totalCount = await GenericTest.countDocuments({ fasting_required: true });

			res.status(200).json({
				success: true,
				data: tests,
				pagination: {
					currentPage: page,
					totalPages: Math.ceil(totalCount / limit),
					totalCount,
				},
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: 'Error fetching fasting tests',
				error: error.message,
			});
		}
	}

	// Get tests by gender
	static async getTestsByGender(req, res) {
		try {
			const { gender } = req.params;

			if (!['male', 'female', 'both'].includes(gender.toLowerCase())) {
				return res.status(400).json({
					success: false,
					message: 'Gender must be male, female, or both',
				});
			}

			const page = parseInt(req.query.page) || 1;
			const limit = parseInt(req.query.limit) || 10;
			const skip = (page - 1) * limit;

			const filter =
				gender.toLowerCase() === 'both'
					? { gender_specific: 'both' }
					: { gender_specific: { $in: [gender.toLowerCase(), 'both'] } };

			const tests = await GenericTest.find(filter).sort({ name: 1 }).skip(skip).limit(limit);

			const totalCount = await GenericTest.countDocuments(filter);

			res.status(200).json({
				success: true,
				data: tests,
				pagination: {
					currentPage: page,
					totalPages: Math.ceil(totalCount / limit),
					totalCount,
				},
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: 'Error fetching tests by gender',
				error: error.message,
			});
		}
	}

	// Get test categories
	static async getTestCategories(req, res) {
		try {
			const categories = await GenericTest.aggregate([
				{
					$group: {
						_id: '$test_category',
						count: { $sum: 1 },
						tests: { $push: { name: '$name', id: '$_id' } },
					},
				},
				{ $sort: { _id: 1 } },
			]);

			res.status(200).json({
				success: true,
				data: categories,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: 'Error fetching test categories',
				error: error.message,
			});
		}
	}

	// Get test statistics
	static async getTestStats(req, res) {
		try {
			const stats = await GenericTest.aggregate([
				{
					$group: {
						_id: null,
						totalTests: { $sum: 1 },
						fastingRequired: { $sum: { $cond: ['$fasting_required', 1, 0] } },
						maleSpecific: { $sum: { $cond: [{ $eq: ['$gender_specific', 'male'] }, 1, 0] } },
						femaleSpecific: { $sum: { $cond: [{ $eq: ['$gender_specific', 'female'] }, 1, 0] } },
						bothGenders: { $sum: { $cond: [{ $eq: ['$gender_specific', 'both'] }, 1, 0] } },
					},
				},
			]);

			const categoryStats = await GenericTest.aggregate([
				{
					$group: {
						_id: '$test_category',
						count: { $sum: 1 },
					},
				},
				{ $sort: { count: -1 } },
			]);

			const turnaroundStats = await GenericTest.aggregate([
				{
					$group: {
						_id: '$turnaround_time',
						count: { $sum: 1 },
					},
				},
				{ $sort: { count: -1 } },
			]);

			res.status(200).json({
				success: true,
				data: {
					overview: stats[0] || {},
					byCategory: categoryStats,
					byTurnaroundTime: turnaroundStats,
				},
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: 'Error fetching test statistics',
				error: error.message,
			});
		}
	}

	// Get popular tests (most referenced in keywords)
	static async getPopularTests(req, res) {
		try {
			const limit = parseInt(req.query.limit) || 10;

			const popularTests = await GenericTest.aggregate([
				{
					$addFields: {
						keywordCount: { $size: '$keywords' },
						aliasCount: { $size: '$aliases' },
					},
				},
				{
					$sort: {
						keywordCount: -1,
						aliasCount: -1,
						name: 1,
					},
				},
				{
					$limit: limit,
				},
				{
					$project: {
						name: 1,
						test_category: 1,
						description: 1,
						turnaround_time: 1,
						fasting_required: 1,
						keywordCount: 1,
						aliasCount: 1,
					},
				},
			]);

			res.status(200).json({
				success: true,
				data: popularTests,
				count: popularTests.length,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: 'Error fetching popular tests',
				error: error.message,
			});
		}
	}

	// Bulk create tests
	static async bulkCreateTests(req, res) {
		try {
			const tests = req.body.tests;

			if (!Array.isArray(tests) || tests.length === 0) {
				return res.status(400).json({
					success: false,
					message: 'Tests array is required and cannot be empty',
				});
			}

			const createdTests = await GenericTest.insertMany(tests, {
				ordered: false, // Continue on error
			});

			res.status(201).json({
				success: true,
				message: `${createdTests.length} medical tests created successfully`,
				data: createdTests,
			});
		} catch (error) {
			if (error.name === 'BulkWriteError') {
				const successCount = error.result.insertedCount;
				const errorCount = error.writeErrors.length;

				return res.status(207).json({
					success: 'partial',
					message: `${successCount} tests created, ${errorCount} failed`,
					errors: error.writeErrors,
				});
			}

			res.status(500).json({
				success: false,
				message: 'Error bulk creating medical tests',
				error: error.message,
			});
		}
	}
}

export default GenericTestController;
