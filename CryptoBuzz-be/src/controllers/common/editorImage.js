import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadImageToAzure, deleteImageFromAzure } from "../../utils/azureUploader.js";

/**
 * @desc    Upload image for rich text editor
 * @route   POST /api/v1/common/editor/upload-image
 * @access  Common (Admin, Educator, User)
 */
export const uploadEditorImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      message: "Image file is required" 
    });
  }

  // Validate file type
  if (!req.file.mimetype.startsWith('image/')) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid file type. Please upload an image file." 
    });
  }

  try {
    // Upload image to Azure
    const imageUrl = await uploadImageToAzure(
      req.file.buffer, 
      req.file.originalname
    );

    return res.status(200).json(
      ApiResponse(200, { url: imageUrl }, "Image uploaded successfully")
    );
  } catch (error) {
    console.error("Editor image upload error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to upload image" 
    });
  }
});

/**
 * @desc    Delete image from Azure for rich text editor
 * @route   DELETE /api/v1/common/editor/delete-image
 * @access  Common (Admin, Educator, User)
 */
export const deleteEditorImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ 
      success: false, 
      message: "Image URL is required" 
    });
  }

  // Only allow deletion of Azure blob URLs for security
  if (!imageUrl.includes('blob.core.windows.net') && !imageUrl.includes('edulms.blob.core.windows.net')) {
    return res.status(400).json({ 
      success: false, 
      message: "Only Azure blob images can be deleted" 
    });
  }

  try {
    // Delete image from Azure
    await deleteImageFromAzure(imageUrl);

    return res.status(200).json(
      ApiResponse(200, {}, "Image deleted successfully")
    );
  } catch (error) {
    console.error("Editor image delete error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to delete image" 
    });
  }
});

export default { uploadEditorImage, deleteEditorImage };
