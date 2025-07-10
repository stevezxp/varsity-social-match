import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import logoImage from '@/assets/varsity-heights-logo.png';

const Contact = () => {
  const contactInfo = [
    {
      icon: "📱",
      title: "Phone",
      value: "+263778031727",
      link: "tel:+263778031727",
      color: "from-green-400 to-green-600"
    },
    {
      icon: "📧",
      title: "Email",
      value: "stephennyams2002@gmail.com",
      link: "mailto:stephennyams2002@gmail.com",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: "📸",
      title: "Instagram",
      value: "@stephen_r.j",
      link: "https://instagram.com/stephen_r.j",
      color: "from-pink-400 to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      <Header />
      
      {/* Floating bubbles for consistency */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full animate-float shadow-lg opacity-60" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full animate-float shadow-xl opacity-50" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full animate-float shadow-lg opacity-55" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-br from-orange-100 to-pink-200 rounded-full animate-float shadow-md opacity-45" style={{ animationDelay: '6s' }}></div>
      </div>

      <div className="pt-20 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <img 
                src={logoImage} 
                alt="Varsity Heights Logo" 
                className="w-20 h-20 rounded-2xl shadow-love"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contact the Creator
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get in touch with Stephen RJ, the developer behind Varsity Heights Dating
            </p>
          </div>

          {/* Creator Info Card */}
          <Card className="dating-card mb-12 text-center">
            <CardHeader>
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white text-3xl font-bold shadow-love">
                SR
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                Stephen RJ
              </CardTitle>
              <p className="text-lg text-gray-600">
                Full-Stack Developer & Creator of Varsity Heights Dating
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-6">
                Passionate about connecting university students and creating meaningful relationships 
                through innovative technology. Building the future of campus dating, one match at a time.
              </p>
              <div className="inline-flex items-center bg-gradient-to-r from-pink-100 to-orange-100 rounded-full px-6 py-3">
                <span className="text-gray-800 font-medium">💡 "Home Away from Home" for your heart</span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {contactInfo.map((contact, index) => (
              <Card key={index} className="dating-card text-center group">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${contact.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                    {contact.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {contact.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {contact.value}
                  </p>
                  <Button 
                    asChild
                    className="love-button w-full"
                  >
                    <a href={contact.link} target="_blank" rel="noopener noreferrer">
                      Get in Touch
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <Card className="dating-card text-center">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                About This Project
              </h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Varsity Heights Dating was created with the vision of helping university students 
                find meaningful connections within their campus community. Built with modern web 
                technologies and a focus on safety, authenticity, and user experience.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-gradient-to-r from-pink-100 to-pink-200 rounded-full px-4 py-2">
                  <span className="text-pink-800 font-medium">React</span>
                </div>
                <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-full px-4 py-2">
                  <span className="text-orange-800 font-medium">TypeScript</span>
                </div>
                <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-full px-4 py-2">
                  <span className="text-purple-800 font-medium">Supabase</span>
                </div>
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-full px-4 py-2">
                  <span className="text-blue-800 font-medium">Tailwind CSS</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;