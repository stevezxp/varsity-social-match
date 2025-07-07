
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Features = () => {
  const features = [
    {
      icon: "🎓",
      title: "Student Verified",
      description: "Connect only with verified university students and recent graduates",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: "🏛️",
      title: "Campus-Based",
      description: "Find matches from your university or nearby campuses",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: "💬",
      title: "Smart Matching",
      description: "AI-powered recommendations based on interests and compatibility",
      color: "from-green-400 to-blue-500"
    },
    {
      icon: "🔒",
      title: "Safe & Secure",
      description: "Advanced safety features and strict profile verification",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: "📱",
      title: "Real-Time Chat",
      description: "Instant messaging with photos, voice notes, and video calls",
      color: "from-red-400 to-pink-500"
    },
    {
      icon: "📍",
      title: "Local Events",
      description: "Discover campus events and meetups to attend together",
      color: "from-indigo-400 to-purple-500"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose Varsity Heights Dating?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built specifically for the university community with features that matter to students
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="vh-card-hover border-0 shadow-lg bg-white">
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 text-base leading-relaxed">
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
