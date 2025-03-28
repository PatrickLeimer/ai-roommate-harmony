import mongoose from 'mongoose';

// MongoDB connection
export async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connection established successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Define schemas and models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subscriptionTier: { type: String, default: 'free' },
  subscriptionStatus: { type: String, default: 'active' },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  size: { type: Number },
  imageUrl: { type: String },
  contactInfo: { type: String, required: true },
  nearestTransport: { type: String },
  transportDistance: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  scheduledTime: { type: Date, required: true },
  status: { type: String, default: 'pending' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const subscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  interval: { type: String, required: true },
  features: { type: String, required: true }, // JSON string of features
  stripePriceId: { type: String },
});

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  content: { type: String, required: true },
  role: { type: String, required: true, enum: ['user', 'assistant', 'system'] },
  createdAt: { type: Date, default: Date.now }
});

// Create models
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);
export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
export const SubscriptionPlan = mongoose.models.SubscriptionPlan || mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);