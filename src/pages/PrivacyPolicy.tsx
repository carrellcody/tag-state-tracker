import { SEOHead } from "@/components/SEOHead";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-12 px-4">
      <SEOHead 
        title="Privacy Policy - TalloTags"
        description="Privacy Policy for TalloTags - Learn how we collect, use, and protect your information."
        canonicalPath="/privacy-policy"
      />
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-2">tallotags.com</p>
        <p className="text-muted-foreground mb-8">Last updated: January 31, 2026</p>
        
        <p className="mb-8">
          Zoar Solutions LLC ("we," "us," or "our") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use tallotags.com.
        </p>

        <hr className="my-8 border-border" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          
          <h3 className="text-lg font-medium mb-2">a. Information You Provide</h3>
          <ul className="list-disc list-inside mb-4 space-y-1">
            <li>Name</li>
            <li>Email address</li>
            <li>Account information</li>
            <li>Preference points</li>
            <li>State of residence</li>
            <li>Subscription status</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">b. Payment Information</h3>
          <p className="mb-4">
            Payments are processed securely through Stripe. We do not store or have access to your full credit card details.
          </p>

          <h3 className="text-lg font-medium mb-2">c. Automatically Collected Information</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>IP address</li>
            <li>Browser and device information</li>
            <li>Usage data (pages visited, features used)</li>
            <li>Cookies or similar technologies</li>
          </ul>
        </section>

        <hr className="my-8 border-border" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="mb-2">We use your information to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Provide and maintain the Service</li>
            <li>Process subscriptions and payments</li>
            <li>Communicate account or service updates</li>
            <li>Improve site performance and user experience</li>
            <li>Detect fraud or misuse</li>
          </ul>
        </section>

        <hr className="my-8 border-border" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Data Sharing</h2>
          <p className="mb-4">We do not sell your personal information.</p>
          <p className="mb-2">We may share information with:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Service providers (hosting, analytics, payment processing such as Stripe)</li>
            <li>Legal authorities if required by law</li>
            <li>Parties necessary to protect our rights or prevent fraud</li>
          </ul>
        </section>

        <hr className="my-8 border-border" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Cookies & Analytics</h2>
          <p>
            We may use cookies or similar technologies to improve functionality and analyze site usage. You can disable cookies through your browser settings, though some features may not work correctly.
          </p>
        </section>

        <hr className="my-8 border-border" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
          <p>
            We retain personal information only as long as necessary to provide the Service, comply with legal obligations, or resolve disputes.
          </p>
        </section>

        <hr className="my-8 border-border" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
          <p>
            We implement reasonable administrative and technical safeguards to protect your information. However, no method of transmission or storage is completely secure.
          </p>
        </section>

        <hr className="my-8 border-border" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
          <p className="mb-2">Depending on your location, you may have the right to:</p>
          <ul className="list-disc list-inside mb-4 space-y-1">
            <li>Access or update your personal information</li>
            <li>Request deletion of your account</li>
            <li>Opt out of non-essential communications</li>
          </ul>
          <p>
            To exercise these rights, contact{" "}
            <a href="mailto:tallotags@gmail.com" className="text-primary hover:underline">
              tallotags@gmail.com
            </a>.
          </p>
        </section>

        <hr className="my-8 border-border" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
          <p>
            Tallotags.com is not intended for individuals under 18. We do not knowingly collect personal data from minors.
          </p>
        </section>

        <hr className="my-8 border-border" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. Changes will be posted on this page with an updated effective date.
          </p>
        </section>

        <hr className="my-8 border-border" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, contact:{" "}
            <a href="mailto:tallotags@gmail.com" className="text-primary hover:underline">
              tallotags@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
