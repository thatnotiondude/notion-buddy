'use client'

import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';

export default function HomePage() {
  const features = [
    {
      title: 'Notion Guidance',
      description: 'Expert advice on workspace organization and structure',
      icon: '📚',
    },
    {
      title: 'Instant Answers',
      description: 'Quick solutions to all your Notion questions',
      icon: '⚡',
    },
    {
      title: 'Best Practices',
      description: 'Learn expert tips and optimization tricks',
      icon: '💡',
    },
  ];

  return (
    <main className="min-h-screen bg-[#0A0B14] text-white">
      {/* Navigation */}
      <div className="fixed top-4 right-4 flex gap-6">
        <Link
          href="/features"
          className="text-gray-400 hover:text-white transition-colors"
        >
          Features
        </Link>
      </div>

      {/* Small Label */}
      <div className="text-center pt-8">
        <span className="text-[#8B8BF9] text-sm">🌟 AI-Powered Notion Assistant</span>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-5xl font-bold mb-4">
          Your Notion Expert
        </h1>
        <h2 className="text-5xl font-bold mb-8 text-gray-300">
          Available 24/7
        </h2>
        <p className="text-xl text-gray-400 mb-4 max-w-2xl mx-auto">
          Get instant answers and expert guidance for all your Notion questions.
        </p>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Transform your workspace with AI-powered insights and best practices.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#12131D] p-6 rounded-xl border border-gray-800 hover:border-[#8B8BF9] transition-colors"
            >
              <div className="text-[#8B8BF9] mb-4 text-2xl">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => window.location.href = '/api/auth/google'}
          className="bg-[#8B8BF9] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#7A7AE6] transition-colors mx-auto"
        >
          Sign in with Google
        </button>

        {/* Footer Text */}
        <div className="mt-8 text-sm text-gray-500">
          Powered by advanced AI technology • Secure Google sign-in
        </div>
      </section>
    </main>
  );
} 