import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { friendlyAuthError, registerOfficerRequest } from "@/lib/skl/auth";
import { officerValidFile } from "@/components/skl/OfficerRegisterForm";
import type { OfficerDocKey } from "@/components/skl/OfficerRegisterForm";
import { OfficerStepDots } from "@/components/skl/OfficerRegisterWidgets";
import { OfficerRegisterFields } from "@/components/skl/OfficerRegisterAccount";
import { OfficerRegisterProFields } from "@/components/skl/OfficerRegisterPro";
import { OfficerRegisterDocuments } from "@/components/skl/OfficerRegisterDocuments";
import { OfficerRegisterSummary } from "@/components/skl/OfficerRegisterSummary";

export function OfficerRegisterShell({ onDone }: { onDone: (m: string) => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [qualification, setQualification] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [officerId, setOfficerId] = useState("");
  const [district, setDistrict] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<OfficerDocKey, File | null>>({
    degreeCertificate: null,
    appointmentCertificate: null,
    officerIdDocument: null,
    experienceCertificate: null,
    otherDocument: null,
  });

  const v1 = (): string | null => {
    if (!name.trim()) return "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email address.";
    if (!phone.trim()) return "Please enter your phone number.";
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  };

  const v2 = (): string | null => {
    if (!qualification.trim()) return "Qualification is required.";
    if (!designation.trim()) return "Designation is required.";
    if (!department.trim()) return "Department / Organization is required.";
    if (!specialization.trim()) return "Specialization is required.";
    if (!officerId.trim()) return "Officer ID / Registration ID is required.";
    const years = Number(experienceYears);
    if (experienceYears.trim() === "" || !Number.isInteger(years) || years < 0 || years > 60) {
      return "Please enter valid Years of Experience (0-60).";
    }
    return null;
  };

  const v3 = (): string | null => {
    if (!files.degreeCertificate) return "Degree Certificate is required.";
    if (!files.appointmentCertificate) return "Appointment Certificate is required.";
    if (!files.officerIdDocument) return "Officer ID / Registration ID document is required.";
    return null;
  };

  const next = () => {
    const problem = step === 1 ? v1() : step === 2 ? v2() : v3();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, 4));
  };

  const pickFile = (key: OfficerDocKey, file: File | undefined) => {
    if (!file) return;
    const problem = officerValidFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setFiles((f) => ({ ...f, [key]: file }));
  };

  const removeFile = (key: OfficerDocKey) => {
    setFiles((f) => ({ ...f, [key]: null }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const a = v1();
    if (a) {
      setError(a);
      setStep(1);
      return;
    }
    const b = v2();
    if (b) {
      setError(b);
      setStep(2);
      return;
    }
    const c = v3();
    if (c) {
      setError(c);
      setStep(3);
      return;
    }
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await registerOfficerRequest({
        name,
        email,
        phone,
        password,
        qualification,
        designation,
        department,
        specialization,
        experienceYears: Number(experienceYears),
        officerId,
        district,
        state: stateVal,
        degreeCertificate: files.degreeCertificate!,
        appointmentCertificate: files.appointmentCertificate!,
        officerIdDocument: files.officerIdDocument!,
        experienceCertificate: files.experienceCertificate,
        otherDocument: files.otherDocument,
      });
      toast.success("Registration submitted for verification");
      onDone(`${result.message} Account: ${result.user.email}. Please login.`);
      navigate({ to: "/login" });
    } catch (err) {
      setError(friendlyAuthError(err, "Officer registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="gap-0 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Krushi Adhikari Registration</h1>
        <Badge variant="outline" className="rounded-full">OFFICER</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Your account is created as PENDING. Full access after admin verification.
      </p>
      <OfficerStepDots step={step} />
      <form className="mt-6" onSubmit={submit}>
        {step === 1 && (
          <OfficerRegisterFields
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            password={password}
            setPassword={setPassword}
            confirm={confirm}
            setConfirm={setConfirm}
          />
        )}
        {step === 2 && (
          <OfficerRegisterProFields
            qualification={qualification}
            setQualification={setQualification}
            designation={designation}
            setDesignation={setDesignation}
            department={department}
            setDepartment={setDepartment}
            specialization={specialization}
            setSpecialization={setSpecialization}
            experienceYears={experienceYears}
            setExperienceYears={setExperienceYears}
            officerId={officerId}
            setOfficerId={setOfficerId}
            district={district}
            setDistrict={setDistrict}
            stateVal={stateVal}
            setStateVal={setStateVal}
          />
        )}
        {step === 3 && (
          <OfficerRegisterDocuments files={files} onPick={pickFile} onRemove={removeFile} />
        )}
        {step === 4 && (
          <OfficerRegisterSummary
            name={name}
            email={email}
            phone={phone}
            qualification={qualification}
            designation={designation}
            department={department}
            specialization={specialization}
            experienceYears={experienceYears}
            officerId={officerId}
            files={files}
          />
        )}
        {error ? (
          <p role="alert" className="mt-4 text-sm font-medium text-destructive">{error}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => { setError(null); setStep((s) => s - 1); }}>
              Back
            </Button>
          )}
          {step < 4 && (
            <Button type="button" onClick={next}>
              Continue
            </Button>
          )}
          {step === 4 && (
            <Button type="submit" className="h-11 px-10" disabled={loading}>
              {loading ? "Submitting for verification..." : "Register & Submit for Verification"}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}

export const OfficerRegisterForm = OfficerRegisterShell;



