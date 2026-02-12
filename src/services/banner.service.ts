import { apiClient } from "./api-client";
import { Banner } from "@/types";

export const bannerService = {
    getAll: async () => {
        const response = await apiClient.get<{ data: Banner[] }>("/api/banners");
        return response.data;
    },

    getActive: async () => {
        // We fetch all and filter client side as likely the API doesn't support sophisticated filtering yet
        const response = await apiClient.get<{ data: Banner[] }>("/api/banners");
        return response.data.filter(b => b.isActive);
    }
};
