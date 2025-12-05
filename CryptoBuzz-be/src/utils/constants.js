import { StreamClient } from "@stream-io/node-sdk";

// Database names for different environments
const DB_NAMES = {
    development: "CryptoBuzz_develop",
    staging: "CryptoBuzz_staging",
    production: "CryptoBuzz_production"
};

const NODE_ENV = process.env.NODE_ENV || "development";

export const DB_NAME = DB_NAMES[NODE_ENV] || DB_NAMES.development;

// Stream API Configuration
const STREAM_API_KEY = process.env.STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET;

// Validate Stream credentials
if (!STREAM_API_KEY || !STREAM_API_SECRET) {
    console.log(
        `Stream API credentials not found for ${NODE_ENV} environment. Please set STREAM_API_KEY and STREAM_API_SECRET in your .env file.`
    );
}

// Initialize Stream Client
export const streamClient = STREAM_API_KEY && STREAM_API_SECRET
    ? new StreamClient(STREAM_API_KEY, STREAM_API_SECRET)
    : null;

if (streamClient) {
    console.log(`Stream client initialized for ${NODE_ENV} environment`);
}
