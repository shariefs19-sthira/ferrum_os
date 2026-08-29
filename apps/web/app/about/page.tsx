export default function AboutPage() {
  const stats = [
    {
      value: "50+",
      label: "Team Members"
    },
    {
      value: "200+",
      label: "Projects Completed"
    },
    {
      value: "15+",
      label: "Years Experience"
    }
  ]

  const teamMembers = [
    { name: "Alex Johnson", role: "CEO & Founder" },
    { name: "Sarah Chen", role: "CTO" },
    { name: "Michael Rodriguez", role: "Head of Design" },
    { name: "Emily Davis", role: "Lead Developer" },
    { name: "James Wilson", role: "Product Manager" },
    { name: "Lisa Thompson", role: "Marketing Director" },
    { name: "David Kim", role: "Sales Lead" },
    { name: "Maria Garcia", role: "Customer Success" }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              Building the future of construction
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
              We're on a mission to transform the construction industry with innovative software solutions that make building smarter, faster, and more sustainable.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-extrabold text-blue-600">{stat.value}</div>
                <div className="mt-2 text-lg font-medium text-gray-900">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Meet Our Team
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
              The passionate individuals driving innovation in construction technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-gray-600">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}