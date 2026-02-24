import { useEffect, useImperativeHandle, forwardRef, useMemo, useState } from "react";
import {
  PaymentType,
  PaymentOption,
  PAYMENT_METHODS,
  INSTALLMENT_PROVIDERS,
} from "@/data/enrollmentData";
import { CreditCard, Landmark } from "lucide-react";
import SectionHeader from "./SectionHeader";

export interface PaymentMethodRef {
  validate: () => boolean;
}

interface PaymentMethodProps {
  paymentType: PaymentType;
  paymentOption: PaymentOption | null;
  paymentMethodId: string | null;
  installmentProviderId: string | null;
  installmentPlan: number | null;
  effectivePrice: number;
  onSetPaymentOption: (o: PaymentOption) => void;
  onSetPaymentMethodId: (id: string) => void;
  onSetInstallmentProvider: (id: string) => void;
  onSetInstallmentPlan: (plan: number, providerId: string) => void;
  onPrev: () => void;
  onNext: () => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
}

const PaymentMethod = forwardRef<PaymentMethodRef, PaymentMethodProps>(
  (
    {
      paymentType,
      paymentOption,
      paymentMethodId,
      installmentProviderId,
      installmentPlan,
      effectivePrice,
      onSetPaymentOption,
      onSetPaymentMethodId,
      onSetInstallmentProvider,
      onSetInstallmentPlan,
    },
    ref
  ) => {
    const isInstallment = paymentType === "installment";
    const [optionError, setOptionError] = useState<string | null>(null);

    const filteredMethods = useMemo(
      () => PAYMENT_METHODS.filter((m) => m.category === paymentOption),
      [paymentOption]
    );

    const validateInternal = () => {
      // Installment: must pick provider + plan
      if (isInstallment) {
        if (!installmentProviderId || !installmentPlan) {
          return "Please select an installment plan before proceeding";
        }
        return null;
      }

      // Non-installment: must pick payment option + method
      if (!paymentOption) {
        return "Please select a payment method";
      }
      if (!paymentMethodId) {
        return `Please choose ${
          paymentOption === "card" ? "a card type" : "a bank"
        } before proceeding`;
      }
      return null;
    };

    useImperativeHandle(ref, () => ({
      validate: () => {
        const err = validateInternal();
        setOptionError(err);
        return !err;
      },
    }));

    // Auto select first method after choosing payment option (card/fpx)
    useEffect(() => {
      if (!isInstallment && paymentOption && filteredMethods.length > 0) {
        const stillValid = filteredMethods.some((m) => m.id === paymentMethodId);
        if (!paymentMethodId || !stillValid) {
          onSetPaymentMethodId(filteredMethods[0].id);
        }
      }
    }, [isInstallment, paymentOption, filteredMethods, paymentMethodId, onSetPaymentMethodId]);

    // Clear error when user fixes selection
    useEffect(() => {
      if (!optionError) return;
      const errNow = validateInternal();
      if (!errNow) setOptionError(null);
    }, [optionError, isInstallment, paymentOption, paymentMethodId, installmentProviderId, installmentPlan]);

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* ===== Non-installment (deposit / full) ===== */}
        {!isInstallment ? (
          <div className="enrollment-card">
            <SectionHeader
              number={4}
              title="Select Payment Option"
              subtitle="Choose your preferred payment method"
            />

            {/* Option buttons */}
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  onSetPaymentOption("card");
                  setOptionError(null);
                }}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  paymentOption === "card"
                    ? "border-primary bg-[#F2FAFF]"
                    : "border-border hover:border-primary/40 bg-white"
                }`}
              >
                <CreditCard
                  className={`w-6 h-6 ${
                    paymentOption === "card"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                <div className="text-left">
                  <p className="font-semibold text-foreground">Credit / Debit Card</p>
                  <p className="text-sm text-muted-foreground">Visa, Mastercard, Amex</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSetPaymentOption("fpx");
                  setOptionError(null);
                }}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  paymentOption === "fpx"
                    ? "border-primary bg-[#F2FAFF]"
                    : "border-border hover:border-primary/40 bg-white"
                }`}
              >
                <Landmark
                  className={`w-6 h-6 ${
                    paymentOption === "fpx"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                <div className="text-left">
                  <p className="font-semibold text-foreground">FPX / Online Transfer</p>
                  <p className="text-sm text-muted-foreground">Malaysian online banking</p>
                </div>
              </button>
            </div>

            {/* Divider + nested chooser INSIDE SAME CARD */}
            {paymentOption && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Choose {paymentOption === "card" ? "Card Type" : "Bank"}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filteredMethods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onSetPaymentMethodId(m.id);
                        setOptionError(null);
                      }}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm transition-all ${
                        paymentMethodId === m.id
                          ? "border-primary bg-[#F2FAFF] font-medium"
                          : "border-border hover:border-primary/40 bg-white"
                      }`}
                    >
                      <span className="text-lg">{m.icon}</span>
                      <span className="text-foreground">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ✅ Error message at bottom of SAME CARD */}
            {optionError && <p className="field-error mt-4">{optionError}</p>}
          </div>
        ) : (
          /* ===== Installment (tile grid) ===== */
          <div className="enrollment-card">
            <SectionHeader
              number={4}
              title="Choose Payment Method"
              subtitle="Select your installment bank & plan"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {INSTALLMENT_PROVIDERS.map((provider) => {
                const selected = installmentProviderId === provider.id;

                return (
                  <div
                    key={provider.id}
                    className={`rounded-xl border-2 overflow-hidden transition-all bg-white ${
                      selected
                        ? "border-[#F97316] shadow-[0_10px_30px_rgba(2,8,23,0.10)]"
                        : "border-border hover:border-[#F97316]/50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSetInstallmentProvider(provider.id);
                        setOptionError(null);
                      }}
                      className={`w-full text-left p-4 flex items-center gap-3 ${
                        selected ? "bg-[#FFF7ED]" : "bg-white"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${
                          selected
                            ? "bg-[#F97316] text-white"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {provider.logo}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {provider.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          0% Interest Installment Plan
                        </p>
                      </div>

                      <div className="shrink-0">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selected
                              ? "border-[#F97316]"
                              : "border-muted-foreground/30"
                          }`}
                        >
                          {selected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                          )}
                        </div>
                      </div>
                    </button>

                    <div className="p-4 pt-3 border-t border-border">
                      <div className="space-y-2">
                        {provider.plans.map((months) => {
                          const monthly = effectivePrice / months;
                          const checked = selected && installmentPlan === months;

                          return (
                            <label
                              key={months}
                              className="flex items-start gap-2 cursor-pointer select-none"
                              onClick={() => {
                                if (!selected) onSetInstallmentProvider(provider.id);
                                onSetInstallmentPlan(months, provider.id);
                                setOptionError(null);
                              }}
                            >
                              <span className="mt-1">
                                <span
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    checked
                                      ? "border-[#F97316]"
                                      : "border-muted-foreground/40"
                                  }`}
                                >
                                  {checked && (
                                    <span className="w-2 h-2 rounded-full bg-[#F97316]" />
                                  )}
                                </span>
                              </span>

                              <span className="leading-tight">
                                <span className="font-semibold text-foreground">
                                  {String(months).padStart(2, "0")} months
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                  from RM {monthly.toFixed(2)} / mth
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ✅ Error message at bottom of SAME CARD (installment) */}
            {optionError && <p className="field-error mt-4">{optionError}</p>}
          </div>
        )}
      </div>
    );
  }
);

PaymentMethod.displayName = "PaymentMethod";
export default PaymentMethod;
