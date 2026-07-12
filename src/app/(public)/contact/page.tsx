import { ContactForm } from '@/components/ContactForm';

export const metadata = {
  title: 'Contact Us - Madina Paint Store',
  description: 'Get in touch with Madina Paint Store in Khanewal for spectrometer color matching and estimate consultations.',
};

export default function ContactPage() {
  const shopPhone = process.env.NEXT_PUBLIC_SHOP_PHONE || '+92 300 1234567';
  const shopEmail = process.env.NEXT_PUBLIC_SHOP_EMAIL || 'info@paintshop.com';
  const shopAddress = process.env.NEXT_PUBLIC_SHOP_ADDRESS || 'Madina Town, Nirala Sweet, Khanewal';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:py-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about our premium paint selections, spectrometer mixing, or scheduling professional painters? Get in touch today.
          </p>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Column 1: Info and Map */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8 space-y-6">
              <h2 className="text-2xl font-bold text-[#2D5016]">Our Store Location</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Visit our showroom in Khanewal to view physical catalog color decks, try matching consultations, or pick up supplies.
              </p>

              <div className="space-y-4 text-sm font-medium">
                {/* Address */}
                <div className="flex items-start space-x-3">
                  <span className="text-2xl mt-0.5">📍</span>
                  <div>
                    <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Showroom Address</h4>
                    <p className="text-gray-800 mt-1">{shopAddress}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-3">
                  <span className="text-2xl mt-0.5">📞</span>
                  <div>
                    <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Call or WhatsApp</h4>
                    <a href={`tel:${shopPhone.replace(/\s+/g, '')}`} className="text-[#2D5016] hover:underline block mt-1">
                      {shopPhone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-3">
                  <span className="text-2xl mt-0.5">✉️</span>
                  <div>
                    <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Email Inquiry</h4>
                    <a href={`mailto:${shopEmail}`} className="text-[#2D5016] hover:underline block mt-1">
                      {shopEmail}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map Embed */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden h-96 relative">
              <iframe
                title="Madina Paint Store Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27533.829107771746!2d71.91672322304899!3d30.30138982361664!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393b4a28adcf10e5%3A0xe5a14c33845c48b!2sKhanewal%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                className="w-full h-full border-0 absolute inset-0"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Column 2: Contact Form */}
          <ContactForm />
          
        </div>
      </div>
    </div>
  );
}
