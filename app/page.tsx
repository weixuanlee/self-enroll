"use client";

import { useRef, useCallback } from 'react';
import type { ContactDetailsRef } from '@/components/enrollment/ContactDetails';
import StepIndicator from '@/components/enrollment/StepIndicator';
import ContactDetails from '@/components/enrollment/ContactDetails';
import EnrollmentSummary from '@/components/enrollment/EnrollmentSummary';
import PaymentMethod from '@/components/enrollment/PaymentMethod';
import type { PaymentMethodRef } from "@/components/enrollment/PaymentMethod";
import PaymentSummary from '@/components/enrollment/PaymentSummary';
import { useEnrollment } from '@/hooks/useEnrollment';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import { GraduationCap, Clock, Loader2 } from 'lucide-react';
import Image from 'next/image';
import logo from "./logo.png";
import waIcon from "./icon_whatsapp.png";
import msgrIcon from "./icon_fb_messenger.png";

const STEPS = ['Contact & Enrollment', 'Payment Method & Review'];

export default function Page() {
  const enrollment = useEnrollment();
  const { currentStep, state, pkg } = enrollment;
  const contactRef = useRef<ContactDetailsRef>(null);

  const handleTimerExpire = useCallback(() => { enrollment.resetAll(); }, [enrollment]);

  const { display, remaining } = useCountdownTimer({
    onExpireStartLoading: () => enrollment.setIsLoading(true), // ✅ show overlay
    onExpire: () => enrollment.resetAll(),                     // ✅ clear state
    loadingDelayMs: 800,                                       // optional
  });

  const paymentMethodRef = useRef<PaymentMethodRef>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Left brand block */}
          <div className="flex items-center gap-3 min-w-[220px]">
            <div className="w-[180px] h-12 relative flex items-center">
              <Image src={logo} alt="Logo" className="object-cover scale-110" />
            </div>
          </div>

          {/* Right: Chat icons */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-foreground">Chat with us</span>

            <a href="#" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white border border-border hover:bg-muted transition" aria-label="Chat on Whatsapp" title="Whatsapp">
              <Image src={waIcon} alt="Whatsapp" width={20} height={20} className="object-contain" />
            </a>

            <a href="#" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white border border-border hover:bg-muted transition" aria-label="Chat on Messenger" title="Messenger">
              <Image src={msgrIcon} alt="Messenger" width={20} height={20} className="object-contain" />
            </a>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-4">
        {/* Timer countdown */}
        <div className="flex justify-end mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Timeout in</span>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-semibold ${remaining <= 300 ? "bg-destructive/10 text-destructive" : "bg-muted text-foreground"}`}>
              <Clock className="w-4 h-4" /> {display}
            </div>
          </div>
        </div>

        <StepIndicator currentStep={currentStep + 1} steps={STEPS} />

        {currentStep === 0 && (
          <EnrollmentSummary
            pkg={pkg}
            isMalaysian={enrollment.isMalaysian}
            billingCountry={state.contact.billing_country}
            paymentType={state.paymentType}
            installmentType={state.installmentType}
            promocodeApplied={state.promocodeApplied}
            promocodeDiscount={state.promocodeDiscount}
            promocodeLabel={state.promocodeLabel}
            termsAccepted={state.termsAccepted}
            isLoading={enrollment.isLoading}
            effectivePrice={enrollment.getEffectivePrice()}
            depositAmount={enrollment.getDepositAmount()}
            contactDetailsSlot={
              <ContactDetails
                ref={contactRef}
                contact={state.contact}
                onUpdate={enrollment.updateContact}
                onNext={() => {}}
                noCard
              />
            }
            onApplyPromocode={enrollment.applyPromocode}
            onSetPaymentType={enrollment.setPaymentType}
            onSetInstallmentType={enrollment.setInstallmentType}
            onSetTermsAccepted={enrollment.setTermsAccepted}
            onPrev={enrollment.prevStep}
            onNext={async () => {
              // ✅ show overlay immediately
              enrollment.setIsLoading(true);

              const ok = contactRef.current?.validate() ?? true;

              if (!ok) {
                // ✅ hide overlay
                enrollment.setIsLoading(false);

                // ✅ wait UI render errors then scroll to first error
                requestAnimationFrame(() => {
                  contactRef.current?.scrollToFirstError?.();
                });
                return;
              }

              // optional tiny delay to mimic processing
              await new Promise((r) => setTimeout(r, 300));

              enrollment.setIsLoading(false);
              enrollment.nextStep();
            }}
            setIsLoading={enrollment.setIsLoading}
          />
        )}

        {currentStep === 1 && state.paymentType && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <PaymentMethod
              ref={paymentMethodRef}
              paymentType={state.paymentType}
              paymentOption={state.paymentOption}
              paymentMethodId={state.paymentMethodId}
              installmentProviderId={state.installmentProviderId}
              installmentPlan={state.installmentPlan}
              effectivePrice={enrollment.getEffectivePrice()}
              onSetPaymentOption={enrollment.setPaymentOption}
              onSetPaymentMethodId={enrollment.setPaymentMethodId}
              onSetInstallmentProvider={enrollment.setInstallmentProvider}
              onSetInstallmentPlan={enrollment.setInstallmentPlan}
              onPrev={enrollment.prevStep}
              onNext={() => {}}
              isLoading={enrollment.isLoading}
              setIsLoading={enrollment.setIsLoading}
            />

            <PaymentSummary
              pkg={pkg}
              paymentType={state.paymentType}
              paymentOption={state.paymentOption}
              paymentMethodId={state.paymentMethodId}
              installmentProviderId={state.installmentProviderId}
              installmentPlan={state.installmentPlan}
              effectivePrice={enrollment.getEffectivePrice()}
              depositAmount={enrollment.getDepositAmount()}
              onPrev={enrollment.prevStep}
              onValidatePaymentMethod={() => paymentMethodRef.current?.validate() ?? false}
              setIsLoading={enrollment.setIsLoading}
            />
          </div>
        )}
      </main>
      {enrollment.isLoading && (
        <div
          className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white/90 px-6 py-5 shadow-lg">
            <Loader2 className="w-6 h-6 animate-spin text-[#C41E71]" />
            <p className="text-sm font-semibold text-foreground">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}