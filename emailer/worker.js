const { Worker } = require("bullmq");
const { redisConnection, queueName } = require("./config/queue");
const connectDB = require("./config/database");
const EmailJob = require("./models/EmailJob.model");
const { sendEmail } = require("./services/mailService");

const processLivestreamBulkJob = async (job) => {

  const body = job.data.payload;
  const { communityName, title, description, scheduledTime, communitySlug, streamLink } = body.data;
  const { emails } = body;

  const subject = `New Livestream Scheduled: ${title}`;

  // Loop through each email and send it
  // This is now happening in the background worker, not the main server!
  for (const email of emails) {
    try {
      await sendEmail(
        'new-livestream-notification', // This is the template name
        {
          communityName,
          title,
          description,
          scheduledTime,
          communitySlug,
          streamLink,
        },
        email.email,
        subject,
        `${communityName} <${process.env.SMTP_USER}>`
      );
      // Optional: Add a small delay to avoid being rate-limited by your email provider
      // await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to send stream notification to ${email}:`, error.message);
      // Continue to the next email even if one fails
    }
  }
};

// --- Main Worker Logic ---
// This function contains the core task of sending the email for a given job.
const processEmailJob = async (job) => {
  const { jobName, payload } = job.data;
  console.log(`Sending email for job ${job.id} (${jobName})`);

  // The switch statement for actually sending the email remains here.
  switch (jobName) {
    case "welcome":
      return sendEmail(
        "welcome",
        { userName: payload.name },
        payload.email,
        "Welcome to Bell n Desk!"
      );
    case "join-request":
      return sendEmail(
        "join-request",
        {
          userName: payload.name,
          communityName: payload.communityName,
          communitySlug: payload.communitySlug,
          communityOwnerName: payload.communityOwnerName,
        },
        payload.email,
        `Join Request from ${payload.name} for ${payload.communityName}`,
        `${payload.communityName} <${process.env.SMTP_USER}>`
      );
    case "join-request-accepted":
      return sendEmail(
        "join-request-accepted",
        {
          userName: payload.name,
          communityName: payload.communityName,
          communitySlug: payload.communitySlug,
        },
        payload.email,
        `Your join request for ${payload.communityName} has been accepted!`,
        `${payload.communityName} <${process.env.SMTP_USER}>`
      );
    case "platform-purchase-success":
      return sendEmail(
        "platform-purchase-success",
        {
          userName: payload.name,
          planName: payload.planName,
          communityName: payload.communityName,
          communitySlug: payload.communitySlug,
        },
        payload.email,
        `Your plan purchase on Bell n Desk for ${payload.communityName} has been successful!`,
      );
    case "plan-invoice":
      return sendEmail(
        "plan-invoice",
        {
          userName: payload.name,
          planName: payload.planName,
          planPrice: payload.planPrice,
          invoiceDate: payload.invoiceDate,
          invoiceNumber: payload.invoiceNumber,
          invoiceLink: payload.invoiceLink,
        },
        payload.email,
        `Here's your plan invoice for ${payload.communityName} from Bell n Desk!`,
      );
    case "community-purchase-success":
      return sendEmail(
        "community-purchase-success",
        {
          userName: payload.name,
          communityName: payload.communityName,
          communitySlug: payload.communitySlug,
        },
        payload.email,
        `Your subscription purchase on Bell n Desk for ${payload.communityName} has been successful!`,
      );
    case "community-invoice":
      return sendEmail(
        "community-invoice",
        {
          userName: payload.name,
          communityName: payload.communityName,
          subscriptionPrice: payload.subscriptionPrice,
          invoiceDate: payload.invoiceDate,
          invoiceNumber: payload.invoiceNumber,
          invoiceLink: payload.invoiceLink,
        },
        payload.email,
        `Here's your community invoice for ${payload.communityName} from Bell n Desk!`,
      );
    case "subscription-cancelled":
      return sendEmail(
        "subscription-cancelled",
        {
          userName: payload.name,
          communityName: payload.communityName,
          communitySlug: payload.communitySlug,
          // endDate: payload.endDate,
        },
        payload.email,
        `Your upgraded membership for ${payload.communityName} has been cancelled.`,
        `${payload.communityName} <${process.env.SMTP_USER}>`
      );
    case "access-rejected":
      return sendEmail(
        "accessRejected",
        {
          name: payload.name,
          communityName: payload.communityName,
          reason: payload.reason,
        },
        payload.email,
        `Update on your request for ${payload.communityName}`,
        `${payload.communityName} <${process.env.SMTP_USER}>`
      );
    case "reset-password":
      return sendEmail(
        "resetPassword",
        {
          name: payload.name,
          link: `https://bellndesk.com/reset-password?token=${payload.token}`,
        },
        payload.email,
        "Reset Your Password"
      );
    case "new_livestream_scheduled_bulk":
      return await processLivestreamBulkJob(job);
    case "community-invitation":
      return sendEmail(
        "community-invitation",
        {
          inviterName: payload.inviterName,
          communityName: payload.communityName,
          communitySlug: payload.communitySlug,
          communityLink: payload.communityLink,
        },
        payload.email,
        `${payload.inviterName} has invited you to join ${payload.communityName} on Bell N Desk`,
        `${payload.communityName} <${process.env.SMTP_USER}>`
      );
    case "verify-email":
      return sendEmail(
        "verify-email",
        {
          name: payload.name,
          link: payload.link,
          bannerImage:
            "https://my.criptobuzz.com/media/images/banner_1.jpeg"
        },
        payload.email,
        "Verify your email address"
      );
    default:
      throw new Error(`Unknown job name: ${jobName}`);
  }
};

// --- Worker Initialization and Event Listeners ---
const startWorker = async () => {
  // Connect to MongoDB
  await connectDB();

  console.log("Email worker starting...");

  const worker = new Worker(queueName, processEmailJob, {
    connection: redisConnection,
    concurrency: 5,
    limiter: {
      max: 1000,
      duration: 1000,
    },
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  });

  // Event: Job is picked up from the queue and is about to be processed.
  worker.on("active", async (job) => {
    console.log(`Job ${job.id} (${job.data.jobName}) is now active.`);
    try {
      await EmailJob.updateOne(
        { bullJobId: job.id },
        { $set: { status: "in-progress" } }
      );
    } catch (dbError) {
      console.error(`DB_ERROR on 'active' for job ${job.id}:`, dbError);
    }
  });

  // Event: Job has been processed successfully.
  worker.on("completed", async (job) => {
    console.log(`Job ${job.id} (${job.data.jobName}) has completed.`);
    try {
      await EmailJob.updateOne(
        { bullJobId: job.id },
        { $set: { status: "success", successTimestamp: new Date() } }
      );
    } catch (dbError) {
      console.error(`DB_ERROR on 'completed' for job ${job.id}:`, dbError);
    }
  });

  // Event: Job has failed after all retry attempts.
  worker.on("failed", async (job, err) => {
    console.error(
      `Job ${job.id} (${job.data.jobName}) has failed: ${err.message}`
    );
    try {
      await EmailJob.updateOne(
        { bullJobId: job.id },
        {
          $set: {
            status: "failed",
            lastFailureTimestamp: new Date(),
          },
          $inc: { failureCount: 1 },
          $push: {
            errorLogs: { error: err.message, timestamp: new Date() },
          },
        }
      );
    } catch (dbError) {
      console.error(`DB_ERROR on 'failed' for job ${job.id}:`, dbError);
    }
  });

  console.log(`Worker listening for jobs on queue: "${queueName}"`);
};

startWorker();
