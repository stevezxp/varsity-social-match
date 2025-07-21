
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
    <section id="safety" className="py-32 bg-gradient-to-br from-pink-50 dark:from-gray-800 to-orange-50 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-24">
          <h2 className="text-5xl font-bold text-foreground mb-8">
            Your Safety is Our Priority
          </h2>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We've built comprehensive safety features to ensure a secure and positive experience for all users
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {safetyFeatures.map((feature, index) => (
            <Card key={index} className="border-0 shadow-card bg-card/90 backdrop-blur-sm dating-card hover:shadow-love p-8">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-2xl">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {feature.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-lg leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-24 text-center">
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-12 max-w-3xl mx-auto border border-border/20 shadow-lg">
            <h3 className="text-3xl font-bold text-foreground mb-6">
              Need Help?
            </h3>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Our support team is available 24/7 to help with any safety concerns or questions you might have.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="mailto:safety@varsityheightsdating.com" className="text-blue-600 hover:text-blue-700 font-semibold text-lg">
                safety@varsityheightsdating.com
              </a>
              <span className="hidden sm:block text-muted-foreground">|</span>
              <span className="text-muted-foreground text-lg">24/7 Support Available</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Safety;
