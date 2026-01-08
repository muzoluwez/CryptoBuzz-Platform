import CoursePurchase from "../../models/coursePurchase.js";
import Course from "../../models/course.js";
import User from "../../models/user.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import crypto from "crypto";
import * as yup from "yup";

// Validation schema
const createPaymentLinkSchema = yup.object().shape({
  courseId: yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/)
    .required("Course ID is required"),
});

// Hotmart checkout base URL
const HOTMART_CHECKOUT_BASE_URL = "https://pay.hotmart.com";

/**
 * Generate Hotmart payment checkout URL
 * Note: You need to create the product in Hotmart dashboard first and get the product ID
 */
export const createPaymentLink = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.body;

    await createPaymentLinkSchema.validate({ courseId });

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if course is premium/paid
    if (course.tier === "FREE" || course.price <= 0) {
      return res.status(400).json({
        message: "This course is free. Payment is not required.",
      });
    }

    // Check if user already purchased this course
    const existingPurchase = await CoursePurchase.findOne({
      user: userId,
      course: courseId,
      status: "approved",
    });

    if (existingPurchase) {
      return res.status(400).json({
        message: "You have already purchased this course",
      });
    }

    // Check if there's a pending purchase
    const pendingPurchase = await CoursePurchase.findOne({
      user: userId,
      course: courseId,
      status: "pending",
    });

    if (pendingPurchase) {
      return res.status(400).json({
        message: "You have a pending purchase for this course",
        purchaseId: pendingPurchase._id,
      });
    }

    // Get Hotmart product ID from course or use default
    const hotmartProductId = course.hotmartProductId || process.env.HOTMART_DEFAULT_PRODUCT_ID;

    if (!hotmartProductId) {
      return res.status(400).json({
        message: "Hotmart product ID not configured for this course. Please contact support.",
      });
    }

    // Create a purchase record
    const purchase = await CoursePurchase.create({
      user: userId,
      course: courseId,
      amount: course.price,
      currency: "USD",
      status: "pending",
      paymentMethod: "hotmart",
      hotmartProductId: hotmartProductId,
    });

    // Generate checkout URL
    // Hotmart checkout URL format: https://pay.hotmart.com/{product_id}?checkoutMode=default
    // You can add custom parameters using the checkout builder or API
    const checkoutUrl = `${HOTMART_CHECKOUT_BASE_URL}/${hotmartProductId}`;

    // Add custom parameters (buyer email, etc.)
    const user = await User.findById(userId);
    const checkoutParams = new URLSearchParams({
      checkoutMode: "default",
      email: user.email || "",
      // Add your custom parameters here if needed
    });

    const fullCheckoutUrl = `${checkoutUrl}?${checkoutParams.toString()}`;

    return res.status(200).json(
      ApiResponse(200, {
        purchaseId: purchase._id,
        checkoutUrl: fullCheckoutUrl,
        amount: course.price,
        currency: "USD",
      }, "Payment link generated successfully")
    );
  } catch (error) {
    console.error("Error creating payment link:", error);
    return res.status(500).json({
      message: error.errors?.[0] || error.message,
    });
  }
};

/**
 * Verify Hotmart webhook hottok
 * 
 * hottok is Hotmart's authentication token included in every webhook payload.
 * It's used to validate that the webhook request is actually from Hotmart.
 * You can find your hottok in Hotmart dashboard: Tools → Webhook → Authentication tab
 * 
 * @param {string} receivedHottok - The hottok from the webhook payload
 * @param {string} expectedHottok - Your hottok from environment variables
 * @returns {boolean} - True if hottok is valid
 */
const verifyHotmartHottok = (receivedHottok, expectedHottok) => {
  if (!expectedHottok) {
    console.warn("HOTMART_HOTTOK not configured. Skipping validation.");
    return true; // Allow if not configured (for development/testing)
  }

  if (!receivedHottok) {
    console.error("No hottok found in webhook payload");
    return false;
  }

  return receivedHottok === expectedHottok;
};

/**
 * Handle Hotmart webhook notifications
 * This endpoint should be publicly accessible (no auth middleware)
 * Hotmart will send POST requests here for payment events
 * 
 * Hotmart webhooks can come in different formats:
 * 1. JSON format with event and data fields
 * 2. Form data format with individual fields
 * 3. Query parameters format
 */
export const handleHotmartWebhook = async (req, res) => {
  try {
    // hottok is Hotmart's authentication token included in EVERY webhook payload
    // It validates that the webhook request is actually from Hotmart
    // Get your hottok from: Hotmart Dashboard → Tools → Webhook → Authentication tab
    // Note: Hotmart sends it in the header 'x-hotmart-hottok' or in body/query
    const receivedHottok = req.headers['x-hotmart-hottok'] || req.body.hottok || req.query.hottok;
    const expectedHottok = process.env.HOTMART_HOTTOK;

    // Validate hottok to ensure request is from Hotmart
    if (!verifyHotmartHottok(receivedHottok, expectedHottok)) {
      console.error("Invalid hottok. Request may not be from Hotmart.");
      console.error("Received hottok:", receivedHottok ? "***" + receivedHottok.slice(-4) : "missing");
      return res.status(401).json({ message: "Invalid hottok" });
    }

    console.log("✅ Hotmart webhook validated successfully");

    // Handle different webhook formats
    let eventType, data;

    // Format 1: JSON with event and data
    if (req.body.event) {
      eventType = req.body.event;
      data = req.body.data || req.body;
    }
    // Format 2: Form data format (Hotmart sends data directly in body)
    else if (req.body.event_type || req.body.notification_type) {
      eventType = req.body.event_type || req.body.notification_type;
      data = req.body;
    }
    // Format 3: Query parameters
    else if (req.query.event) {
      eventType = req.query.event;
      data = req.query;
    }
    else {
      // Try to infer event type from data
      eventType = req.body.event_type || "UNKNOWN";
      data = req.body;
    }

    console.log("📥 Hotmart webhook received:", {
      eventType,
      hottok: receivedHottok ? "***" + receivedHottok.slice(-4) : "missing",
      hasData: !!data
    });
    console.log("Webhook payload:", JSON.stringify(data, null, 2));

    // Handle different event types
    // Hotmart event types may vary: PURCHASE_APPROVED, PURCHASE_COMPLETE, PURCHASE_REFUNDED, etc.
    const normalizedEventType = eventType.toUpperCase();

    switch (normalizedEventType) {
      case "PURCHASE_APPROVED":
      case "APPROVED":
        await handlePurchaseApproved(data);
        break;
      case "PURCHASE_COMPLETE":
      case "COMPLETE":
        await handlePurchaseComplete(data);
        break;
      case "PURCHASE_CANCELLED":
      case "CANCELLED":
        await handlePurchaseCancelled(data);
        break;
      case "PURCHASE_REFUNDED":
      case "REFUNDED":
        await handlePurchaseRefunded(data);
        break;
      default:
        console.log("Unhandled webhook event type:", normalizedEventType);
        // Try to process as purchase data if it contains transaction info
        if (data.transaction || data.purchase?.transaction) {
          await handlePurchaseApproved(data);
        }
    }

    // Always return 200 to acknowledge receipt (Hotmart expects 200 OK)
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error processing Hotmart webhook:", error);
    // Still return 200 to prevent Hotmart from retrying excessively
    return res.status(200).json({ received: true, error: error.message });
  }
};

/**
 * Handle purchase approved event
 * Handles multiple webhook data formats from Hotmart
 */
const handlePurchaseApproved = async (data) => {
  try {
    // Extract data from different possible formats
    let transactionCode, hotmartProductId, buyerEmail, buyerName, amount, currency, purchaseDate, productName, paymentMethod;

    // Format 1: Nested structure (purchase.product.id, etc.)
    if (data.purchase) {
      const purchase = data.purchase;
      transactionCode = purchase.transaction || purchase.transaction_code || purchase.order_id;
      hotmartProductId = purchase.product?.id || purchase.product_id || purchase.product?.code;
      buyerEmail = purchase.buyer?.email || purchase.email || purchase.buyer_email;
      buyerName = purchase.buyer?.name || purchase.buyer_name || purchase.name;
      amount = purchase.price?.value || purchase.price_value || purchase.amount || purchase.price;
      currency = purchase.price?.currency_code || purchase.currency_code || purchase.currency || "USD";
      purchaseDate = purchase.purchase_date || purchase.date || purchase.created_at;
      productName = purchase.product?.name || purchase.product_name;
      paymentMethod = purchase.payment?.method || purchase.payment_method;
    }
    // Format 2: Flat structure (transaction, product_id, etc.)
    else {
      transactionCode = data.transaction || data.transaction_code || data.order_id || data.code;
      hotmartProductId = data.product_id || data.product?.id || data.product_code;
      buyerEmail = data.buyer_email || data.email || data.buyer?.email;
      buyerName = data.buyer_name || data.name || data.buyer?.name;
      amount = data.price_value || data.amount || data.price || data.value;
      currency = data.currency_code || data.currency || "USD";
      purchaseDate = data.purchase_date || data.date || data.created_at;
      productName = data.product_name || data.product?.name;
      paymentMethod = data.payment_method || data.payment?.method;
    }

    if (!transactionCode) {
      console.error("Transaction code not found in webhook data");
      return;
    }

    if (!hotmartProductId) {
      console.error("Hotmart product ID not found in webhook data");
      return;
    }

    // Find course by Hotmart product ID
    const course = await Course.findOne({ hotmartProductId });
    if (!course) {
      console.error(`Course not found for Hotmart product ID: ${hotmartProductId}`);
      return;
    }

    if (!buyerEmail) {
      console.error("Buyer email not found in webhook data");
      return;
    }

    // Find user by email
    const user = await User.findOne({ email: buyerEmail });
    if (!user) {
      console.error(`User not found for email: ${buyerEmail}`);
      return;
    }

    // Parse amount and date
    const parsedAmount = typeof amount === "string" ? parseFloat(amount) : amount || course.price;
    const parsedDate = purchaseDate ? new Date(purchaseDate) : new Date();

    // Update or create purchase record
    const purchase = await CoursePurchase.findOneAndUpdate(
      {
        hotmartTransactionCode: transactionCode,
      },
      {
        user: user._id,
        course: course._id,
        hotmartTransactionCode: transactionCode,
        status: "approved",
        amount: parsedAmount,
        currency: currency,
        hotmartProductId: hotmartProductId,
        hotmartBuyerEmail: buyerEmail,
        hotmartBuyerName: buyerName,
        purchaseDate: parsedDate,
        accessGranted: true,
        accessGrantedAt: new Date(),
        metadata: {
          productName: productName || course.title,
          paymentMethod: paymentMethod || "hotmart",
          rawData: data, // Store raw data for debugging
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    console.log(`Purchase approved: ${transactionCode} for course ${course._id}, user ${user._id}`);
  } catch (error) {
    console.error("Error handling purchase approved:", error);
    throw error;
  }
};

/**
 * Handle purchase complete event
 */
const handlePurchaseComplete = async (data) => {
  // Similar to approved, but marks the purchase as fully completed
  await handlePurchaseApproved(data);
};

/**
 * Handle purchase cancelled event
 */
const handlePurchaseCancelled = async (data) => {
  try {
    const transactionCode = data.purchase?.transaction || data.transaction || data.transaction_code || data.code;

    if (!transactionCode) {
      console.error("Transaction code not found in cancellation data");
      return;
    }

    await CoursePurchase.findOneAndUpdate(
      { hotmartTransactionCode: transactionCode },
      {
        status: "cancelled",
        accessGranted: false,
      }
    );

    console.log(`Purchase cancelled: ${transactionCode}`);
  } catch (error) {
    console.error("Error handling purchase cancelled:", error);
    throw error;
  }
};

/**
 * Handle purchase refunded event
 */
const handlePurchaseRefunded = async (data) => {
  try {
    const transactionCode = data.purchase?.transaction || data.transaction || data.transaction_code || data.code;

    if (!transactionCode) {
      console.error("Transaction code not found in refund data");
      return;
    }

    await CoursePurchase.findOneAndUpdate(
      { hotmartTransactionCode: transactionCode },
      {
        status: "refunded",
        accessGranted: false,
      }
    );

    console.log(`Purchase refunded: ${transactionCode}`);
  } catch (error) {
    console.error("Error handling purchase refunded:", error);
    throw error;
  }
};

/**
 * Get user's purchases
 */
export const getUserPurchases = async (req, res) => {
  try {
    const userId = req.user._id;

    const purchases = await CoursePurchase.find({ user: userId })
      .populate("course", "title description imageUrl price tier")
      .sort({ createdAt: -1 });

    return res.status(200).json(
      ApiResponse(200, purchases, "Purchases retrieved successfully")
    );
  } catch (error) {
    console.error("Error getting user purchases:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * Batch check access for multiple courses (efficient approach)
 * Accepts array of course IDs and returns access status for each
 */
export const batchCheckCourseAccess = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseIds } = req.body;

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ message: "courseIds array is required" });
    }

    // Fetch all courses and user purchases in parallel
    const [courses, purchases] = await Promise.all([
      Course.find({ _id: { $in: courseIds } }),
      CoursePurchase.find({ 
        user: userId,
        status: "approved",
        accessGranted: true,
        course: { $in: courseIds }
      })
    ]);

    // Create a Set of purchased course IDs for O(1) lookup
    const purchasedCourseIds = new Set(
      purchases.map(p => p.course.toString())
    );

    // Build access map for each course
    const accessMap = {};
    
    for (const course of courses) {
      const courseId = course._id.toString();
      const isPremium = course.tier === "PREMIUM" || (course.price && course.price > 0);
      
      if (!isPremium) {
        // Free course - everyone has access
        accessMap[courseId] = {
          hasAccess: true,
          isPremium: false,
          reason: "free_course",
          coursePrice: course.price || 0,
          courseTier: course.tier
        };
      } else {
        // Premium course - check if purchased
        const hasAccess = purchasedCourseIds.has(courseId);
        const purchase = purchases.find(p => p.course.toString() === courseId);
        
        accessMap[courseId] = {
          hasAccess,
          isPremium: true,
          purchase: purchase || null,
          coursePrice: course.price || 0,
          courseTier: course.tier
        };
      }
    }

    return res.status(200).json(
      ApiResponse(200, accessMap, "Batch access check completed")
    );
  } catch (error) {
    console.error("Error in batch check course access:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * Check if user has access to a course
 */
export const checkCourseAccess = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Free courses are accessible to everyone
    if (course.tier === "FREE" || course.price <= 0) {
      return res.status(200).json(
        ApiResponse(200, { hasAccess: true, reason: "free_course" }, "Access granted")
      );
    }

    // Check if user has approved purchase
    const purchase = await CoursePurchase.findOne({
      user: userId,
      course: courseId,
      status: "approved",
      accessGranted: true,
    });

    const hasAccess = !!purchase;

    // Return additional info to help frontend determine if course is premium
    return res.status(200).json(
      ApiResponse(200, { 
        hasAccess, 
        purchase: purchase || null,
        isPremium: course.tier === "PREMIUM" || course.price > 0,
        courseTier: course.tier,
        coursePrice: course.price
      }, "Access check completed")
    );
  } catch (error) {
    console.error("Error checking course access:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

