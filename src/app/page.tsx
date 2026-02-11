import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-slate-50 dark:bg-slate-950 py-24 md:py-32 lg:py-40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="container relative mx-auto flex flex-col items-center px-4 text-center">
          <div className="inline-flex items-center rounded-full bg-[#FF8C42]/10 px-3 py-1 text-sm font-medium text-[#FF8C42] ring-1 ring-inset ring-[#FF8C42]/20 mb-6 animate-fade-in-up">
            New: Enhanced Matching Algorithm 🚀
          </div>
          <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-[#2C3E50] sm:text-6xl md:text-7xl lg:text-8xl mb-8">
            Safe Rides for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C42] to-[#2C3E50]">Every Student</span>
          </h1>
          <p className="max-w-2xl text-lg text-slate-700 md:text-xl mb-10 leading-relaxed">
            Connect directly with verified private school bus drivers in your area.
            Real-time tracking, secure messaging, and personalized routes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-[#2C3E50] rounded-xl hover:bg-[#1a252f] shadow-xl shadow-[#2C3E50]/20 hover:shadow-[#2C3E50]/40 transition-all transform hover:-translate-y-1">
                Find a Driver
              </button>
            </Link>
            <Link href="/register?role=driver" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-[#2C3E50] bg-white border-2 border-[#2C3E50] rounded-xl hover:bg-slate-50 hover:border-[#1a252f] shadow-md transition-all">
                Drive for Us
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="w-full py-24 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Smart Matching"
              description="Our algorithm finds drivers whose routes pass right by your home and school."
              icon="🗺️"
            />
            <FeatureCard
              title="Verified Drivers"
              description="All drivers are vetted with license verification for your peace of mind."
              icon="🛡️"
            />
            <FeatureCard
              title="Real-time Chat"
              description="Communicate directly with drivers through our secure messaging platform."
              icon="💬"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <div className="group relative p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#FF8C42]/50 hover:shadow-2xl hover:shadow-[#FF8C42]/10 transition-all duration-300">
      <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-bold text-[#2C3E50] dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  )
}
