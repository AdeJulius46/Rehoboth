"use client";

import { Mail, Lock, ShoppingCart, Package, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { FormSection } from "@/components/forms/form-section";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export default function ComponentsPlayground() {
  return (
    <div className="mx-auto max-w-5xl space-y-12 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Component Playground</h1>
        <p className="text-sm text-muted-foreground">
          Visual QA surface for Phase 1 design-system primitives — compare against Figma.
        </p>
      </div>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="default">Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Text Inputs">
        <div className="grid max-w-md gap-4">
          <TextInput label="Email" icon={Mail} placeholder="Enter your email" />
          <TextInput
            label="Password"
            icon={Lock}
            type="password"
            placeholder="Enter your password"
            hint="Must be at least 8 characters"
          />
          <TextInput label="Email" defaultValue="not-an-email" error="Enter a valid email address" />
        </div>
      </Section>

      <Section title="Select & Textarea">
        <div className="grid max-w-md gap-4">
          <Select items={{ active: "Active", inactive: "Inactive" }} defaultValue="active">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Textarea placeholder="Notes" />
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <StatusBadge label="Paid" variant="success" />
          <StatusBadge label="Pending" variant="warning" />
          <StatusBadge label="Overdue" variant="danger" />
          <StatusBadge label="Draft" variant="neutral" />
        </div>
      </Section>

      <Section title="Stat Cards">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Revenue"
            value="₦12,450,000"
            icon={ShoppingCart}
            delta={{ value: "18.4%", direction: "up" }}
            caption="this month"
          />
          <StatCard
            label="Total Sales"
            value="₦7,820,000"
            icon={Package}
            delta={{ value: "10.2%", direction: "up" }}
            caption="this month"
          />
          <StatCard
            label="Total Customers"
            value="1,245"
            icon={Users}
            delta={{ value: "3.1%", direction: "down" }}
            caption="vs yesterday"
          />
          <StatCard label="Total Staff" value="52" icon={Users} caption="active" />
        </div>
      </Section>

      <Section title="Page Header">
        <Card className="p-4">
          <PageHeader
            title="Customers"
            count={1245}
            action={{ label: "Add Customer", href: "/customers/new" }}
          />
        </Card>
      </Section>

      <Section title="Form Section">
        <FormSection title="Product Information" description="Basic details about the product">
          <TextInput label="Product Name" placeholder="e.g. Wireless Headphone" />
          <TextInput label="SKU" placeholder="e.g. WH-1001" />
        </FormSection>
      </Section>

      <Section title="Card, Dialog, Dropdown">
        <div className="flex flex-wrap items-center gap-4">
          <Card className="w-64 p-4">
            <CardHeader className="p-0">
              <CardTitle>Card title</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-2 text-muted-foreground">
              Card body content goes here.
            </CardContent>
          </Card>

          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>Open Dialog</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete customer?</DialogTitle>
                <DialogDescription>This action cannot be undone.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                <Button variant="destructive">
                  <Trash2 />
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>Row actions</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>View</DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={() => toast.success("Customer created successfully")}>
            Trigger Toast
          </Button>
        </div>
      </Section>

      <Section title="Skeleton, Avatar, Tabs">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>MJ</AvatarFallback>
            </Avatar>
          </div>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">Overview panel content.</TabsContent>
            <TabsContent value="activity">Activity panel content.</TabsContent>
          </Tabs>
        </div>
      </Section>

      <Section title="Empty State & Pagination">
        <Card className="p-0">
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Get started by adding your first customer."
            action={{ label: "Add Customer", onClick: () => toast("Add customer clicked") }}
          />
        </Card>
        <Pagination page={2} pageCount={5} totalItems={48} pageSize={10} onPageChange={() => {}} />
      </Section>
    </div>
  );
}
