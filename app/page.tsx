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
import { GraduationCap, Clock } from 'lucide-react';

const STEPS = ['Contact & Enrollment', 'Payment Method & Review'];

export default function Page() {
  const enrollment = useEnrollment();
  const { currentStep, state, pkg } = enrollment;
  const contactRef = useRef<ContactDetailsRef>(null);

  const handleTimerExpire = useCallback(() => {
    enrollment.resetAll();
  }, [enrollment]);

  const { display, remaining } = useCountdownTimer(handleTimerExpire);

  const paymentMethodRef = useRef<PaymentMethodRef>(null);


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">
                Course Enrollment
              </h1>
              <p className="text-xs text-muted-foreground">{pkg.name}</p>
            </div>
          </div>

          {/* Right: Chat icons */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-foreground">Chat with us</span>

            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#25D366] text-white hover:opacity-90 transition"
              aria-label="Chat on WhatsApp"
              title="WhatsApp"
            >
              {/* WhatsApp icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.5 3.5A11.92 11.92 0 0 0 12.01 0C5.4 0 .02 5.38.02 11.99c0 2.12.55 4.19 1.6 6.02L0 24l6.17-1.62a12 12 0 0 0 5.84 1.49h.01c6.61 0 11.99-5.38 11.99-11.99 0-3.2-1.25-6.21-3.51-8.38Zm-8.49 18.4h-.01a10 10 0 0 1-5.1-1.4l-.37-.22-3.66.96.98-3.57-.24-.37a9.96 9.96 0 0 1-1.54-5.33c0-5.51 4.49-10 10.01-10a9.95 9.95 0 0 1 7.07 2.93 9.93 9.93 0 0 1 2.93 7.07c0 5.51-4.49 10-10.07 10Z"/>
              </svg>
            </a>

            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#0084FF] text-white hover:opacity-90 transition"
              aria-label="Chat on Messenger"
              title="Messenger"
            >
              {/* Messenger-ish icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.49 2 2 6.01 2 10.95c0 2.82 1.52 5.32 3.9 6.97V22l3.77-2.07c.74.2 1.52.31 2.33.31 5.51 0 10-4.01 10-8.95C22 6.01 17.51 2 12 2Zm1.03 11.86-2.55-2.72-4.98 2.72 5.48-5.79 2.55 2.72 4.94-2.72-5.44 5.79Z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-4">
        {/* Timer countdown */}
        <div className="flex justify-end mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Timeout in</span>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-semibold ${
                remaining <= 300
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-foreground"
              }`}
            >
              <Clock className="w-4 h-4" />
              {display}
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
            onNext={() => {
              if (contactRef.current?.validate()) {
                enrollment.nextStep();
              }
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
            />
          </div>
        )}
      </main>
    </div>
  );
}