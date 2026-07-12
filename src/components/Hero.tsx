import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-[#2D5016] text-white py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-300 via-green-600 to-black"></div>
      
      <div className="container mx-auto px-4 relative z-10 max-w-4xl text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none mb-6">
          Bring Color to Your Spaces With <span className="text-[#E8B44D]">Premium Paints</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
          Explore top brand paint selections, bespoke color mixing, and schedule professional consultation or painting services with our experts today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/booking"
            className="w-full sm:w-auto bg-[#E8B44D] hover:bg-[#d4a03b] text-gray-900 font-bold px-8 py-3 rounded-md transition-colors shadow-lg"
          >
            Book Free Estimate
          </Link>
          <Link
            href="/services"
            className="w-full sm:w-auto border-2 border-white hover:bg-white hover:text-[#2D5016] text-white font-bold px-8 py-3 rounded-md transition-colors"
          >
            Explore Services
          </Link>
        </div>
      </div>
    </section>
  );
}
