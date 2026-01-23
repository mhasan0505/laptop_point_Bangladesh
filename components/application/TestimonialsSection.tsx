"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import Image from "next/image";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const testimonials = [
  {
    id: 1,
    name: "Rahim Ahmed",
    role: "Software Engineer",
    image:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
    quote:
      "Laptop Point BD provided me with an authentic HP EliteBook. The condition was pristine, just like new. Their support team was extremely helpful in guiding me to the right choice.",
    rating: 5,
  },
  {
    id: 2,
    name: "Fatima Begum",
    role: "Student",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    quote:
      "I was looking for a budget-friendly laptop for my university work. I found a great deal on a Dell Latitude here. Delivery was fast, and the packaging was secure. Highly recommended!",
    rating: 5,
  },
  {
    id: 3,
    name: "Tanvir Hasan",
    role: "Digital Marketer",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    quote:
      "The best place to buy used laptops in Bangladesh. I've bought two laptops for my office, and both are performing exceptionally well. The 15-day replacement warranty gave me peace of mind.",
    rating: 4,
  },
  {
    id: 4,
    name: "Nusrat Jahan",
    role: "Freelancer",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
    quote:
      "Amazing service! I ordered a Lenovo ThinkPad, and it arrived within 2 days. The battery backup is solid, and the keyboard is fantastic. Will definitely shop here again.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            What Our Customers Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600"
          >
            Don&apos;t just take our word for it. Here&apos;s what our satisfied
            customers have to say about their experience with Laptop Point BD.
          </motion.p>
        </div>

        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          centeredSlides={true}
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            bulletActiveClass: "swiper-pagination-bullet-active bg-primary",
          }}
          breakpoints={{
            640: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
              centeredSlides: false,
            },
            1024: {
              slidesPerView: 3,
              centeredSlides: false,
            },
          }}
          className="pb-12"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id} className="h-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col relative"
              >
                <div className="absolute top-8 right-8 text-primary/10">
                  <Quote size={40} />
                </div>

                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-primary font-medium">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                <div className="flex mb-4 text-yellow-400 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < testimonial.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-200"
                      }
                    />
                  ))}
                </div>

                <p className="text-gray-600 leading-relaxed italic flex-1">
                  &quot;{testimonial.quote}&quot;
                </p>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
