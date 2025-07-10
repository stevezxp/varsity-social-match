
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Features = () => {
  const features = [
    {
      icon: "🎓",
      title: "Student Verified",
      description: "Connect only with verified university students and recent graduates",
      color: "from-pink-400 to-pink-600"
    },
    {
      icon: "🏛️",
      title: "Campus-Based",
      description: "Find matches from your university or nearby campuses",
      color: "from-orange-400 to-red-500"
    },
    {
      icon: "💬",
      title: "Smart Matching",
      description: "AI-powered recommendations based on interests and compatibility",
      color: "from-pink-400 to-orange-500"
    },
    {
      icon: "🔒",
      title: "Safe & Secure",
      description: "Advanced safety features and strict profile verification",
      color: "from-rose-400 to-pink-500"
    },
    {
      icon: "📱",
      title: "Real-Time Chat",
      description: "Instant messaging with photos, voice notes, and video calls",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: "📍",
      title: "Local Events",
      description: "Discover campus events and meetups to attend together",
      color: "from-orange-400 to-pink-500"
    }
  ];

  return (
    <section id="features" className="py-32 bg-gradient-to-b from-white to-pink-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-24">
          <h2 className="text-5xl font-bold text-gray-900 mb-8">
            Why Choose Varsity Heights Dating?
          </h2>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Built specifically for the university community with features that matter to students
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="dating-card border-0 shadow-card bg-white hover:shadow-love p-8">
              <CardHeader className="text-center pb-6">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 text-lg leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
