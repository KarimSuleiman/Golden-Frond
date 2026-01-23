import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCreateCar } from "@/hooks/use-cars";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertCarSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

export default function Admin() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const createCarMutation = useCreateCar();
  
  const form = useForm<z.infer<typeof insertCarSchema>>({
    resolver: zodResolver(insertCarSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      vin: "",
      color: "",
      imageUrl: "",
      status: "Purchased",
      userId: user?.id || "",
    }
  });

  // Auto-fill user ID when available
  if (user && !form.getValues("userId")) {
    form.setValue("userId", user.id);
  }

  const onSubmit = (data: z.infer<typeof insertCarSchema>) => {
    createCarMutation.mutate(data, {
      onSuccess: () => {
        form.reset({
          make: "",
          model: "",
          year: new Date().getFullYear(),
          vin: "",
          color: "",
          imageUrl: "",
          status: "Purchased",
          userId: user?.id || "",
        });
      }
    });
  };

  if (isAuthLoading) return null;
  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-white hover:bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-white/10 shadow-xl shadow-black/40">
            <CardHeader>
              <CardTitle className="text-2xl font-display">Add Vehicle to Inventory</CardTitle>
              <CardDescription>Manually add a car to the database (Admin/Demo Mode)</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="make"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Make</Label>
                          <FormControl>
                            <Input placeholder="Mercedes-Benz" className="bg-background/50 border-white/10" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Model</Label>
                          <FormControl>
                            <Input placeholder="S-Class" className="bg-background/50 border-white/10" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Year</Label>
                          <FormControl>
                            <Input 
                              type="number" 
                              className="bg-background/50 border-white/10" 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Color</Label>
                          <FormControl>
                            <Input placeholder="Obsidian Black" className="bg-background/50 border-white/10" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="vin"
                    render={({ field }) => (
                      <FormItem>
                        <Label>VIN (Chassis Number)</Label>
                        <FormControl>
                          <Input placeholder="W1K..." className="bg-background/50 border-white/10 font-mono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Status</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50 border-white/10">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Purchased">Purchased</SelectItem>
                              <SelectItem value="Reserved">Reserved</SelectItem>
                              <SelectItem value="In Transit">In Transit</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Just hiding userId input but keeping it in form state */}
                    <div className="hidden">
                       <Input {...form.register("userId")} />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Image URL</Label>
                        <FormControl>
                          <Input placeholder="https://..." className="bg-background/50 border-white/10" {...field} />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">Tip: Use Unsplash URL for demo</p>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                    disabled={createCarMutation.isPending}
                  >
                    {createCarMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> Add to Inventory
                      </>
                    )}
                  </Button>

                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
