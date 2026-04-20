export interface Agency {
  id: number;
  name: string;
  providerCount: number;
}

export interface Provider {
  id: number;
  fullName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  phone: string;
  email: string;
  profileImage?: string | null;
  street: string;
  areaCity: string;
  notes?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  agency: Agency;
  skills: { skill: string }[];
  zipCodes: { zipCode: string }[];
  licenses: {
    licenseType: string;
    licenseNumber: string;
    stateIssued: string;
    expirationDate: string;
  }[];
  documents: {
    id: number;
    label: string;
    fileName: string;
    filePath: string;
  }[];
}

export interface LicensePayload {
  licenseType: string;
  licenseNumber: string;
  stateIssued: string;
  expirationDate: string;
}

export interface ProviderCreatePayload {
  fullName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  phone: string;
  email: string;
  profileImage?: string;
  street: string;
  areaCity: string;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE';
  agencyId: number;
  agencyName: string;
  skills: string[];
  zipCodes: string[];
  license: LicensePayload;
}
