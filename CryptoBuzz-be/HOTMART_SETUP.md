# Hotmart Payment Integration Setup Guide

This guide explains how to set up and use Hotmart payment integration for paid courses in CryptoBuzz Platform.

## Overview

The Hotmart integration allows you to:
- Accept payments for premium courses
- Handle payment webhooks automatically
- Track course purchases and grant access
- Support multiple payment methods through Hotmart

## Prerequisites

1. A Hotmart account (sign up at https://www.hotmart.com/)
2. At least one product created in your Hotmart dashboard
3. Access to Hotmart webhook settings

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Hotmart Configuration
# hottok is Hotmart's authentication token included in every webhook payload
# Get it from: Hotmart Dashboard → Tools → Webhook → Authentication tab
HOTMART_HOTTOK=your_hottok_here

# Optional: Default product ID if not specified per course
HOTMART_DEFAULT_PRODUCT_ID=your_default_product_id_here

# Optional: If you want to use Hotmart API (for advanced features)
HOTMART_CLIENT_ID=your_client_id_here
HOTMART_CLIENT_SECRET=your_client_secret_here
```

### Getting Your Hotmart hottok

**What is hottok?**
- `hottok` is Hotmart's authentication token that is included in **every webhook payload**
- It's a security measure to validate that the webhook request is actually from Hotmart (not a fake/spoofed request)
- You should **never share your hottok** publicly - treat it like a password

**How to get it:**
1. Log in to your Hotmart account
2. Go to **Tools** → **Webhook (API and notifications)**
3. Click on the **Authentication** tab
4. Copy your `hottok` (it's a string of characters)
5. Add it to your `.env` file as `HOTMART_HOTTOK`

**Important Security Notes:**
- Always validate the `hottok` in incoming webhooks
- Never commit `hottok` to version control (use `.env` file and add to `.gitignore`)
- Only share `hottok` with trusted team members involved in the integration
- If you suspect your `hottok` is compromised, you may need to regenerate it in Hotmart

### Getting Your Hotmart Product ID

1. Log in to your Hotmart account
2. Go to **Products** → **My Products**
3. Click on the product you want to use
4. The Product ID is displayed in the product URL or product details page
   - Format: Usually a string like `12345678` or alphanumeric code

### Getting Your Webhook URL

1. Your webhook endpoint is: `https://your-domain.com/api/v1/common/payment/webhook/hotmart`
2. Log in to your Hotmart account
3. Go to **Tools** → **Webhook (API and notifications)**
4. Configure the webhook URL to point to your endpoint
5. Select events to receive (PURCHASE_APPROVED, PURCHASE_COMPLETE, etc.)
6. The `hottok` is automatically included in every webhook payload (no separate configuration needed)

## Setup Steps

### Step 1: Create Products in Hotmart Dashboard

1. Log in to Hotmart
2. Create a product for each paid course (or use one product for all courses)
3. Set the product price, description, and other details
4. Note the Product ID

### Step 2: Configure Courses in CryptoBuzz

When creating or updating a course:

1. Set the course `tier` to `"PREMIUM"`
2. Set the course `price` (should match Hotmart product price)
3. Set the `hotmartProductId` field to your Hotmart Product ID

Example course creation payload:
```json
{
  "title": "Advanced Trading Course",
  "description": "Learn advanced trading strategies",
  "price": 99.99,
  "tier": "PREMIUM",
  "hotmartProductId": "12345678",
  "category": "category_id_here",
  "section": "section_id_here",
  "language": "en"
}
```

### Step 3: Configure Webhook URL in Hotmart

1. In Hotmart dashboard, go to Webhook settings
2. Add webhook URL: `https://your-domain.com/api/v1/common/payment/webhook/hotmart`
3. Select events to receive:
   - PURCHASE_APPROVED
   - PURCHASE_COMPLETE
   - PURCHASE_CANCELLED
   - PURCHASE_REFUNDED
4. Save the webhook configuration

### Step 4: Set Environment Variables

Add the environment variables to your `.env` file as described above.

## API Endpoints

### Create Payment Link

**Endpoint:** `POST /api/v1/common/payment/checkout`

**Authentication:** Required (CommonAuth)

**Request Body:**
```json
{
  "courseId": "course_id_here"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "purchaseId": "purchase_id",
    "checkoutUrl": "https://pay.hotmart.com/12345678?checkoutMode=default&email=user@example.com",
    "amount": 99.99,
    "currency": "USD"
  },
  "message": "Payment link generated successfully",
  "success": true
}
```

### Check Course Access

**Endpoint:** `GET /api/v1/common/payment/access/course/:courseId`

**Authentication:** Required (CommonAuth)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "hasAccess": true,
    "purchase": { /* purchase details */ }
  },
  "message": "Access check completed",
  "success": true
}
```

### Get User Purchases

**Endpoint:** `GET /api/v1/common/payment/purchases`

**Authentication:** Required (CommonAuth)

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "purchase_id",
      "user": "user_id",
      "course": { /* course details */ },
      "status": "approved",
      "amount": 99.99,
      "currency": "USD",
      "purchaseDate": "2024-01-01T00:00:00.000Z",
      "accessGranted": true
    }
  ],
  "message": "Purchases retrieved successfully",
  "success": true
}
```

### Webhook Endpoint (Hotmart calls this)

**Endpoint:** `POST /api/v1/common/payment/webhook/hotmart`

**Authentication:** None (public endpoint)

**Note:** This endpoint is automatically called by Hotmart when payment events occur. You don't need to call this manually.

## Payment Flow

1. User requests to purchase a course → Frontend calls `/api/v1/common/payment/checkout`
2. Backend generates Hotmart checkout URL → Returns URL to frontend
3. User completes payment on Hotmart → Redirected back to your site
4. Hotmart sends webhook → Backend processes purchase and grants access
5. User can access the course → Frontend checks access via `/api/v1/common/payment/access/course/:courseId`

## Testing

### Test Webhook Locally

Use a tool like ngrok to expose your local server:

```bash
ngrok http 8000
```

Then configure the ngrok URL in Hotmart webhook settings: `https://your-ngrok-url.ngrok.io/api/v1/common/payment/webhook/hotmart`

### Test Purchase Flow

1. Create a test course with `tier: "PREMIUM"` and `hotmartProductId`
2. Call the checkout endpoint to get payment URL
3. Complete a test purchase in Hotmart (use sandbox/test mode if available)
4. Verify webhook is received and processed
5. Check that purchase record is created in database
6. Verify user has access to the course

## Database Models

### CoursePurchase Model

The system automatically creates purchase records with the following fields:
- `user`: Reference to the user who purchased
- `course`: Reference to the purchased course
- `hotmartTransactionCode`: Unique transaction ID from Hotmart
- `status`: Purchase status (pending, approved, cancelled, refunded)
- `amount`: Purchase amount
- `currency`: Currency code
- `accessGranted`: Whether user has access to the course
- `purchaseDate`: Date of purchase

## Troubleshooting

### Webhook Not Received

1. Check webhook URL is correctly configured in Hotmart
2. Verify the endpoint is publicly accessible (no auth required)
3. Check server logs for incoming requests
4. Ensure `hottok` matches your environment variable

### Webhook Received But Not Working

If you're receiving webhook events but they're not being processed:

1. **Check hottok validation:**
   - Verify `HOTMART_HOTTOK` in your `.env` file matches the hottok from Hotmart dashboard
   - Check server logs for "Invalid hottok" errors
   - The hottok should be in `req.body.hottok` in the webhook payload

2. **Check webhook payload format:**
   - Hotmart sends data in different formats (JSON, form data, etc.)
   - Check server logs to see the actual payload structure
   - The code tries to handle multiple formats, but you may need to adjust based on your specific payload

3. **Debug webhook data:**
   - The webhook handler logs the full payload - check your server logs
   - Look for the `event` or `event_type` field to identify the event type
   - Verify the payload contains transaction/product/user data

4. **Common issues:**
   - Event type doesn't match (check if it's "PURCHASE_APPROVED" vs "APPROVED", etc.)
   - Product ID doesn't match any course in database
   - User email from webhook doesn't match any user in database
   - Transaction code format differs from expected

### Purchase Not Processed

1. Check server logs for webhook processing errors
2. Verify course exists with matching `hotmartProductId`
3. Verify user exists with matching email (from `buyer.email` in webhook)
4. Check database for purchase records
5. Verify the webhook payload structure matches what the handler expects

### Access Not Granted

1. Verify purchase status is "approved"
2. Check `accessGranted` field is `true`
3. Verify course access endpoint is being called correctly
4. Check user authentication token is valid

### Debugging Tips

1. **Enable detailed logging:**
   - The webhook handler logs the full payload
   - Check your server console/logs when webhook is received
   - Look for error messages in the logs

2. **Test with sample payload:**
   - You can manually test the webhook endpoint with a sample payload
   - Make sure to include the `hottok` field in your test payload
   - Example test payload structure:
   ```json
   {
     "hottok": "your_hottok_here",
     "event": "PURCHASE_APPROVED",
     "data": {
       "purchase": {
         "transaction": "HP123456789",
         "product": {
           "id": "your_product_id",
           "name": "Product Name"
         },
         "buyer": {
           "email": "buyer@example.com",
           "name": "Buyer Name"
         },
         "price": {
           "value": 99.99,
           "currency_code": "USD"
         }
       }
     }
   }
   ```

3. **Check Hotmart webhook logs:**
   - Hotmart dashboard may show webhook delivery status
   - Check if webhooks are being successfully delivered
   - Verify the webhook URL is correct and accessible

## Support

For Hotmart-specific issues, consult:
- Hotmart API Documentation: https://developers.hotmart.com/
- Hotmart Support: https://help.hotmart.com/

For integration issues, check:
- Server logs for error messages
- Database records for purchase status
- Webhook payload format matches expected structure

