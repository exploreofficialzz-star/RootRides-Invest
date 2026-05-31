import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import OrbitalTestimonialCarousel from "@/components/OrbitalTestimonialCarousel";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { api, type Testimonial } from "@/lib/api";

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { id:"1", quote:"I invested ₦20,000 in the Farm plan and I've been claiming ₦2,500 daily. RootRides changed how I think about growing my money.", name:"Chinedu O.", plan_label:"Farm Plan Investor",   display_order:1 },
  { id:"2", quote:"The daily earnings are real. I started with Rice and kept reinvesting. Now I'm on the Cars plan earning ₦4,835 every single day.",  name:"Amina K.",   plan_label:"Cars Plan Investor",   display_order:2 },
  { id:"3", quote:"I've referred 12 friends so far. The ₦3,000 bonus per referral adds up fast. This is the easiest side income I've ever had.",      name:"Tunde B.",   plan_label:"Top Referrer",         display_order:3 },
  { id:"4", quote:"Bank withdrawals work exactly as promised. I get my money within 48 hours every month. Very reliable platform.",                     name:"Ngozi M.",   plan_label:"Cement Plan Investor", display_order:4 },
  { id:"5", quote:"As a student, the Rice plan was perfect for me. ₦5,000 to start and ₦835 daily helps with my expenses.",                            name:"Emeka J.",   plan_label:"Rice Plan Investor",   display_order:5 },
];

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const { ref: titleRef, isInView: titleInView } = useScrollReveal();

  useEffect(() => {
    api.getTestimonials().then(setTestimonials).catch(() => {/* keep defaults */});
  }, []);

  return (
    <section className="section-padding bg-dark-green" data-section-bg="dark">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-h2 text-white mb-4">What Our Investors Say</h2>
        </motion.div>

        <OrbitalTestimonialCarousel testimonials={testimonials} />
      </div>
    </section>
  );
}
