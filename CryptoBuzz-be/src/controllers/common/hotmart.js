import { getHotmartProducts } from "../../utils/hotmartService.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const listHotmartProducts = async (req, res) => {
    try {
        const productsData = await getHotmartProducts();

        return res.status(200).json(
            ApiResponse(200, productsData, "Hotmart products fetched successfully")
        );
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
