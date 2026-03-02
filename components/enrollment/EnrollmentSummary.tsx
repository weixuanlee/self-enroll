import { useState, useCallback, useEffect, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PackageData, PaymentType, InstallmentType, COUNTRIES, EXCHANGE_RATES, } from "@/data/enrollmentData";
import { CreditCard, Banknote, Landmark, Loader2, CheckCircle2, AlertCircle, ExternalLink, ArrowRight, ChevronDown, ChevronUp, } from "lucide-react";
import SectionHeader from "./SectionHeader";

interface EnrollmentSummaryProps {
  pkg: PackageData;
  isMalaysian: boolean;
  billingCountry: string;
  paymentType: PaymentType | null;
  installmentType: InstallmentType;
  promocodeApplied: boolean;
  promocodeDiscount: number;
  promocodeLabel: string;
  termsAccepted: boolean;
  isLoading: boolean;
  effectivePrice: number;
  depositAmount: number;
  contactDetailsSlot: ReactNode;
  onApplyPromocode: (code: string) => Promise<{ success: boolean; message: string }>;
  onSetPaymentType: (type: PaymentType) => void;
  onSetInstallmentType: (type: InstallmentType) => void;
  onSetTermsAccepted: (v: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
  setIsLoading: (v: boolean) => void;
}

const EnrollmentSummary = ({
  pkg,
  isMalaysian,
  billingCountry,
  paymentType,
  installmentType,
  promocodeApplied,
  promocodeDiscount,
  promocodeLabel,
  termsAccepted,
  isLoading,
  effectivePrice,
  depositAmount,
  contactDetailsSlot,
  onApplyPromocode,
  onSetPaymentType,
  onSetInstallmentType,
  onSetTermsAccepted,
  onPrev,
  onNext,
  setIsLoading,
}: EnrollmentSummaryProps) => {
  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [paymentError, setPaymentError] = useState(false);

  // ===== Mobile detection (Tailwind sm = 640px) =====
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // ===== Remark collapse (default collapsed on mobile) =====
  const [remarkCollapsed, setRemarkCollapsed] = useState(false);

  useEffect(() => {
    if (isMobile) setRemarkCollapsed(true);
    else setRemarkCollapsed(false);
  }, [isMobile]);

  const country = COUNTRIES.find((c) => c.code === billingCountry);
  const foreignCurrency = country?.currency;
  const exchangeRate = foreignCurrency ? EXCHANGE_RATES[foreignCurrency] : 1;

  const payFull = isMalaysian ? pkg.payment_full : pkg.foreign_payment_full;
  const payInstallment = isMalaysian
    ? pkg.payment_installment
    : pkg.foreign_payment_installment;
  const payDeposit = isMalaysian ? pkg.payment_deposit : pkg.foreign_payment_deposit;

  const installmentAvailable =
    payInstallment === 1 && effectivePrice > pkg.installment_threshold;

  const handleApply = useCallback(async () => {
    if (isLoading) return;
    const result = await onApplyPromocode(promoInput);
    setPromoMessage(result.message);
    setPromoSuccess(result.success);
  }, [promoInput, isLoading, onApplyPromocode]);

  const handleProceed = async () => {
    // show overlay immediately
    setIsLoading(true);

    if (!paymentType) {
      setPaymentError(true);
      setIsLoading(false);
      return;
    }

    if (!termsAccepted) {
      setTermsError(true);
      setIsLoading(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    onNext();
  };

  const formatMYR = (v: number) =>
    `RM ${v.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`;

  // ===== Payment card styles =====
  const payCardBase = "relative flex flex-col items-center text-center cursor-pointer transition-all duration-200 rounded-xl border-2 p-4 pt-8 bg-white";
  const payCardSelected = "border-[#C41E71] bg-[#FFF3F7] shadow-[0_10px_30px_rgba(2,8,23,0.08)]";
  const payCardUnselected = "border-[#BFD9EE] hover:border-[#86C5E7] hover:shadow-[0_10px_26px_rgba(2,8,23,0.06)]";

  const badgeBase = "absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-all";
  const badgeSelected = "bg-[#C41E71] text-white";
  const badgeUnselected = "bg-white border-2 border-[#BFD9EE] text-transparent";

  const iconBase = "flex items-center justify-center w-11 h-11 rounded-xl mb-3 transition-all";
  const iconSelected = "bg-[#C41E71] text-white";
  const iconUnselected = "bg-[#F1F5F9] text-[#64748B]";

  const [remarkOpen, setRemarkOpen] = useState(false); // mobile collapse

  // ===== Mobile collapse wrapper (mobile only usage below) =====
  const MobileCollapseCard = ({
    selected,
    onSelect,
    header,
    children,
  }: {
    selected: boolean;
    onSelect: () => void;
    header: ReactNode;
    children: ReactNode;
  }) => {
    return (
      <div className="rounded-xl border-2 bg-white overflow-hidden">
        <button type="button" onClick={onSelect} className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left ${ selected ? "bg-[#FFF3F7]" : "bg-white" }`}>
          {header}
          <span className={`text-xs font-semibold ${ selected ? "text-[#C41E71]" : "text-muted-foreground" }`}>
            {selected ? "Selected" : "Select"}
          </span>
        </button>

        <div className={`${selected ? "block" : "hidden"}`}>{children}</div>
      </div>
    );
  };

  // ===== Card renderers (so desktop can stay exactly the original size) =====
  const FullPaymentCard = () => {
    const discountPercent = pkg.full_payment_discount_percent;
    const fullDiscountedPrice = effectivePrice * (1 - discountPercent / 100);
    const hasDiscount = discountPercent > 0;
    const selected = paymentType === "full";

    return (
      <div
        onClick={() => {
          onSetPaymentType("full");
          setPaymentError(false);
        }}
        className={`${payCardBase} ${selected ? payCardSelected : payCardUnselected}`}
      >
        <div className={`${badgeBase} ${selected ? badgeSelected : badgeUnselected}`}>
          {selected && <CheckCircle2 className="w-4 h-4" />}
        </div>

        <div className={`${iconBase} ${selected ? iconSelected : iconUnselected}`}>
          <Banknote className="w-5 h-5" />
        </div>

        <p className="font-semibold text-foreground text-lg">One Time Full Payment</p>

        {hasDiscount && (
          <p className="text-sm text-muted-foreground line-through mt-1">
            {formatMYR(effectivePrice)}
          </p>
        )}

        <p className="text-lg font-bold text-primary">{formatMYR(fullDiscountedPrice)}</p>

        {hasDiscount && (
          <p className="text-sm font-medium italic text-[#C41E71] mt-2">
            after {discountPercent}% discount
          </p>
        )}
      </div>
    );
  };

  const InstallmentCard = () => {
    const selected = paymentType === "installment";

    return (
      <div
        onClick={() => {
          onSetPaymentType("installment");
          onSetInstallmentType("allowed");
          setPaymentError(false);
        }}
        className={`${payCardBase} ${selected ? payCardSelected : payCardUnselected}`}
      >
        <div className={`${badgeBase} ${selected ? badgeSelected : badgeUnselected}`}>
          {selected && <CheckCircle2 className="w-4 h-4" />}
        </div>

        <div className={`${iconBase} ${selected ? iconSelected : iconUnselected}`}>
          <CreditCard className="w-5 h-5" />
        </div>

        <p className="font-semibold text-foreground text-lg">Credit Card Installment</p>
        <p className="text-lg font-bold text-primary mt-1">{formatMYR(effectivePrice)}</p>

        <div className="w-full mt-4 space-y-2 text-left" onClick={(e) => e.stopPropagation()}>
          <p className="text-sm font-semibold text-foreground">Select Bank Type :</p>

          <label
            className={`flex items-start gap-2 p-1 rounded-lg cursor-pointer transition-all text-left border ${
              installmentType === "allowed" && selected
                ? "bg-[#F2FAFF] border-[#BFD9EE]"
                : "bg-white border-transparent hover:bg-[#F2FAFF]"
            }`}
            onClick={() => {
              onSetInstallmentType("allowed");
              onSetPaymentType("installment");
              setPaymentError(false);
            }}
          >
            <div className="mt-0.5 shrink-0">
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                  installmentType === "allowed" && selected
                    ? "border-[#C41E71]"
                    : "border-muted-foreground/40"
                }`}
              >
                {installmentType === "allowed" && selected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C41E71]" />
                )}
              </div>
            </div>

            <p className="text-xs text-foreground leading-snug font-semibold">
              Maybank, CIMB Bank, Public Bank, Hong Leong Bank, HSBC Bank and Standard
              Chartered Bank
            </p>
          </label>

          <label
            className={`flex items-start gap-2 p-1 rounded-lg cursor-pointer transition-all text-left border ${
              installmentType === "not-allowed"
                ? "bg-[#FFF3F7] border-[#F5A6C7]"
                : "bg-white border-transparent hover:bg-[#FFF3F7]"
            }`}
            onClick={() => {
              onSetInstallmentType("not-allowed");
              onSetPaymentType("deposit");
              setPaymentError(false);
            }}
          >
            <div className="mt-0.5 shrink-0">
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                  installmentType === "not-allowed"
                    ? "border-[#C41E71]"
                    : "border-muted-foreground/40"
                }`}
              >
                {installmentType === "not-allowed" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C41E71]" />
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-1">
                <p className="text-xs text-foreground font-semibold">Other available banks</p>
                <ArrowRight className="w-5 h-5 text-[#C41E71]" />
              </div>

              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                Citibank, RHB, Ambank, HSBC, Affin Bank and Aeon Credit.
              </p>
              <p className="text-[11px] text-[#C41E71] leading-tight mt-1">
                Pay 10% deposit first and balance later via installment in Beyond Insights
                Center.
              </p>
            </div>
          </label>
        </div>
      </div>
    );
  };

  const DepositCard = () => {
    const selected = paymentType === "deposit";

    return (
      <div
        onClick={() => {
          onSetPaymentType("deposit");
          setPaymentError(false);
        }}
        className={`${payCardBase} ${selected ? payCardSelected : payCardUnselected}`}
      >
        <div className={`${badgeBase} ${selected ? badgeSelected : badgeUnselected}`}>
          {selected && <CheckCircle2 className="w-4 h-4" />}
        </div>

        <div className={`${iconBase} ${selected ? iconSelected : iconUnselected}`}>
          <Landmark className="w-5 h-5" />
        </div>

        <p className="font-semibold text-foreground text-lg">
          Pay {pkg.deposit_percent}% Deposit
        </p>
        <p className="text-lg font-bold text-primary mt-1">{formatMYR(depositAmount)}</p>

        <p className="text-sm text-[#C41E71] font-medium mt-2">Secure Today&apos;s Offer</p>
        <p className="text-sm text-foreground font-semibold mt-2">
          Balance via installment or other payment method.
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Card 1 */}
      <div className="enrollment-card">
        <SectionHeader number={1} title="Contact Details" subtitle="Enter your details" />

        {contactDetailsSlot}

        <div className="border-t border-border mt-6 pt-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Enrollment Summary</h3>
          <p className="text-sm text-muted-foreground -mt-2 mb-3">review package</p>

          <div className="bg-accent/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-md font-semibold text-foreground">Package</span>
              <span className="text-md font-semibold text-foreground text-right max-w-[60%]">
                {pkg.name}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Course Fee</span>
              <span className="text-sm text-foreground">{formatMYR(pkg.course_fee)}</span>
            </div>

            {(pkg.promotion_label || promocodeApplied) && (
              <div className="flex justify-between text-success">
                <span className="text-sm">
                  {promocodeApplied ? promocodeLabel : pkg.promotion_label}
                </span>
                <span className="text-sm font-medium">
                  -{" "}
                  {formatMYR( promocodeApplied ? promocodeDiscount : pkg.promotion_discount )}
                </span>
              </div>
            )}

            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="font-semibold text-foreground">Total Payable</span>
              <span className="text-xl font-bold text-primary">
                {formatMYR(effectivePrice)}
              </span>
            </div>

            <p className="text-sm text-muted-foreground italic">
              {pkg.is_include_tax === 1 ? `* All price shown are inclusive ${pkg.tax_rate}% of SST` : `* Price is subject to ${pkg.tax_rate}% tax`}
            </p>

            {!isMalaysian && foreignCurrency && (
              <p className="text-xs text-muted-foreground">
                ≈ Approx. {foreignCurrency}{" "}
                {(effectivePrice * exchangeRate).toLocaleString("en", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-border mt-6 pt-6">
          <Label className="text-md font-medium text-foreground mb-2 block">Promocode</Label>

          <div className="flex gap-2">
            <Input value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="Enter promocode" onBlur={() => promoInput.length >= 5 && handleApply()} className="flex-1" />
            <Button onClick={handleApply} disabled={isLoading || !promoInput} variant="outline" className="shrink-0">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
            </Button>
          </div>

          {promoMessage && (
            <div className={`flex items-center gap-2 mt-2 text-sm ${ promoSuccess ? "text-success" : "text-destructive" }`}>
              {promoSuccess ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {promoMessage}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            Try &quot;SAVE20&quot; for a demo discount
          </p>
        </div>
      </div>

      {/* Card 2 */}
      <div className="enrollment-card">
        <SectionHeader number={2} title="Choose Payment Type" subtitle="Select how you'd like to pay" />

        {paymentError && !paymentType && (
          <p className="field-error mb-3">Please select a payment type</p>
        )}

        {/* MOBILE: collapsed */}
        <div className="grid gap-3 sm:hidden">
          {payFull === 1 && (
            <MobileCollapseCard
              selected={paymentType === "full"}
              onSelect={() => {
                onSetPaymentType("full");
                setPaymentError(false);
              }}
              header={
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      paymentType === "full"
                        ? "bg-[#C41E71] text-white"
                        : "bg-[#F1F5F9] text-[#64748B]"
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm">One Time Full Payment</p>
                    <p className="text-xs text-muted-foreground">Tap to view</p>
                  </div>
                </div>
              }
            >
              <FullPaymentCard />
            </MobileCollapseCard>
          )}

          {installmentAvailable && (
            <MobileCollapseCard
              selected={paymentType === "installment"}
              onSelect={() => {
                onSetPaymentType("installment");
                onSetInstallmentType("allowed");
                setPaymentError(false);
              }}
              header={
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      paymentType === "installment"
                        ? "bg-[#C41E71] text-white"
                        : "bg-[#F1F5F9] text-[#64748B]"
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm">Credit Card Installment</p>
                    <p className="text-xs text-muted-foreground">Tap to view</p>
                  </div>
                </div>
              }
            >
              <InstallmentCard />
            </MobileCollapseCard>
          )}

          {payDeposit === 1 && (
            <MobileCollapseCard
              selected={paymentType === "deposit"}
              onSelect={() => {
                onSetPaymentType("deposit");
                setPaymentError(false);
              }}
              header={
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      paymentType === "deposit"
                        ? "bg-[#C41E71] text-white"
                        : "bg-[#F1F5F9] text-[#64748B]"
                    }`}
                  >
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm">
                      Pay {pkg.deposit_percent}% Deposit
                    </p>
                    <p className="text-xs text-muted-foreground">Tap to view</p>
                  </div>
                </div>
              }
            >
              <DepositCard />
            </MobileCollapseCard>
          )}
        </div>

        {/* DESKTOP: original (exact same sizing as before) */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-3">
          {payFull === 1 && <FullPaymentCard />}
          {installmentAvailable && <InstallmentCard />}
          {payDeposit === 1 && <DepositCard />}
        </div>
      </div>

      {/* Card 3: Remark + Terms (mobile collapsible) */}
      <div className="enrollment-card">
        {/* Header row */}
        <button
          type="button"
          onClick={() => setRemarkOpen((v) => !v)}
          className="w-full text-left"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <SectionHeader
                number={3}
                title="Remark"
                subtitle="Important information for your payment method and installment plan"
              />
            </div>

            {/* Mobile chevron */}
            <div className="sm:hidden pt-1 text-foreground">
              {remarkOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </div>
        </button>

        {/* Collapsed error (mobile only, show under header when collapsed) */}
        {termsError && !remarkOpen && (
          <p className="field-error mt-2 sm:hidden">
            You must accept the terms to continue
          </p>
        )}

        {/* Content: desktop always visible, mobile toggled */}
        <div className={`${remarkOpen ? "block" : "hidden"} sm:block`}>
          {/* Installment Remark */}
          <div className="mt-4 mb-6">
            <p className="text-sm text-[#C41E71] font-semibold mb-2">
              For payment above MYR 1,000.00, We are now able to support credit card from the
              banks below with Online Installment :
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-3 list-none pl-0">
              <li>✦ Maybank credit cards — up to 12 months.</li>
              <li>✦ CIMB credit cards — up to 24 months.</li>
              <li>✦ Public Bank credit cards — up to 24 months.</li>
              <li>✦ Hong Leong Bank credit cards — up to 24 months.</li>
              <li>✦ HSBC Bank credit cards — 24 months.</li>
              <li>✦ Standard Chartered Bank credit cards — 24 months.</li>
            </ul>
            <p className="text-sm text-foreground">
              <span className="font-semibold text-[#C41E71]">
                * For other available banks,
              </span>{" "}
              installment payment must be processed using your credit card physically at our
              training centers in Petaling Jaya or Penang, Malaysia. Please pay a 10% deposit
              first and we will make an arrangement with you later to drop by our office for
              the balance payment via installment.
            </p>
          </div>

          {/* Terms */}
          <div className="border-t border-border pt-5">
            <div className="flex items-center gap-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(v) => {
                  onSetTermsAccepted(!!v);
                  setTermsError(false);
                }}
                className={termsError ? "border-destructive" : ""}
              />

              <label htmlFor="terms" className="text-sm text-foreground cursor-pointer">
                I agree to the{" "}
                <a
                  href="https://example.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline inline-flex items-center gap-1"
                >
                  Terms &amp; Conditions <ExternalLink className="w-3 h-3" />
                </a>
              </label>
            </div>

            {/* Expanded error (mobile expanded + desktop): show under “I agree…” */}
            {termsError && (
              <p className="field-error mt-2 pl-[34px]">
                You must accept the terms to continue
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleProceed}>
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
};

export default EnrollmentSummary;
