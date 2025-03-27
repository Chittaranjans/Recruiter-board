'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  UserIcon, 
  BriefcaseIcon, 
  ClipboardCheckIcon, 
  UsersIcon, 
  CalendarIcon,
  KanbanIcon
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="border-b">
        <div className="container flex items-center justify-between py-4 mx-auto">
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Recruitment Tracker</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/auth/login')}>
              Log in
            </Button>
            <Button onClick={() => router.push('/auth/register')}>
              Sign up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-background py-20">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Streamline Your <span className="text-primary">Recruitment</span> Process
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                A comprehensive platform for managing job postings, candidates, interviews,
                and hiring decisions—all in one place.
              </p>
              <div className="flex gap-4 pt-4">
                <Button size="lg" onClick={() => router.push('/auth/login')}>
                  Get Started
                </Button>
                <Button variant="outline" size="lg" onClick={() => router.push('/auth/register')}>
                  Create Account
                </Button>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <Image
                src="/recruitment-hero.svg"
                alt="Recruitment Illustration"
                width={500}
                height={400}
                className="dark:invert"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BriefcaseIcon className="h-10 w-10 text-primary" />}
              title="Job Management"
              description="Create, edit, and publish job postings with detailed descriptions and requirements."
            />
            <FeatureCard 
              icon={<UsersIcon className="h-10 w-10 text-primary" />}
              title="Candidate Tracking"
              description="Organize candidates by status and track their progress through your hiring pipeline."
            />
            <FeatureCard 
              icon={<CalendarIcon className="h-10 w-10 text-primary" />}
              title="Interview Scheduling"
              description="Schedule interviews, send notifications, and track upcoming appointments."
            />
            <FeatureCard 
              icon={<ClipboardCheckIcon className="h-10 w-10 text-primary" />}
              title="Feedback Collection"
              description="Gather standardized feedback from interviewers to make informed hiring decisions."
            />
            <FeatureCard 
              icon={<KanbanIcon className="h-10 w-10 text-primary" />}
              title="Kanban Board View"
              description="Visualize your recruitment pipeline with a customizable Kanban board interface."
            />
            <FeatureCard 
              icon={<UserIcon className="h-10 w-10 text-primary" />}
              title="Role-Based Access"
              description="Assign roles to team members with appropriate permissions for their responsibilities."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container px-4 mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Recruitment Process?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join hundreds of companies that have streamlined their hiring with our platform.
          </p>
          <Button size="lg" onClick={() => router.push('/register')}>
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-8 mt-auto">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} Recruitment Tracking System
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/about" className="text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                Contact
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
