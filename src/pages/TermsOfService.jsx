import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-5 py-10">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold">Terms of Service</h1>
            <p className="text-xs text-muted-foreground">Last updated: September 2026</p>
          </div>
        </div>

        <div className="prose prose-sm prose-slate max-w-none space-y-6 text-sm text-foreground/80 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p>
              By creating an account and using this app, you agree to these Terms of Service. If you do not agree, please do not use the app. You must be at least 18 years old (or the age of majority in your jurisdiction) to use this app.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">2. Not Medical Advice</h2>
            <p>
              This app is a personal recovery support tool, not a medical service. The AI coach and recovery content are for informational and motivational purposes only and do not constitute professional medical, psychiatric, or therapeutic advice. If you are experiencing a mental health crisis, please contact a qualified professional or emergency services.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">3. Subscriptions and Billing</h2>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Subscription fees are billed in advance on a monthly or annual basis</li>
              <li>Free trials convert to paid subscriptions unless cancelled before the trial ends</li>
              <li>You may cancel at any time; access continues until the end of your billing period</li>
              <li>Refunds are handled on a case-by-case basis — contact us within 7 days of a charge</li>
              <li>All payments are processed by Stripe and subject to Stripe's terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Use the app to harass, abuse, or harm others</li>
              <li>Attempt to access other users' data</li>
              <li>Reverse-engineer, scrape, or exploit the app's systems</li>
              <li>Use the AI coach to generate harmful, illegal, or explicit content</li>
              <li>Share your account credentials with others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">5. Privacy</h2>
            <p>
              Your use of the app is also governed by our <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>, which is incorporated into these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">6. Account Responsibility</h2>
            <p>
              You are responsible for maintaining the security of your account. You agree to notify us immediately of any unauthorized access. We are not liable for losses caused by unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the app. Our total liability shall not exceed the amount you paid in the 3 months prior to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">8. Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms. You may delete your account at any time via Settings.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">9. Changes to Terms</h2>
            <p>
              We may update these Terms. We will notify you of material changes via the app. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">10. Copyright</h2>
            <p>
              The app and its content are owned by Black Inheritance. © 2026 Black Inheritance. All rights reserved.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}