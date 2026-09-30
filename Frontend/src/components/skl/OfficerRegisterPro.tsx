import { Input } from "@/components/ui/input";
import { FormField } from "@/components/skl/OfficerRegisterForm";

export function OfficerRegisterProFields(props: {
  qualification: string;
  setQualification: (v: string) => void;
  designation: string;
  setDesignation: (v: string) => void;
  department: string;
  setDepartment: (v: string) => void;
  specialization: string;
  setSpecialization: (v: string) => void;
  experienceYears: string;
  setExperienceYears: (v: string) => void;
  officerId: string;
  setOfficerId: (v: string) => void;
  district: string;
  setDistrict: (v: string) => void;
  stateVal: string;
  setStateVal: (v: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <h2 className="text-base font-semibold sm:col-span-2">Step 2 — Professional Details</h2>
      <FormField label="Qualification *">
        <Input maxLength={120} value={props.qualification} onChange={(e) => props.setQualification(e.target.value)} placeholder="B.Sc. Agriculture" />
      </FormField>
      <FormField label="Designation *">
        <Input maxLength={120} value={props.designation} onChange={(e) => props.setDesignation(e.target.value)} placeholder="Agriculture Officer" />
      </FormField>
      <FormField label="Department / Organization *">
        <Input maxLength={120} value={props.department} onChange={(e) => props.setDepartment(e.target.value)} placeholder="Dept. of Agriculture, Nashik" />
      </FormField>
      <FormField label="Specialization *">
        <Input maxLength={120} value={props.specialization} onChange={(e) => props.setSpecialization(e.target.value)} placeholder="Crop Protection" />
      </FormField>
      <FormField label="Years of Experience *">
        <Input type="number" min={0} max={60} step={1} value={props.experienceYears} onChange={(e) => props.setExperienceYears(e.target.value)} placeholder="5" />
      </FormField>
      <FormField label="Officer ID / Registration ID *">
        <Input maxLength={60} value={props.officerId} onChange={(e) => props.setOfficerId(e.target.value)} placeholder="MH-AGRI-12345" />
      </FormField>
      <FormField label="District">
        <Input maxLength={120} value={props.district} onChange={(e) => props.setDistrict(e.target.value)} placeholder="Nashik" />
      </FormField>
      <FormField label="State">
        <Input maxLength={120} value={props.stateVal} onChange={(e) => props.setStateVal(e.target.value)} placeholder="Maharashtra" />
      </FormField>
    </div>
  );
}
