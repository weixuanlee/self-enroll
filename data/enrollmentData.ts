export interface PackageData {
  id: string;
  enc_package_id: string;
  name: string;
  course_fee: number;
  promotion_label: string | null;
  promotion_discount: number;
  promotion_price: number;
  promotion_price_taxed: number;
  is_include_tax: number; // 1 = inclusive, 0 = subject to
  tax_rate: number;
  currency: string;
  payment_full: number;
  payment_installment: number;
  payment_deposit: number;
  deposit_percent: number;
  foreign_payment_full: number;
  foreign_payment_installment: number;
  foreign_payment_deposit: number;
  installment_threshold: number;
  full_payment_discount_percent: number;
}

export interface ContactFormData {
  family_name: string;
  given_name: string;
  phone_code: string;
  contact_number: string;
  email: string;
  billing_country: string;
}

export type PaymentType = 'full' | 'installment' | 'deposit';
export type InstallmentType = 'allowed' | 'not-allowed';
export type PaymentOption = 'card' | 'fpx';

export interface InstallmentProvider {
  id: string;
  name: string;
  logo: string;
  plans: number[]; // months
}

export interface PaymentMethodItem {
  id: string;
  name: string;
  icon: string;
  category: PaymentOption;
}

export interface EnrollmentState {
  contact: ContactFormData;
  paymentType: PaymentType | null;
  installmentType: InstallmentType;
  paymentOption: PaymentOption | null;
  paymentMethodId: string | null;
  installmentProviderId: string | null;
  installmentPlan: number | null;
  promocode: string;
  promocodeApplied: boolean;
  promocodeDiscount: number;
  promocodeLabel: string;
  termsAccepted: boolean;
}

export interface PhoneCode {
  code: string;
  country: string;
  dial: string;
}

export interface Country {
  code: string;
  name: string;
  currency: string;
}

export const PHONE_CODES: PhoneCode[] = [
  { code: 'MY', country: 'Malaysia', dial: '+60' },
  { code: 'SG', country: 'Singapore', dial: '+65' },
  { code: 'ID', country: 'Indonesia', dial: '+62' },
  { code: 'TH', country: 'Thailand', dial: '+66' },
  { code: 'PH', country: 'Philippines', dial: '+63' },
  { code: 'US', country: 'United States', dial: '+1' },
  { code: 'GB', country: 'United Kingdom', dial: '+44' },
  { code: 'AU', country: 'Australia', dial: '+61' },
  { code: 'IN', country: 'India', dial: '+91' },
  { code: 'CN', country: 'China', dial: '+86' },
];

export const COUNTRIES: Country[] = [
  { code: 'MY', name: 'Malaysia', currency: 'MYR' },
  { code: 'SG', name: 'Singapore', currency: 'SGD' },
  { code: 'ID', name: 'Indonesia', currency: 'IDR' },
  { code: 'TH', name: 'Thailand', currency: 'THB' },
  { code: 'PH', name: 'Philippines', currency: 'PHP' },
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'CN', name: 'China', currency: 'CNY' },
];

export const MOCK_PACKAGE: PackageData = {
  id: 'pkg-001',
  enc_package_id: 'enc_abc123xyz',
  name: 'Professional Data Analytics Certification',
  course_fee: 3500,
  promotion_label: 'Early Bird Discount',
  promotion_discount: 500,
  promotion_price: 3000,
  promotion_price_taxed: 3180,
  is_include_tax: 1,
  tax_rate: 8,
  currency: 'MYR',
  payment_full: 1,
  payment_installment: 1,
  payment_deposit: 1,
  deposit_percent: 10,
  foreign_payment_full: 1,
  foreign_payment_installment: 1,
  foreign_payment_deposit: 1,
  installment_threshold: 600,
  full_payment_discount_percent: 3,
};

export const INSTALLMENT_PROVIDERS: InstallmentProvider[] = [
  { id: 'maybank', name: 'Maybank', logo: '🏦', plans: [6, 12, 24] },
  { id: 'cimb', name: 'CIMB Bank', logo: '🏛️', plans: [6, 12] },
  { id: 'publicbank', name: 'Public Bank', logo: '🏦', plans: [6, 12, 24] },
];

export const PAYMENT_METHODS: PaymentMethodItem[] = [
  { id: 'visa', name: 'Visa', icon: '💳', category: 'card' },
  { id: 'mastercard', name: 'Mastercard', icon: '💳', category: 'card' },
  { id: 'amex', name: 'Amex', icon: '💳', category: 'card' },
  { id: 'maybank2u', name: 'Maybank2u', icon: '🏦', category: 'fpx' },
  { id: 'cimb-clicks', name: 'CIMB Clicks', icon: '🏛️', category: 'fpx' },
  { id: 'public-bank', name: 'Public Bank', icon: '🏦', category: 'fpx' },
  { id: 'rhb', name: 'RHB Now', icon: '🏦', category: 'fpx' },
  { id: 'hong-leong', name: 'Hong Leong Connect', icon: '🏦', category: 'fpx' },
];

export const EXCHANGE_RATES: Record<string, number> = {
  MYR: 1,
  SGD: 0.29,
  USD: 0.21,
  GBP: 0.17,
  AUD: 0.33,
  IDR: 3300,
  THB: 7.5,
  PHP: 12,
  INR: 17.5,
  CNY: 1.53,
};

export const DEFAULT_CONTACT: ContactFormData = {
  family_name: '',
  given_name: '',
  phone_code: '',
  contact_number: '',
  email: '',
  billing_country: '',
};

export const DEFAULT_ENROLLMENT_STATE: EnrollmentState = {
  contact: { ...DEFAULT_CONTACT },
  paymentType: 'full',
  installmentType: 'allowed',
  paymentOption: null,
  paymentMethodId: null,
  installmentProviderId: null,
  installmentPlan: null,
  promocode: '',
  promocodeApplied: false,
  promocodeDiscount: 0,
  promocodeLabel: '',
  termsAccepted: false,
};
