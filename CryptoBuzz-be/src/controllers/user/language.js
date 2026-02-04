import LanguageModel from "../../models/language.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

// ------------------------------------------
// GET ACTIVE LANGUAGES (PUBLIC API FOR USERS)
// ------------------------------------------
export const getLanguageList = async (req, res) => {
    try {
        const languages = await LanguageModel.find({ status: true, isDelete: false });

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

export default {
    getLanguageList
};
