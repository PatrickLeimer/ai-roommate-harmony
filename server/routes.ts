import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { handleChatConversation, analyzeLease, generateListings } from "./openai";
import { createSubscriptionCheckout, handleWebhookEvent, getSubscriptionPlans } from "./stripe";
import Stripe from "stripe";
import { insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";

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
    } catch (error) {
      res.status(500).json({ message: "Error fetching listings", error: error.message });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const listing = await storage.getListing(id);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      res.json(listing);
    } catch (error) {
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
      
      const response = await handleChatConversation(
        req.user.id,
        message,
        conversationId ? parseInt(conversationId, 10) : undefined
      );
      
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: "Error processing chat", error: error.message });
    }
  });

  app.get("/api/conversations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const conversations = await storage.getUserConversations(req.user.id);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching conversations", error: error.message });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const conversationId = parseInt(req.params.id, 10);
      const conversation = await storage.getConversation(conversationId);
      
      if (!conversation || conversation.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to conversation" });
      }
      
      const messages = await storage.getMessages(conversationId);
      res.json(messages);
    } catch (error) {
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
    } catch (error) {
      res.status(500).json({ message: "Error analyzing lease", error: error.message });
    }
  });

  // Appointments
  app.post("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Create a schema that ensures userId matches the authenticated user
      const schema = insertAppointmentSchema
        .refine(data => data.userId === req.user.id, {
          message: "You can only create appointments for yourself",
          path: ["userId"]
        });
      
      const validatedData = schema.parse(req.body);
      
      // Check if listing exists
      const listing = await storage.getListing(validatedData.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Check appointment limits based on subscription
      const userAppointments = await storage.getUserAppointments(req.user.id);
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
      
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error creating appointment", error: error.message });
    }
  });

  app.get("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const appointments = await storage.getUserAppointments(req.user.id);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching appointments", error: error.message });
    }
  });

  app.patch("/api/appointments/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      
      if (!status || !["pending", "confirmed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      if (appointment.userId !== req.user.id) {
        return res.status(403).json({ message: "You can only update your own appointments" });
      }
      
      const updatedAppointment = await storage.updateAppointmentStatus(id, status);
      res.json(updatedAppointment);
    } catch (error) {
      res.status(500).json({ message: "Error updating appointment", error: error.message });
    }
  });

  // Subscription management
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const result = await getSubscriptionPlans();
      
      if (result.success) {
        res.json(result.plans);
      } else {
        res.status(500).json({ message: "Error fetching subscription plans", error: result.error });
      }
    } catch (error) {
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
      
      const result = await createSubscriptionCheckout(req.user.id, parseInt(planId, 10));
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json({ message: "Error creating subscription", error: result.error });
      }
    } catch (error) {
      res.status(500).json({ message: "Error creating subscription", error: error.message });
    }
  });

  // Stripe webhook handler
  app.post("/api/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event: Stripe.Event;
    
    try {
      if (!sig || !endpointSecret) {
        throw new Error("Missing Stripe signature or endpoint secret");
      }
      
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "your-stripe-secret-key", {
        apiVersion: "2023-10-16",
      });
      
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      
      const result = await handleWebhookEvent(event);
      
      if (result.success) {
        res.json({ received: true });
      } else {
        console.error("Webhook error:", result.error);
        res.status(400).json({ received: false, error: result.error });
      }
    } catch (error) {
      console.error("Webhook error:", error.message);
      res.status(400).json({ received: false, error: error.message });
    }
  });

  // Demo API to seed listings (could be removed in production)
  app.post("/api/demo/generate-listings", async (req, res) => {
    if (!req.isAuthenticated() || req.user.id !== 1) { // Only admin can use this
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
    } catch (error) {
      res.status(500).json({ message: "Error generating listings", error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
