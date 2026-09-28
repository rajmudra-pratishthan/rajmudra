export type Event = {
  id?: string; slug: string; title: string; description: string; category: string;
  event_date: string; location: string; image_url: string; highlights?: string[];
  short_description?: string; full_description?: string; is_featured?: boolean; display_order?: number;
};
export type TeamMember = { id: string; display_name: string; position: string; occupation: string; profile_image_url: string | null; is_featured?: boolean };
export type Testimonial = { id: string; name: string; designation: string; organization: string; message: string; photo_url: string | null };
export type Reel = { id: string; reel_url: string; title: string; thumbnail_url: string | null };
export type DonationData = {
  page_title: string; page_description: string; upi_id: string; upi_display_name: string;
  qr_code_url: string; bank_name: string; account_holder: string; account_number: string;
  ifsc: string; branch: string; instructions: string;
};
export type OrgMap = Record<string, string>;
export type SiteSettings = Record<string, string>;
export type IconType = React.ComponentType<{ size?: number; strokeWidth?: number }>;
