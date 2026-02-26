import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PackageData, PaymentType, PaymentOption, PAYMENT_METHODS, INSTALLMENT_PROVIDERS, } from "@/data/enrollmentData";
import { Loader2, CheckCircle2 } from "lucide-react";
import SectionHeader from "./SectionHeader";

interface PaymentSummaryProps {
  pkg: PackageData;
  paymentType: PaymentType;
  paymentOption: PaymentOption | null;
  paymentMethodId: string | null;
  installmentProviderId: string | null;
  installmentPlan: number | null;
  effectivePrice: number;
  depositAmount: number;
  onPrev: () => void;

  onValidatePaymentMethod: () => boolean;

  // ADD THIS (global overlay control)
  setIsLoading: (v: boolean) => void;
}

const PaymentSummary = ({
  pkg,
  paymentType,
  paymentOption,
  paymentMethodId,
  installmentProviderId,
  installmentPlan,
  effectivePrice,
  depositAmount,
  onPrev,
  onValidatePaymentMethod,
  setIsLoading,
}: PaymentSummaryProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const method = PAYMENT_METHODS.find((m) => m.id === paymentMethodId);
  const provider = INSTALLMENT_PROVIDERS.find((p) => p.id === installmentProviderId);

  const paymentTypeLabel =
    paymentType === "installment"
      ? "Credit Card Installment"
      : paymentType === "deposit"
      ? `${pkg.deposit_percent}% Deposit`
      : "One-Time Full Payment";

  const payableAmount = paymentType === "deposit" ? depositAmount : effectivePrice;

  const formatMYR = (v: number) =>
    `RM ${v.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`;

  const handleSubmit = async () => {
    if (isSubmitting) return; // prevent double submit

    // overlay appears immediately when clicked
    setIsSubmitting(true);
    setIsLoading(true);

    // validate step 4; if invalid -> hide overlay and stop
    const ok = onValidatePaymentMethod();
    if (!ok) {
      setIsLoading(false);
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 1500));
      setIsComplete(true);
    } catch (e) {
      // If API fails, hide overlay and show error (you can toast here)
      // For now just stop
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="enrollment-card text-center py-12 animate-in fade-in duration-500">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Payment Initiated!</h2>
        <p className="text-muted-foreground mb-1">
          Your enrollment for <strong>{pkg.name}</strong> has been submitted.
        </p>
        <p className="text-sm text-muted-foreground">
          You will be redirected to the payment gateway shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="enrollment-card">
        <SectionHeader number={5} title="Payment Summary" subtitle="Review before proceeding" />

        <div className="text-md text-foreground text-center mb-2">You are paying for :</div>

        <div className="bg-accent/50 rounded-lg p-5 space-y-4">
          <div className="flex justify-between">
            <span className="text-md font-semibold text-foreground">Package</span>
            <span className="text-md font-semibold text-[#C41E71] text-right max-w-[60%]">
              {pkg.name}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Payment Type</span>
            <span className="text-sm font-medium text-foreground">{paymentTypeLabel}</span>
          </div>

          {paymentType !== "installment" && method && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Payment Method</span>
              <span className="text-sm text-foreground">
                {method.icon} {method.name}
              </span>
            </div>
          )}

          {paymentType === "installment" && provider && installmentPlan && (
            <>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Provider</span>
                <span className="text-sm text-foreground">
                  {provider.logo} {provider.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Installment Plan</span>
                <span className="text-sm font-medium text-foreground">
                  {installmentPlan} Months — {formatMYR(effectivePrice / installmentPlan)} / month
                </span>
              </div>
            </>
          )}

          <div className="border-t border-border pt-4 flex justify-between items-center">
            <span className="font-semibold text-foreground">
              {paymentType === "installment" ? "Installment Payable" : "Total Payable"}
            </span>
            <span className="text-2xl font-bold text-primary">
              {paymentType === "installment" && installmentPlan
                ? formatMYR(effectivePrice / installmentPlan) + " / month"
                : formatMYR(payableAmount)}
            </span>
          </div>

          <p className="text-sm italic text-muted-foreground">
            {pkg.is_include_tax === 1
              ? `* All prices show are inclusive ${pkg.tax_rate}% of SST`
              : `* Price is subject to ${pkg.tax_rate}% tax`}
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="h-11 px-10 rounded-xl border-2 border-[#BFD9EE] bg-white text-[#0F172A] hover:bg-[#F2FAFF]" disabled={isSubmitting}>
          Back
        </Button>

        <Button onClick={handleSubmit} disabled={isSubmitting} className="h-11 px-10 rounded-xl bg-[#C41E71] text-white hover:bg-[#C2176B]">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
};

export default PaymentSummary;