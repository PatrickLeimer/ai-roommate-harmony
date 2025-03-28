import Stripe from "stripe";
import { storage } from "./storage";
import { User } from "./mongodb";

// Initialize Stripe with API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// Create a checkout session for subscription
export async function createSubscriptionCheckout(userId: string, planId: string) {
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const plan = await storage.getSubscriptionPlan(planId);
    if (!plan) {
      throw new Error("Subscription plan not found");
    }
    
    // Check for zero-price plans (e.g., free trial)
    if (plan.price === 0) {
      // For free plans, just update the user's subscription without payment
      const updatedUser = await storage.updateUserSubscription(userId, plan.name.toLowerCase(), "active");
      return { success: true, user: updatedUser };
    }
    
    // For paid plans, create or use existing customer
    let stripeCustomerId = user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
        metadata: {
          userId: user._id.toString()
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      await storage.updateUserStripeInfo(userId, {
        customerId: customer.id,
        subscriptionId: ""
      });
    }
    
    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.APP_URL || "http://localhost:5000"}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || "http://localhost:5000"}/subscription/cancel`,
      metadata: {
        userId: user._id.toString(),
        planId: plan._id.toString()
      }
    });
    
    return { success: true, sessionId: session.id, url: session.url };
  } catch (error: any) {
    console.error("Error creating subscription checkout:", error);
    return { success: false, error: error.message };
  }
}

// Handle webhook events from Stripe
export async function handleWebhookEvent(event: Stripe.Event) {
  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulCheckout(session);
        break;
        
      case "customer.subscription.updated":
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
        
      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(deletedSubscription);
        break;
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error handling webhook event:", error);
    return { success: false, error: error.message };
  }
}

// Helper function to handle successful checkout
async function handleSuccessfulCheckout(session: Stripe.Checkout.Session) {
  // Extract userId and planId from metadata
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;
  
  if (!userId || !planId) {
    throw new Error("Missing user or plan information");
  }
  
  const user = await storage.getUser(userId);
  const plan = await storage.getSubscriptionPlan(planId);
  
  if (!user || !plan) {
    throw new Error("User or plan not found");
  }
  
  // If there's a subscription ID in the session
  if (session.subscription) {
    const subscriptionId = typeof session.subscription === "string" 
      ? session.subscription 
      : session.subscription.id;
    
    // Update user with subscription info
    await storage.updateUserStripeInfo(userId, {
      customerId: user.stripeCustomerId || session.customer as string,
      subscriptionId
    });
    
    // Update user subscription status
    await storage.updateUserSubscription(userId, plan.name.toLowerCase(), "active");
  }
}

// Helper function to handle subscription updates
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // Find user with this subscription ID
    const users = await User.find({ stripeSubscriptionId: subscription.id }).lean();
    
    if (users.length === 0) {
      console.warn(`No user found with subscription ID: ${subscription.id}`);
      return;
    }
    
    const user = users[0];
    
    // Update subscription status based on Stripe status
    let status = "inactive";
    switch (subscription.status) {
      case "active":
      case "trialing":
        status = "active";
        break;
      case "past_due":
        status = "past_due";
        break;
      case "unpaid":
        status = "unpaid";
        break;
      case "canceled":
        status = "cancelled";
        break;
    }
    
    // Get plan name from the first item in the subscription
    const item = subscription.items.data[0];
    if (item && item.price) {
      const planName = item.price.nickname || 
        (item.price.unit_amount === 1900 ? "monthly" : 
         item.price.unit_amount === 16900 ? "annual" : "unknown");
      
      // Cast user._id to string or use a safe approach
      const userId = user._id ? (user._id as any).toString() : "";
      await storage.updateUserSubscription(userId, planName.toLowerCase(), status);
    }
  } catch (error: any) {
    console.error("Error updating subscription:", error);
    throw error;
  }
}

// Helper function to handle subscription cancellations
async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  try {
    // Find user with this subscription ID
    const users = await User.find({ stripeSubscriptionId: subscription.id }).lean();
    
    if (users.length === 0) {
      console.warn(`No user found with subscription ID: ${subscription.id}`);
      return;
    }
    
    const user = users[0];
    
    // Cast user._id to string or use a safe approach
    const userId = user._id ? (user._id as any).toString() : "";
    await storage.updateUserSubscription(userId, "free", "inactive");
  } catch (error: any) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
}

// List available subscription plans
export async function getSubscriptionPlans() {
  try {
    const plans = await storage.getSubscriptionPlans();
    return { success: true, plans };
  } catch (error: any) {
    console.error("Error getting subscription plans:", error);
    return { success: false, error: error.message };
  }
}
