import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Plus, Users, Car, Upload, Trash2, Edit, X } from "lucide-react";
import type { Car as CarType } from "@shared/schema";

interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: string | null;
  createdAt: Date | null;
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddCar, setShowAddCar] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [editingCar, setEditingCar] = useState<CarType | null>(null);

  const [carForm, setCarForm] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vin: "",
    color: "",
    status: "Purchased",
    price: 0,
    details: "",
    containerNumber: "",
    bookingNumber: "",
    trackingUrl: "",
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: cars = [], isLoading: loadingCars } = useQuery<CarType[]>({
    queryKey: ["/api/admin/cars"],
  });

  const { data: isAdminCheck, isLoading: checkingAdmin } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/auth/is-admin"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("فشل رفع الصورة");
      return res.json();
    },
  });

  const createCarMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/cars", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cars"] });
      toast({ title: "تم إضافة السيارة بنجاح" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const updateCarMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PUT", `/api/admin/cars/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cars"] });
      toast({ title: "تم تحديث السيارة بنجاح" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const deleteCarMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/cars/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cars"] });
      toast({ title: "تم حذف السيارة" });
    },
    onError: (error: Error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setCarForm({
      make: "",
      model: "",
      year: new Date().getFullYear(),
      vin: "",
      color: "",
      status: "Purchased",
      price: 0,
      details: "",
      containerNumber: "",
      bookingNumber: "",
      trackingUrl: "",
    });
    setSelectedUserId("");
    setImageFile(null);
    setImagePreview("");
    setShowAddCar(false);
    setEditingCar(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCar && !selectedUserId) {
      toast({ title: "خطأ", description: "يرجى اختيار المستخدم", variant: "destructive" });
      return;
    }

    let imageUrl = editingCar?.imageUrl || "";

    if (imageFile) {
      try {
        const result = await uploadMutation.mutateAsync(imageFile);
        imageUrl = result.imageUrl;
      } catch {
        return;
      }
    }

    if (!imageUrl && !editingCar) {
      toast({ title: "خطأ", description: "يرجى رفع صورة للسيارة", variant: "destructive" });
      return;
    }

    const carData = {
      ...carForm,
      userId: editingCar ? editingCar.userId : selectedUserId,
      imageUrl,
      price: carForm.price || null,
      containerNumber: carForm.containerNumber || null,
      bookingNumber: carForm.bookingNumber || null,
      trackingUrl: carForm.trackingUrl || null,
      details: carForm.details || null,
    };

    if (editingCar) {
      updateCarMutation.mutate({ id: editingCar.id, data: carData });
    } else {
      createCarMutation.mutate(carData);
    }
  };

  const handleEdit = (car: CarType) => {
    setEditingCar(car);
    setCarForm({
      make: car.make,
      model: car.model,
      year: car.year,
      vin: car.vin,
      color: car.color,
      status: car.status,
      price: car.price || 0,
      details: car.details || "",
      containerNumber: car.containerNumber || "",
      bookingNumber: car.bookingNumber || "",
      trackingUrl: car.trackingUrl || "",
    });
    setImagePreview(car.imageUrl);
    setShowAddCar(true);
  };

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName || ""} ${user.lastName || ""} (${user.email})` : userId;
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdminCheck?.isAdmin) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">غير مصرح لك بالوصول لهذه الصفحة</h1>
          <p className="text-muted-foreground mt-4">هذه الصفحة للمسؤولين فقط</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <div className="container py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
          <Button onClick={() => setShowAddCar(true)} data-testid="button-add-car">
            <Plus className="w-4 h-4 ml-2" />
            إضافة سيارة
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                المستخدمين ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 rounded-lg bg-secondary border border-border"
                      data-testid={`user-card-${user.id}`}
                    >
                      <p className="font-bold text-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground" dir="ltr">
                        {user.email}
                      </p>
                      {user.isAdmin === "true" && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                          مسؤول
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                السيارات ({cars.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCars ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : cars.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">لا توجد سيارات بعد</p>
              ) : (
                <div className="space-y-4">
                  {cars.map((car) => (
                    <div
                      key={car.id}
                      className="flex gap-4 p-4 rounded-lg bg-secondary border border-border"
                      data-testid={`car-card-${car.id}`}
                    >
                      <img
                        src={car.imageUrl}
                        alt={`${car.make} ${car.model}`}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-foreground">
                              {car.make} {car.model} {car.year}
                            </h3>
                            <p className="text-sm text-muted-foreground">{car.color}</p>
                            <p className="text-xs text-muted-foreground mt-1" dir="ltr">
                              VIN: {car.vin}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              car.status === "In Transit"
                                ? "bg-blue-500/20 text-blue-600"
                                : car.status === "Purchased"
                                ? "bg-green-500/20 text-green-600"
                                : "bg-yellow-500/20 text-yellow-600"
                            }`}
                          >
                            {car.status === "In Transit"
                              ? "في الطريق"
                              : car.status === "Purchased"
                              ? "مشتراة"
                              : "محجوزة"}
                          </span>
                        </div>
                        <p className="text-xs text-primary mt-2">المالك: {getUserName(car.userId)}</p>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(car)} data-testid={`button-edit-car-${car.id}`}>
                            <Edit className="w-3 h-3 ml-1" />
                            تعديل
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteCarMutation.mutate(car.id)}
                            disabled={deleteCarMutation.isPending}
                            data-testid={`button-delete-car-${car.id}`}
                          >
                            <Trash2 className="w-3 h-3 ml-1" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {showAddCar && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle>{editingCar ? "تعديل السيارة" : "إضافة سيارة جديدة"}</CardTitle>
                <Button size="icon" variant="ghost" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!editingCar && (
                    <div className="space-y-2">
                      <Label>المستخدم *</Label>
                      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                        <SelectTrigger data-testid="select-user">
                          <SelectValue placeholder="اختر المستخدم" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>صورة السيارة {!editingCar && "*"}</Label>
                    <div className="flex items-center gap-4">
                      {imagePreview && (
                        <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                      )}
                      <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>اختر صورة</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          data-testid="input-image"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الشركة المصنعة *</Label>
                      <Input
                        value={carForm.make}
                        onChange={(e) => setCarForm({ ...carForm, make: e.target.value })}
                        placeholder="Toyota"
                        required
                        data-testid="input-make"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الموديل *</Label>
                      <Input
                        value={carForm.model}
                        onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
                        placeholder="Land Cruiser"
                        required
                        data-testid="input-model"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>سنة الصنع *</Label>
                      <Input
                        type="number"
                        value={carForm.year}
                        onChange={(e) => setCarForm({ ...carForm, year: parseInt(e.target.value) })}
                        required
                        data-testid="input-year"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>اللون *</Label>
                      <Input
                        value={carForm.color}
                        onChange={(e) => setCarForm({ ...carForm, color: e.target.value })}
                        placeholder="أبيض لؤلؤي"
                        required
                        data-testid="input-color"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>رقم الشاصي (VIN) *</Label>
                    <Input
                      value={carForm.vin}
                      onChange={(e) => setCarForm({ ...carForm, vin: e.target.value })}
                      placeholder="JTMHT05J123456789"
                      dir="ltr"
                      required
                      data-testid="input-vin"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الحالة *</Label>
                      <Select
                        value={carForm.status}
                        onValueChange={(value) => setCarForm({ ...carForm, status: value })}
                      >
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Purchased">مشتراة</SelectItem>
                          <SelectItem value="Reserved">محجوزة</SelectItem>
                          <SelectItem value="In Transit">في الطريق</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>السعر (اختياري)</Label>
                      <Input
                        type="number"
                        value={carForm.price || ""}
                        onChange={(e) => setCarForm({ ...carForm, price: parseInt(e.target.value) || 0 })}
                        placeholder="50000"
                        data-testid="input-price"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>رقم الكونتينر</Label>
                      <Input
                        value={carForm.containerNumber}
                        onChange={(e) => setCarForm({ ...carForm, containerNumber: e.target.value })}
                        placeholder="MSCU7654321"
                        dir="ltr"
                        data-testid="input-container"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>رقم الحجز</Label>
                      <Input
                        value={carForm.bookingNumber}
                        onChange={(e) => setCarForm({ ...carForm, bookingNumber: e.target.value })}
                        placeholder="BKG-2024-001234"
                        dir="ltr"
                        data-testid="input-booking"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>رابط التتبع</Label>
                    <Input
                      value={carForm.trackingUrl}
                      onChange={(e) => setCarForm({ ...carForm, trackingUrl: e.target.value })}
                      placeholder="https://..."
                      dir="ltr"
                      data-testid="input-tracking"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>تفاصيل إضافية</Label>
                    <Textarea
                      value={carForm.details}
                      onChange={(e) => setCarForm({ ...carForm, details: e.target.value })}
                      placeholder="أي تفاصيل إضافية عن السيارة..."
                      data-testid="input-details"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={createCarMutation.isPending || updateCarMutation.isPending || uploadMutation.isPending}
                      data-testid="button-submit-car"
                    >
                      {(createCarMutation.isPending || updateCarMutation.isPending || uploadMutation.isPending) && (
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      )}
                      {editingCar ? "تحديث السيارة" : "إضافة السيارة"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      إلغاء
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
