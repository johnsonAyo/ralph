import { ReactNode } from "react";
export interface CTAProps {
    children?: ReactNode;
    variant?: "primary" | "secondary" | string;
}
export type PricingItem = [
    string,
    string,
    string,
    string[]
];
export type RiskTolerance = "cautious" | "balanced" | "flexible";
import { ListingSnapshot } from "@ralph/shared";
export interface CreateReportInput {
    listingUrl: string;
    totalUserBudget: number;
    postcode: string;
    riskTolerance: "cautious" | "balanced" | "flexible";
    listing?: ListingSnapshot;
}
export interface AuthPlatform {
    id: "copart" | "iaa";
    name: string;
    subtitle: string;
    iconName: "Warehouse" | "ScrollText";
}
export interface WhyUseCard {
    title: string;
    body: string;
    iconName: "FileSearch" | "Receipt" | "ShieldCheck" | "Target" | "Camera" | "Users";
}
export interface AboutSection {
    id: string;
    heading: string;
    body: string;
}
export interface FaqItem {
    question: string;
    answer: string;
}
export type StripePriceLookupKey = "starter" | "buyer" | "protected";
