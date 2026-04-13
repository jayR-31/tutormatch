'use client';

import { useEffect } from 'react';

export default function TermsModal({ isOpen, onClose }) {
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
              Legal
            </div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Terms and Conditions</h2>
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
                <li>1. Acceptance of Terms</li>
                <li>2. Description of Service</li>
                <li>3. Eligibility</li>
                <li>4. Account Registration</li>
                <li>5. Tutor Responsibilities</li>
                <li>6. Student Responsibilities</li>
                <li>7. Payments &amp; Fees</li>
                <li>8. No Refund Policy</li>
                <li>9. Prohibited Conduct</li>
                <li>10. Intellectual Property</li>
                <li>11. Privacy &amp; Data</li>
                <li>12. Disclaimers</li>
                <li>13. Limitation of Liability</li>
                <li>14. Termination</li>
                <li>15. Governing Law</li>
                <li>16. Contact Us</li>
              </ul>
            </div>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 01</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Acceptance of Terms</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                By accessing or using TutorMatch ({"\""}the Platform,{"\""} {"\""}we,{"\""} {"\""}us,{"\""} or {"\""}our{"\""}), you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
              </p>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mt-4">
                If you do not agree to these terms in their entirety, you may not access or use the Platform. Your continued use constitutes acceptance of any future modifications to these terms, which we will notify you of by updating the effective date above.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 02</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Description of Service</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                TutorMatch is an online marketplace that connects students seeking academic support with qualified tutors. We facilitate introductions, scheduling, and payments — we do not directly provide tutoring services, and tutors are independent contractors, not employees of TutorMatch.
              </p>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mt-4">
                We reserve the right to modify, suspend, or discontinue any aspect of the Platform at any time with reasonable notice.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 03</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Eligibility</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                TutorMatch is available to users worldwide, subject to applicable local laws. You are responsible for ensuring your use of the Platform complies with laws in your jurisdiction.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 04</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Account Registration</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                To access most features of TutorMatch, you must register for an account. You agree to:
              </p>
              <ul className="text-sm text-stone-500 font-medium space-y-2 mt-4 list-disc pl-5">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your login credentials confidential</li>
                <li>Notify us immediately of any unauthorized account access</li>
                <li>Accept responsibility for all activities that occur under your account</li>
              </ul>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mt-4">
                We reserve the right to suspend or terminate accounts that contain false, misleading, or outdated information.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 05</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Tutor Responsibilities</h4>
              <div className="space-y-6">
                <div>
                  <h5 className="font-bold text-stone-900 text-sm mb-2">Credentials & Accuracy</h5>
                  <p className="text-sm text-stone-500 font-medium leading-relaxed">All stated qualifications, degrees, certifications, and experience must be truthful and verifiable upon request. Profile photos must be recent and an accurate likeness. Subject expertise must only be listed in areas of genuine competency.</p>
                </div>
                <div>
                  <h5 className="font-bold text-stone-900 text-sm mb-2">Professional Standards</h5>
                  <p className="text-sm text-stone-500 font-medium leading-relaxed">Conduct all sessions in a professional, respectful, and safe environment. Provide sessions as scheduled or give adequate advance notice of cancellation. Maintain appropriate boundaries with students at all times. Comply with all applicable laws, including child safety regulations when tutoring minors.</p>
                </div>
                <div>
                  <h5 className="font-bold text-stone-900 text-sm mb-2">Independent Contractor Status</h5>
                  <p className="text-sm text-stone-500 font-medium leading-relaxed">Tutors are independent contractors. TutorMatch does not withhold taxes, provide benefits, or exercise direct control over tutoring methods. Tutors are solely responsible for reporting and paying applicable taxes on earnings received through the Platform.</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 06</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Student Responsibilities</h4>
              <ul className="text-sm text-stone-500 font-medium space-y-2 mt-4 list-disc pl-5">
                <li>Attend scheduled sessions on time or provide timely cancellation notice</li>
                <li>Treat tutors with respect and professionalism</li>
                <li>Use tutoring services for legitimate academic purposes only</li>
                <li>Not request tutors to complete assignments, exams, or assessments on their behalf in violation of academic integrity policies</li>
                <li>Pay for sessions in accordance with agreed rates and these Terms</li>
              </ul>
              <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl italic text-sm text-red-900 font-medium leading-relaxed">
                Academic integrity reminder: Using TutorMatch to have a tutor complete your academic work may violate your institution{"'"}s honor code. TutorMatch is intended to support learning, not to circumvent it.
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 07</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Payments &amp; Fees</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                TutorMatch charges a service fee on each transaction, deducted from the tutor{"'"}s earnings. Current fee rates are displayed in your account dashboard and may be updated with 30 days{"'"} notice.
              </p>
              <div className="space-y-6 mt-6">
                <div>
                  <h5 className="font-bold text-stone-900 text-sm mb-2">Payment Processing</h5>
                  <p className="text-sm text-stone-500 font-medium leading-relaxed">All payments are processed through our third-party payment provider. By making a payment, you agree to that provider{"'"}s terms and privacy policy. TutorMatch does not store full payment card details.</p>
                </div>
                <div>
                  <h5 className="font-bold text-stone-900 text-sm mb-2">Tutor Payouts</h5>
                  <p className="text-sm text-stone-500 font-medium leading-relaxed">Tutor earnings are released according to our payout schedule, typically within 3–5 business days after session completion, subject to any holds for disputes or policy reviews.</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 08</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">No Refund Policy</h4>
              <div className="bg-red-50/50 p-6 rounded-[24px] border border-red-100">
                <p className="text-sm text-stone-900 font-bold leading-relaxed mb-4 italic underline decoration-red-200 decoration-2">
                  All payments made through TutorMatch are final and non-refundable.
                </p>
                <p className="text-sm text-stone-500 font-medium leading-relaxed mb-4">
                  By completing a payment, you acknowledge and agree that no refunds will be issued under any circumstances, including but not limited to:
                </p>
                <ul className="text-sm text-stone-500 font-medium space-y-2 list-disc pl-5">
                  <li>Cancellations or no-shows by the student</li>
                  <li>Dissatisfaction with a tutoring session</li>
                  <li>Scheduling conflicts or changes of mind</li>
                  <li>Failure to attend a booked session</li>
                  <li>Technical issues on the user{"'"}s end</li>
                </ul>
                <p className="text-sm text-stone-500 font-medium leading-relaxed mt-6">
                  Please review your booking carefully before completing payment. All sales are final. If you experience a technical issue on TutorMatch{"'"}s end that prevents a session from occurring, please contact our support team — such cases are reviewed at TutorMatch{"'"}s sole discretion.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 09</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Prohibited Conduct</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                Users may not engage in any of the following on or through TutorMatch:
              </p>
              <ul className="text-sm text-stone-500 font-medium space-y-2 mt-4 list-disc pl-5">
                <li>Harassment, discrimination, or abusive behavior toward any user</li>
                <li>Soliciting or accepting payments outside the Platform to circumvent fees</li>
                <li>Creating fake reviews or manipulating the rating system</li>
                <li>Sharing another user{"'"}s personal information without consent</li>
                <li>Uploading malicious software or attempting to compromise Platform security</li>
                <li>Impersonating another person or misrepresenting affiliation with any entity</li>
                <li>Any unlawful activity including fraud, money laundering, or exploitation of minors</li>
              </ul>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mt-4">
                Violations may result in immediate account suspension and, where applicable, referral to law enforcement.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 10</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Intellectual Property</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                All content on the TutorMatch Platform, including logos, design, software, and original text, is owned by or licensed to TutorMatch and protected by applicable intellectual property laws.
              </p>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mt-4">
                By uploading materials to the Platform (such as lesson plans, worksheets, or session notes), you grant TutorMatch a limited, non-exclusive license to display and store that content solely for the purpose of operating the service. You retain ownership of your original materials.
              </p>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mt-4">
                You may not reproduce, redistribute, or exploit any part of the Platform without written permission.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 11</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Privacy & Data</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                Your use of TutorMatch is also governed by our Privacy Policy, incorporated herein by reference. By using the Platform, you consent to the collection and use of information as described in that policy.
              </p>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mt-4">
                We take reasonable technical and organizational measures to protect your data. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 12</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Disclaimers</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed italic">
                TutorMatch provides the Platform on an {"\""}as is{"\""} and {"\""}as available{"\""} basis. We do not warrant that the Platform will be uninterrupted, error-free, or free of harmful components.
              </p>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mt-4">
                While we take steps to vet tutors, TutorMatch makes no guarantees regarding tutor qualifications, the quality of tutoring sessions, or specific academic outcomes for students. Users engage with one another at their own risk.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 13</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Limitation of Liability</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                To the fullest extent permitted by law, TutorMatch and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of (or inability to use) the Platform.
              </p>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mt-4">
                Our total aggregate liability to you for any claim arising out of these Terms shall not exceed the greater of (a) $100 USD or (b) the total fees paid by you to TutorMatch in the 3 months preceding the event giving rise to the claim.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 14</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Termination</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                Either party may terminate the user relationship at any time. You may close your account via your account settings. TutorMatch may suspend or terminate your account immediately for material violations of these Terms, with or without prior notice.
              </p>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mt-4">
                Upon termination, your right to use the Platform ceases immediately. Provisions that by their nature should survive termination (including payments owed, intellectual property rights, and limitations of liability) shall continue to apply.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 15</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Governing Law</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which TutorMatch is registered, without regard to its conflict of law provisions.
              </p>
              <p className="text-sm text-stone-500 font-medium leading-relaxed mt-4">
                Any disputes arising under these Terms shall first be attempted to be resolved through good-faith negotiation. If unresolved, disputes shall be submitted to binding arbitration in accordance with the rules of a recognized arbitration body, unless prohibited by applicable law.
              </p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 mb-4">Section 16</h3>
              <h4 className="text-lg font-bold text-stone-900 mb-4">Contact Us</h4>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">
                If you have questions about these Terms and Conditions, please reach out to us:
              </p>
              <ul className="text-sm text-stone-500 font-medium space-y-2 mt-4 list-none p-0">
                <li><span className="font-bold text-stone-900">Email:</span> legal@tutormatch.com</li>
                <li><span className="font-bold text-stone-900">Website:</span> www.tutormatch.com/legal</li>
                <li><span className="font-bold text-stone-900">Response time:</span> within 5 business days</li>
              </ul>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-12 pt-8 border-t border-stone-100">
                These Terms and Conditions were last updated on April 11, 2026. TutorMatch reserves the right to update these terms at any time. Continued use of the Platform after any changes constitutes your acceptance of the new terms.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
