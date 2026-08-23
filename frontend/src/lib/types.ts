export interface ClinicLatestStatus {
  accepting_walk_ins: boolean | null;
  estimated_wait_minutes: number | null;
  raw_status_text: string | null;
  scrape_success: boolean;
  scrape_error: string | null;
  checked_at: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  website_url: string;
  booking_url: string | null;
  clinic_latest_status: ClinicLatestStatus[];
}
