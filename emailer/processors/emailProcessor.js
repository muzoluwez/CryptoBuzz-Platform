// emailer/processors/emailProcessor.js
const { sendEmail } = require("../services/mailService");

const processEmailJob = async (job) => {
  const { jobName, payload } = job.data;
  console.log(`Processing job ${job.id} (${jobName}) for: ${payload.email}`);

  try {
    switch (jobName) {
      case "welcome":
        await sendEmail(
          "welcome",
          { userName: payload.name },
          payload.email,
          "Welcome to Bell N Desk!"
        );
        break;

      case "join-request":
        await sendEmail(
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
        break;

      case "join-request-accepted":
        await sendEmail(
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
        break;
      case "platform-purchase-success":
        await sendEmail(
          "platform-purchase-success",
          {
            userName: payload.name,
            planName: payload.planName,
            communityName: payload.communityName,
            communitySlug: payload.communitySlug,
          },
          payload.email,
          `Your plan purchase on Bell n Desk for ${payload.communityName} has been successful!`
        );
        break;
      case "plan-invoice":
        await sendEmail(
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
          `Here's your plan invoice for ${payload.communityName} from Bell n Desk!`
        );
        break;
      case "community-purchase-success":
        await sendEmail(
          "community-purchase-success",
          {
            userName: payload.name,
            communityName: payload.communityName,
            communitySlug: payload.communitySlug,
          },
          payload.email,
          `Your subscription purchase on Bell n Desk for ${payload.communityName} has been successful!`
        );
        break;
      case "community-invoice":
        await sendEmail(
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
          `Here's your community invoice for ${payload.communityName} from Bell n Desk!`
        );
        break;
      case "subscription-cancelled":
        await sendEmail(
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
        break;
      case "access-approved":
        await sendEmail(
          "accessApproved",
          {
            name: payload.name,
            communityName: payload.communityName,
            link: payload.communityLink,
          },
          payload.email,
          `You've been approved for ${payload.communityName}!`,
          `${payload.communityName} <${process.env.SMTP_USER}>`
        );
        break;

      case "access-rejected":
        await sendEmail(
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
        break;

      case "reset-password":
        await sendEmail(
          "resetPassword",
          {
            name: payload.name,
            link: `https://bellndesk.com/reset-password?token=${payload.token}`,
          },
          payload.email,
          "Reset Your Password"
        );
        break;

      case "community-invitation":
        await sendEmail(
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
        break;

      default:
        throw new Error(`Unknown job name: ${jobName}`);
    }
  } catch (error) {
    console.error(
      `Failed to process job ${job.id} (${jobName}):`,
      error.message
    );
    throw error;
  }
};

module.exports = processEmailJob;
