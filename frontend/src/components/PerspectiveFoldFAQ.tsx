import { useState } from "react";
import type { FaqItem } from "@/lib/api";

interface Props {
  items: FaqItem[];
}

export default function PerspectiveFoldFAQ({ items }: Props) {
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
          {items.map((item, i) => (
            <li
              key={item.id}
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
