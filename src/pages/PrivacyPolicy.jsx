import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-5 py-10">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold">Privacy Policy</h1>
            <p className="text-xs text-muted-foreground">Last updated: June 2026</p>
          </div>
        </div>

        <div className="prose prose-sm prose-slate max-w-none space-y-6 text-sm text-foreground/80 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">1. What We Collect</h2>
            <p>We collect only the minimum information needed to provide your recovery experience:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Email address (for account authentication)</li>
              <li>Recovery profile answers you provide during onboarding</li>
              <li>Journal entries, urge logs, and relapse reflections you create</li>
              <li>Accountability partner name and email (only if you choose to add one)</li>
              <li>Subscription status (Stripe customer ID, no raw payment data)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">2. What We Do Not Collect</h2>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>We do not store your payment card details — all billing is handled by Stripe</li>
              <li>We do not build public profiles or social feeds</li>
              <li>We do not sell your data to third parties</li>
              <li>We do not use your data for advertising</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">3. How Your Data Is Used</h2>
            <p>Your data is used exclusively to:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Personalize your recovery dashboard and AI coaching responses</li>
              <li>Generate weekly recovery reports</li>
              <li>Send progress summaries to your accountability partner (only if you explicitly enable this)</li>
              <li>Process your subscription securely via Stripe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">4. Accountability Partner Sharing</h2>
            <p>
              You fully control what is shared with your accountability partner. Depending on your Privacy Level setting:
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Minimal:</strong> Streak duration and check-in status only</li>
              <li><strong>Moderate:</strong> The above, plus urge counts</li>
              <li><strong>Full:</strong> The above, plus trigger categories and mood trends</li>
            </ul>
            <p className="mt-2">Journal notes, relapse reflection content, and AI conversations are <strong>never</strong> shared.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">5. AI Coach Privacy</h2>
            <p>
              When you use the AI Recovery Coach, your recovery context (triggers, goals, urge history summaries) is sent to our AI provider to generate responses. Raw journal text and relapse notes are not sent. AI conversations are stored locally in your session and are deleted when you delete your account.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">6. Data Security</h2>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>All data is transmitted over HTTPS/TLS</li>
              <li>Each user can only access their own data</li>
              <li>API keys and secrets are stored as environment variables, never in code</li>
              <li>Stripe handles all payment processing — we store only your Stripe customer ID</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Access:</strong> View all data through your dashboard</li>
              <li><strong>Delete:</strong> Permanently delete all your data via Settings → Delete all my data</li>
              <li><strong>Opt out:</strong> Disable all partner notifications at any time in Settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">8. Data Retention</h2>
            <p>
              Your data is retained as long as your account is active. When you delete your account, all personal data is immediately and permanently removed from our systems.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">9. Contact</h2>
            <p>
              For privacy questions or data requests, please contact us through the app. We aim to respond within 48 hours.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}