import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, MapPin, FileText, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from '@/components/SEOHead';
const contactSchema = z.object({
  name: z.string().trim().min(1, {
    message: "Name is required"
  }).max(100),
  email: z.string().trim().email({
    message: "Invalid email address"
  }).max(255),
  subject: z.string().min(1, {
    message: "Subject is required"
  }),
  message: z.string().trim().min(1, {
    message: "Message is required"
  }).max(1000)
});
export default function About() {
  const {
    toast
  } = useToast();
  const location = useLocation();
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "General Question",
      message: ""
    }
  });
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subjectParam = params.get('subject');
    if (subjectParam === 'Advertising') {
      form.setValue('subject', 'Advertising');
    }
  }, [location.search, form]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: z.infer<typeof contactSchema>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: data
      });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "Thank you for contacting us. We'll get back to you soon."
      });
      form.reset();
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="container mx-auto px-4 py-12 max-w-4xl">
      <SEOHead 
        title="About TalloTags | Colorado Big Game Hunting Statistics"
        description="Learn about TalloTags - your source for Colorado big game draw odds, harvest statistics, and preference point data. Contact us for questions or feedback."
        canonicalPath="/about"
      />
      <h1 className="text-4xl font-bold mb-8 text-center">About TalloTags</h1>
      
      <Card className="shadow-medium mb-8">
        <CardHeader>
          <CardTitle className="text-center">Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p className="text-center">TalloTags was created to help hunters make informed decisions about their big game application strategies across the west.  


We want to make this information easy to access for everyone, so are committed to offering an affordable yearly subscription fee.</p>
          <p>
            We started with Colorado, but have plans to expand across all western states, so stay tuned!
          </p>
          
        </CardContent>
      </Card>

      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6 text-center">What We Offer</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-subtle hover:shadow-medium transition-shadow">
            <CardHeader>
              <Target className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Draw Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed draw odds for 2025 season across all Colorado units
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-subtle hover:shadow-medium transition-shadow">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-accent mb-2" />
              <CardTitle>Harvest Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                2024 harvest statistics including success rates and hunter density
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-subtle hover:shadow-medium transition-shadow">
            <CardHeader>
              <MapPin className="h-10 w-10 text-secondary mb-2" />
              <CardTitle>Unit Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Public land percentages, unit sizes, and geographic data
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-subtle hover:shadow-medium transition-shadow">
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Advanced Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Filter by preference points, weapon type, season, and more
              </p>
            </CardContent>
          </Card>
          
        </div>
        <div className="flex justify-center mt-6">
          <Card className="shadow-subtle hover:shadow-medium transition-shadow md:w-1/2">
            <CardHeader>
              <Tag className="h-10 w-10 text-accent mb-2" />
              <CardTitle>Over The Counter Tag Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Analyze over the counter tags with the most up to date harvest and unit data available
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Future Plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>We're constantly working to improve TalloTags and expand our coverage. Future updates will include additional states, more species, and enhanced data visualization tools.</p>
          <p>
            All data is sourced from official Colorado Parks & Wildlife publications and is updated annually after each draw and hunting season.
          </p>
        </CardContent>
      </Card>

      <Card id="contact" className="shadow-medium mt-12">
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="name" render={({
              field
            }) => <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              <FormField control={form.control} name="email" render={({
              field
            }) => <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              <FormField control={form.control} name="subject" render={({
              field
            }) => <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="General Question">General Question</SelectItem>
                        <SelectItem value="Report a bug">Report a bug</SelectItem>
                        <SelectItem value="Advertising">Advertising</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>} />
              <FormField control={form.control} name="message" render={({
              field
            }) => <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us what's on your mind..." className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
<Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>;
}