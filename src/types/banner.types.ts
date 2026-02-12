
export enum BannerPosition {
    HERO = "HERO",
    SIDEBAR = "SIDEBAR",
    CATEGORY = "CATEGORY",
    PRODUCT = "PRODUCT",
    POPUP = "POPUP",
}

export interface Banner {
    id: number;
    title: string;
    subtitle: string | null;
    image: string;
    mobileImage: string | null;
    link: string | null;
    buttonText: string | null;
    position: BannerPosition;
    order: number;
    isActive: boolean;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
