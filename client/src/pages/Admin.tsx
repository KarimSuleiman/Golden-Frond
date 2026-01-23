import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCreateCar } from "@/hooks/use-cars";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, ArrowLeft, RefreshCw, Database } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertCarSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const createCarMutation = useCreateCar();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const reseedMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/reseed");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
      toast({
        title: "تم تحميل البيانات التجريبية",
        description: `تم تحميل ${data.cars?.length || 0} سيارات تجريبية بنجاح مع معلومات التتبع.`,
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات التجريبية. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });
  
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
          <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-foreground hover:bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" /> العودة للسيارات
          </Button>
        </Link>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Demo Data Section */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                تحميل بيانات تجريبية
              </CardTitle>
              <CardDescription>
                تحميل سيارات تجريبية مع معلومات الشحن والتتبع لاختبار النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => reseedMutation.mutate()}
                disabled={reseedMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-load-demo"
              >
                {reseedMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري التحميل...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" /> تحميل سيارات تجريبية مع معلومات التتبع
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                سيتم استبدال السيارات الحالية ببيانات تجريبية تتضمن أرقام الكونتينر والحجز وروابط التتبع.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-display">إضافة سيارة جديدة</CardTitle>
              <CardDescription>إضافة سيارة يدوياً لقاعدة البيانات (وضع الأدمن)</CardDescription>
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
                          <Label>الشركة المصنعة</Label>
                          <FormControl>
                            <Input placeholder="Toyota" className="bg-secondary border-border" {...field} />
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
                          <Label>الموديل</Label>
                          <FormControl>
                            <Input placeholder="Land Cruiser" className="bg-secondary border-border" {...field} />
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
                          <Label>سنة الصنع</Label>
                          <FormControl>
                            <Input 
                              type="number" 
                              className="bg-secondary border-border" 
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
                          <Label>اللون</Label>
                          <FormControl>
                            <Input placeholder="أبيض لؤلؤي" className="bg-secondary border-border" {...field} />
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
                        <Label>رقم الشاصي (VIN)</Label>
                        <FormControl>
                          <Input placeholder="JTMHT05J..." className="bg-secondary border-border font-mono" {...field} />
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
                          <Label>حالة السيارة</Label>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-secondary border-border">
                                <SelectValue placeholder="اختر الحالة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Purchased">تم الشراء</SelectItem>
                              <SelectItem value="Reserved">محجوز</SelectItem>
                              <SelectItem value="In Transit">قيد الشحن</SelectItem>
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
                        <Label>رابط الصورة</Label>
                        <FormControl>
                          <Input placeholder="https://..." className="bg-secondary border-border" {...field} />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">نصيحة: استخدم رابط من Unsplash للتجربة</p>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground font-bold"
                    disabled={createCarMutation.isPending}
                    data-testid="button-add-car"
                  >
                    {createCarMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري الإضافة...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> إضافة للمخزون
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
