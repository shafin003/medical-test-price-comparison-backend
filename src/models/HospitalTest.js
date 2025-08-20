import mongoose from 'mongoose';

const hospitalTestSchema = new mongoose.Schema(
	{
		hospital_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Hospitals',
			required: [true, 'Hospital ID is required'],
			index: true,
		},

		test_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'MedicalTest',
			required: [true, 'Test ID is required'],
			index: true,
		},

		price: {
			type: Number,
			required: [true, 'Price is required'],
			min: [0, 'Price cannot be negative'],
		},

		currency: {
			type: String,
			required: [true, 'Currency is required'],
			enum: {
				values: ['BDT', 'USD', 'EUR', 'GBP'],
				message: '{VALUE} is not a supported currency',
			},
			default: 'BDT',
			uppercase: true,
		},

		unit: {
			type: String,
			required: [true, 'Unit is required'],
			trim: true,
			enum: {
				values: ['per test', 'per sample', 'per panel', 'per consultation'],
				message: '{VALUE} is not a supported unit',
			},
			default: 'per test',
		},

		availability_hours: {
			type: String,
			required: [true, 'Availability hours are required'],
			trim: true,
			validate: {
				validator: function (v) {
					// Validates formats like "24/7", "9 AM - 5 PM", "Mon-Fri: 8-6"
					return /^(24\/7|[\w\s\-:,]+)$/i.test(v);
				},
				message: 'Invalid availability hours format',
			},
		},

		priority_available: {
			type: Boolean,
			default: false,
		},

		discount_available: {
			type: Boolean,
			default: false,
		},

		discount_percentage: {
			type: Number,
			min: [0, 'Discount cannot be negative'],
			max: [100, 'Discount cannot exceed 100%'],
			validate: {
				validator: function (v) {
					// Only validate if discount_available is true
					return !this.discount_available || (v !== undefined && v !== null);
				},
				message: 'Discount percentage is required when discount is available',
			},
		},

		insurance_coverage: [
			{
				type: String,
				trim: true,
				maxlength: [100, 'Insurance name cannot exceed 100 characters'],
			},
		],

		turnaround_time: {
			type: String,
			required: [true, 'Turnaround time is required'],
			trim: true,
			validate: {
				validator: function (v) {
					// Validates formats like "24 hours", "2-3 days", "1 week"
					return /^(\d+(-\d+)?\s+(hours?|days?|weeks?))$/i.test(v);
				},
				message: 'Turnaround time must be in format like "24 hours", "2-3 days", "1 week"',
			},
		},

		report_format: {
			type: String,
			required: [true, 'Report format is required'],
			enum: {
				values: ['digital', 'physical', 'both'],
				message: '{VALUE} is not a supported report format',
			},
			lowercase: true,
		},

		home_collection_available: {
			type: Boolean,
			default: false,
		},

		home_collection_fee: {
			type: Number,
			min: [0, 'Home collection fee cannot be negative'],
			validate: {
				validator: function (v) {
					// Only validate if home_collection_available is true
					return !this.home_collection_available || (v !== undefined && v !== null);
				},
				message: 'Home collection fee is required when home collection is available',
			},
		},

		booking_contact: {
			type: String,
			required: [true, 'Booking contact is required'],
			trim: true,
			match: [/^(\+880|880|0)?1[3-9]\d{8}$/, 'Please provide a valid Bangladeshi phone number'],
		},

		online_booking_url: {
			type: String,
			trim: true,
			match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
		},

		sample_collection_points: {
			type: String,
			required: [true, 'Sample collection points are required'],
			trim: true,
			maxlength: [500, 'Sample collection points cannot exceed 500 characters'],
		},

		is_active: {
			type: Boolean,
			default: true,
			index: true,
		},

		featured: {
			type: Boolean,
			default: false,
			index: true,
		},

		hospital_notes: {
			type: String,
			trim: true,
			maxlength: [1000, 'Hospital notes cannot exceed 1000 characters'],
		},

		preparation_notes_override: {
			type: String,
			trim: true,
			maxlength: [1000, 'Preparation notes override cannot exceed 1000 characters'],
		},

		appointment_required: {
			type: Boolean,
			default: true,
		},

		min_advance_booking_hours: {
			type: Number,
			min: [0, 'Minimum advance booking hours cannot be negative'],
			default: 0,
		},

		max_advance_booking_days: {
			type: Number,
			min: [1, 'Maximum advance booking days must be at least 1'],
			default: 30,
		},
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
		versionKey: false,
	}
);

// Compound indexes for efficient querying
hospitalTestSchema.index({ hospital_id: 1, test_id: 1 }, { unique: true }); // Prevent duplicate entries
hospitalTestSchema.index({ hospital_id: 1, is_active: 1 });
hospitalTestSchema.index({ test_id: 1, is_active: 1 });
hospitalTestSchema.index({ price: 1 });
hospitalTestSchema.index({ featured: 1, is_active: 1 });
hospitalTestSchema.index({ home_collection_available: 1, is_active: 1 });

// Static method to find tests by hospital
hospitalTestSchema.statics.findByHospital = function (hospitalId, activeOnly = true) {
	const query = { hospital_id: hospitalId };
	if (activeOnly) query.is_active = true;

	return this.find(query)
		.populate('test_id', 'name description test_category')
		.populate('hospital_id', 'name city division');
};

// Static method to find hospitals offering a specific test
hospitalTestSchema.statics.findHospitalsByTest = function (testId, activeOnly = true) {
	const query = { test_id: testId };
	if (activeOnly) query.is_active = true;

	return this.find(query)
		.populate('hospital_id', 'name city division phone')
		.populate('test_id', 'name test_category')
		.sort({ price: 1 }); // Sort by price ascending
};

// Static method to search by price range
hospitalTestSchema.statics.findByPriceRange = function (minPrice, maxPrice, activeOnly = true) {
	const query = {
		price: { $gte: minPrice, $lte: maxPrice },
	};
	if (activeOnly) query.is_active = true;

	return this.find(query)
		.populate('hospital_id', 'name city division')
		.populate('test_id', 'name test_category')
		.sort({ price: 1 });
};

// Static method to find featured test offerings
hospitalTestSchema.statics.findFeatured = function (limit = 10) {
	return this.find({ featured: true, is_active: true })
		.populate('hospital_id', 'name city division')
		.populate('test_id', 'name test_category')
		.sort({ price: 1 })
		.limit(limit);
};

// Static method to find tests with home collection
hospitalTestSchema.statics.findWithHomeCollection = function (activeOnly = true) {
	const query = { home_collection_available: true };
	if (activeOnly) query.is_active = true;

	return this.find(query)
		.populate('hospital_id', 'name city division')
		.populate('test_id', 'name test_category')
		.sort({ home_collection_fee: 1 });
};

// Instance method to calculate total cost including home collection
hospitalTestSchema.methods.getTotalCost = function (includeHomeCollection = false) {
	let total = this.price;

	if (includeHomeCollection && this.home_collection_available && this.home_collection_fee) {
		total += this.home_collection_fee;
	}

	if (this.discount_available && this.discount_percentage) {
		total = total * (1 - this.discount_percentage / 100);
	}

	return Math.round(total * 100) / 100; // Round to 2 decimal places
};

// Instance method to get booking summary
hospitalTestSchema.methods.getBookingSummary = function () {
	return {
		hospital_test_id: this._id,
		hospital_name: this.hospital_id?.name,
		test_name: this.test_id?.name,
		price: this.price,
		currency: this.currency,
		turnaround_time: this.turnaround_time,
		home_collection_available: this.home_collection_available,
		appointment_required: this.appointment_required,
		booking_contact: this.booking_contact,
		online_booking_url: this.online_booking_url,
	};
};

// Virtual for discounted price
hospitalTestSchema.virtual('discounted_price').get(function () {
	if (this.discount_available && this.discount_percentage) {
		return Math.round(this.price * (1 - this.discount_percentage / 100) * 100) / 100;
	}
	return this.price;
});

const HospitalTest = mongoose.model('HospitalTest', hospitalTestSchema);
export default HospitalTest;
