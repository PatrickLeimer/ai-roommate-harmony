import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage, MongoUser } from "./storage";
import { setupAuth } from "./auth";
import { handleChatConversation, analyzeLease, generateListings } from "./openai";
import { createSubscriptionCheckout, handleWebhookEvent, getSubscriptionPlans } from "./stripe";
import Stripe from "stripe";
import { z } from "zod";
import { Types } from 'mongoose';

// ID validation helper that works with both MongoDB ObjectId and our mock storage
const isValidObjectId = (id: string): boolean => {
  // For mock storage, we're using numeric strings as IDs
  if (/^\d+$/.test(id)) {
    return true;
  }
  // For MongoDB, we use ObjectId validation
  return Types.ObjectId.isValid(id);
};

// Add this to Express.User to fix type issues
declare global {
  namespace Express {
    interface User extends MongoUser {}
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API routes
  // Listings
  app.get("/api/listings", async (req, res) => {
    try {
      const filters = {
        location: req.query.location as string,
        minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string, 10) : undefined,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string, 10) : undefined,
        bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms as string, 10) : undefined
      };
      
      const listings = await storage.getListings(filters);
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching listings", error: error.message });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const id = req.params.id;
      
      if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid listing ID format" });
      }
      
      const listing = await storage.getListing(id);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      res.json(listing);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching listing", error: error.message });
    }
  });

  // Chat API
  app.post("/api/chat", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { message, conversationId } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      // Handle user's MongoDB _id
      const userId = req.user._id;
      
      const response = await handleChatConversation(
        userId,
        message,
        conversationId || undefined
      );
      
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ message: "Error processing chat", error: error.message });
    }
  });

  app.get("/api/conversations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const conversations = await storage.getUserConversations(req.user._id);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching conversations", error: error.message });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const conversationId = req.params.id;
      
      if (!isValidObjectId(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation ID format" });
      }
      
      const conversation = await storage.getConversation(conversationId);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      if (conversation.userId !== req.user._id) {
        return res.status(403).json({ message: "Unauthorized access to conversation" });
      }
      
      const messages = await storage.getMessages(conversationId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching messages", error: error.message });
    }
  });

  // Lease analysis
  app.post("/api/analyze-lease", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Check subscription tier
    if (req.user.subscriptionTier === "free" || req.user.subscriptionStatus !== "active") {
      return res.status(403).json({ 
        message: "Lease analysis requires an active paid subscription" 
      });
    }
    
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Lease text is required" });
      }
      
      const analysis = await analyzeLease(text);
      res.json({ analysis });
    } catch (error: any) {
      res.status(500).json({ message: "Error analyzing lease", error: error.message });
    }
  });

  // Appointments
  app.post("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Validate the data directly 
      const appointmentSchema = z.object({
        userId: z.string().refine(val => val === req.user._id.toString(), {
          message: "You can only create appointments for yourself"
        }),
        listingId: z.string().refine(val => isValidObjectId(val), {
          message: "Invalid listing ID format"
        }),
        scheduledTime: z.string().or(z.date()),
        notes: z.string().optional()
      });
      
      const validatedData = appointmentSchema.parse(req.body);
      
      // Check if listing exists
      const listing = await storage.getListing(validatedData.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Convert scheduledTime to Date if it's a string
      const scheduledTime = typeof validatedData.scheduledTime === 'string' 
        ? new Date(validatedData.scheduledTime) 
        : validatedData.scheduledTime;
      
      // Check appointment limits based on subscription
      const userAppointments = await storage.getUserAppointments(req.user._id.toString());
      const pendingAppointments = userAppointments.filter(a => a.status !== "cancelled");
      
      if (req.user.subscriptionTier === "free" && pendingAppointments.length >= 1) {
        return res.status(403).json({ 
          message: "Free tier is limited to 1 scheduled viewing" 
        });
      }
      
      if (req.user.subscriptionTier === "monthly" && pendingAppointments.length >= 10) {
        return res.status(403).json({ 
          message: "Monthly tier is limited to 10 scheduled viewings" 
        });
      }
      
      // Create appointment with proper date object
      const appointment = await storage.createAppointment({
        userId: validatedData.userId,
        listingId: validatedData.listingId,
        scheduledTime,
        notes: validatedData.notes
      });
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Error creating appointment", error: errorMessage });
    }
  });

  app.get("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const appointments = await storage.getUserAppointments(req.user._id.toString());
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching appointments", error: error.message });
    }
  });

  app.patch("/api/appointments/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const id = req.params.id;
      
      if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid appointment ID format" });
      }
      
      const { status } = req.body;
      
      if (!status || !["pending", "confirmed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      if (appointment.userId !== req.user._id.toString()) {
        return res.status(403).json({ message: "You can only update your own appointments" });
      }
      
      const updatedAppointment = await storage.updateAppointmentStatus(id, status);
      res.json(updatedAppointment);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating appointment", error: error.message });
    }
  });

  // Subscription management
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      // First try getting plans from MongoDB
      const plans = await storage.getSubscriptionPlans();
      
      if (plans.length > 0) {
        res.json(plans);
      } else {
        // Fallback to Stripe
        const result = await getSubscriptionPlans();
        
        if (result.success) {
          res.json(result.plans);
        } else {
          res.status(500).json({ message: "Error fetching subscription plans", error: result.error });
        }
      }
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching subscription plans", error: error.message });
    }
  });

  app.post("/api/subscribe", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { planId } = req.body;
      
      if (!planId) {
        return res.status(400).json({ message: "Plan ID is required" });
      }
      
      const result = await createSubscriptionCheckout(req.user._id.toString(), planId);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json({ message: "Error creating subscription", error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Error creating subscription", error: error.message });
    }
  });
  
  // Verify subscription after successful Stripe checkout
  app.post("/api/verify-subscription", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required", success: false });
      }
      
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
      
      // Retrieve the session to get subscription details
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      // If the session is complete, update the user's subscription status
      if (session.status === "complete" && session.subscription) {
        // Get the subscription to check its status
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        
        // If the checkout was successful but webhook hasn't processed yet, update user manually
        if (subscription.status === "active" && session.metadata?.userId === req.user._id.toString()) {
          // Update the user's subscription info
          const updatedUser = await storage.updateUserSubscription(
            req.user._id.toString(),
            session.metadata?.planId || "premium", // Default to premium if no planId
            "active"
          );
          
          // Update stripe info if it doesn't exist
          if (!req.user.stripeCustomerId || !req.user.stripeSubscriptionId) {
            await storage.updateUserStripeInfo(req.user._id.toString(), {
              customerId: session.customer as string,
              subscriptionId: session.subscription as string
            });
          }
          
          return res.json({
            success: true,
            message: "Subscription verified successfully"
          });
        }
      }
      
      // If the session is not complete or doesn't have a subscription, return error
      return res.json({
        success: true,
        message: "Subscription is being processed. It may take a few minutes to activate."
      });
    } catch (error: any) {
      console.error("Error verifying subscription:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: "Error verifying subscription"
      });
    }
  });

  // Stripe webhook handler - make sure body-parser doesn't process this route
  app.post("/api/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event: Stripe.Event;
    
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
      
      // If we have the signature and secret, verify the webhook
      // Make sure req.body is a Buffer for webhook signature verification
      if (sig && endpointSecret && Buffer.isBuffer(req.body)) {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } else {
        // For development or when missing the secret, parse the raw body
        // Note: This is less secure but allows development without webhook setup
        console.warn("Missing Stripe signature or endpoint secret - parsing raw body instead");
        const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);
        event = JSON.parse(rawBody);
      }
      
      const result = await handleWebhookEvent(event);
      
      if (result.success) {
        res.json({ received: true });
      } else {
        console.error("Webhook error:", result.error);
        res.status(400).json({ received: false, error: result.error });
      }
    } catch (error: any) {
      console.error("Webhook error:", error.message);
      res.status(400).json({ received: false, error: error.message });
    }
  });

  // Demo API to seed listings (could be removed in production)
  app.post("/api/demo/generate-listings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const { criteria } = req.body;
      
      if (!criteria) {
        return res.status(400).json({ message: "Search criteria required" });
      }
      
      const generatedListings = await generateListings(criteria);
      
      // Save listings to database
      const savedListings = await Promise.all(
        generatedListings.map(listing => storage.createListing(listing))
      );
      
      res.json({ listings: savedListings });
    } catch (error: any) {
      res.status(500).json({ message: "Error generating listings", error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
