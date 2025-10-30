import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-2xl mx-auto text-center">
        <Card className="shadow-medium">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-secondary/20 p-4">
                <Construction className="h-12 w-12 text-secondary" />
              </div>
            </div>
            <CardTitle className="text-3xl">{title}</CardTitle>
            <CardDescription className="text-lg">{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              We're currently converting this page from the original static version to the new React-based platform. 
              All the powerful filtering and data analysis features you're familiar with will be available soon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button variant="default">Back to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
