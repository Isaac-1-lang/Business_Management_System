
import { useState } from "react";
import { ArrowLeft, HelpCircle, Search, Book, MessageCircle, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Help() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const faqItems = [
    {
      id: "1",
      question: "How do I add a new employee to the system?",
      answer: "Navigate to HR > Employee Records and click the 'Add Employee' button. Fill in all required information including personal details, contract information, and role assignments."
    },
    {
      id: "2",
      question: "How can I generate monthly financial reports?",
      answer: "Go to Reports & Audit section, select the reporting period, and choose 'Monthly Financial Summary' from the quick reports section. You can export the report in PDF or Excel format."
    },
    {
      id: "3",
      question: "What happens when a compliance deadline is approaching?",
      answer: "The system will automatically send notifications 7, 3, and 1 day before any deadline. You'll receive alerts through the notification center and via email if enabled."
    },
    {
      id: "4",
      question: "How do I upload and secure important documents?",
      answer: "Use the Document Vault to upload files. You can categorize documents, mark them as secured, and control access permissions based on user roles."
    },
    {
      id: "5",
      question: "Can I customize user roles and permissions?",
      answer: "Yes, go to System > User Management to create custom roles and assign specific permissions for different modules and functionalities."
    }
  ];

  const handleContactSupport = () => {
    toast({
      title: "Support Request",
      description: "Support ticket system will be implemented"
    });
  };

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Help & Support</h1>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Search */}
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search for help topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 text-base h-12"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Help Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-6 text-center">
                <Book className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-medium mb-2">User Guide</h3>
                <p className="text-sm text-gray-600">Step-by-step instructions for all features</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-3 text-green-600" />
                <h3 className="font-medium mb-2">Live Chat</h3>
                <p className="text-sm text-gray-600">Get instant help from our support team</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-6 text-center">
                <Mail className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                <h3 className="font-medium mb-2">Email Support</h3>
                <p className="text-sm text-gray-600">Send us your questions via email</p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQ.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Support Hours</h4>
                  <p className="text-sm text-gray-600 mb-1">Monday - Friday: 8:00 AM - 6:00 PM</p>
                  <p className="text-sm text-gray-600 mb-1">Saturday: 9:00 AM - 1:00 PM</p>
                  <p className="text-sm text-gray-600">Sunday: Closed</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4" />
                      <span>support@officemanager.rw</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4" />
                      <span>+250 788 123 456</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button onClick={handleContactSupport}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
