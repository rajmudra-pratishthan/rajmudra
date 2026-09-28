import { Landmark, ShieldCheck, Sparkles } from 'lucide-react';
import { Header, Footer, InnerHero } from './shared';
import { images } from './constants';
import type { DonationData, OrgMap } from './types';

export function DonatePage({ donation, org }: { donation: DonationData | null; org: OrgMap }) {
  const hasDetails = donation && (donation.upi_id || donation.bank_name || donation.account_number);
  return (
    <><Header org={org} /><main className="inner-page">
      <InnerHero label="Your support" title="Donate" desc="Make a difference in the community." image={images.volunteers} />
      <section className="section donate-section"><div className="container donate-card">
        <div>
          <Sparkles size={25} />
          <h2>{donation?.page_title || 'Your support helps us create more social, educational and cultural opportunities.'}</h2>
          <p>{donation?.page_description || 'Please verify official details before making a donation. Public donation information will be added here by the organization.'}</p>
        </div>
        {hasDetails ? (
          <div className="donate-details">
            <div className="donate-section-block">
              <h3>UPI</h3>
              {donation.upi_id && <p><strong>UPI ID:</strong> {donation.upi_id}</p>}
              {donation.upi_display_name && <p><strong>Name:</strong> {donation.upi_display_name}</p>}
              {donation.qr_code_url && <img src={donation.qr_code_url} alt="QR Code" style={{ width: 160, height: 160, borderRadius: 12, marginTop: 12 }} />}
            </div>
            {(donation.bank_name || donation.account_number) && (
              <div className="donate-section-block">
                <h3>Bank Details</h3>
                {donation.bank_name && <p><strong>Bank:</strong> {donation.bank_name}</p>}
                {donation.account_holder && <p><strong>Account Holder:</strong> {donation.account_holder}</p>}
                {donation.account_number && <p><strong>Account Number:</strong> {donation.account_number}</p>}
                {donation.ifsc && <p><strong>IFSC:</strong> {donation.ifsc}</p>}
                {donation.branch && <p><strong>Branch:</strong> {donation.branch}</p>}
              </div>
            )}
            {donation.instructions && <p className="donate-instructions">{donation.instructions}</p>}
            <div className="donate-trust"><ShieldCheck size={17} /><small>Your safety and transparency matter to us.</small></div>
          </div>
        ) : (
          <div className="donate-placeholder">
            <Landmark size={32} />
            <strong>Official details coming soon</strong>
            <span>UPI, QR code and bank details<br />will be published by the organization.</span>
            <ShieldCheck size={17} /><small>Your safety and transparency matter to us.</small>
          </div>
        )}
      </div></section>
    </main><Footer org={org} /></>
  );
}
