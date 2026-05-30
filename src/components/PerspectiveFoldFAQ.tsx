import { useState } from "react";

const FAQ_DATA = [
  {
    question: "How do I start investing?",
    answer:
      "Download the RootRides app, create an account with your phone number, deposit funds via Flutterwave, and choose an investment plan. Your daily earnings begin immediately.",
  },
  {
    question: "When can I withdraw my earnings?",
    answer:
      "You can withdraw your accumulated earnings once every month. Submit your bank details in the app, and your withdrawal will be processed within 24-48 hours.",
  },
  {
    question: "How does the referral program work?",
    answer:
      "Share your unique referral code with friends. When they register and make their first deposit, \u20A63,000 is automatically credited to your account.",
  },
  {
    question: "Is my investment safe?",
    answer:
      "Yes. RootRides uses bank-grade encryption and secure payment processing through Flutterwave. Your funds are protected with enterprise-level security protocols.",
  },
  {
    question: "What happens if I miss a daily claim?",
    answer:
      "You can claim your earnings once every 24 hours. If you miss a day, you can claim the next day \u2014 earnings accumulate and are available whenever you check in.",
  },
  {
    question: "How do I download the app?",
    answer:
      "Visit rootrides.com/download on your Android device to download the APK. iOS support is coming soon.",
  },
];

export default function PerspectiveFoldFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <div className="text-center mb-12">
          <h2 className="text-h2 text-dark-green mb-4">
            Frequently Asked Questions
          </h2>
        </div>
        <ul className="faq-list">
          {FAQ_DATA.map((item, i) => (
            <li
              key={i}
              className={`faq-item ${openIndex === i ? "is-open" : ""}`}
            >
              <div className="faq-front" onClick={() => toggleFAQ(i)}>
                <div className="faq-title">{item.question}</div>
                <div className="faq-icon">
                  <i className="faq-plus" />
                </div>
              </div>
              <div className="faq-back">
                <div className="faq-back-inner">
                  <p>{item.answer}</p>
                </div>
              </div>
              <div className="faq-divider" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
