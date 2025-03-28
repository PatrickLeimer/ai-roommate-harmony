import { Types } from 'mongoose';
import session from "express-session";
import createMemoryStore from "memorystore";
import {
  User, Listing, Appointment, SubscriptionPlan, Conversation, Message,
  connectToDatabase
} from './mongodb';

const MemoryStore = createMemoryStore(session);

// Define types for MongoDB documents
export interface MongoUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
}

export interface MongoListing {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  size?: number;
  imageUrl?: string;
  contactInfo: string;
  nearestTransport?: string;
  transportDistance?: string;
  createdAt: Date;
}

export interface MongoAppointment {
  _id: string;
  userId: string;
  listingId: string;
  scheduledTime: Date;
  status: string;
  notes?: string;
  createdAt: Date;
}

export interface MongoSubscriptionPlan {
  _id: string;
  name: string;
  price: number;
  interval: string;
  features: string; // JSON string of features
  stripePriceId?: string;
}

export interface MongoConversation {
  _id: string;
  userId: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoMessage {
  _id: string;
  conversationId: string;
  content: string;
  role: string;
  createdAt: Date;
}

export interface IStorage {
  // User operations
  getUser(id: string): Promise<MongoUser | null>;
  getUserByUsername(username: string): Promise<MongoUser | null>;
  getUserByEmail(email: string): Promise<MongoUser | null>;
  createUser(user: { username: string; email: string; password: string }): Promise<MongoUser>;
  updateUserSubscription(userId: string, tier: string, status: string): Promise<MongoUser>;
  updateUserStripeInfo(userId: string, stripeInfo: { customerId: string, subscriptionId: string }): Promise<MongoUser>;
  
  // Listing operations
  getListing(id: string): Promise<MongoListing | null>;
  getListings(filters?: any): Promise<MongoListing[]>;
  createListing(listing: Omit<MongoListing, '_id' | 'createdAt'>): Promise<MongoListing>;
  
  // Appointment operations
  getAppointment(id: string): Promise<MongoAppointment | null>;
  getUserAppointments(userId: string): Promise<MongoAppointment[]>;
  createAppointment(appointment: Omit<MongoAppointment, '_id' | 'createdAt' | 'status'>): Promise<MongoAppointment>;
  updateAppointmentStatus(id: string, status: string): Promise<MongoAppointment>;
  
  // Subscription operations
  getSubscriptionPlans(): Promise<MongoSubscriptionPlan[]>;
  getSubscriptionPlan(id: string): Promise<MongoSubscriptionPlan | null>;
  
  // Chat operations
  getConversation(id: string): Promise<MongoConversation | null>;
  getUserConversations(userId: string): Promise<MongoConversation[]>;
  createConversation(conversation: { userId: string, title?: string }): Promise<MongoConversation>;
  getMessages(conversationId: string): Promise<MongoMessage[]>;
  createMessage(message: { conversationId: string; content: string; role: string }): Promise<MongoMessage>;
  
  // Session store
  sessionStore: session.Store;
  
  // Initialize database
  initializeDatabase(): Promise<void>;
}

// MongoDB storage implementation
export class MongoStorage implements IStorage {
  // Session store
  sessionStore: session.Store;
  
  constructor() {
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }
  
  async initializeDatabase(): Promise<void> {
    try {
      const connection = await connectToDatabase();
      if (connection === null) {
        console.warn('Running with limited functionality since MongoDB connection failed');
        return;
      }
      
      // Initialize subscription plans if none exist
      const plansCount = await SubscriptionPlan.countDocuments();
      if (plansCount === 0) {
        await this.initializeSubscriptionPlans();
      }
    } catch (error) {
      console.error('Database initialization error:', error);
      console.warn('Running with limited functionality');
      // Don't throw - let app run with limitations
    }
  }
  
  private async initializeSubscriptionPlans(): Promise<void> {
    const freePlan = {
      name: "Free Trial",
      price: 0,
      interval: "monthly",
      features: JSON.stringify([
        "3 property searches per week",
        "1 scheduled viewing",
        "Basic AI chat assistance"
      ]),
      stripePriceId: "price_free"
    };
    
    const monthlyPlan = {
      name: "Monthly",
      price: 1900, // $19.00
      interval: "monthly",
      features: JSON.stringify([
        "Unlimited property searches",
        "10 scheduled viewings",
        "Full AI chat assistance",
        "Lease contract analysis"
      ]),
      stripePriceId: process.env.STRIPE_MONTHLY_PRICE_ID || "price_1R59GJCkzXLayljknE1GHw3R"
    };
    
    const annualPlan = {
      name: "Annual",
      price: 16900, // $169.00
      interval: "yearly",
      features: JSON.stringify([
        "Unlimited property searches",
        "Unlimited scheduled viewings",
        "Premium AI chat assistance",
        "Advanced lease contract analysis",
        "Priority results & early access"
      ]),
      stripePriceId: process.env.STRIPE_ANNUAL_PRICE_ID || "price_1R59HPCkzXLayljkKrZvvldx"
    };
    
    await SubscriptionPlan.create([freePlan, monthlyPlan, annualPlan]);
    console.log('Subscription plans initialized');
  }
  
  // User methods
  async getUser(id: string): Promise<MongoUser | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await User.findById(id).lean();
  }
  
  async getUserByUsername(username: string): Promise<MongoUser | null> {
    return await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } }).lean();
  }
  
  async getUserByEmail(email: string): Promise<MongoUser | null> {
    return await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } }).lean();
  }
  
  async createUser(userData: { username: string; email: string; password: string }): Promise<MongoUser> {
    const newUser = new User({
      ...userData,
      subscriptionTier: 'free',
      subscriptionStatus: 'inactive'
    });
    
    await newUser.save();
    return newUser.toObject();
  }
  
  async updateUserSubscription(userId: string, tier: string, status: string): Promise<MongoUser> {
    if (!Types.ObjectId.isValid(userId)) throw new Error(`Invalid user ID: ${userId}`);
    
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        subscriptionTier: tier,
        subscriptionStatus: status
      },
      { new: true }
    ).lean();
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return user;
  }
  
  async updateUserStripeInfo(userId: string, stripeInfo: { customerId: string, subscriptionId: string }): Promise<MongoUser> {
    if (!Types.ObjectId.isValid(userId)) throw new Error(`Invalid user ID: ${userId}`);
    
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        stripeCustomerId: stripeInfo.customerId,
        stripeSubscriptionId: stripeInfo.subscriptionId
      },
      { new: true }
    ).lean();
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return user;
  }
  
  // Listing methods
  async getListing(id: string): Promise<MongoListing | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Listing.findById(id).lean();
  }
  
  async getListings(filters?: any): Promise<MongoListing[]> {
    let query = Listing.find();
    
    if (filters) {
      if (filters.location) {
        query = query.where('location').regex(new RegExp(filters.location, 'i'));
      }
      
      if (filters.minPrice !== undefined) {
        query = query.where('price').gte(filters.minPrice);
      }
      
      if (filters.maxPrice !== undefined) {
        query = query.where('price').lte(filters.maxPrice);
      }
      
      if (filters.bedrooms !== undefined) {
        query = query.where('bedrooms').gte(filters.bedrooms);
      }
    }
    
    return await query.lean();
  }
  
  async createListing(listingData: Omit<MongoListing, '_id' | 'createdAt'>): Promise<MongoListing> {
    const newListing = new Listing(listingData);
    await newListing.save();
    return newListing.toObject();
  }
  
  // Appointment methods
  async getAppointment(id: string): Promise<MongoAppointment | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Appointment.findById(id).lean();
  }
  
  async getUserAppointments(userId: string): Promise<MongoAppointment[]> {
    if (!Types.ObjectId.isValid(userId)) return [];
    return await Appointment.find({ userId }).lean();
  }
  
  async createAppointment(appointmentData: Omit<MongoAppointment, '_id' | 'createdAt' | 'status'>): Promise<MongoAppointment> {
    const newAppointment = new Appointment({
      ...appointmentData,
      status: 'pending'
    });
    
    await newAppointment.save();
    return newAppointment.toObject();
  }
  
  async updateAppointmentStatus(id: string, status: string): Promise<MongoAppointment> {
    if (!Types.ObjectId.isValid(id)) throw new Error(`Invalid appointment ID: ${id}`);
    
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();
    
    if (!appointment) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    
    return appointment;
  }
  
  // Subscription plan methods
  async getSubscriptionPlans(): Promise<MongoSubscriptionPlan[]> {
    try {
      return await SubscriptionPlan.find().sort({ price: 1 }).lean();
    } catch (error) {
      console.warn('Error getting subscription plans:', error);
      // Return fallback subscription plans for UI testing
      return [
        {
          _id: '1',
          name: 'Free Trial',
          price: 0,
          interval: 'monthly',
          features: JSON.stringify([
            '3 property searches per week',
            '1 scheduled viewing',
            'Basic AI chat assistance'
          ]),
          stripePriceId: 'price_free'
        },
        {
          _id: '2',
          name: 'Monthly',
          price: 1900,
          interval: 'monthly',
          features: JSON.stringify([
            'Unlimited property searches',
            '10 scheduled viewings',
            'Full AI chat assistance',
            'Lease contract analysis'
          ]),
          stripePriceId: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_1R59GJCkzXLayljknE1GHw3R'
        },
        {
          _id: '3',
          name: 'Annual',
          price: 16900,
          interval: 'yearly',
          features: JSON.stringify([
            'Unlimited property searches',
            'Unlimited scheduled viewings',
            'Premium AI chat assistance',
            'Advanced lease contract analysis',
            'Priority results & early access'
          ]),
          stripePriceId: process.env.STRIPE_ANNUAL_PRICE_ID || 'price_1R59HPCkzXLayljkKrZvvldx'
        }
      ];
    }
  }
  
  async getSubscriptionPlan(id: string): Promise<MongoSubscriptionPlan | null> {
    // Check if id is one of our string IDs
    if (id === "1" || id === "2" || id === "3") {
      // For string IDs like "1", "2", "3" use _id field
      return await SubscriptionPlan.findOne({ _id: id }).lean();
    } else if (Types.ObjectId.isValid(id)) {
      // For ObjectId format IDs use findById
      return await SubscriptionPlan.findById(id).lean();
    }
    return null;
  }
  
  // Chat methods
  async getConversation(id: string): Promise<MongoConversation | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await Conversation.findById(id).lean();
  }
  
  async getUserConversations(userId: string): Promise<MongoConversation[]> {
    if (!Types.ObjectId.isValid(userId)) return [];
    return await Conversation.find({ userId }).sort({ updatedAt: -1 }).lean();
  }
  
  async createConversation(conversationData: { userId: string, title?: string }): Promise<MongoConversation> {
    if (!Types.ObjectId.isValid(conversationData.userId)) {
      throw new Error(`Invalid user ID: ${conversationData.userId}`);
    }
    
    const newConversation = new Conversation({
      userId: conversationData.userId,
      title: conversationData.title || 'New Conversation',
      updatedAt: new Date()
    });
    
    await newConversation.save();
    return newConversation.toObject();
  }
  
  async getMessages(conversationId: string): Promise<MongoMessage[]> {
    if (!Types.ObjectId.isValid(conversationId)) return [];
    return await Message.find({ conversationId }).sort({ createdAt: 1 }).lean();
  }
  
  async createMessage(messageData: { conversationId: string; content: string; role: string }): Promise<MongoMessage> {
    if (!Types.ObjectId.isValid(messageData.conversationId)) {
      throw new Error(`Invalid conversation ID: ${messageData.conversationId}`);
    }
    
    const newMessage = new Message(messageData);
    await newMessage.save();
    
    // Update the conversation's updated_at timestamp
    await Conversation.findByIdAndUpdate(
      messageData.conversationId,
      { updatedAt: new Date() }
    );
    
    return newMessage.toObject();
  }
}

// Mock storage that doesn't require MongoDB connection
export class MockStorage implements IStorage {
  // Session store
  sessionStore: session.Store;
  
  // Mock data
  private users: MongoUser[] = [];
  private listings: MongoListing[] = [];
  private appointments: MongoAppointment[] = [];
  private subscriptionPlans: MongoSubscriptionPlan[] = [];
  private conversations: MongoConversation[] = [];
  private messages: MongoMessage[] = [];
  private nextId = 1;
  
  constructor() {
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Add default subscription plans with actual Stripe price IDs
    this.subscriptionPlans = [
      {
        _id: '1',
        name: 'Free Trial',
        price: 0,
        interval: 'monthly',
        features: JSON.stringify([
          '3 property searches per week',
          '1 scheduled viewing',
          'Basic AI chat assistance'
        ]),
        stripePriceId: 'price_free'
      },
      {
        _id: '2',
        name: 'Monthly',
        price: 1900,
        interval: 'monthly',
        features: JSON.stringify([
          'Unlimited property searches',
          '10 scheduled viewings',
          'Full AI chat assistance',
          'Lease contract analysis'
        ]),
        stripePriceId: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_1R59GJCkzXLayljknE1GHw3R'
      },
      {
        _id: '3',
        name: 'Annual',
        price: 16900,
        interval: 'yearly',
        features: JSON.stringify([
          'Unlimited property searches',
          'Unlimited scheduled viewings',
          'Premium AI chat assistance',
          'Advanced lease contract analysis',
          'Priority results & early access'
        ]),
        stripePriceId: process.env.STRIPE_ANNUAL_PRICE_ID || 'price_1R59HPCkzXLayljkKrZvvldx'
      }
    ];
  }
  
  generateId(): string {
    return (this.nextId++).toString();
  }
  
  async initializeDatabase(): Promise<void> {
    console.log('Using mock database');
    return Promise.resolve();
  }
  
  // User methods
  async getUser(id: string): Promise<MongoUser | null> {
    return this.users.find(user => user._id === id) || null;
  }
  
  async getUserByUsername(username: string): Promise<MongoUser | null> {
    return this.users.find(user => 
      user.username.toLowerCase() === username.toLowerCase()
    ) || null;
  }
  
  async getUserByEmail(email: string): Promise<MongoUser | null> {
    return this.users.find(user => 
      user.email.toLowerCase() === email.toLowerCase()
    ) || null;
  }
  
  async createUser(userData: { username: string; email: string; password: string }): Promise<MongoUser> {
    const newUser: MongoUser = {
      _id: this.generateId(),
      ...userData,
      subscriptionTier: 'free',
      subscriptionStatus: 'inactive',
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }
  
  async updateUserSubscription(userId: string, tier: string, status: string): Promise<MongoUser> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    user.subscriptionTier = tier;
    user.subscriptionStatus = status;
    return user;
  }
  
  async updateUserStripeInfo(userId: string, stripeInfo: { customerId: string, subscriptionId: string }): Promise<MongoUser> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    user.stripeCustomerId = stripeInfo.customerId;
    user.stripeSubscriptionId = stripeInfo.subscriptionId;
    return user;
  }
  
  // Listing methods
  async getListing(id: string): Promise<MongoListing | null> {
    return this.listings.find(listing => listing._id === id) || null;
  }
  
  async getListings(filters?: any): Promise<MongoListing[]> {
    let result = [...this.listings];
    
    if (filters) {
      if (filters.location) {
        result = result.filter(listing => 
          listing.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
      
      if (filters.minPrice !== undefined) {
        result = result.filter(listing => listing.price >= filters.minPrice);
      }
      
      if (filters.maxPrice !== undefined) {
        result = result.filter(listing => listing.price <= filters.maxPrice);
      }
      
      if (filters.bedrooms !== undefined) {
        result = result.filter(listing => listing.bedrooms >= filters.bedrooms);
      }
    }
    
    return result;
  }
  
  async createListing(listingData: Omit<MongoListing, '_id' | 'createdAt'>): Promise<MongoListing> {
    const newListing: MongoListing = {
      _id: this.generateId(),
      ...listingData,
      createdAt: new Date()
    };
    this.listings.push(newListing);
    return newListing;
  }
  
  // Appointment methods
  async getAppointment(id: string): Promise<MongoAppointment | null> {
    return this.appointments.find(appointment => appointment._id === id) || null;
  }
  
  async getUserAppointments(userId: string): Promise<MongoAppointment[]> {
    return this.appointments.filter(appointment => appointment.userId === userId);
  }
  
  async createAppointment(appointmentData: Omit<MongoAppointment, '_id' | 'createdAt' | 'status'>): Promise<MongoAppointment> {
    const newAppointment: MongoAppointment = {
      _id: this.generateId(),
      ...appointmentData,
      status: 'pending',
      createdAt: new Date()
    };
    this.appointments.push(newAppointment);
    return newAppointment;
  }
  
  async updateAppointmentStatus(id: string, status: string): Promise<MongoAppointment> {
    const appointment = await this.getAppointment(id);
    if (!appointment) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    
    appointment.status = status;
    return appointment;
  }
  
  // Subscription plan methods
  async getSubscriptionPlans(): Promise<MongoSubscriptionPlan[]> {
    return this.subscriptionPlans;
  }
  
  async getSubscriptionPlan(id: string): Promise<MongoSubscriptionPlan | null> {
    return this.subscriptionPlans.find(plan => plan._id === id) || null;
  }
  
  // Chat methods
  async getConversation(id: string): Promise<MongoConversation | null> {
    return this.conversations.find(convo => convo._id === id) || null;
  }
  
  async getUserConversations(userId: string): Promise<MongoConversation[]> {
    return this.conversations.filter(convo => convo.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
  
  async createConversation(conversationData: { userId: string, title?: string }): Promise<MongoConversation> {
    const now = new Date();
    const newConversation: MongoConversation = {
      _id: this.generateId(),
      userId: conversationData.userId,
      title: conversationData.title || 'New Conversation',
      createdAt: now,
      updatedAt: now
    };
    this.conversations.push(newConversation);
    return newConversation;
  }
  
  async getMessages(conversationId: string): Promise<MongoMessage[]> {
    return this.messages.filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async createMessage(messageData: { conversationId: string; content: string; role: string }): Promise<MongoMessage> {
    const newMessage: MongoMessage = {
      _id: this.generateId(),
      ...messageData,
      createdAt: new Date()
    };
    this.messages.push(newMessage);
    
    // Update conversation updatedAt
    const conversation = await this.getConversation(messageData.conversationId);
    if (conversation) {
      conversation.updatedAt = new Date();
    }
    
    return newMessage;
  }
}

// First try to use MongoDB, and if it fails, fall back to mock storage
let usingMockStorage = false;
try {
  // Check if MongoDB URI is valid
  const mongoUri = process.env.MONGODB_URI || '';
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    console.warn('Invalid MongoDB URI format, using mock storage');
    usingMockStorage = true;
  }
} catch (error) {
  console.warn('Error checking MongoDB URI, using mock storage:', error);
  usingMockStorage = true;
}

export const storage = usingMockStorage ? new MockStorage() : new MongoStorage();
