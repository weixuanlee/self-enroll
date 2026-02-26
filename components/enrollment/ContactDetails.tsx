import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { ContactFormData, PHONE_CODES, COUNTRIES } from "@/data/enrollmentData";
import { Mail, MapPin } from "lucide-react";

interface ContactDetailsProps {
  contact: ContactFormData;
  onUpdate: (data: Partial<ContactFormData>) => void;
  onNext: () => void;
  noCard?: boolean;
}

export interface ContactDetailsRef {
  validate: () => boolean;
  scrollToFirstError: () => void;
}

const ContactDetails = forwardRef<ContactDetailsRef, ContactDetailsProps>(
  ({ contact, onUpdate, noCard }, ref) => {
    const [errors, setErrors] = useState< Partial<Record<keyof ContactFormData, string>> >({});

    // ✅ Keep latest errors in a ref (so scrolling works immediately)
    const lastErrorsRef = useRef< Partial<Record<keyof ContactFormData, string>> >({});

    // ✅ Refs for scrolling (NOTE: no "| null" in generic)
    const familyRef = useRef<HTMLDivElement>(null);
    const givenRef = useRef<HTMLDivElement>(null);
    const phoneRef = useRef<HTMLDivElement>(null);
    const emailRef = useRef<HTMLDivElement>(null);
    const billingRef = useRef<HTMLDivElement>(null);

    const normalizePhone = (phoneCode: string, local: string) => {
      const ccDigits = (phoneCode || "").replace(/\D/g, ""); // "+60" -> "60"
      const localDigits = (local || "").replace(/\D/g, ""); // digits only

      // Malaysia rule: after +60, local number must NOT start with 0
      if (ccDigits === "60" && localDigits.startsWith("0")) {
        return {
          ok: false,
          reason: "For +60 (Malaysia), do not start with 0. Example: 123456789",
          full: "",
        };
      }

      // Combine: exclude "+"
      const full = `${ccDigits}${localDigits}`;
      return { ok: true, reason: "", full };
    };

    const validate = (): boolean => {
      const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

      if (!contact.family_name.trim())
        newErrors.family_name = "Family name is required";

      if (!contact.given_name.trim())
        newErrors.given_name = "Given name is required";

      if (!contact.phone_code) newErrors.phone_code = "Phone code is required";

      const localRaw = contact.contact_number.trim();
      const localDigits = localRaw.replace(/\D/g, "");

      if (!localRaw) {
        newErrors.contact_number = "Contact number is required";
      } else if (localRaw !== localDigits) {
        newErrors.contact_number = "Contact number must contain digits only";
      } else {
        const norm = normalizePhone(contact.phone_code, localDigits);

        if (!norm.ok) {
          newErrors.contact_number = norm.reason;
        } else if (localDigits.length < 7 || localDigits.length > 15) {
          newErrors.contact_number = "Please enter a valid contact number";
        }
      }

      if (!contact.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
        newErrors.email = "Please enter a valid email";
      }

      if (!contact.billing_country)
        newErrors.billing_country = "Billing country is required";

      // store errors in ref first (so scroll works immediately)
      lastErrorsRef.current = newErrors;

      // then update state for rendering
      setErrors(newErrors);

      return Object.keys(newErrors).length === 0;
    };

    const scrollToFirstError = () => {
      const e = lastErrorsRef.current;

      const order: Array<[keyof ContactFormData, React.RefObject<HTMLDivElement | null>]> = [
        ["family_name", familyRef],
        ["given_name", givenRef],
        ["phone_code", phoneRef],
        ["contact_number", phoneRef],
        ["email", emailRef],
        ["billing_country", billingRef],
      ];

      for (const [key, refEl] of order) {
        if (e[key] && refEl.current) {
          refEl.current.scrollIntoView({ behavior: "smooth", block: "center" });
          break;
        }
      }
    };

    useImperativeHandle(ref, () => ({ validate, scrollToFirstError }));

    const content = (
      <div className="grid gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div ref={familyRef}>
            <Label htmlFor="family_name" className="text-base font-medium text-foreground mb-1">
              Family Name <span className="text-destructive">*</span>
            </Label>
            <Input id="family_name" value={contact.family_name} onChange={(e) => onUpdate({ family_name: e.target.value })} placeholder="e.g. Smith" className={errors.family_name ? "border-destructive" : ""} />
            {errors.family_name && ( <p className="field-error text-sm">{errors.family_name}</p> )}
          </div>

          <div ref={givenRef}>
            <Label htmlFor="given_name" className="text-base font-medium text-foreground mb-1">
              Given Name <span className="text-destructive">*</span>
            </Label>
            <Input id="given_name" value={contact.given_name} onChange={(e) => onUpdate({ given_name: e.target.value })} placeholder="e.g. John" className={errors.given_name ? "border-destructive" : ""} />
            {errors.given_name && ( <p className="field-error text-sm">{errors.given_name}</p> )}
          </div>
        </div>

        {/* Phone Number */}
        <div className="grid gap-2" ref={phoneRef}>
          <Label className="sm:hidden text-base font-medium text-foreground">
            Phone Number <span className="text-destructive">*</span>
            <span className="ml-2 text-sm text-[#C41E71] italic">
              Omit the leading '0' (e.g., 1xxxxxxx instead of 01xxxxxxx)
            </span>
          </Label>

          {/* Row (always in one row; on desktop it becomes the 180px + 1fr layout) */}
          <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] gap-0 sm:gap-4">
            {/* Phone Code */}
            <div>
              {/* Label for small screen only */}
              <Label className="hidden sm:block text-base font-medium text-foreground mb-1">
                Phone Code <span className="text-destructive">*</span>
              </Label>

              <Select value={contact.phone_code} onValueChange={(v) => onUpdate({ phone_code: v })}>
                <SelectTrigger className={[ errors.phone_code ? "border-destructive" : "", "rounded-r-none border-r-0 sm:rounded-r-md sm:border-r",].join(" ")}>
                  {contact.phone_code ? (
                    <span className="text-sm text-foreground">
                      {contact.phone_code}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">🇲🇾 +60</span>
                  )}
                </SelectTrigger>

                <SelectContent>
                  {PHONE_CODES.map((p) => (
                    // store dial code only
                    <SelectItem key={p.code} value={p.dial}>
                      {/* Dropdown show full text */}
                      {p.dial} ({p.country})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.phone_code && ( <p className="field-error text-sm sm:mt-1">{errors.phone_code}</p> )}
            </div>

            {/* Contact Number */}
            <div>
              {/* Label for small screen only */}
              <Label htmlFor="contact_number" className="hidden sm:block text-base font-medium text-foreground mb-1">
                Contact Number <span className="text-destructive">*</span>
                <span className="text-sm text-[#C41E71] italic">
                  {" "}
                  Omit the leading '0' (e.g., 1xxxxxxx instead of 01xxxxxxx)
                </span>
              </Label>

              <Input id="contact_number" value={contact.contact_number}
                onChange={(e) =>
                  onUpdate({ contact_number: e.target.value.replace(/\D/g, "") })
                }
                inputMode="numeric"
                placeholder="e.g. 123456789"
                className={[
                  "rounded-l-none sm:rounded-l-md",
                  errors.contact_number ? "border-destructive" : "",
                ].join(" ")}
              />

              {errors.contact_number && ( <p className="field-error text-sm sm:mt-1">{errors.contact_number}</p> )}
            </div>
          </div>
        </div>

        <div ref={emailRef}>
          <Label htmlFor="email" className="flex items-center gap-2 text-base font-medium text-foreground mb-1">
            <Mail className="w-4 h-4 text-muted-foreground" />
            Email Address <span className="text-destructive">*</span>
          </Label>
          <Input id="email" type="email" value={contact.email} onChange={(e) => onUpdate({ email: e.target.value })} placeholder="e.g. john@example.com" className={errors.email ? "border-destructive" : ""} />
          {errors.email && <p className="field-error text-sm">{errors.email}</p>}
        </div>

        <div ref={billingRef}>
          <Label className="flex items-center gap-2 text-base font-medium text-foreground mb-1">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            Resident Country <span className="text-destructive">*</span>
          </Label>
          <Select value={contact.billing_country} onValueChange={(v) => onUpdate({ billing_country: v })}>
            <SelectTrigger className={errors.billing_country ? "border-destructive" : ""}>
              <span className="text-sm text-foreground">
                {contact.billing_country
                  ? COUNTRIES.find((c) => c.code === contact.billing_country)?.name
                  : "Select country"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.billing_country && ( <p className="field-error text-sm">{errors.billing_country}</p> )}
        </div>
      </div>
    );

    if (noCard) return content;
    return (
      <div className="enrollment-card animate-in fade-in duration-300">{content}</div>
    );
  }
);

ContactDetails.displayName = "ContactDetails";
export default ContactDetails;