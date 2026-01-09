import CoursePurchase from "../../models/coursePurchase.js";
import Course from "../../models/course.js";
import Plan from "../../models/plan.js";
import User from "../../models/user.js";
import UserCredential from "../../models/userCredential.js";
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

/**
 * Helper function to extract checkout code from Hotmart checkout URL
 * (for backward compatibility and webhook matching)
 */
const extractCheckoutCodeFromUrl = (url) => {
  if (!url) return null;
  const match = url.match(/https?:\/\/pay\.hotmart\.com\/([A-Z0-9]+)/i);
  if (match && match[1]) return match[1].toUpperCase();
  const segments = url.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  if (lastSegment && /^[A-Z0-9]+$/i.test(lastSegment)) return lastSegment.toUpperCase();
  return null;
};


/**
 * Generate Hotmart payment checkout URL
 * Uses the stored checkout URL directly from Plan model (no need to generate)
 */
export const createPaymentLink = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.body;

    await createPaymentLinkSchema.validate({ courseId });

    // Check if course exists and populate plan
    const course = await Course.findById(courseId).populate("plan");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Get checkout URL directly from plan - it's already stored, no need to generate
    let hotmartCheckoutUrl = null;
    let planCheckoutCode = null;
    let plan = null;

    // Always fetch plan explicitly to ensure we have the latest data
    if (course.plan) {
      // Check if plan is already populated (has hotmartCheckoutUrl property)
      if (course.plan && typeof course.plan === 'object' && course.plan.hotmartCheckoutUrl) {
        // Plan is populated - use it directly
        plan = course.plan;
      } else {
        // Plan reference exists but wasn't populated - fetch it manually
        const planId = course.plan._id || course.plan;
        plan = await Plan.findById(planId);
        
        if (!plan) {
          console.error("Plan reference exists but plan document not found:", {
            planReference: planId,
            courseId: courseId,
            courseTitle: course.title
          });
        }
      }
      
      // Get checkout URL directly from plan
      if (plan) {
        if (plan.hotmartCheckoutUrl) {
          const trimmedUrl = plan.hotmartCheckoutUrl.trim();
          
          // Validate it's not null, empty, or contains "null"
          if (trimmedUrl && 
              trimmedUrl !== 'null' && 
              trimmedUrl.toLowerCase() !== 'null' &&
              !trimmedUrl.toLowerCase().includes('/null') &&
              !trimmedUrl.toLowerCase().endsWith('/null')) {
            hotmartCheckoutUrl = trimmedUrl;
            planCheckoutCode = plan.hotmartCheckoutCode || extractCheckoutCodeFromUrl(hotmartCheckoutUrl);
          } else {
            console.error("Plan has invalid checkout URL:", {
              planId: plan._id,
              planName: plan.name,
              checkoutUrl: plan.hotmartCheckoutUrl,
              checkoutUrlType: typeof plan.hotmartCheckoutUrl,
              courseId: courseId,
              courseTitle: course.title
            });
          }
        } else {
          console.error("Plan found but missing hotmartCheckoutUrl:", {
            planId: plan._id,
            planName: plan.name,
            planFields: Object.keys(plan.toObject ? plan.toObject() : plan),
            courseId: courseId,
            courseTitle: course.title
          });
        }
      }
    } else {
      console.warn("Course does not have a plan assigned:", {
        courseId: courseId,
        courseTitle: course.title,
        courseTier: course.tier,
        coursePrice: course.price
      });
    }

    // Determine if course is premium/paid:
    // 1. If course has a plan assigned (course.plan exists), it's premium (regardless of tier or price)
    // 2. If course.tier === "PREMIUM", it's premium
    // 3. If course.price > 0, it's premium
    // 4. If plan exists and plan.price > 0, it's premium
    // Only block payment if course is truly free (no plan reference, tier === "FREE", price <= 0) AND no checkout URL
    const hasPlanReference = !!course.plan; // Check if plan reference exists (even if plan document wasn't fetched)
    const hasPlanDocument = !!plan; // Check if plan document was successfully fetched
    const isPremiumByTier = course.tier === "PREMIUM";
    const coursePrice = plan?.price ?? course.price ?? 0;
    const isPremiumByPrice = coursePrice > 0;
    const isPremiumCourse = hasPlanReference || hasPlanDocument || isPremiumByTier || isPremiumByPrice;
    
    // Debug logging for troubleshooting
    console.log("Payment checkout request:", {
      courseId: courseId,
      courseTitle: course.title,
      courseTier: course.tier,
      coursePrice: course.price,
      coursePlanRef: course.plan || null,
      hasPlanReference: hasPlanReference,
      hasPlanDocument: hasPlanDocument,
      planId: plan?._id || null,
      planName: plan?.name || null,
      planPrice: plan?.price || null,
      coursePriceFromPlan: coursePrice,
      isPremiumByTier,
      isPremiumByPrice,
      isPremiumCourse,
      hasCheckoutUrl: !!hotmartCheckoutUrl,
      checkoutUrl: hotmartCheckoutUrl || null
    });
    
    // Only block if course is truly free (not premium) AND has no checkout URL
    if (!isPremiumCourse && !hotmartCheckoutUrl) {
      console.warn("Blocking payment - course is free:", {
        courseId: courseId,
        courseTitle: course.title,
        courseTier: course.tier,
        coursePrice: course.price,
        hasPlanReference: hasPlanReference,
        hasPlanDocument: hasPlanDocument,
        planPrice: plan?.price || null,
        isPremiumCourse: isPremiumCourse
      });
      return res.status(400).json({
        message: "This course is free. Payment is not required.",
      });
    }

    // If no checkout URL, cannot proceed with payment
    if (!hotmartCheckoutUrl) {
      return res.status(400).json({
        message: "Hotmart checkout URL not configured for this course. Please assign a Plan with a valid checkout URL or contact support.",
        details: plan ? `The Plan "${plan.name}" assigned to this course is missing a checkout URL. Please update the Plan in the admin panel.` : "The course does not have a Plan assigned. Please assign a Plan with a valid checkout URL."
      });
    }

    // Validate URL format and ensure it's not null/undefined/contains "null"
    // Also explicitly reject the word "null" in the URL path
    const isValidUrl = hotmartCheckoutUrl && 
                       typeof hotmartCheckoutUrl === 'string' && 
                       hotmartCheckoutUrl.toLowerCase() !== 'null' &&
                       !hotmartCheckoutUrl.toLowerCase().includes('/null') &&
                       !hotmartCheckoutUrl.toLowerCase().endsWith('/null') &&
                       hotmartCheckoutUrl.match(/^https?:\/\/pay\.hotmart\.com\/[A-Z0-9]+$/i) &&
                       !hotmartCheckoutUrl.match(/\/null($|\?|#)/i); // Explicitly reject /null at end or followed by query/fragment
    
    if (!isValidUrl) {
      console.error("Invalid or missing checkout URL:", {
        courseId,
        courseTitle: course.title,
        planId: plan?._id || course.plan || null,
        planName: plan?.name || null,
        planHasCheckoutUrl: plan?.hotmartCheckoutUrl ? true : false,
        planCheckoutUrlValue: plan?.hotmartCheckoutUrl ? JSON.stringify(plan.hotmartCheckoutUrl) : null,
        hotmartCheckoutUrl: hotmartCheckoutUrl || "null/undefined",
        hotmartCheckoutUrlType: typeof hotmartCheckoutUrl,
        hotmartProductId: course.hotmartProductId || null,
        courseTier: course.tier,
        containsNull: hotmartCheckoutUrl?.toLowerCase().includes('null') || false
      });
      return res.status(400).json({
        message: "Invalid Hotmart checkout URL format.",
        details: "The checkout URL must be in format: https://pay.hotmart.com/J103673988Y and cannot contain 'null'.",
        received: hotmartCheckoutUrl || "null/undefined",
        courseId: courseId,
        suggestion: plan ? "The course has a Plan assigned, but the Plan has an invalid checkout URL (possibly contains 'null'). Please update the Plan with a valid checkout URL in the admin panel." : "The course does not have a Plan assigned. Please assign a Plan with a valid checkout URL."
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

    // Check if there's a pending purchase - return stored checkout URL for existing pending purchase
    const pendingPurchase = await CoursePurchase.findOne({
      user: userId,
      course: courseId,
      status: "pending",
    });

    if (pendingPurchase) {
      // IMPORTANT: Always re-fetch plan data when there's a pending purchase
      // This ensures we have the latest checkout URL even if the plan was updated
      // or if the plan wasn't populated correctly initially
      if (course.plan) {
        // Get plan ID (handle both populated and unpopulated cases)
        const planId = (course.plan._id || course.plan).toString();
        const refreshedPlan = await Plan.findById(planId);
        
        if (refreshedPlan) {
          plan = refreshedPlan;
          
          // Get fresh checkout URL from plan - validate thoroughly
          if (refreshedPlan.hotmartCheckoutUrl && 
              refreshedPlan.hotmartCheckoutUrl !== null && 
              refreshedPlan.hotmartCheckoutUrl !== 'null' && 
              refreshedPlan.hotmartCheckoutUrl.trim() !== '' &&
              typeof refreshedPlan.hotmartCheckoutUrl === 'string' &&
              refreshedPlan.hotmartCheckoutUrl.toLowerCase() !== 'null' &&
              !refreshedPlan.hotmartCheckoutUrl.toLowerCase().includes('/null')) {
            const trimmedUrl = refreshedPlan.hotmartCheckoutUrl.trim();
            hotmartCheckoutUrl = trimmedUrl;
            planCheckoutCode = refreshedPlan.hotmartCheckoutCode || extractCheckoutCodeFromUrl(hotmartCheckoutUrl);
          } else {
            console.error("Plan found but has invalid checkout URL for pending purchase:", {
              courseId,
              purchaseId: pendingPurchase._id,
              planId: refreshedPlan._id,
              planName: refreshedPlan.name,
              checkoutUrl: refreshedPlan.hotmartCheckoutUrl,
              checkoutUrlType: typeof refreshedPlan.hotmartCheckoutUrl,
              checkoutUrlValue: JSON.stringify(refreshedPlan.hotmartCheckoutUrl),
              containsNull: refreshedPlan.hotmartCheckoutUrl?.toLowerCase().includes('null') || false
            });
          }
        } else {
          console.error("Plan reference exists but plan document not found for pending purchase:", {
            courseId,
            purchaseId: pendingPurchase._id,
            planReference: planId
          });
        }
      }

      // Re-validate checkout URL - this MUST be valid before we return
      // Explicitly check for null, "null" string, and URLs containing "/null"
      const isValidPendingUrl = hotmartCheckoutUrl && 
                                typeof hotmartCheckoutUrl === 'string' && 
                                hotmartCheckoutUrl !== 'null' &&
                                hotmartCheckoutUrl.toLowerCase() !== 'null' &&
                                hotmartCheckoutUrl.trim() !== '' &&
                                !hotmartCheckoutUrl.toLowerCase().includes('/null') &&
                                !hotmartCheckoutUrl.toLowerCase().endsWith('/null') &&
                                hotmartCheckoutUrl.match(/^https?:\/\/pay\.hotmart\.com\/[A-Z0-9]+$/i) &&
                                !hotmartCheckoutUrl.match(/\/null($|\?|#)/i);
      
      if (!isValidPendingUrl) {
        // If we don't have a valid checkout URL, something is wrong with the course/plan configuration
        console.error("No valid checkout URL found for pending purchase:", {
          courseId,
          purchaseId: pendingPurchase._id,
          planId: plan?._id || course.plan || null,
          planExists: !!plan,
          planCheckoutUrl: plan?.hotmartCheckoutUrl || null,
          planCheckoutUrlValue: plan?.hotmartCheckoutUrl ? JSON.stringify(plan.hotmartCheckoutUrl) : null,
          hotmartCheckoutUrl: hotmartCheckoutUrl,
          hotmartCheckoutUrlType: typeof hotmartCheckoutUrl,
          containsNull: hotmartCheckoutUrl?.toLowerCase().includes('null') || false
        });
        // Delete the invalid pending purchase and let the user try again
        await CoursePurchase.findByIdAndDelete(pendingPurchase._id);
        return res.status(400).json({
          message: "Hotmart checkout URL not configured for this course. Please assign a Plan or contact support.",
          details: plan ? `The Plan "${plan.name}" assigned to this course has an invalid checkout URL (possibly contains 'null'). Please update the Plan in the admin panel with a valid checkout URL.` : "The course does not have a Plan assigned. Please assign a Plan with a valid checkout URL."
        });
      }

      // Get price from plan if available, otherwise use course price
      const purchaseAmount = plan?.price ?? course.price ?? 0;

      // Final safety check: Ensure checkout URL doesn't contain "null" anywhere
      if (hotmartCheckoutUrl && (hotmartCheckoutUrl.toLowerCase().includes('null') || hotmartCheckoutUrl === 'null')) {
        console.error("FATAL: Checkout URL contains 'null' - this should have been caught earlier:", {
          courseId,
          purchaseId: pendingPurchase._id,
          checkoutUrl: hotmartCheckoutUrl
        });
        await CoursePurchase.findByIdAndDelete(pendingPurchase._id);
        return res.status(500).json({
          message: "Internal server error: Invalid checkout URL configuration detected.",
          details: "The checkout URL contains invalid data. This has been logged. Please contact support."
        });
      }

      return res.status(200).json(
        ApiResponse(200, {
          purchaseId: pendingPurchase._id,
          checkoutUrl: hotmartCheckoutUrl, // Return the validated URL
          amount: purchaseAmount,
          currency: "USD",
        }, "Existing pending purchase found. Redirecting to checkout.")
      );
    }

    // Get price from plan if available, otherwise use course price
    const purchaseAmount = plan?.price ?? course.price ?? 0;

    // Create a purchase record
    const purchase = await CoursePurchase.create({
      user: userId,
      course: courseId,
      amount: purchaseAmount,
      currency: "USD",
      status: "pending",
      paymentMethod: "hotmart",
      hotmartProductId: planCheckoutCode || extractCheckoutCodeFromUrl(hotmartCheckoutUrl) || null, // Store checkout code for webhook matching
    });

    // Final safety check: Ensure checkout URL doesn't contain "null" anywhere
    if (hotmartCheckoutUrl && (hotmartCheckoutUrl.toLowerCase().includes('null') || hotmartCheckoutUrl === 'null')) {
      console.error("FATAL: Checkout URL contains 'null' - this should have been caught earlier:", {
        courseId,
        purchaseId: purchase._id,
        checkoutUrl: hotmartCheckoutUrl
      });
      // Delete the invalid purchase that was just created
      await CoursePurchase.findByIdAndDelete(purchase._id);
      return res.status(500).json({
        message: "Internal server error: Invalid checkout URL configuration detected.",
        details: "The checkout URL contains invalid data. This has been logged. Please contact support."
      });
    }

    // Return the stored checkout URL directly from plan (no need to generate)
    return res.status(200).json(
      ApiResponse(200, {
        purchaseId: purchase._id,
        checkoutUrl: hotmartCheckoutUrl, // Return the stored URL directly (no generation needed)
        amount: purchaseAmount,
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
 * Updated to find courses by Plan and track each course purchase individually
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

    // Find plan by hotmartProductId/checkout code from webhook
    // Webhook might send either product ID or checkout code
    const extractedCode = extractCheckoutCodeFromUrl(`https://pay.hotmart.com/${hotmartProductId}`) || hotmartProductId;
    
    const plan = await Plan.findOne({
      $or: [
        { hotmartProductId: hotmartProductId },
        { hotmartCheckoutCode: hotmartProductId },
        { hotmartCheckoutCode: extractedCode },
        { hotmartCheckoutUrl: { $regex: hotmartProductId, $options: "i" } }
      ]
    });

    let courses = [];
    
    if (plan) {
      // New approach: Find all courses using this plan
      courses = await Course.find({ plan: plan._id });
    } else {
      // Legacy approach: Find course by direct hotmartProductId
      const legacyCourse = await Course.findOne({ hotmartProductId });
      if (legacyCourse) {
        courses = [legacyCourse];
      }
    }

    if (courses.length === 0) {
      console.error(`No courses found for Hotmart product ID/checkout code: ${hotmartProductId}`);
      return;
    }

    if (!buyerEmail) {
      console.error("Buyer email not found in webhook data");
      return;
    }

    // Find user by email (check both User and UserCredential models)
    let user = await User.findOne({ email: buyerEmail });
    if (!user) {
      const userCredential = await UserCredential.findOne({ email: buyerEmail }).select("-password");
      if (userCredential) {
        user = {
          _id: userCredential._id,
          email: userCredential.email,
          first_name: userCredential.first_name,
          last_name: userCredential.last_name,
          name: userCredential.name,
          role: userCredential.role || 'student',
          image: userCredential.image,
        };
      }
    }

    if (!user) {
      console.error(`User not found for email: ${buyerEmail}`);
      return;
    }

    // Parse amount and date
    const parsedDate = purchaseDate ? new Date(purchaseDate) : new Date();

    // Process purchases for all courses using this plan
    // This ensures we track purchases correctly - each course purchase is linked to the specific course
    for (const course of courses) {
      // Get price from plan if available, otherwise use course price
      const parsedAmount = typeof amount === "string" ? parseFloat(amount) : amount || (plan?.price ?? course.price ?? 0);

      // Update or create purchase record for this specific course
      // This is crucial: we track which specific course the user purchased
      await CoursePurchase.findOneAndUpdate(
        {
          hotmartTransactionCode: transactionCode,
          course: course._id, // Link to specific course
        },
        {
          user: user._id,
          course: course._id, // Link to specific course - this is how we track purchases
          hotmartTransactionCode: transactionCode,
          status: "approved",
          amount: parsedAmount,
          currency: currency,
          hotmartProductId: plan ? (plan.hotmartProductId || plan.hotmartCheckoutCode) : hotmartProductId,
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
    }
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

    await CoursePurchase.updateMany(
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

    await CoursePurchase.updateMany(
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
 * Updated to use Plan for price information
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
      Course.find({ _id: { $in: courseIds } }).populate("plan"),
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
      
      // Get price from plan if available, otherwise use course price
      const coursePrice = course.plan?.price ?? course.price ?? 0;
      
      // Determine if premium: tier is PREMIUM or price > 0
      const isPremium = course.tier === "PREMIUM" || coursePrice > 0;
      
      if (!isPremium) {
        // Free course - everyone has access
        accessMap[courseId] = {
          hasAccess: true,
          isPremium: false,
          reason: "free_course",
          coursePrice: coursePrice,
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
          coursePrice: coursePrice,
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
 * Updated to use Plan for price information
 */
export const checkCourseAccess = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate("plan");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Get price from plan if available, otherwise use course price
    const coursePrice = course.plan?.price ?? course.price ?? 0;

    // Free courses are accessible to everyone
    if (course.tier === "FREE" || coursePrice <= 0) {
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
        isPremium: course.tier === "PREMIUM" || coursePrice > 0,
        courseTier: course.tier,
        coursePrice: coursePrice
      }, "Access check completed")
    );
  } catch (error) {
    console.error("Error checking course access:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * @deprecated This endpoint is no longer needed. Use Plan management instead.
 * Update Hotmart checkout code for a course
 * Utility endpoint to fix courses with numeric product IDs
 */
/*
export const updateCourseCheckoutCode = async (req, res) => {
  try {
    const { courseId, hotmartCheckoutCode } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    if (!hotmartCheckoutCode) {
      return res.status(400).json({ message: "hotmartCheckoutCode is required" });
    }

    // Validate course ID format
    if (!/^[0-9a-fA-F]{24}$/.test(courseId)) {
      return res.status(400).json({ message: "Invalid courseId format" });
    }

    // Validate checkout code format (should be alphanumeric, not just numeric)
    if (/^\d+$/.test(hotmartCheckoutCode)) {
      return res.status(400).json({
        message: "Invalid checkout code format. Checkout codes must be alphanumeric (e.g., 'J103673988Y'), not numeric.",
        received: hotmartCheckoutCode,
        expectedFormat: "Alphanumeric checkout code from Hotmart dashboard"
      });
    }

    // Find and update the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const oldCheckoutCode = course.hotmartProductId;
    course.hotmartProductId = hotmartCheckoutCode;
    await course.save();

    return res.status(200).json(
      ApiResponse(200, {
        courseId: course._id,
        courseTitle: course.title,
        oldCheckoutCode: oldCheckoutCode || null,
        newCheckoutCode: hotmartCheckoutCode,
      }, "Course checkout code updated successfully")
    );
  } catch (error) {
    console.error("Error updating course checkout code:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};*/
