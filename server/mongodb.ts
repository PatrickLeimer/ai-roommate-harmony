import mongoose from 'mongoose';

// MongoDB connection
export async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    // Make sure URI format is valid
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
      console.warn('Warning: MONGODB_URI does not start with mongodb:// or mongodb+srv://');
      // Just handle this gracefully for now so UI can be tested
      return null;
    }
    
    await mongoose.connect(mongoUri);
    console.log('MongoDB connection established successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't throw the error - temporarily allow app to run without DB
    console.warn('App running without MongoDB connection');
    return null;
  }
}

// Define schemas and models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subscriptionTier: { type: String, default: 'free' },
  subscriptionStatus: { type: String, default: 'inactive' },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for faster lookups
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

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

// Add indexes for common search filters
listingSchema.index({ location: 'text' });
listingSchema.index({ price: 1 });
listingSchema.index({ bedrooms: 1 });

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  scheduledTime: { type: Date, required: true },
  status: { type: String, default: 'pending' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Add index for faster user-specific lookups
appointmentSchema.index({ userId: 1 });

const subscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  interval: { type: String, required: true },
  features: { type: String, required: true }, // JSON string of features
  stripePriceId: { type: String },
});

// Conversation schema with reference to user
const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Conversation' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add index for faster user-specific lookups
conversationSchema.index({ userId: 1 });

// Message schema with reference to conversation
const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  content: { type: String, required: true },
  role: { type: String, required: true, enum: ['user', 'assistant', 'system'] },
  createdAt: { type: Date, default: Date.now }
});

// Add index for faster message retrieval by conversation
messageSchema.index({ conversationId: 1, createdAt: 1 });

// Create models
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);
export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
export const SubscriptionPlan = mongoose.models.SubscriptionPlan || mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);