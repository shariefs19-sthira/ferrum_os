export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Get in touch with our team for any questions or support
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Get in Touch
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Address</h3>
              <p className="text-gray-600">
                123 Construction Avenue<br />
                Tech District, TD 12345<br />
                Innovation City
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">contact@ferrum_os.com</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">+1 (555) 123-4567</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Our Offices & Hours
          </h2>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bengaluru (HQ)</h3>
              <p className="text-gray-600 mb-3">
                4th Floor, Ferrum Tower<br />
                Outer Ring Road, Marathahalli<br />
                Bengaluru, KA 560037
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Hours:</span> Mon–Fri, 09:30–18:30 IST
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Phone:</span> +91 80 4000 2200
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Mumbai</h3>
              <p className="text-gray-600 mb-3">
                Level 7, BKC One<br />
                Bandra Kurla Complex<br />
                Mumbai, MH 400051
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Hours:</span> Mon–Fri, 09:30–18:30 IST
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Phone:</span> +91 22 6100 4400
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">London</h3>
              <p className="text-gray-600 mb-3">
                Suite 12, 88 Shoreditch High Street<br />
                London E1 6JJ<br />
                United Kingdom
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Hours:</span> Mon–Fri, 09:00–18:00 GMT
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Phone:</span> +44 20 7946 0810
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Office visits are by appointment only. Please email{' '}
            <a href="mailto:visit@ferrum_os.com" className="text-blue-600 hover:text-blue-500">
              visit@ferrum_os.com
            </a>{' '}
            to schedule.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Find Us
          </h2>
          <div
            role="img"
            aria-label="Map placeholder showing Bengaluru headquarters location"
            className="w-full h-64 rounded-md border border-gray-200 bg-gradient-to-br from-blue-50 via-white to-gray-100 flex items-center justify-center"
          >
            <div className="text-center px-6">
              <svg
                className="mx-auto h-10 w-10 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="mt-3 text-sm font-medium text-gray-700">
                Interactive map placeholder
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Embedded map will load here (Google Maps / Mapbox) with HQ pin and directions.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Send us a Message
          </h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            
            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            For immediate assistance, call us at{' '}
            <a href="tel:+15551234567" className="text-blue-600 hover:text-blue-500">
              +1 (555) 123-4567
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}