'use client'

export default function FeaturesPage() {
  const mainFeatures = [
    {
      title: 'Notion Guidance',
      description: 'Get expert guidance on how to structure and organize your Notion workspace effectively.',
      details: [
        'Workspace organization advice',
        'Database structure recommendations',
        'Template usage tips',
        'Page layout suggestions',
        'Setup optimization guidance'
      ],
      icon: '📚'
    },
    {
      title: 'Instant Answers',
      description: 'Get immediate, AI-powered responses to all your Notion-related questions and challenges.',
      details: [
        'Feature explanations',
        'How-to instructions',
        'Troubleshooting help',
        'Formula assistance',
        'Best practice recommendations'
      ],
      icon: '⚡'
    },
    {
      title: 'Best Practices',
      description: 'Learn from expert insights and proven strategies to maximize your Notion workspace efficiency.',
      details: [
        'Productivity techniques',
        'Organization strategies',
        'Collaboration tips',
        'Workflow optimization',
        'Feature utilization tips'
      ],
      icon: '💡'
    }
  ];

  const additionalFeatures = [
    {
      title: 'AI-Powered Assistance',
      description: 'Advanced artificial intelligence that understands your Notion needs and provides tailored solutions.',
      icon: '🤖'
    },
    {
      title: '24/7 Availability',
      description: 'Get help whenever you need it, with instant responses at any time of day.',
      icon: '🌐'
    },
    {
      title: 'Secure Integration',
      description: 'Safe and secure Google authentication with complete data privacy.',
      icon: '🔒'
    }
  ];

  return (
    <main className="min-h-screen bg-[#0A0B14] text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Features & Capabilities</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Your AI companion for mastering Notion - get instant help, guidance, and best practices
        </p>
      </header>

      {/* Main Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-[#12131D] p-8 rounded-xl border border-gray-800 hover:border-[#8B8BF9] transition-colors"
            >
              <div className="text-[#8B8BF9] text-3xl mb-4">{feature.icon}</div>
              <h2 className="text-xl font-semibold mb-3">{feature.title}</h2>
              <p className="text-gray-400 mb-6">{feature.description}</p>
              <ul className="space-y-3">
                {feature.details.map((detail, idx) => (
                  <li key={idx} className="flex items-center text-gray-300">
                    <span className="text-[#8B8BF9] mr-2">•</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Features */}
      <section className="container mx-auto px-4 py-16 bg-[#0D0E17]">
        <h2 className="text-3xl font-bold text-center mb-12">Additional Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {additionalFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-[#12131D] p-6 rounded-xl border border-gray-800 hover:border-[#8B8BF9] transition-colors text-center"
            >
              <div className="text-[#8B8BF9] text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Notion Experience?</h2>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Join now and unlock the full potential of your Notion workspace
        </p>
        <button
          onClick={() => window.location.href = '/api/auth/google'}
          className="bg-[#8B8BF9] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#7A7AE6] transition-colors"
        >
          Get Started with Google
        </button>
      </section>

      {/* Navigation */}
      <div className="fixed top-4 right-4">
        <button
          onClick={() => window.location.href = '/'}
          className="text-gray-400 hover:text-white transition-colors"
        >
          Back to Home
        </button>
      </div>
    </main>
  );
} 