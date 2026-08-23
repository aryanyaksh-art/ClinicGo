export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  postal_code: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  website_url: string;
  booking_url: string | null;
  source_url: string;
}

export interface ClinicSeed {
  name: string;
  address: string;
  city?: string;
  website_url: string;
  source_url: string;
  phone?: string;
  booking_url?: string;
  lat?: number;
  lng?: number;
}

export interface ClinicStatusExtraction {
  accepting_walk_ins: boolean | null;
  estimated_wait_minutes: number | null;
  raw_status_text: string | null;
}
