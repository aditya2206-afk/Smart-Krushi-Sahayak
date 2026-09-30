import { Input } from "@/components/ui/input";
import { FormField } from "@/components/skl/OfficerRegisterForm";

export function OfficerRegisterFields(props: {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirm: string;
  setConfirm: (v: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <h2 className="text-base font-semibold sm:col-span-2">Step 1 — Account Details</h2>
      <FormField label="Full Name *">
        <Input maxLength={100} value={props.name} onChange={(e) => props.setName(e.target.value)} placeholder="Dr. Anita Deshmukh" />
      </FormField>
      <FormField label="Email *">
        <Input type="email" maxLength={255} value={props.email} onChange={(e) => props.setEmail(e.target.value)} placeholder="officer@example.com" />
      </FormField>
      <FormField label="Phone Number *">
        <Input maxLength={20} value={props.phone} onChange={(e) => props.setPhone(e.target.value)} placeholder="9876543210" />
      </FormField>
      <FormField label="Password *">
        <Input type="password" minLength={8} maxLength={64} value={props.password} onChange={(e) => props.setPassword(e.target.value)} />
      </FormField>
      <FormField label="Confirm Password *">
        <Input type="password" minLength={8} maxLength={64} value={props.confirm} onChange={(e) => props.setConfirm(e.target.value)} />
      </FormField>
    </div>
  );
}
