import Hero from "@/components/Hero";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Hero />
      
      {/* Features / Quick Links Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Madina Paint Store?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#2D5016]/10 text-[#2D5016] rounded-full flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Premium Paint Selection</h3>
              <p className="text-gray-600 text-sm">
                We stock top-tier industrial and decorative paint brands. Long-lasting, high-opacity, and eco-friendly options.
              </p>
            </div>
            
            <div className="p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#E8B44D]/10 text-[#E8B44D] rounded-full flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Color Matching Experts</h3>
              <p className="text-gray-600 text-sm">
                Bring any color sample, fabric, or photo. Our computer-aided spectrometers will match it perfectly.
              </p>
            </div>
            
            <div className="p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#DC2626]/10 text-[#DC2626] rounded-full flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Professional Services</h3>
              <p className="text-gray-600 text-sm">
                Schedule wall preparation, color consultations, or full-scale painting projects with our vetted painters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16 text-center border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to start your painting project?</h2>
          <p className="text-gray-600 mb-6">
            Get professional advice and color matching. Book an appointment online or visit our store.
          </p>
          <Link
            href="/booking"
            className="bg-[#2D5016] hover:bg-[#203a10] text-white px-6 py-3 rounded-md font-semibold transition-colors"
          >
            Schedule Consultation
          </Link>
        </div>
      </section>
    </div>
  );
}
