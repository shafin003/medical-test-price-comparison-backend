import mongoose from 'mongoose';
import { DEPARTMENTS, HOSPITAL_FACILITIES, HOSPITAL_TYPE, LANGUAGE_SPOKEN } from '../constants/enum';

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
			match: [/^\+?[1-9]\d{1,14}$/, 'Please fill a valid bangladeshi phone number'],
			unique: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address.'],
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
		home_collection: {
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
			match: [/^\+?[1-9]\d{1,14}$/, 'Please fill a valid bangladeshi phone number'],
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
		created_at: {
			type: Date,
			default: Date.now,
		},
		updated_at: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	}
);

const Hospitals = mongoose.model('Hospitals', hospitalSchema);
export default Hospitals;
