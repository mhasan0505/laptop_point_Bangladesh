"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaPaperPlane } from 'react-icons/fa';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const MapWithNoSSR = dynamic(
  () => import('@/components/application/Map'),
  { ssr: false }
);

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactPage() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Replace with your actual form submission logic
      console.log('Form submitted:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus({
        success: true,
        message: 'Your message has been sent successfully! We\'ll get back to you soon.'
      });
      reset();
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: 'Failed to send message. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Have questions or need assistance? Fill out the form below or reach out to us through our contact information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
          
          {submitStatus && (
            <div className={`p-4 mb-6 rounded-md ${submitStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {submitStatus.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                {...register('name', { required: 'Name is required' })}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your@email.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                {...register('subject', { required: 'Subject is required' })}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.subject ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="How can we help you?"
              />
              {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Your Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                rows={5}
                {...register('message', { required: 'Message is required' })}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.message ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Type your message here..."
              ></textarea>
              {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition duration-200 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <FaPaperPlane className="inline-block" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Contact Information */}
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full text-blue-600">
                  <FaMapMarkerAlt className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Our Location</h3>
                  <p className="mt-1 text-gray-600">123 Tech Street, Dhaka 1207<br />Bangladesh</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full text-blue-600">
                  <FaPhone className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Phone Number</h3>
                  <p className="mt-1 text-gray-600">+880 1XXX XXXXXX</p>
                  <p className="text-gray-600">+880 1XXX XXXXXX (Support)</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full text-blue-600">
                  <FaEnvelope className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Email Address</h3>
                  <p className="mt-1 text-gray-600">info@laptoppointbd.com</p>
                  <p className="text-gray-600">support@laptoppointbd.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full text-blue-600">
                  <FaClock className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Working Hours</h3>
                  <p className="mt-1 text-gray-600">Saturday - Thursday: 9:00 AM - 8:00 PM</p>
                  <p className="text-gray-600">Friday: 2:00 PM - 8:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-64 w-full">
              <MapWithNoSSR />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
