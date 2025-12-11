import "dotenv/config"; // ESM version of dotenv
import fs from "fs";

import   { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, ContainerSASPermissions, BlobSASPermissions } from "@azure/storage-blob";
import  { v4 as uuidv4 } from "uuid";

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error("AZURE_STORAGE_CONNECTION_STRING not found");
}

const IMAGE_CONTAINER_NAME = "cryptobuzz";
const VIDEO_CONTAINER_NAME = "crypto-buzz-video";

const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);
const imageContainerClient =
  blobServiceClient.getContainerClient(IMAGE_CONTAINER_NAME);
const videoContainerClient =
  blobServiceClient.getContainerClient(VIDEO_CONTAINER_NAME);

export async function uploadImageToAzure(fileBuffer, originalName) {
  const blobName = uuidv4() + "-" + originalName;
  const blockBlobClient = imageContainerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: { blobContentType: "image/jpeg" },
  });

  return blockBlobClient.url;
}

export const deleteImageFromAzure = async (imageUrl) => {
  try {
    const blobName = decodeURIComponent(imageUrl.split("/").pop());
    const blockBlobClient = imageContainerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  } catch (err) {
    console.error("Azure Delete Error:", err.message);
  }
};

export const uploadVideoToAzure = async (
  fileBufferOrPath,
  originalName,
  mimeType = "video/mp4"
) => {
  try {
    // Ensure video container exists with public access
    await videoContainerClient.createIfNotExists({
      access: "container", // This makes the container and all blobs publicly accessible
    });

    const blobName = uuidv4() + "-" + originalName;
    const blockBlobClient = videoContainerClient.getBlockBlobClient(blobName);

    // If a file path is provided, stream from disk to avoid 2 GiB Buffer limits
    if (typeof fileBufferOrPath === "string" && fs.existsSync(fileBufferOrPath)) {
      const bufferSize = 8 * 1024 * 1024; // 8MB blocks
      const maxConcurrency = 5;
      await blockBlobClient.uploadFile(fileBufferOrPath, {
        blockSize: bufferSize,
        concurrency: maxConcurrency,
        blobHTTPHeaders: {
          blobContentType: mimeType,
          blobCacheControl: "max-age=31536000",
          blobContentDisposition: `inline; filename="${originalName}"`,
        },
        metadata: {
          originalName: originalName,
          uploadedAt: new Date().toISOString(),
        },
      });
    } else {
      const fileBuffer = fileBufferOrPath;
      // Upload with proper content type and metadata (Buffer path)
      await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: {
          blobContentType: mimeType,
          blobCacheControl: "max-age=31536000", // Cache for 1 year
          blobContentDisposition: `inline; filename="${originalName}"`, // Allow inline viewing
        },
        metadata: {
          originalName: originalName,
          uploadedAt: new Date().toISOString(),
          fileSize: fileBuffer.length.toString(),
        },
      });
    }

    return blockBlobClient.url;
  } catch (err) {
    console.error("Azure Video Upload Error:", err.message);
    throw err;
  }
};

// ❌ Delete video from Azure
export const deleteVideoFromAzure = async (videoUrl) => {
  try {
    const blobName = decodeURIComponent(videoUrl.split("/").pop());
    const blockBlobClient = videoContainerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  } catch (err) {
    console.error("Azure Video Delete Error:", err.message);
  }
};

// Function to ensure container has public access (useful for existing containers)
export const ensurePublicAccess = async () => {
  try {
    // Set container access level to public
    await videoContainerClient.setAccessPolicy({
      access: "container",
    });

    // Set CORS policy at STORAGE ACCOUNT level (this is the key!)
    await blobServiceClient.setServiceProperties({
      cors: [
        {
          allowedOrigins: [
            "https://edu-fsasavghftf7h2da.westus2-01.azurewebsites.net",
            "https://iqonic.vip",
            "http://localhost:3000", // For local development
            "http://localhost:3001", // For local development
          ],
          allowedMethods: ["GET", "HEAD"],
          allowedHeaders: ["*"],
          exposedHeaders: ["*"],
          maxAgeInSeconds: 86400,
        },
      ],
    });

    
  } catch (err) {
    console.error("Error updating container access:", err.message);
  }
};

export function parseConnectionString(connStr) {
  const parts = connStr.split(";");
  let accountName, accountKey;
  for (const part of parts) {
    if (part.startsWith("AccountName="))
      accountName = part.replace("AccountName=", "");
    if (part.startsWith("AccountKey="))
      accountKey = part.replace("AccountKey=", "");
  }
  return { accountName, accountKey };
}

const { accountName, accountKey } = parseConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

const blobServiceClient1 = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
);

export async function getSignedUrl(blobName) {
  const containerClient = blobServiceClient1.getContainerClient(VIDEO_CONTAINER_NAME);
  const blobClient = containerClient.getBlobClient(blobName);

  const expiresOn = new Date(new Date().valueOf() + 24 * 60 * 60 * 1000); // 24hr

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName: VIDEO_CONTAINER_NAME,      // ✅ field name containerName
      blobName: blobName,                       // ✅ blob name
      permissions: BlobSASPermissions.parse("r"), // ✅ correct permissions parser
      startsOn: new Date(),                     // ✅ recommended
      expiresOn,                                // ✅ expiry
    },
    sharedKeyCredential
  ).toString();

  return `${blobClient.url}?${sasToken}`;
}

