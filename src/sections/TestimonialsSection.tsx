import { motion } from "framer-motion";
import OrbitalTestimonialCarousel from "@/components/OrbitalTestimonialCarousel";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function TestimonialsSection() {
  const { ref: titleRef, isInView: titleInView } = useScrollReveal();

  return (
    <section
      className="section-padding bg-dark-green"
      data-section-bg="dark"
    >
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

        <OrbitalTestimonialCarousel />
      </div>
    </section>
  );
}
