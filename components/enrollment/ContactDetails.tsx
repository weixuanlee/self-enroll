import { useState, forwardRef, useImperativeHandle } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContactFormData, PHONE_CODES, COUNTRIES } from "@/data/enrollmentData";
import { Mail, Phone, MapPin } from "lucide-react";

interface ContactDetailsProps {
  contact: ContactFormData;
  onUpdate: (data: Partial<ContactFormData>) => void;
  onNext: () => void;
  noCard?: boolean;
}

export interface ContactDetailsRef {
  validate: () => boolean;
}

const ContactDetails = forwardRef<ContactDetailsRef, ContactDetailsProps>(
  ({ contact, onUpdate, noCard }, ref) => {
    const [errors, setErrors] = useState<
      Partial<Record<keyof ContactFormData, string>>
    >({});

    const normalizePhone = (phoneCode: string, local: string) => {
      const ccDigits = (phoneCode || "").replace(/\D/g, ""); // "+60" -> "60"
      const localDigits = (local || "").replace(/\D/g, "");  // keep digits only

      // Malaysia rule: after +60, local number must NOT start with 0
      if (ccDigits === "60" && localDigits.startsWith("0")) {
        return { ok: false, reason: "For +60 (Malaysia), do not start with 0. Example: 123456789", full: "" };
      }

      // Combine: exclude "+" (digits only)
      const full = `${ccDigits}${localDigits}`;

      return { ok: true, reason: "", full };
    };

    const validate = (): boolean => {
      const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
      if (!contact.family_name.trim())
        newErrors.family_name = "Family name is required";
      if (!contact.given_name.trim())
        newErrors.given_name = "Given name is required";
      if (!contact.phone_code) {
          newErrors.phone_code = "Phone code is required";
        }

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
            // local length rule (generic)
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
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    useImperativeHandle(ref, () => ({ validate }));

    const content = (
      <div className="grid gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="family_name"
              className="text-base font-medium text-foreground mb-1"
            >
              Family Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="family_name"
              value={contact.family_name}
              onChange={(e) => onUpdate({ family_name: e.target.value })}
              placeholder="e.g. Smith"
              className={errors.family_name ? "border-destructive" : ""}
            />
            {errors.family_name && (
              <p className="field-error text-sm">{errors.family_name}</p>
            )}
          </div>
          <div>
            <Label
              htmlFor="given_name"
              className="text-base font-medium text-foreground mb-1"
            >
              Given Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="given_name"
              value={contact.given_name}
              onChange={(e) => onUpdate({ given_name: e.target.value })}
              placeholder="e.g. John"
              className={errors.given_name ? "border-destructive" : ""}
            />
            {errors.given_name && (
              <p className="field-error text-sm">{errors.given_name}</p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-[180px_1fr] gap-4">
          <div>
            <Label className="text-base font-medium text-foreground mb-1">
              Phone Code <span className="text-destructive">*</span>
            </Label>
            <Select
              value={contact.phone_code}
              onValueChange={(v) => onUpdate({ phone_code: v })}
            >
              <SelectTrigger className={errors.phone_code ? "border-destructive" : ""}>
                <Phone className="w-4 h-4 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Code" />
              </SelectTrigger>
              <SelectContent>
                {PHONE_CODES.map((p) => (
                  <SelectItem key={p.code} value={p.dial}>
                    {p.dial} ({p.country})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.phone_code && (
              <p className="field-error text-sm">{errors.phone_code}</p>
            )}
          </div>

          <div>
            <Label
              htmlFor="contact_number"
              className="text-base font-medium text-foreground mb-1"
            >
              Contact Number <span className="text-destructive">*</span><span className="text-sm text-[#C41E71] italic"> Omit the leading '0' (e.g., 1xxxxxxx instead of 01xxxxxxx)</span>
            </Label>
            <Input
              id="contact_number"
              value={contact.contact_number}
              onChange={(e) => onUpdate({ contact_number: e.target.value.replace(/\D/g, "") }) }
              inputMode="numeric"
              placeholder="e.g. 123456789"
              className={errors.contact_number ? "border-destructive" : ""}
            />
            {errors.contact_number && (
              <p className="field-error text-sm">{errors.contact_number}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="flex items-center gap-2 text-base font-medium text-foreground mb-1">
            <Mail className="w-4 h-4 text-muted-foreground" />
            Email Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={contact.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
            placeholder="e.g. john@example.com"
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="field-error text-sm">{errors.email}</p>}
        </div>

        <div>
          <Label className="flex items-center gap-2 text-base font-medium text-foreground mb-1">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            Billing Country <span className="text-destructive">*</span>
          </Label>
          <Select
            value={contact.billing_country}
            onValueChange={(v) => onUpdate({ billing_country: v })}
          >
            <SelectTrigger className={errors.billing_country ? "border-destructive" : ""}>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.billing_country && (
            <p className="field-error text-sm">{errors.billing_country}</p>
          )}
        </div>
      </div>
    );

    if (noCard) return content;

    return <div className="enrollment-card animate-in fade-in duration-300">{content}</div>;
  }
);

ContactDetails.displayName = "ContactDetails";

export default ContactDetails;
