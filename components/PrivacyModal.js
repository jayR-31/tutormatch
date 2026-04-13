'use client';

import { useEffect } from 'react';

export default function PrivacyModal({ isOpen, onClose }) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-stone-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white glass-panel rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-white/50">
        {/* Header */}
        <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-white/50 sticky top-0 z-20 backdrop-blur-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-[10px] font-bold tracking-[0.2em] uppercase mb-3 shadow-sm shadow-red-900/5">
              Privacy
            </div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Privacy Policy</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mt-1">
              TutorMatch  ·  Effective date: April 11, 2026  ·  Version 1.0
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors border-0 cursor-pointer group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">✕</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-stone-50/30">
          <div className="flex justify-start mb-8">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 bg-stone-900 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-stone-900/10 active:scale-95 border-0 cursor-pointer"
            >
              I Acknowledge
            </button>
          </div>

          <div className="prose prose-stone max-w-none space-y-12 pb-8">
            <div className="bg-white/40 p-6 rounded-[24px] border border-stone-100">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-6">Table of Contents</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-[11px] font-bold text-stone-500 list-none p-0 m-0">
                <li>1. Introduction</li>
                <li>2. Information We Collect</li>
                <li>3. How We Use Your Information</li>
                <li>4. How We Share Your Information</li>
                <li>5. Cookies & Tracking</li>
                <li>6. Data Retention</li>
                <li>7. Your Rights & Choices</li>
                <li>8. Children{"'"}s Privacy</li>
                <li>9. Data Security</li>
                <li>10. Third-Party Links</li>
                <li>11. International Transfers</li>
                <li>12. Changes to This Policy</li>
                <li>13. Contact Us</li>
              </ul>
            </div>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 01</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Introduction</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                TutorMatch ({"\""}we,{"\""} {"\""}us,{"\""} or {"\""}our{"\""}) is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and the choices you have regarding your information when you use our platform at tutormatch.com.
              </p>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mt-4">
                By creating an account or using TutorMatch, you agree to the collection and use of information in accordance with this policy. If you do not agree, please discontinue use of the Platform.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 02</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Information We Collect</h4>
              <div className="space-y-6">
                <div>
                  <h5 className="font-bold text-stone-900 text-sm mb-2">Information you provide directly</h5>
                  <ul className="text-sm text-stone-500 font-medium space-y-2 list-disc pl-5">
                    <li>Name, email address, and password when you register</li>
                    <li>Profile information such as a photo, bio, subjects taught, and qualifications (tutors)</li>
                    <li>Payment information (processed by our third-party payment provider — we do not store card details)</li>
                    <li>Messages and communications sent through the Platform</li>
                    <li>Reviews and ratings you submit</li>
                    <li>Support requests and correspondence with our team</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-bold text-stone-900 text-sm mb-2">Information collected automatically</h5>
                  <ul className="text-sm text-stone-500 font-medium space-y-2 list-disc pl-5">
                    <li>IP address, browser type, and device information</li>
                    <li>Pages visited, session duration, and clickstream data</li>
                    <li>Referring URLs and search terms used to find TutorMatch</li>
                    <li>Cookie and tracking technology data (see Section 5)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-bold text-stone-900 text-sm mb-2">Information from third parties</h5>
                  <ul className="text-sm text-stone-500 font-medium space-y-2 list-disc pl-5">
                    <li>If you sign in via Google or another OAuth provider, we receive your name and email from that service</li>
                    <li>Payment processors may share transaction confirmation data with us</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 03</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">How We Use Your Information</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mb-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="text-sm text-stone-500 font-medium space-y-2 list-disc pl-5">
                <li>To create and manage your account and provide Platform services</li>
                <li>To match students with suitable tutors based on subject, availability, and preferences</li>
                <li>To process payments and send transaction confirmations</li>
                <li>To send service-related communications such as booking confirmations and reminders</li>
                <li>To respond to support inquiries and resolve disputes</li>
                <li>To improve and personalize the Platform experience</li>
                <li>To detect, investigate, and prevent fraudulent or prohibited activity</li>
                <li>To comply with legal obligations</li>
                <li>To send promotional emails or updates, where you have opted in (you may opt out at any time)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 04</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">How We Share Your Information</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                We do not sell your personal information. We may share your data only in the following circumstances:
              </p>
              <div className="space-y-6 mt-6">
                <div>
                  <h5 className="font-bold text-stone-900 text-sm mb-2">With other users</h5>
                  <p className="text-sm text-stone-500 font-medium leading-relaxed">Tutor profiles — including name, photo, bio, subjects, and ratings — are visible to students. Students{"'"} names and general location may be visible to tutors they have booked or messaged.</p>
                </div>
                <div>
                  <h5 className="font-bold text-stone-900 text-sm mb-2">With service providers</h5>
                  <p className="text-sm text-stone-500 font-medium leading-relaxed">We share data with trusted third-party vendors who assist us in operating the Platform, including payment processors, email delivery services, analytics providers, and cloud hosting. These providers are contractually bound to protect your data and may only use it for the specific services they provide to us.</p>
                </div>
                <div>
                  <h5 className="font-bold text-stone-900 text-sm mb-2">For legal reasons</h5>
                  <p className="text-sm text-stone-500 font-medium leading-relaxed">We may disclose your information if required by law, court order, or governmental authority, or when we believe disclosure is necessary to protect the safety of any person or to prevent fraud or abuse.</p>
                </div>
                <div>
                  <h5 className="font-bold text-stone-900 text-sm mb-2">Business transfers</h5>
                  <p className="text-sm text-stone-500 font-medium leading-relaxed">In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you before your data becomes subject to a different privacy policy.</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 05</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Cookies & Tracking</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                TutorMatch uses cookies and similar tracking technologies to operate and improve the Platform. Cookies are small text files stored on your device.
              </p>
              <h5 className="font-bold text-stone-900 text-sm mt-6 mb-2">Types of cookies we use</h5>
              <ul className="text-sm text-stone-500 font-medium space-y-2 list-disc pl-5">
                <li>Essential cookies — required for the Platform to function (e.g., keeping you logged in)</li>
                <li>Analytics cookies — help us understand how users interact with the Platform (e.g., Google Analytics)</li>
                <li>Preference cookies — remember your settings and preferences across sessions</li>
                <li>Marketing cookies — used to deliver relevant promotions, where applicable</li>
              </ul>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mt-4 italic">
                You can control or disable cookies through your browser settings. Note that disabling essential cookies may affect Platform functionality.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 06</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Data Retention</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                We retain your personal information for as long as your account is active or as needed to provide our services. If you close your account, we will delete or anonymize your personal data within 90 days, except where we are required to retain it for legal, tax, or compliance purposes.
              </p>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mt-4">
                Certain records such as transaction history and communications related to disputes may be retained for up to 7 years in accordance with applicable law.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 07</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Your Rights & Choices</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your personal data:
              </p>
              <ul className="text-sm text-stone-500 font-medium space-y-2 list-disc pl-5">
                <li>Access — request a copy of the personal data we hold about you</li>
                <li>Correction — request that inaccurate or incomplete data be updated</li>
                <li>Deletion — request that we delete your personal data, subject to legal obligations</li>
                <li>Portability — request your data in a structured, machine-readable format</li>
                <li>Objection — object to certain processing activities, including marketing</li>
                <li>Withdrawal of consent — where processing is based on consent, withdraw it at any time</li>
              </ul>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mt-8 p-4 bg-white/40 border border-stone-100 rounded-2xl">
                To exercise any of these rights, please contact us at **privacy@tutormatch.com**. We will respond within 30 days.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 08</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Children{"'"}s Privacy</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                TutorMatch is available to users of all ages, and we recognize that some students may be minors. Where a user is under 18, we require verifiable parental or guardian consent before account creation.
              </p>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mt-4">
                We do not knowingly collect personal information from children under 13 without parental consent. If you believe a child under 13 has provided us with personal data without consent, please contact us immediately and we will take steps to delete that information.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 09</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Data Security</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                We implement industry-standard technical and organizational measures to protect your personal information against unauthorized access, loss, destruction, or alteration. These include encrypted data transmission (HTTPS), access controls, and regular security reviews.
              </p>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mt-4 italic">
                However, no method of transmission over the internet is completely secure. While we strive to protect your data, we cannot guarantee absolute security. In the event of a data breach that affects your rights, we will notify you as required by applicable law.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 10</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Third-Party Links</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                The Platform may contain links to third-party websites or services. This Privacy Policy applies only to TutorMatch. We are not responsible for the privacy practices of any third-party sites and encourage you to review their privacy policies before sharing any personal information.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 11</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">International Transfers</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                TutorMatch operates globally, and your data may be stored or processed in countries outside your own. Where data is transferred internationally, we take steps to ensure adequate protections are in place in compliance with applicable data protection laws, such as standard contractual clauses recognized under GDPR.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 12</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Changes to This Policy</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email or by displaying a prominent notice on the Platform prior to the change taking effect. The updated policy will indicate the new effective date at the top.
              </p>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mt-4">
                Your continued use of TutorMatch after any changes constitutes your acceptance of the revised policy.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 13</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Contact Us</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
              </p>
              <ul className="text-sm text-stone-500 font-medium space-y-2 mt-4 list-none p-0">
                <li><span className="font-bold text-stone-900">Email:</span> privacy@tutormatch.com</li>
                <li><span className="font-bold text-stone-900">Website:</span> www.tutormatch.com/privacy</li>
                <li><span className="font-bold text-stone-900">Response time:</span> within 5 business days</li>
              </ul>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-12 pt-8 border-t border-stone-100">
                These Privacy Policy were last updated on April 11, 2026. TutorMatch reserves the right to update these policies at any time. Continued use of the Platform after any changes constitutes your acceptance of the new policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
