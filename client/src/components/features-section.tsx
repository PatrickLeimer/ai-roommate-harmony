import { motion } from "framer-motion";
import { Search, Bell, Shield, FileText } from "lucide-react";

const features = [
  {
    title: "Unified Search",
    description: "Our AI scans multiple platforms to find the best listings matching your specific needs and preferences.",
    icon: Search
  },
  {
    title: "Instant Alerts",
    description: "Get notified instantly when new properties matching your criteria become available.",
    icon: Bell
  },
  {
    title: "Trusted Security",
    description: "All listings are verified to protect you from scams and ensure a safe rental experience.",
    icon: Shield
  },
  {
    title: "Lease Analysis",
    description: "Our AI reads and summarizes complex lease agreements, highlighting important terms and potential issues.",
    icon: FileText
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2 
            className="text-base font-semibold text-primary tracking-wide uppercase"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Features
          </motion.h2>
          <motion.p 
            className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Smart Housing Search, Reimagined
          </motion.p>
          <motion.p 
            className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Let AI do the hard work of finding your perfect home, so you can focus on what matters.
          </motion.p>
        </div>

        <motion.div 
          className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={feature.title}
              className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition duration-300 transform hover:-translate-y-1"
              variants={item}
            >
              <div className="absolute top-6 right-6 h-12 w-12 bg-primary-50 rounded-md flex items-center justify-center">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mt-8">{feature.title}</h3>
              <p className="mt-2 text-base text-gray-500">
                {feature.description}
              </p>
              <p className="mt-4 text-sm text-primary font-medium">Learn more &rarr;</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
