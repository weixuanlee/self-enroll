import { useState, useCallback } from 'react';
import {
  EnrollmentState,
  DEFAULT_ENROLLMENT_STATE,
  ContactFormData,
  PaymentType,
  InstallmentType,
  PaymentOption,
  MOCK_PACKAGE,
} from '@/data/enrollmentData';

export function useEnrollment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<EnrollmentState>({ ...DEFAULT_ENROLLMENT_STATE });
  const [isLoading, setIsLoading] = useState(false);
  const pkg = MOCK_PACKAGE;

  const isMalaysian = state.contact.billing_country === 'MY';

  const getEffectivePrice = useCallback(() => {
    const base = pkg.promotion_price_taxed;
    return state.promocodeApplied ? base - state.promocodeDiscount : base;
  }, [pkg.promotion_price_taxed, state.promocodeApplied, state.promocodeDiscount]);

  const getDepositAmount = useCallback(() => {
    return getEffectivePrice() * (pkg.deposit_percent / 100);
  }, [getEffectivePrice, pkg.deposit_percent]);

  const updateContact = useCallback((contact: Partial<ContactFormData>) => {
    setState(prev => ({ ...prev, contact: { ...prev.contact, ...contact } }));
  }, []);

  const setPaymentType = useCallback((paymentType: PaymentType) => {
    setState(prev => ({
      ...prev,
      paymentType,
      paymentOption: paymentType === 'installment' ? null : prev.paymentOption,
      paymentMethodId: paymentType === 'installment' ? null : prev.paymentMethodId,
      installmentProviderId: paymentType !== 'installment' ? null : prev.installmentProviderId,
      installmentPlan: paymentType !== 'installment' ? null : prev.installmentPlan,
    }));
  }, []);

  const setInstallmentType = useCallback((installmentType: InstallmentType) => {
    setState(prev => ({
      ...prev,
      installmentType,
      paymentType: installmentType === 'allowed' ? 'installment' : (prev.paymentType === 'installment' ? 'deposit' : prev.paymentType),
    }));
  }, []);

  const setPaymentOption = useCallback((paymentOption: PaymentOption) => {
    setState(prev => ({ ...prev, paymentOption, paymentMethodId: null }));
  }, []);

  const setPaymentMethodId = useCallback((paymentMethodId: string) => {
    setState(prev => ({ ...prev, paymentMethodId }));
  }, []);

  const setInstallmentProvider = useCallback((providerId: string) => {
    setState(prev => ({ ...prev, installmentProviderId: providerId, installmentPlan: null }));
  }, []);

  const setInstallmentPlan = useCallback((plan: number, providerId: string) => {
    setState(prev => ({ ...prev, installmentPlan: plan, installmentProviderId: providerId }));
  }, []);

  const applyPromocode = useCallback(async (code: string) => {
    if (code.length < 5) {
      setState(prev => ({ ...prev, promocodeApplied: false, promocodeDiscount: 0, promocodeLabel: '' }));
      return { success: false, message: 'Invalid promocode' };
    }
    setIsLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200));
    setIsLoading(false);

    // Simulate success for demo
    if (code.toUpperCase() === 'SAVE20') {
      const discount = pkg.promotion_price_taxed * 0.2;
      setState(prev => ({
        ...prev,
        promocode: code,
        promocodeApplied: true,
        promocodeDiscount: discount,
        promocodeLabel: '20% Off Promocode Applied',
      }));
      return { success: true, message: 'Promocode applied successfully!' };
    }

    setState(prev => ({ ...prev, promocodeApplied: false, promocodeDiscount: 0, promocodeLabel: '' }));
    return { success: false, message: 'Invalid or expired promocode' };
  }, [pkg.promotion_price_taxed]);

  const setTermsAccepted = useCallback((accepted: boolean) => {
    setState(prev => ({ ...prev, termsAccepted: accepted }));
  }, []);

  const resetAll = useCallback(() => {
    setCurrentStep(0);
    setState({ ...DEFAULT_ENROLLMENT_STATE });
    setIsLoading(false);
  }, []);

  const nextStep = useCallback(() => setCurrentStep(s => Math.min(s + 1, 1)), []);
  const prevStep = useCallback(() => setCurrentStep(s => Math.max(s - 1, 0)), []);
  const goToStep = useCallback((step: number) => setCurrentStep(step), []);

  return {
    currentStep,
    state,
    pkg,
    isLoading,
    setIsLoading,
    isMalaysian,
    getEffectivePrice,
    getDepositAmount,
    updateContact,
    setPaymentType,
    setInstallmentType,
    setPaymentOption,
    setPaymentMethodId,
    setInstallmentProvider,
    setInstallmentPlan,
    applyPromocode,
    setTermsAccepted,
    resetAll,
    nextStep,
    prevStep,
    goToStep,
  };
}
