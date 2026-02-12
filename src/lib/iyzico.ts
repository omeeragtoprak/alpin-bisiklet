// Iyzico Payment Integration - Alpin Bisiklet
// Sandbox mode - keys will be configured later

const IYZICO_API_KEY = process.env.IYZICO_API_KEY || "";
const IYZICO_SECRET_KEY = process.env.IYZICO_SECRET_KEY || "";
const IYZICO_BASE_URL = process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com";

// ============================================
// TYPES
// ============================================

export interface IyzicoAddress {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode?: string;
}

export interface IyzicoBasketItem {
    id: string;
    name: string;
    category1: string;
    category2?: string;
    itemType: "PHYSICAL" | "VIRTUAL";
    price: string;
}

export interface IyzicoPaymentRequest {
    locale: "tr" | "en";
    conversationId: string;
    price: string;
    paidPrice: string;
    currency: "TRY";
    installment: string;
    basketId: string;
    paymentChannel: "WEB";
    paymentGroup: "PRODUCT";
    paymentCard?: {
        cardHolderName: string;
        cardNumber: string;
        expireMonth: string;
        expireYear: string;
        cvc: string;
        registerCard?: string;
    };
    buyer: {
        id: string;
        name: string;
        surname: string;
        gsmNumber?: string;
        email: string;
        identityNumber: string;
        registrationAddress: string;
        ip: string;
        city: string;
        country: string;
        zipCode?: string;
    };
    shippingAddress: IyzicoAddress;
    billingAddress: IyzicoAddress;
    basketItems: IyzicoBasketItem[];
    callbackUrl?: string;
}

export interface IyzicoPaymentResponse {
    status: "success" | "failure";
    errorCode?: string;
    errorMessage?: string;
    paymentId?: string;
    conversationId?: string;
    price?: number;
    paidPrice?: number;
    installment?: number;
    cardType?: string;
    cardAssociation?: string;
    cardFamily?: string;
    binNumber?: string;
    lastFourDigits?: string;
    fraudStatus?: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateHmacSha256(key: string, data: string): string {
    const crypto = require("crypto");
    return crypto.createHmac("sha256", key).update(data).digest("base64");
}

function generateAuthorizationHeader(
    apiKey: string,
    secretKey: string,
    randomString: string,
    requestBody: string,
): string {
    const crypto = require("crypto");
    const hashStr = randomString + requestBody;
    const signature = generateHmacSha256(secretKey, hashStr);
    const authStr = `apiKey:${apiKey}&randomKey:${randomString}&signature:${signature}`;
    return `IYZWS ${Buffer.from(authStr).toString("base64")}`;
}

function generateRandomString(): string {
    return `${Date.now()}${Math.random().toString(36).substring(2, 15)}`;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Iyzico API'ye istek gönder
 */
async function iyzicoRequest<T>(endpoint: string, body: object): Promise<T> {
    const randomString = generateRandomString();
    const jsonBody = JSON.stringify(body);
    const authorization = generateAuthorizationHeader(IYZICO_API_KEY, IYZICO_SECRET_KEY, randomString, jsonBody);

    const response = await fetch(`${IYZICO_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: authorization,
            "x-iyzi-rnd": randomString,
        },
        body: jsonBody,
    });

    return response.json() as Promise<T>;
}

/**
 * Ödeme başlat
 */
export async function createPayment(request: IyzicoPaymentRequest): Promise<IyzicoPaymentResponse> {
    return iyzicoRequest<IyzicoPaymentResponse>("/payment/auth", request);
}

/**
 * 3D Secure ödeme başlat
 */
export async function create3DPayment(request: IyzicoPaymentRequest): Promise<IyzicoPaymentResponse & { threeDSHtmlContent?: string }> {
    return iyzicoRequest("/payment/3dsecure/initialize", request);
}

/**
 * İade işlemi
 */
export async function refundPayment(params: {
    locale: string;
    conversationId: string;
    paymentTransactionId: string;
    price: string;
    currency: string;
    ip: string;
}): Promise<IyzicoPaymentResponse> {
    return iyzicoRequest<IyzicoPaymentResponse>("/payment/refund", params);
}

/**
 * Ödeme sorgula
 */
export async function retrievePayment(params: {
    locale: string;
    conversationId: string;
    paymentId: string;
}): Promise<IyzicoPaymentResponse> {
    return iyzicoRequest<IyzicoPaymentResponse>("/payment/detail", params);
}

/**
 * Taksit sorgula
 */
export async function checkInstallments(params: {
    locale: string;
    conversationId: string;
    binNumber: string;
    price: string;
}): Promise<unknown> {
    return iyzicoRequest("/payment/iyzipos/installment", params);
}

/**
 * Iyzico yapılandırılmış mı kontrol et
 */
export function isIyzicoConfigured(): boolean {
    return IYZICO_API_KEY.length > 0 &&
        IYZICO_SECRET_KEY.length > 0 &&
        !IYZICO_API_KEY.includes("sandbox-your");
}
