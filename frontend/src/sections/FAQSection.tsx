import { useEffect, useState } from "react";
import PerspectiveFoldFAQ from "@/components/PerspectiveFoldFAQ";
import { api, type FaqItem } from "@/lib/api";

const DEFAULT_FAQ: FaqItem[] = [
  { id:"1", question:"How do I start investing?",           answer:"Download the RootRides app, create an account with your phone number, deposit funds via Flutterwave, and choose an investment plan. Your daily earnings begin immediately.",                                                                   display_order:1 },
  { id:"2", question:"When can I withdraw my earnings?",    answer:"You can withdraw your accumulated earnings once every month. Submit your bank details in the app, and your withdrawal will be processed within 24–48 hours.",                                                                                 display_order:2 },
  { id:"3", question:"How does the referral program work?", answer:"Share your unique referral code with friends. When they register and make their first deposit, ₦3,000 is automatically credited to your account.",                                                                                           display_order:3 },
  { id:"4", question:"Is my investment safe?",              answer:"Yes. RootRides uses bank-grade encryption and secure payment processing through Flutterwave. Your funds are protected with enterprise-level security protocols.",                                                                             display_order:4 },
  { id:"5", question:"What happens if I miss a daily claim?", answer:"You can claim your earnings once every 24 hours. If you miss a day, you can claim the next day — earnings accumulate and are available whenever you check in.",                                                                            display_order:5 },
  { id:"6", question:"How do I download the app?",          answer:"Visit rootrides.com/download on your Android device to download the APK directly. iOS support is coming soon.",                                                                                                                             display_order:6 },
];

export default function FAQSection() {
  const [items, setItems] = useState<FaqItem[]>(DEFAULT_FAQ);

  useEffect(() => {
    api.getFaq().then(setItems).catch(() => {/* keep defaults */});
  }, []);

  return (
    <div id="faq" data-section-bg="light">
      <PerspectiveFoldFAQ items={items} />
    </div>
  );
}
