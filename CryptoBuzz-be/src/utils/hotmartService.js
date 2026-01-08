import axios from "axios";

/**
 * Hotmart endpoints (Production)
 */
const HOTMART_AUTH_URL =
    "https://api-sec-vlc.hotmart.com/security/oauth/token";

const HOTMART_API_BASE_URL =
    `${process.env.HOTMART_API_BASE_URL}/products/api/v1/products`;

/**
 * Get Hotmart OAuth Access Token
 * (Producer / Creator – client_credentials)
 */
export const getHotmartAccessToken = async () => {
    try {
        const clientId = process.env.HOTMART_CLIENT_ID;
        const clientSecret = process.env.HOTMART_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error(
                "HOTMART_CLIENT_ID and HOTMART_CLIENT_SECRET must be set"
            );
        }

        // 🔑 THIS IS THE MOST IMPORTANT PART
        const basicAuth = Buffer.from(
            `${clientId}:${clientSecret}`
        ).toString("base64");

        const response = await axios.post(
            `${HOTMART_AUTH_URL}?grant_type=client_credentials`,
            null,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${basicAuth}`,
                },
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error(
            "Hotmart Auth Error:",
            error.response?.data || error.message
        );
        throw new Error("Failed to authenticate with Hotmart");
    }
};

/**
 * Get Hotmart Products (MY PRODUCTS ONLY – Producer)
 */
export const getHotmartProducts = async () => {
    try {
        const token = await getHotmartAccessToken();

        const response = await axios.get(HOTMART_API_BASE_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            params: {
                max_results: 50,
            },
        });

        return response.data;
    } catch (error) {
        console.error(
            "Hotmart Products Error:",
            error.response?.data || error.message
        );
        throw new Error("Failed to fetch products from Hotmart");
    }
};
