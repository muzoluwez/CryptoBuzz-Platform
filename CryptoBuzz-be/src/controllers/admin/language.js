import LanguageModel from "../../models/language.js";
import { ApiResponse, GetApiResponse } from "../../utils/ApiResponse.js";

// ------------------------------------------
// GET ACTIVE LANGUAGES (ONLY STATUS = TRUE)
// ------------------------------------------
export const getLanguageList = async (req, res) => {
  try {
    const languages = await LanguageModel.find({ status: true });

    if (!languages.length) {
      return res.status(404).json({ message: "No languages found." });
    }

    const response = languages.map(item => ({
      _id: item._id,
      name: item.name
    }));

    return res.status(200).json(ApiResponse(200, response, "Languages fetched successfully"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------------------
// GET PAGINATED LANGUAGE LIST WITH SEARCH
// ------------------------------------------
export const getLanguage = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      isDelete: false,
      ...(search && { name: { $regex: search, $options: "i" } })
    };

    const totalCount = await LanguageModel.countDocuments(query);

    const languages = await LanguageModel.find(query).skip(skip).limit(Number(limit));

    if (!languages.length) {
      return res.status(404).json({ message: "No languages found." });
    }

    const pagination = {
      total: totalCount,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalCount / limit)
    };

    return res.status(200).json(GetApiResponse(200, languages, pagination, "Languages fetched successfully"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------------------
// CREATE LANGUAGE
// ------------------------------------------
export const createLanguage = async (req, res) => {
  try {
    const { name, status } = req.body;

    const newLanguage = new LanguageModel({ name, status });
    await newLanguage.save();

    return res.status(200).json(ApiResponse(200, newLanguage, "Language added successfully"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------------------
// UPDATE LANGUAGE
// ------------------------------------------
export const updateLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const language = await LanguageModel.findById(id);

    if (!language) {
      return res.status(400).json({ message: "Language does not exist." });
    }

    language.name = name ?? language.name;
    language.status = status ?? language.status;

    await language.save();

    return res.status(200).json(ApiResponse(200, language, "Language updated successfully"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------------------
// SOFT DELETE LANGUAGE
// ------------------------------------------
export const deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;

    const language = await LanguageModel.findById(id);

    if (!language) {
      return res.status(400).json({ message: "Language does not exist." });
    }

    language.isDelete = true;
    language.status = false;
    language.deleteAt = new Date();

    await language.save();

    return res.status(200).json(ApiResponse(200, {}, "Language deleted successfully"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Default export if needed
export default {
  getLanguageList,
  getLanguage,
  createLanguage,
  updateLanguage,
  deleteLanguage
};
