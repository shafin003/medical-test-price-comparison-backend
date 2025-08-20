const mongoose = require('mongoose');
const { DEPARTMENTS, GENDER } = require('../constants/enum');

// Define the schema for medical tests
const genericMedicalTestSchema = new mongoose.Schema(
	{
		test_category: {
			type: String,
			required: [true, 'Test category is required'],
			enum: {
				values: DEPARTMENTS,
				message: '{VALUE} is not supported',
			},
			lowercase: true,
			trim: true,
		},

		name: {
			type: String,
			required: [true, 'Test name is required'],
			trim: true,
			maxlength: [400, 'Test name cannot exceed 400 characters'],
		},

		description: {
			type: String,
			required: [true, 'Test description is required'],
			trim: true,
			maxlength: [1000, 'Description cannot exceed 1000 characters'],
		},

		preparation_instructions: {
			type: String,
			required: [true, 'Preparation instructions are required'],
			trim: true,
			maxlength: [2000, 'Preparation instructions cannot exceed 2000 characters'],
		},

		fasting_required: {
			type: Boolean,
			required: [true, 'Fasting requirement must be specified'],
			default: false,
		},

		turnaround_time: {
			type: String,
			required: [true, 'Turnaround time is required'],
			trim: true,
		},

		common_symptoms: [
			{
				type: String,
				trim: true,
				maxlength: [100, 'Each symptom cannot exceed 100 characters'],
			},
		],

		age_restrictions: {
			type: String,
			required: [true, 'Age restrictions must be specified'],
			trim: true,
			maxlength: [100, 'Age restrictions cannot exceed 100 characters'],
		},

		gender_specific: {
			type: String,
			required: [true, 'Gender specification is required'],
			enum: {
				values: GENDER,
				message: 'Gender specific must be either male, female, or both',
			},
			lowercase: true,
		},

		aliases: [
			{
				type: String,
				trim: true,
				maxlength: [100, 'Each alias cannot exceed 100 characters'],
			},
		],

		keywords: [
			{
				type: String,
				trim: true,
				lowercase: true,
				maxlength: [100, 'Each keyword cannot exceed 100 characters'],
			},
		],

		purpose: {
			type: String,
			required: [true, 'Test purpose is required'],
			trim: true,
			maxlength: [1000, 'Purpose cannot exceed 1000 characters'],
		},

		risks: [
			{
				type: String,
				trim: true,
				maxlength: [200, 'Each risk cannot exceed 200 characters'],
			},
		],

		contraindications: [
			{
				type: String,
				trim: true,
				maxlength: [200, 'Each contraindication cannot exceed 200 characters'],
			},
		],
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
		versionKey: false,
	}
);

// Indexes for better query performance
medicalTestSchema.index({ test_category: 1 });
medicalTestSchema.index({ name: 1 });
medicalTestSchema.index({ keywords: 1 });
medicalTestSchema.index({ aliases: 1 });

// Instance method to get test summary
medicalTestSchema.methods.getSummary = function () {
	return {
		id: this._id,
		name: this.name,
		category: this.test_category,
		turnaround_time: this.turnaround_time,
		fasting_required: this.fasting_required,
	};
};

// Static method to find tests by category
medicalTestSchema.statics.findByCategory = function (category) {
	return this.find({ test_category: category.toLowerCase() });
};

// Static method to search tests by keywords
medicalTestSchema.statics.searchByKeywords = function (searchTerm) {
	const regex = new RegExp(searchTerm, 'i');
	return this.find({
		$or: [{ name: regex }, { keywords: { $in: [regex] } }, { aliases: { $in: [regex] } }, { description: regex }],
	});
};

// Create and export the model
const GenericTest = mongoose.model('MedicalTest', genericMedicalTestSchema);

module.exports = GenericTest;
