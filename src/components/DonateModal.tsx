import { useEffect, useState } from 'react';
import { Building, Building2, Code, Copy, CreditCard, Landmark, QrCode, ShieldCheck, Smartphone, User, Wallet, X } from 'lucide-react';
import type { DonationData } from './types';

function CopyRow({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="dm-bank-row">
      <div className="dm-bank-icon"><Icon size={16} strokeWidth={1.8} /></div>
      <div className="dm-bank-info">
        <span>{label}</span>
        <div className="dm-copy-value">
          <strong>{value}</strong>
          <button onClick={copy} title={`Copy ${label}`}><Copy size={13} />{copied ? 'Copied!' : ''}</button>
        </div>
      </div>
    </div>
  );
}

function PlainRow({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="dm-bank-row">
      <div className="dm-bank-icon"><Icon size={16} strokeWidth={1.8} /></div>
      <div className="dm-bank-info"><span>{label}</span><strong>{value}</strong></div>
    </div>
  );
}

export function DonateModal({ donation, onClose }: { donation: DonationData | null; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const [upiCopied, setUpiCopied] = useState(false);
  function copyUpi() {
    if (donation?.upi_id) navigator.clipboard?.writeText(donation.upi_id);
    setUpiCopied(true);
    setTimeout(() => setUpiCopied(false), 2000);
  }

  const hasUpi = donation && (donation.upi_id || donation.qr_code_url);
  const hasBank = donation && (donation.bank_name || donation.account_number);

  return (
    <div className="dm-overlay" onClick={onClose}>
      <div className="dm-box" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="dm-header">
          <div>
            <span className="dm-label">SECURE DONATION</span>
            <h2>Payment &amp; Bank Details</h2>
            <p>{donation?.upi_display_name || 'Rajmudra Pratishthan'}</p>
          </div>
          <button className="dm-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        {/* Content */}
        {(hasUpi || hasBank) ? (
          <div className="dm-content">

            {/* QR / UPI Section */}
            {hasUpi && (
              <div className="dm-qr-section">
                <div className="dm-scan-badge"><Smartphone size={14} /> Scan &amp; Pay</div>

                {donation.qr_code_url ? (
                  <div className="dm-qr-box"><img src={donation.qr_code_url} alt="Scan to pay" /></div>
                ) : (
                  <div className="dm-qr-box dm-qr-placeholder"><QrCode size={48} /></div>
                )}

                <h3>Pay via UPI</h3>
                <p>Scan this QR code using any UPI app to make your donation.</p>

                {donation.upi_id && (
                  <div className="dm-upi-id-box">
                    <div>
                      <span>UPI ID</span>
                      <strong>{donation.upi_id}</strong>
                    </div>
                    <button onClick={copyUpi} title="Copy UPI ID"><Copy size={14} />{upiCopied ? 'Copied!' : ''}</button>
                  </div>
                )}
              </div>
            )}

            {/* Bank Details Section */}
            {hasBank && (
              <div className="dm-bank-section">
                <div className="dm-bank-heading">
                  <div className="dm-bank-heading-icon"><Landmark size={18} /></div>
                  <div>
                    <span>ACCOUNT INFORMATION</span>
                    <h3>Bank Details</h3>
                  </div>
                </div>

                <div className="dm-bank-list">
                  {donation.bank_name && <PlainRow label="Bank Name" value={donation.bank_name} icon={Building2} />}
                  {donation.account_holder && <PlainRow label="Account Holder" value={donation.account_holder} icon={User} />}
                  {donation.account_number && <CopyRow label="Account Number" value={donation.account_number} icon={CreditCard} />}
                  {donation.ifsc && <CopyRow label="IFSC Code" value={donation.ifsc} icon={Code} />}
                  {donation.branch && <PlainRow label="Branch" value={donation.branch} icon={Building} />}
                  {donation.upi_id && <PlainRow label="UPI ID" value={donation.upi_id} icon={Smartphone} />}
                </div>

                <div className="dm-notice">
                  <ShieldCheck size={15} />
                  <span>{donation.instructions || 'Please verify the account details before making a bank transfer.'}</span>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="dm-placeholder">
            <Wallet size={36} />
            <strong>Official details coming soon</strong>
            <span>UPI, QR code and bank details will be published by the organization.</span>
          </div>
        )}

      </div>
    </div>
  );
}
