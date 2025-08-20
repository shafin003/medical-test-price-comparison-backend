import mongoose from 'mongoose';
import { DEPARTMENTS, HOSPITAL_FACILITIES, HOSPITAL_TYPE, LANGUAGE_SPOKEN } from '../constants/enum.js';

const hospitalSchema = new mongoose.Schema(
	{
		hospital_rank: {
			type: Number,
			required: true,
			min: 1,
		},
		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 200,
		},
		city: {
			type: String,
			required: true,
			trim: true,
			maxlength: 100,
		},
		division: {
			type: String,
			required: true,
			trim: true,
			maxlength: 100,
		},
		area: {
			type: String,
			required: true,
			trim: true,
			maxlength: 100,
		},
		road: {
			type: String,
			required: true,
			trim: true,
			maxlength: 200,
		},
		house_number: {
			type: String,
			required: true,
			trim: true,
			maxlength: 20,
		},
		full_address: {
			type: String,
			required: true,
			trim: true,
			maxlength: 500,
		},
		phone: {
			type: String,
			required: true,
			trim: true,
			match: [/^(\+880|880|0)?1[3-9]\d{8}$/, 'Please provide a valid Bangladeshi phone number'],
			unique: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
		},
		website: {
			type: String,
			trim: true,
			match: /^https?:\/\/.+/,
		},
		facilities: [
			{
				type: String,
				trim: true,
				enum: {
					values: HOSPITAL_FACILITIES,
					message: '{VALUE} is not supported',
				},
			},
		],
		hospital_type: {
			type: String,
			trim: true,
			enum: {
				values: HOSPITAL_TYPE,
				message: '{VALUE} is not supported',
			},
		},
		insurance_accepted: [
			{
				type: String,
				trim: true,
			},
		],
		operating_hours: {
			sunday: {
				type: String,
				required: true,
				default: 'Closed',
			},
			monday: {
				type: String,
				required: true,
				default: 'Closed',
			},
			tuesday: {
				type: String,
				required: true,
				default: 'Closed',
			},
			wednesday: {
				type: String,
				required: true,
				default: 'Closed',
			},
			thursday: {
				type: String,
				required: true,
				default: 'Closed',
			},
			friday: {
				type: String,
				required: true,
				default: 'Closed',
			},
			saturday: {
				type: String,
				required: true,
				default: 'Closed',
			},
		},
		emergency_service: {
			type: Boolean,
			default: false,
		},
		parking_available: {
			type: Boolean,
			default: false,
		},
		wheelchair_accessible: {
			type: Boolean,
			default: false,
		},
		latitude: {
			type: Number,
			required: true,
			min: -90,
			max: 90,
		},
		longitude: {
			type: Number,
			required: true,
			min: -180,
			max: 180,
		},
		verified: {
			type: Boolean,
			default: false,
		},
		featured: {
			type: Boolean,
			default: false,
		},
		description: {
			type: String,
			trim: true,
			maxlength: 2000,
		},
		established_year: {
			type: Number,
			min: 1800,
			max: new Date().getFullYear(),
		},
		total_beds: {
			type: Number,
			min: 1,
		},
		departments: [
			{
				type: String,
				trim: true,
				enum: {
					values: DEPARTMENTS,
					message: '{VALUE} is not supported',
				},
			},
		],
		google_map: {
			type: String,
			trim: true,
			match: /^https?:\/\/.+/,
		},
		ambulance_contact: {
			type: String,
			trim: true,
			match: [/^(\+880|880|0)?1[3-9]\d{8}$/, 'Please provide a valid Bangladeshi phone number'],
		},
		accreditations: [
			{
				type: String,
				trim: true,
			},
		],
		consultation_fee_range: {
			type: String,
			trim: true,
		},
		languages_spoken: [
			{
				type: String,
				trim: true,
				enum: {
					values: LANGUAGE_SPOKEN,
					message: '{VALUE} is not supported',
				},
			},
		],
		social_media: {
			facebook: {
				type: String,
				trim: true,
				match: /^https?:\/\/(www\.)?facebook\.com\/.+/,
			},
			twitter: {
				type: String,
				trim: true,
				match: /^https?:\/\/(www\.)?twitter\.com\/.+/,
			},
			instagram: {
				type: String,
				trim: true,
				match: /^https?:\/\/(www\.)?instagram\.com\/.+/,
			},
			linkedin: {
				type: String,
				trim: true,
				match: /^https?:\/\/(www\.)?linkedin\.com\/.+/,
			},
		},
		branches: [
			{
				type: String,
				trim: true,
			},
		],
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
		versionKey: false,
	}
);

// Indexes for better query performance
hospitalSchema.index({ city: 1 });
hospitalSchema.index({ division: 1 });
hospitalSchema.index({ hospital_type: 1 });
hospitalSchema.index({ verified: 1 });
hospitalSchema.index({ featured: 1 });
hospitalSchema.index({ departments: 1 });
hospitalSchema.index({ facilities: 1 });
hospitalSchema.index({ latitude: 1, longitude: 1 }); // Geospatial index
hospitalSchema.index({ name: 'text', description: 'text' }); // Text search index

// Static method to find hospitals by location
hospitalSchema.statics.findByLocation = function(city, division = null) {
	const query = { city: new RegExp(city, 'i') };
	if (division) {
		query.division = new RegExp(division, 'i');
	}
	return this.find(query);
};

// Static method to find hospitals by department
hospitalSchema.statics.findByDepartment = function(department) {
	return this.find({ departments: { $in: [department] } });
};

// Static method to find nearby hospitals (requires geospatial data)
hospitalSchema.statics.findNearby = function(lat, lng, maxDistance = 5000) {
	return this.find({
		latitude: {
			$gte: lat - (maxDistance / 111000), // Approximate conversion
			$lte: lat + (maxDistance / 111000)
		},
		longitude: {
			$gte: lng - (maxDistance / (111000 * Math.cos(lat * Math.PI / 180))),
			$lte: lng + (maxDistance / (111000 * Math.cos(lat * Math.PI / 180)))
		}
	});
};

// Instance method to get hospital summary
hospitalSchema.methods.getSummary = function() {
	return {
		id: this._id,
		name: this.name,
		city: this.city,
		division: this.division,
		hospital_type: this.hospital_type,
		phone: this.phone,
		emergency_service: this.emergency_service,
		verified: this.verified,
		featured: this.featured
	};
};

// Instance method to check if hospital is open now
hospitalSchema.methods.isOpenNow = function() {
	const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
	const today = days[new Date().getDay()];
	const todayHours = this.operating_hours[today];

	return todayHours && todayHours.toLowerCase() !== 'closed';
};

const Hospitals = mongoose.model('Hospitals', hospitalSchema);
export default Hospitals;