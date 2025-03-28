import { 
  users, type User, type InsertUser,
  listings, type Listing, type InsertListing,
  appointments, type Appointment, type InsertAppointment,
  subscriptionPlans, type SubscriptionPlan, type InsertSubscriptionPlan,
  conversations, type Conversation, type InsertConversation,
  messages, type Message, type InsertMessage
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSubscription(userId: number, tier: string, status: string): Promise<User>;
  updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User>;
  
  // Listing operations
  getListing(id: number): Promise<Listing | undefined>;
  getListings(filters?: any): Promise<Listing[]>;
  createListing(listing: InsertListing): Promise<Listing>;
  
  // Appointment operations
  getAppointment(id: number): Promise<Appointment | undefined>;
  getUserAppointments(userId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment>;
  
  // Subscription operations
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  
  // Chat operations
  getConversation(id: number): Promise<Conversation | undefined>;
  getUserConversations(userId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private listings: Map<number, Listing>;
  private appointments: Map<number, Appointment>;
  private subscriptionPlans: Map<number, SubscriptionPlan>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  
  currentUserId: number;
  currentListingId: number;
  currentAppointmentId: number;
  currentSubscriptionPlanId: number;
  currentConversationId: number;
  currentMessageId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.listings = new Map();
    this.appointments = new Map();
    this.subscriptionPlans = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    
    this.currentUserId = 1;
    this.currentListingId = 1;
    this.currentAppointmentId = 1;
    this.currentSubscriptionPlanId = 1;
    this.currentConversationId = 1;
    this.currentMessageId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with subscription plans
    this.initializeSubscriptionPlans();
  }

  private initializeSubscriptionPlans() {
    const freePlan: InsertSubscriptionPlan = {
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
    
    const monthlyPlan: InsertSubscriptionPlan = {
      name: "Monthly",
      price: 1900, // $19.00
      interval: "monthly",
      features: JSON.stringify([
        "Unlimited property searches",
        "10 scheduled viewings",
        "Full AI chat assistance",
        "Lease contract analysis"
      ]),
      stripePriceId: process.env.STRIPE_MONTHLY_PRICE_ID || "price_monthly"
    };
    
    const annualPlan: InsertSubscriptionPlan = {
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
      stripePriceId: process.env.STRIPE_ANNUAL_PRICE_ID || "price_annual"
    };
    
    this.createSubscriptionPlan(freePlan);
    this.createSubscriptionPlan(monthlyPlan);
    this.createSubscriptionPlan(annualPlan);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionTier: "free",
      subscriptionStatus: "inactive",
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserSubscription(userId: number, tier: string, status: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser: User = {
      ...user,
      subscriptionTier: tier,
      subscriptionStatus: status
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser: User = {
      ...user,
      stripeCustomerId: stripeInfo.customerId,
      stripeSubscriptionId: stripeInfo.subscriptionId
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Listing methods
  async getListing(id: number): Promise<Listing | undefined> {
    return this.listings.get(id);
  }

  async getListings(filters?: any): Promise<Listing[]> {
    let results = Array.from(this.listings.values());
    
    if (filters) {
      if (filters.location) {
        results = results.filter(listing => 
          listing.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
      
      if (filters.minPrice !== undefined) {
        results = results.filter(listing => listing.price >= filters.minPrice);
      }
      
      if (filters.maxPrice !== undefined) {
        results = results.filter(listing => listing.price <= filters.maxPrice);
      }
      
      if (filters.bedrooms !== undefined) {
        results = results.filter(listing => listing.bedrooms >= filters.bedrooms);
      }
    }
    
    return results;
  }

  async createListing(insertListing: InsertListing): Promise<Listing> {
    const id = this.currentListingId++;
    const listing: Listing = { 
      ...insertListing, 
      id, 
      createdAt: new Date() 
    };
    this.listings.set(id, listing);
    return listing;
  }

  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getUserAppointments(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      appointment => appointment.userId === userId
    );
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const appointment: Appointment = { 
      ...insertAppointment, 
      id, 
      status: "pending",
      createdAt: new Date() 
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment> {
    const appointment = await this.getAppointment(id);
    if (!appointment) throw new Error("Appointment not found");
    
    const updatedAppointment: Appointment = {
      ...appointment,
      status
    };
    
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Subscription plan methods
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values());
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }

  private async createSubscriptionPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = this.currentSubscriptionPlanId++;
    const plan: SubscriptionPlan = { ...insertPlan, id };
    this.subscriptionPlans.set(id, plan);
    return plan;
  }

  // Chat methods
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getUserConversations(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      conversation => conversation.userId === userId
    );
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const conversation: Conversation = { 
      ...insertConversation, 
      id, 
      createdAt: new Date() 
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt: new Date() 
    };
    this.messages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
