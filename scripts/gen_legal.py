# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import *
import datetime

PREFIX = ""
TODAY = datetime.date.today().strftime("%B %-d, %Y") if os.name != "nt" else datetime.date.today().strftime("%B %d, %Y")

# ============================================================ PRIVACY POLICY
html = head(
    "Privacy Policy | Straight Flush Plumbing & Leak Detection",
    "Privacy Policy for Straight Flush Plumbing & Leak Detection — how we collect, use, and protect your information.",
    "privacy-policy.html", PREFIX
)
html += nav(PREFIX)
html += page_hero(PREFIX,
    [("Home","index.html"),("Privacy Policy", None)],
    "Legal", "Privacy Policy",
    f"Last updated: {TODAY}",
    "Contact Us", "contact.html"
)
html += f"""<section>
  <div class="wrap" style="max-width:820px;">
    <div class="reveal" style="display:flex; flex-direction:column; gap:28px;">

      <div>
        <h2 style="font-size:1.4rem; margin-bottom:12px;">Information We Collect</h2>
        <p class="muted">When you contact us through our website, call us, or request a callback, we may collect your name, phone number, email address, service address, and details about the plumbing issue you're experiencing. We only collect what's needed to respond to your request and provide service.</p>
      </div>

      <div>
        <h2 style="font-size:1.4rem; margin-bottom:12px;">How We Use Your Information</h2>
        <p class="muted">We use the information you provide to respond to service requests, schedule appointments, provide quotes, and communicate with you about your plumbing needs. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
      </div>

      <div>
        <h2 style="font-size:1.4rem; margin-bottom:12px;">Contact Forms &amp; Communication</h2>
        <p class="muted">Information submitted through our contact forms is used solely to respond to your inquiry. If you provide your phone number, we may call or text you regarding your request. You can opt out of non-essential communications at any time by telling us directly.</p>
      </div>

      <div>
        <h2 style="font-size:1.4rem; margin-bottom:12px;">Cookies &amp; Analytics</h2>
        <p class="muted">Our website may use standard analytics tools to understand how visitors use our site (such as which pages are viewed most). This data is aggregated and anonymized where possible and is not used to personally identify you.</p>
      </div>

      <div>
        <h2 style="font-size:1.4rem; margin-bottom:12px;">Third-Party Links</h2>
        <p class="muted">Our site links to third-party platforms including Google and Yelp for reviews. These sites have their own privacy policies, and we encourage you to review them independently &mdash; we aren't responsible for their practices.</p>
      </div>

      <div>
        <h2 style="font-size:1.4rem; margin-bottom:12px;">Data Security</h2>
        <p class="muted">We take reasonable measures to protect the information you share with us. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>
      </div>

      <div>
        <h2 style="font-size:1.4rem; margin-bottom:12px;">Your Rights</h2>
        <p class="muted">You may request that we delete, correct, or provide a copy of the personal information we hold about you at any time by contacting us directly at {EMAIL} or {PHONE_DISPLAY}.</p>
      </div>

      <div>
        <h2 style="font-size:1.4rem; margin-bottom:12px;">Changes to This Policy</h2>
        <p class="muted">We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.</p>
      </div>

      <div>
        <h2 style="font-size:1.4rem; margin-bottom:12px;">Contact Us</h2>
        <p class="muted">Questions about this Privacy Policy? Reach us at {EMAIL}, {PHONE_DISPLAY}, or {ADDRESS}.</p>
      </div>

    </div>
  </div>
</section>
"""
html += footer(PREFIX)
write_page("privacy-policy.html", html)

# ============================================================ TERMS OF SERVICE
html = head(
    "Terms of Service | Straight Flush Plumbing & Leak Detection",
    "Terms of Service for Straight Flush Plumbing & Leak Detection's website and services.",
    "terms-of-service.html", PREFIX
)
html += nav(PREFIX)
html += page_hero(PREFIX,
    [("Home","index.html"),("Terms of Service", None)],
    "Legal", "Terms of Service",
    f"Last updated: {TODAY}",
    "Contact Us", "contact.html"
)
html += f"""<section>
  <div class="wrap" style="max-width:820px;">
    <div class="reveal" style="display:flex; flex-direction:column; gap:28px;">

      <div>
        <h2 style="font-size:1.4rem; margin-bottom:12px;">Acceptance of Terms</h2>
        <p class="muted">By using this website, you agree to these Terms of Service. If you don't agree with any part of these terms, please don't use our website.</p>
      </div>

      <div>
        <h2 style="font-size:1.4rem; margin-bottom:12px;">Website Content</h2>
        <p class="muted">The information on this website, including articles in our Leak Detection Academy, cost guides, and insurance resources, is provided for general informational purposes only. It does not constitute professional advice specific to your situation, and actual pricing, diagnosis, and recommendations can only be determined after an in-person or phone assessment of your specific property.</p>
      </div>

      <div>
        <h2 style="font-size:1.4rem; margin-bottom:12px;">No Guarantee of Coverage or Outcome</h2>
        <p class="muted">References to insurance coverage on this site are general in nature. Whether your insurance covers a specific plumbing issue depends entirely on your individual policy and provider &mdash; we make no guarantees or representations about insurance coverage.</p>
      </div>

      <div>
        <h2 style="font-size:1.4rem; margin-bottom:12px;">Service Requests &amp; Quotes</h2>
        <p class="muted">Submitting a contact form or callback request through this website does not guarantee a specific appointment time, price, or outcome. All service is subject to an actual assessment of your property and mutual agreement between you and Straight Flush Plumbing &amp; Leak Detection.</p>
      </div>

      <div>
        <h2 style="font-size:1.4rem; margin-bottom:12px;">Reviews &amp; Testimonials</h2>
        <p class="muted">Reviews displayed on this site are sourced from real customers on Google and Yelp. Individual results and experiences may vary from customer to customer.</p>
      </div>

      <div>
        <h2 style="font-size:1.4rem; margin-bottom:12px;">Intellectual Property</h2>
        <p class="muted">The content, design, and branding on this website belong to Straight Flush Plumbing &amp; Leak Detection and may not be copied or reproduced without permission.</p>
      </div>

      <div>
        <h2 style="font-size:1.4rem; margin-bottom:12px;">Limitation of Liability</h2>
        <p class="muted">Straight Flush Plumbing &amp; Leak Detection is not liable for any damages arising from the use of, or inability to use, this website or its content.</p>
      </div>

      <div>
        <h2 style="font-size:1.4rem; margin-bottom:12px;">Governing Law</h2>
        <p class="muted">These terms are governed by the laws of the State of California.</p>
      </div>

      <div>
        <h2 style="font-size:1.4rem; margin-bottom:12px;">Contact Us</h2>
        <p class="muted">Questions about these Terms of Service? Reach us at {EMAIL}, {PHONE_DISPLAY}, or {ADDRESS}.</p>
      </div>

    </div>
  </div>
</section>
"""
html += footer(PREFIX)
write_page("terms-of-service.html", html)

print("Privacy Policy and Terms of Service generated.")
