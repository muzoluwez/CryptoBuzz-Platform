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
  planId: yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/)
    .nullable()
    .optional(),
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
    const { courseId, planId } = req.body;

    await createPaymentLinkSchema.validate({ courseId, planId });

    // Check if course exists and populate plans
    const course = await Course.findById(courseId)
      .populate("plan") // Legacy single plan
      .populate("plans"); // Multiple plans array
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Collect all available plans for this course
    const availablePlans = [];
    const planIdMap = new Map(); // For quick lookup
    
    // Add plans from plans array (new approach - multiple plans)
    if (course.plans && Array.isArray(course.plans)) {
      course.plans.forEach(plan => {
        if (plan && plan._id && plan.status === "active" && !plan.isDeleted) {
          const planId = plan._id.toString();
          availablePlans.push(plan);
          planIdMap.set(planId, plan);
        }
      });
    }

    // Add single plan if it exists and not already in array (backward compatibility)
    if (course.plan && course.plan._id) {
      const planIdStr = course.plan._id.toString();
      if (!planIdMap.has(planIdStr) && course.plan.status === "active" && !course.plan.isDeleted) {
        availablePlans.push(course.plan);
        planIdMap.set(planIdStr, course.plan);
      }
    }

    // If no plans available and course is premium, return error
    if (availablePlans.length === 0 && (course.tier === "PREMIUM" || course.price > 0)) {
      return res.status(400).json({
        message: "No active plans available for this course. Please contact support.",
      });
    }

    // If multiple plans available and no planId specified, return all plans for selection
    if (availablePlans.length > 1 && !planId) {
      return res.status(200).json(
        ApiResponse(200, {
          requiresPlanSelection: true,
          plans: availablePlans.map(p => ({
            _id: p._id,
            name: p.name,
            description: p.description,
            price: p.price,
            currency: p.currency,
            hotmartCheckoutUrl: p.hotmartCheckoutUrl,
          })),
          courseId: courseId,
          courseTitle: course.title,
        }, "Please select a plan to proceed with checkout")
      );
    }

    // Determine which plan to use
    let selectedPlan = null;
    if (planId) {
      // Validate that the provided planId is one of the available plans
      selectedPlan = planIdMap.get(planId);
      if (!selectedPlan) {
        return res.status(400).json({
          message: "Invalid plan selected. The plan is not available for this course.",
          availablePlans: availablePlans.map(p => ({
            _id: p._id,
            name: p.name,
            price: p.price,
          })),
        });
      }
    } else if (availablePlans.length === 1) {
      // Only one plan available, use it
      selectedPlan = availablePlans[0];
    } else if (availablePlans.length === 0) {
      // Free course or no plans
      if (course.tier === "FREE" || course.price <= 0) {
        return res.status(400).json({
          message: "This course is free. Payment is not required.",
        });
      }
    }

    // Use the selected plan (already populated from availablePlans)
    const plan = selectedPlan;
    let hotmartCheckoutUrl = null;
    let planCheckoutCode = null;

    // Get checkout URL from the selected plan
    if (plan) {
      // Plan is already populated from availablePlans, so we can use it directly
      // Get checkout URL directly from plan
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
    const coursePrice = (plan && plan.price) || course.price || 0;
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
      // IMPORTANT: Use the plan from the request (if provided) or from pending purchase or course
      // Priority: request planId > pendingPurchase.plan > course.plan > selectedPlan
      let planToUse = plan; // Use the selected plan from above (already populated)
      
      // If planId is provided in request, use that plan (already set in selectedPlan above)
      // Otherwise, check if pending purchase has a plan stored
      if (!planToUse && pendingPurchase.plan) {
        const pendingPlanId = (pendingPurchase.plan._id || pendingPurchase.plan).toString();
        planToUse = await Plan.findById(pendingPlanId);
      }
      
      // If still no plan, try course.plan
      if (!planToUse && course.plan) {
        const coursePlanId = (course.plan._id || course.plan).toString();
        planToUse = await Plan.findById(coursePlanId);
      }
      
      // If we have a plan to use, get checkout URL from it
      if (planToUse) {
        if (planToUse.hotmartCheckoutUrl && 
            planToUse.hotmartCheckoutUrl !== null && 
            planToUse.hotmartCheckoutUrl !== 'null' && 
            planToUse.hotmartCheckoutUrl.trim() !== '' &&
            typeof planToUse.hotmartCheckoutUrl === 'string' &&
            planToUse.hotmartCheckoutUrl.toLowerCase() !== 'null' &&
            !planToUse.hotmartCheckoutUrl.toLowerCase().includes('/null')) {
          const trimmedUrl = planToUse.hotmartCheckoutUrl.trim();
          hotmartCheckoutUrl = trimmedUrl;
          planCheckoutCode = planToUse.hotmartCheckoutCode || extractCheckoutCodeFromUrl(hotmartCheckoutUrl);
        } else {
          console.error("Plan found but has invalid checkout URL for pending purchase:", {
            courseId,
            purchaseId: pendingPurchase._id,
            planId: planToUse._id,
            planName: planToUse.name,
            checkoutUrl: planToUse.hotmartCheckoutUrl
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
          planId: planToUse?._id || plan?._id || course.plan || null,
          planExists: !!planToUse || !!plan,
          planCheckoutUrl: planToUse?.hotmartCheckoutUrl || plan?.hotmartCheckoutUrl || null,
          planCheckoutUrlValue: planToUse?.hotmartCheckoutUrl || plan?.hotmartCheckoutUrl ? JSON.stringify(planToUse?.hotmartCheckoutUrl || plan?.hotmartCheckoutUrl) : null,
          hotmartCheckoutUrl: hotmartCheckoutUrl,
          hotmartCheckoutUrlType: typeof hotmartCheckoutUrl,
          containsNull: hotmartCheckoutUrl?.toLowerCase().includes('null') || false
        });
        // Delete the invalid pending purchase and let the user try again
        await CoursePurchase.findByIdAndDelete(pendingPurchase._id);
        return res.status(400).json({
          message: "Hotmart checkout URL not configured for this course. Please assign a Plan or contact support.",
          details: (planToUse || plan) ? `The Plan "${(planToUse || plan).name}" assigned to this course has an invalid checkout URL (possibly contains 'null'). Please update the Plan in the admin panel with a valid checkout URL.` : "The course does not have a Plan assigned. Please assign a Plan with a valid checkout URL."
        });
      }

      // Get price from plan if available, otherwise use course price
      const purchaseAmount = (planToUse && planToUse.price) || (plan && plan.price) || course.price || 0;

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
    const purchaseAmount = (plan && plan.price) || course.price || 0;

    // Get user details for the purchase record
    const user = await User.findById(userId).select("email first_name last_name name");
    
    // Create a purchase record with user details
    const purchase = await CoursePurchase.create({
      user: userId,
      course: courseId,
      plan: plan?._id || null, // Store the selected plan
      amount: purchaseAmount,
      currency: plan?.currency || "USD",
      status: "pending",
      paymentMethod: "hotmart",
      hotmartProductId: planCheckoutCode || extractCheckoutCodeFromUrl(hotmartCheckoutUrl) || null, // Store checkout code for webhook matching
      hotmartBuyerEmail: user?.email || null,
      hotmartBuyerName: user?.name || (user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : null),
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
      // IMPORTANT: Plan purchases grant GLOBAL access across all modules
      // This webhook creates CoursePurchase records for Courses, but plan-based access
      // works globally - users get access to ALL content (Courses, Trade Ideas, Trade Analysis,
      // Crypto Projects, Social Feed, Live Streams) associated with the purchased plan.
      
      // Find all courses using this plan (from plans array or single plan field)
      // Note: We create CoursePurchase records for courses, but access checking for other
      // content types will also check these plan purchases via the global access control utility.
      courses = await Course.find({
        $or: [
          { plans: plan._id }, // Course has this plan in plans array
          { plan: plan._id }   // Course has this plan as single plan (legacy)
        ]
      });
      
      // TODO: In the future, we could also create purchase records for other content types here
      // For now, global access is handled by checking CoursePurchase.plan when accessing any content type
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
      const parsedAmount = typeof amount === "string" ? parseFloat(amount) : amount || (plan && plan.price) || course.price || 0;

      // First, try to find an existing pending purchase for this user and course
      // This handles the case where user initiated checkout but payment completed later
      const existingPendingPurchase = await CoursePurchase.findOne({
        user: user._id,
        course: course._id,
        status: "pending",
        $or: [
          { hotmartTransactionCode: { $exists: false } },
          { hotmartTransactionCode: null },
          { hotmartTransactionCode: "" }
        ]
      });

      // If we find a pending purchase, update it with transaction details
      if (existingPendingPurchase) {
        await CoursePurchase.findByIdAndUpdate(existingPendingPurchase._id, {
          plan: plan?._id || existingPendingPurchase.plan, // Update or keep plan
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
        });
        console.log(`Updated pending purchase to approved: ${transactionCode} for course ${course._id}, user ${user._id}`);
      } else {
        // If no pending purchase exists, create or update based on transaction code
        await CoursePurchase.findOneAndUpdate(
          {
            hotmartTransactionCode: transactionCode,
            course: course._id, // Link to specific course
          },
          {
            user: user._id,
            course: course._id, // Link to specific course - this is how we track purchases
            plan: plan?._id || null, // Store the plan
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
 * Get user's purchased plan IDs (for global access checking)
 * This endpoint is used by frontend to check plan-based access across all content types
 */
export const getUserPurchasedPlanIds = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      // If no user, return empty array (no purchased plans)
      return res.status(200).json(
        ApiResponse(200, { planIds: [] }, "No purchased plans for unauthenticated user")
      );
    }

    // Get all approved purchases with plans
    const purchases = await CoursePurchase.find({
      user: userId,
      status: "approved",
      accessGranted: true,
      plan: { $exists: true, $ne: null },
    }).select("plan");

    // Extract unique plan IDs
    const planIds = [...new Set(
      purchases
        .map((p) => (p.plan?._id || p.plan)?.toString())
        .filter(Boolean)
    )];

    return res.status(200).json(
      ApiResponse(200, { planIds }, "Purchased plan IDs fetched successfully")
    );
  } catch (error) {
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
    // User may or may not be authenticated for this endpoint
    const userId = req.user?._id || null;
    const { courseIds } = req.body;

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ message: "courseIds array is required" });
    }

    // If no user, we can still check PUBLIC courses
    if (!userId) {
      const courses = await Course.find({ _id: { $in: courseIds } }).populate("plan").populate("plans");
      const accessMap = {};
      for (const course of courses) {
        const courseId = course._id.toString();
        // Only PUBLIC courses are accessible without login
        if (course.tier === "PUBLIC") {
          accessMap[courseId] = {
            hasAccess: true,
            isPremium: false,
            reason: "public_course",
            coursePrice: course.price || 0,
            courseTier: course.tier
          };
        } else {
          // All other tiers require authentication
          accessMap[courseId] = {
            hasAccess: false,
            isPremium: course.tier === "PRO",
            reason: "login_required",
            coursePrice: course.price || 0,
            courseTier: course.tier
          };
        }
      }
      return res.status(200).json(ApiResponse(200, accessMap, "Batch access check completed"));
    }

    // Fetch all courses and user purchases in parallel
    const [courses, allUserPurchases] = await Promise.all([
      Course.find({ _id: { $in: courseIds } }).populate("plan").populate("plans"),
      // Fetch ALL user purchases (not just for these courses) to check plan-based access
      CoursePurchase.find({ 
        user: userId,
        status: "approved",
        accessGranted: true,
      }).populate("plan").populate({
        path: "course",
        populate: [{ path: "plan" }, { path: "plans" }]
      })
    ]);

    // Create a Set of purchased course IDs for O(1) lookup
    const purchasedCourseIds = new Set(
      allUserPurchases.map(p => p.course?._id?.toString() || p.course?.toString()).filter(Boolean)
    );

    // Create a Set of purchased plan IDs for plan-based access check
    // Check both purchase.plan (direct) and course.plan/course.plans
    const purchasedPlanIds = new Set();
    allUserPurchases.forEach(purchase => {
      // Direct plan from purchase
      if (purchase.plan) {
        const planId = (purchase.plan._id || purchase.plan).toString();
        purchasedPlanIds.add(planId);
      }
      // Plan from purchased course (legacy)
      const purchasedCourse = purchase.course;
      if (purchasedCourse?.plan) {
        const planId = (purchasedCourse.plan._id || purchasedCourse.plan).toString();
        purchasedPlanIds.add(planId);
      }
      // Plans array from purchased course (new)
      if (purchasedCourse?.plans && Array.isArray(purchasedCourse.plans)) {
        purchasedCourse.plans.forEach(p => {
          if (p && p._id) {
            const planId = (p._id || p).toString();
            purchasedPlanIds.add(planId);
          }
        });
      }
    });

    // Fetch user details to check UID
    const UserCredential = (await import("../../models/userCredential.js")).default;
    const userCredential = await UserCredential.findById(userId).select("uid");
    const userUid = userCredential?.uid || null;

    // Build access map for each course
    const accessMap = {};
    
    for (const course of courses) {
      const courseId = course._id.toString();
      
      // Check if course has any plans (new plans array or legacy single plan)
      const hasPlansArray = course.plans && Array.isArray(course.plans) && course.plans.length > 0;
      const hasSinglePlan = course.plan && (typeof course.plan === 'object' ? course.plan._id : course.plan);
      const hasAnyPlan = hasPlansArray || hasSinglePlan;
      
      // Get price from plans: check plans array first, then single plan, then course price
      let coursePrice = course.price || 0;
      if (hasPlansArray && course.plans.length > 0) {
        // If multiple plans, use the first plan's price (or minimum price)
        const planPrices = course.plans
          .filter(p => p && p.price !== undefined && p.price !== null)
          .map(p => p.price);
        if (planPrices.length > 0) {
          coursePrice = Math.min(...planPrices);
        }
      } else if (hasSinglePlan && typeof course.plan === 'object' && course.plan.price !== undefined) {
        coursePrice = course.plan.price;
      }
      
      // Handle new tier-based access logic
      let hasAccess = false;
      let reason = null;
      let isPremium = false;
      
      if (course.tier === "PUBLIC") {
        // PUBLIC: Everyone has access (no auth required)
        hasAccess = true;
        reason = "public_course";
        isPremium = false;
      } else if (course.tier === "LOGGED_IN") {
        // LOGGED_IN: User must be authenticated
        hasAccess = !!userId; // We already know userId exists at this point
        reason = hasAccess ? "logged_in_access" : "login_required";
        isPremium = false;
      } else if (course.tier === "UID_ONLY") {
        // UID_ONLY: User must have a valid UID
        hasAccess = !!userUid;
        reason = hasAccess ? "uid_access" : "uid_required";
        isPremium = false;
      } else if (course.tier === "PRO") {
        // PRO: Paid course - check purchase/plan access
        isPremium = true;
        // Check if user has approved purchase for this specific course
        hasAccess = purchasedCourseIds.has(courseId);
        let purchase = allUserPurchases.find(p => {
          const pCourseId = p.course?._id?.toString() || p.course?.toString();
          return pCourseId === courseId;
        });
        
        // If no direct purchase, check plan-based access
        if (!hasAccess) {
          // Check both single plan and plans array
          const coursePlanIds = new Set();
          
          // Add single plan (legacy)
          if (course.plan) {
            const planId = (course.plan._id || course.plan).toString();
            coursePlanIds.add(planId);
          }
          
          // Add plans from array (new)
          if (course.plans && Array.isArray(course.plans)) {
            course.plans.forEach(p => {
              if (p && p._id) {
                const planId = (p._id || p).toString();
                coursePlanIds.add(planId);
              }
            });
          }
          
          // Check if user has purchased any of these plans
          for (const coursePlanId of coursePlanIds) {
            if (purchasedPlanIds.has(coursePlanId)) {
              hasAccess = true;
              
              // Find purchase for this plan
              if (!purchase) {
                purchase = allUserPurchases.find(p => {
                  // Check purchase.plan (direct)
                  if (p.plan) {
                    const pPlanId = (p.plan._id || p.plan).toString();
                    if (pPlanId === coursePlanId) return true;
                  }
                  // Check course.plan/course.plans
                  const pCourse = p.course;
                  if (pCourse?.plan) {
                    const pPlanId = (pCourse.plan._id || pCourse.plan).toString();
                    if (pPlanId === coursePlanId) return true;
                  }
                  if (pCourse?.plans && Array.isArray(pCourse.plans)) {
                    return pCourse.plans.some(plan => {
                      const pPlanId = (plan._id || plan).toString();
                      return pPlanId === coursePlanId;
                    });
                  }
                  return false;
                });
              }
              break; // Found access, no need to check other plans
            }
          }
        }
        
        reason = hasAccess ? "purchased" : "purchase_required";
        accessMap[courseId] = {
          hasAccess,
          isPremium: isPremium,
          reason: reason,
          purchase: purchase || null,
          coursePrice: coursePrice,
          courseTier: course.tier,
          accessVia: hasAccess ? (purchasedCourseIds.has(courseId) ? "direct_purchase" : "plan_access") : null
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
    // User may or may not be authenticated for this endpoint
    const userId = req.user?._id || null;
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate("plan").populate("plans");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Fetch user details to check UID if user is authenticated
    let userUid = null;
    if (userId) {
      const UserCredential = (await import("../../models/userCredential.js")).default;
      const userCredential = await UserCredential.findById(userId).select("uid");
      userUid = userCredential?.uid || null;
    }

    // Check if course has any plans (new plans array or legacy single plan)
    const hasPlansArray = course.plans && Array.isArray(course.plans) && course.plans.length > 0;
    const hasSinglePlan = course.plan && (typeof course.plan === 'object' ? course.plan._id : course.plan);
    const hasAnyPlan = hasPlansArray || hasSinglePlan;
    
    // Get price from plans: check plans array first, then single plan, then course price
    let coursePrice = course.price || 0;
    if (hasPlansArray && course.plans.length > 0) {
      // If multiple plans, use the first plan's price (or minimum price)
      const planPrices = course.plans
        .filter(p => p && p.price !== undefined && p.price !== null)
        .map(p => p.price);
      if (planPrices.length > 0) {
        coursePrice = Math.min(...planPrices);
      }
    } else if (hasSinglePlan && typeof course.plan === 'object' && course.plan.price !== undefined) {
      coursePrice = course.plan.price;
    }

    // Handle new tier-based access logic
    let hasAccess = false;
    let reason = null;
    let isPremium = false;
    let purchase = null;
    let accessVia = null;

    if (course.tier === "PUBLIC") {
      // PUBLIC: Everyone has access (no auth required)
      hasAccess = true;
      reason = "public_course";
      isPremium = false;
    } else if (course.tier === "LOGGED_IN") {
      // LOGGED_IN: User must be authenticated
      hasAccess = !!userId;
      reason = hasAccess ? "logged_in_access" : "login_required";
      isPremium = false;
    } else if (course.tier === "UID_ONLY") {
      // UID_ONLY: User must have a valid UID
      hasAccess = !!userUid;
      reason = hasAccess ? "uid_access" : "uid_required";
      isPremium = false;
    } else if (course.tier === "PRO") {
      // PRO: Paid course - check purchase/plan access
      isPremium = true;
      
      // If no user, deny access
      if (!userId) {
        return res.status(200).json(
          ApiResponse(200, { 
            hasAccess: false, 
            reason: "login_required",
            isPremium: true,
            coursePrice: coursePrice,
            courseTier: course.tier
          }, "Login required for paid course")
        );
      }

      // Check if user has approved purchase for this specific course
      purchase = await CoursePurchase.findOne({
        user: userId,
        course: courseId,
        status: "approved",
        accessGranted: true,
      }).populate("course", "plan");

      hasAccess = !!purchase;
      accessVia = hasAccess ? "direct_purchase" : null;

      // If no direct purchase, check plan-based access
      // User has access if they purchased ANY plan that includes this course
      if (!hasAccess) {
        // Collect all plan IDs for this course
        const coursePlanIds = [];
        if (course.plan) {
          const planId = typeof course.plan === 'object' ? (course.plan._id || course.plan).toString() : course.plan.toString();
          coursePlanIds.push(planId);
        }
        if (course.plans && Array.isArray(course.plans)) {
          course.plans.forEach(p => {
            if (p && p._id) {
              const planId = (p._id || p).toString();
              coursePlanIds.push(planId);
            }
          });
        }
        
        // Check if user has purchased any of these plans
        if (coursePlanIds.length > 0) {
          const planBasedPurchase = await CoursePurchase.findOne({
            user: userId,
            status: "approved",
            accessGranted: true,
            plan: { $in: coursePlanIds }
          }).populate("plan");

          if (planBasedPurchase) {
            hasAccess = true;
            purchase = planBasedPurchase;
            accessVia = "plan_access";
          }
        }
      }
      
      reason = hasAccess ? "purchased" : "purchase_required";
    } else {
      // Unknown tier - default to denying access
      hasAccess = false;
      reason = "unknown_tier";
      isPremium = false;
    }

    // Return additional info to help frontend determine access
    return res.status(200).json(
      ApiResponse(200, { 
        hasAccess, 
        purchase: purchase || null,
        isPremium: isPremium,
        courseTier: course.tier,
        coursePrice: coursePrice,
        accessVia: accessVia,
        reason: reason
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
 * Get courses included in a plan
 * Returns all courses that belong to the specified plan
 */
export const getPlanCourses = async (req, res) => {
  try {
    const { planId } = req.params;

    if (!planId || !/^[0-9a-fA-F]{24}$/.test(planId)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    // Fetch plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Find all courses that include this plan (from plans array or single plan field)
    const courses = await Course.find({
      $or: [
        { plans: planId }, // Course has this plan in plans array
        { plan: planId }   // Course has this plan as single plan (legacy)
      ],
      isDeleted: false,
      published: true, // Only return published courses
    })
      .select("_id title description imageUrl price tier category language")
      .populate("category", "name")
      .populate("instructor", "first_name last_name email image")
      .sort({ createdAt: -1 });

    return res.status(200).json(
      ApiResponse(200, {
        planId: plan._id,
        planName: plan.name,
        planDescription: plan.description,
        planPrice: plan.price,
        planCurrency: plan.currency,
        courses: courses,
      }, "Plan courses retrieved successfully")
    );
  } catch (error) {
    console.error("Error getting plan courses:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * Get available plans for a course
 * Returns all plans that include this course
 */
export const getCoursePlans = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId || !/^[0-9a-fA-F]{24}$/.test(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    // Fetch course with populated plans
    const course = await Course.findById(courseId)
      .populate("plan")
      .populate("plans");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Collect all plans - from plans array (new) or single plan (legacy)
    const availablePlans = [];
    
    // Add plans from plans array
    if (course.plans && Array.isArray(course.plans)) {
      course.plans.forEach(plan => {
        if (plan && plan._id && plan.status === "active" && !plan.isDeleted) {
          availablePlans.push({
            _id: plan._id,
            name: plan.name,
            description: plan.description,
            price: plan.price,
            currency: plan.currency,
            hotmartCheckoutUrl: plan.hotmartCheckoutUrl,
            status: plan.status,
          });
        }
      });
    }

    // Add single plan if it exists and not already in array (backward compatibility)
    if (course.plan && course.plan._id) {
      const planIdStr = course.plan._id.toString();
      const existsInArray = availablePlans.some(p => p._id.toString() === planIdStr);
      if (!existsInArray && course.plan.status === "active" && !course.plan.isDeleted) {
        availablePlans.push({
          _id: course.plan._id,
          name: course.plan.name,
          description: course.plan.description,
          price: course.plan.price,
          currency: course.plan.currency,
          hotmartCheckoutUrl: course.plan.hotmartCheckoutUrl,
          status: course.plan.status,
        });
      }
    }

    return res.status(200).json(
      ApiResponse(200, {
        courseId: course._id,
        courseTitle: course.title,
        plans: availablePlans,
      }, "Available plans retrieved successfully")
    );
  } catch (error) {
    console.error("Error getting course plans:", error);
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
