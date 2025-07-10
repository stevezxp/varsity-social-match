
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Safety = () => {
  const safetyFeatures = [
    {
      icon: "🛡️",
      title: "Profile Verification",
      description: "All profiles are verified through university email addresses and optional student ID upload"
    },
    {
      icon: "🚫",
      title: "Block & Report",
      description: "Easily block or report users who make you uncomfortable with one tap"
    },
    {
      icon: "🔍",
      title: "Active Moderation",
      description: "Our team actively monitors for fake profiles and inappropriate behavior"
    },
    {
      icon: "📱",
      title: "Safe Meeting Tips",
      description: "Built-in safety guidelines and tips for meeting someone new from campus"
    }
  ];

  return (
    <section id="safety" className="py-20 bg-gradient-to-br from-pink-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Your Safety is Our Priority
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We've built comprehensive safety features to ensure a secure and positive experience for all users
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {safetyFeatures.map((feature, index) => (
            <Card key={index} className="border-0 shadow-card bg-white/90 backdrop-blur-sm dating-card hover:shadow-love">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-xl">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-white/20 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need Help?
            </h3>
            <p className="text-gray-600 mb-6">
              Our support team is available 24/7 to help with any safety concerns or questions you might have.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:safety@varsityheightsdating.com" className="text-blue-600 hover:text-blue-700 font-semibold">
                safety@varsityheightsdating.com
              </a>
              <span className="hidden sm:block text-gray-400">|</span>
              <span className="text-gray-600">24/7 Support Available</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Safety;
