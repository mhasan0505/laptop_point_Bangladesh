"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Clock, Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useForm } from "react-hook-form";

// Dynamically import map to avoid SSR issues
const MapWithNoSSR = dynamic(() => import("@/components/application/Map"), {
  ssr: false,
});

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Form submitted:", data);

      setSubmitStatus({
        success: true,
        message: "Message sent successfully! We will get back to you shortly.",
      });
      reset();
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-zinc-900 text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
          >
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
          >
            We&apos;d love to hear from you. Whether you have a question about
            products, pricing, or support, our team is ready to answer all your
            questions.
          </motion.p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="lg:col-span-1 space-y-6"
          >
            {/* Contact Details Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">
                Contact Info
              </h2>

              <div className="space-y-8">
                <div className="flex items-start group">
                  <div className="shrink-0 w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Our Location
                    </h3>
                    <p className="text-gray-900 font-medium">
                      123 Tech Street, Dhaka 1207
                    </p>
                    <p className="text-gray-600">Bangladesh</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="shrink-0 w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Phone Number
                    </h3>
                    <p className="text-gray-900 font-medium">
                      +880 1XXX XXXXXX
                    </p>
                    <p className="text-gray-500 text-sm">Mon-Fri 9am-6pm</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="shrink-0 w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Email Address
                    </h3>
                    <a
                      href="mailto:info@laptoppointbd.com"
                      className="text-gray-900 font-medium hover:text-blue-600 transition-colors"
                    >
                      info@laptoppointbd.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="shrink-0 w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Working Hours
                    </h3>
                    <p className="text-gray-900 font-medium">
                      Sat - Thu: 9:00 AM - 8:00 PM
                    </p>
                    <p className="text-gray-500 text-sm">
                      Friday: 2:00 PM - 8:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-[300px] relative">
              <MapWithNoSSR />
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100 h-full">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Send us a Message
                </h2>
                <p className="text-gray-600">
                  Fill out the form below and we&apos;ll get back to you as soon
                  as possible.
                </p>
              </div>

              {submitStatus && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className={`p-4 mb-8 rounded-xl ${
                    submitStatus.success
                      ? "bg-green-50 text-green-700 border border-green-100"
                      : "bg-red-50 text-red-700 border border-red-100"
                  }`}
                >
                  <p className="flex items-center gap-2">
                    {submitStatus.success ? "✅" : "❌"} {submitStatus.message}
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Full Name
                    </label>
                    <input
                      id="name"
                      {...register("name", { required: "Name is required" })}
                      className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                        errors.name ? "border-red-300" : "border-gray-200"
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                        errors.email ? "border-red-300" : "border-gray-200"
                      }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="text-sm font-medium text-gray-700"
                  >
                    Subject
                  </label>
                  <input
                    id="subject"
                    {...register("subject", {
                      required: "Subject is required",
                    })}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                      errors.subject ? "border-red-300" : "border-gray-200"
                    }`}
                    placeholder="How can we help?"
                  />
                  {errors.subject && (
                    <p className="text-xs text-red-500">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium text-gray-700"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    {...register("message", {
                      required: "Message is required",
                    })}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none ${
                      errors.message ? "border-red-300" : "border-gray-200"
                    }`}
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                  {errors.message && (
                    <p className="text-xs text-red-500">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto h-12 px-8 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
