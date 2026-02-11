import { useState, useMemo } from "react";
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
import { Loader2, Plus, Users, Car, Upload, Trash2, Edit, X, Search, Filter, Key, Eye, EyeOff } from "lucide-react";
import type { Car as CarType } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";

interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: string | null;
  role: string;
  createdAt: Date | null;
}

export default function Admin() {
  const { toast } = useToast();
  const { t, language, dir } = useLanguage();
  const queryClient = useQueryClient();
  const [showAddCar, setShowAddCar] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [existingAdditionalImages, setExistingAdditionalImages] = useState<string[]>([]);
  const [editingCar, setEditingCar] = useState<CarType | null>(null);
  
  // Filter states
  const [filterByUserId, setFilterByUserId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterMake, setFilterMake] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  
  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Expanded user states
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

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
    customUrl: "",
    customUrlReason: "",
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

  const { data: adminInfo } = useQuery<{ isAdmin: boolean; role: string; isMainAdmin: boolean }>({
    queryKey: ["/api/auth/is-admin"],
  });

  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: t("admin.roleUpdated") });
    },
    onError: (error: Error) => {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("admin.passwordChanged") });
      setShowPasswordModal(false);
      setSelectedUserForPassword(null);
      setNewPassword("");
    },
    onError: (error: Error) => {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
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
      customUrl: "",
      customUrlReason: "",
    });
    setSelectedUserId("");
    setImageFile(null);
    setImagePreview("");
    setAdditionalImages([]);
    setAdditionalPreviews([]);
    setExistingAdditionalImages([]);
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

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAdditionalImages((prev) => [...prev, ...files]);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAdditionalPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingAdditionalImage = (index: number) => {
    setExistingAdditionalImages((prev) => prev.filter((_, i) => i !== index));
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

    // Upload additional images
    const uploadedAdditionalImages: string[] = [...existingAdditionalImages];
    for (const file of additionalImages) {
      try {
        const result = await uploadMutation.mutateAsync(file);
        uploadedAdditionalImages.push(result.imageUrl);
      } catch {
        return;
      }
    }

    const carData = {
      ...carForm,
      userId: editingCar ? editingCar.userId : selectedUserId,
      imageUrl,
      images: uploadedAdditionalImages.length > 0 ? uploadedAdditionalImages : null,
      price: carForm.price || null,
      containerNumber: carForm.containerNumber || null,
      bookingNumber: carForm.bookingNumber || null,
      trackingUrl: carForm.trackingUrl || null,
      customUrl: carForm.customUrl || null,
      customUrlReason: carForm.customUrlReason || null,
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
      customUrl: car.customUrl || "",
      customUrlReason: car.customUrlReason || "",
    });
    setImagePreview(car.imageUrl);
    setExistingAdditionalImages(car.images || []);
    setShowAddCar(true);
  };

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName || ""} ${user.lastName || ""} (${user.email})` : userId;
  };

  // Get unique values for filter dropdowns
  const uniqueMakes = useMemo(() => {
    const makes = Array.from(new Set(cars.map((car) => car.make)));
    return makes.sort();
  }, [cars]);

  const uniqueYears = useMemo(() => {
    const years = Array.from(new Set(cars.map((car) => car.year)));
    return years.sort((a, b) => b - a);
  }, [cars]);

  // Filter cars
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // Filter by user
      if (filterByUserId && car.userId !== filterByUserId) return false;
      
      // Filter by search query (name, model, VIN)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          car.make.toLowerCase().includes(query) ||
          car.model.toLowerCase().includes(query) ||
          car.vin.toLowerCase().includes(query) ||
          car.color.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Filter by make
      if (filterMake && filterMake !== "all" && car.make !== filterMake) return false;
      
      // Filter by year
      if (filterYear && filterYear !== "all" && car.year !== parseInt(filterYear)) return false;
      
      // Filter by status
      if (filterStatus && filterStatus !== "all" && car.status !== filterStatus) return false;
      
      return true;
    });
  }, [cars, filterByUserId, searchQuery, filterMake, filterYear, filterStatus]);

  const clearFilters = () => {
    setFilterByUserId("");
    setSearchQuery("");
    setFilterMake("");
    setFilterYear("");
    setFilterStatus("");
  };

  const hasActiveFilters = filterByUserId || searchQuery || filterMake || filterYear || filterStatus;

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
              {/* Show All button */}
              {filterByUserId && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mb-3"
                  onClick={() => setFilterByUserId("")}
                  data-testid="button-show-all-users"
                >
                  {t("admin.filter.all")}
                </Button>
              )}
              {loadingUsers ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => {
                    const userCars = cars.filter(c => c.userId === user.id);
                    const isExpanded = expandedUserId === user.id;
                    
                    return (
                      <div
                        key={user.id}
                        className={`rounded-lg border transition-all ${
                          filterByUserId === user.id 
                            ? "bg-primary/10 border-primary" 
                            : "bg-secondary border-border hover:border-primary/50"
                        }`}
                        data-testid={`user-card-${user.id}`}
                      >
                        <div className="p-3">
                          <div 
                            className="cursor-pointer"
                            onClick={() => {
                              setExpandedUserId(isExpanded ? null : user.id);
                              setFilterByUserId(filterByUserId === user.id ? "" : user.id);
                            }}
                          >
                            <p className="font-bold text-foreground">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground" dir="ltr">
                              {user.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                user.role === "main_admin" ? "bg-red-500/20 text-red-600" :
                                user.role === "backup_admin" ? "bg-orange-500/20 text-orange-600" :
                                user.role === "trader" ? "bg-blue-500/20 text-blue-600" :
                                "bg-green-500/20 text-green-600"
                              }`}>
                                {t(`admin.role.${user.role}`)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {userCars.length} {t("admin.cars")}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 text-muted-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUserForPassword(user);
                                setShowPasswordModal(true);
                              }}
                              data-testid={`button-change-password-${user.id}`}
                            >
                              <Key className="w-4 h-4" />
                              <span className={language === "ar" ? "mr-1" : "ml-1"}>{t("admin.changePassword")}</span>
                            </Button>
                          </div>
                          {adminInfo?.isMainAdmin && user.role !== "main_admin" && (
                            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                              <Select 
                                value={user.role} 
                                onValueChange={(role) => changeRoleMutation.mutate({ userId: user.id, role })}
                              >
                                <SelectTrigger data-testid={`select-role-${user.id}`}>
                                  <SelectValue placeholder={t("admin.selectRole")} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">{t("admin.role.user")}</SelectItem>
                                  <SelectItem value="trader">{t("admin.role.trader")}</SelectItem>
                                  <SelectItem value="backup_admin">{t("admin.role.backup_admin")}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                        
                        {/* Expanded Cars Section */}
                        {isExpanded && userCars.length > 0 && (
                          <div className="border-t border-border p-3 space-y-2">
                            {userCars.map((car) => (
                              <div 
                                key={car.id} 
                                className="flex gap-3 p-2 rounded-lg bg-card border border-border"
                                data-testid={`user-car-${car.id}`}
                              >
                                <img
                                  src={car.imageUrl}
                                  alt={`${car.make} ${car.model}`}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-foreground truncate">
                                    {car.make} {car.model} {car.year}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{car.color}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span
                                      className={`text-xs px-1.5 py-0.5 rounded ${
                                        car.status === "In Transit"
                                          ? "bg-blue-500/20 text-blue-600"
                                          : car.status === "Purchased"
                                          ? "bg-green-500/20 text-green-600"
                                          : "bg-yellow-500/20 text-yellow-600"
                                      }`}
                                    >
                                      {car.status === "In Transit"
                                        ? t("car.status.inTransit")
                                        : car.status === "Purchased"
                                        ? t("car.status.purchased")
                                        : t("car.status.reserved")}
                                    </span>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleEdit(car)}
                                      data-testid={`button-edit-user-car-${car.id}`}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {isExpanded && userCars.length === 0 && (
                          <div className="border-t border-border p-3 text-center text-sm text-muted-foreground">
                            {t("dashboard.noCars")}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  {t("admin.cars")} ({filteredCars.length}{hasActiveFilters ? ` / ${cars.length}` : ""})
                </div>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                    <X className="w-4 h-4" />
                    {t("admin.filter.clear")}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filter Controls */}
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <Search className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                  <Input
                    placeholder={t("admin.filter.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={language === "ar" ? "pr-10" : "pl-10"}
                    data-testid="input-search-cars"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Select value={filterMake} onValueChange={setFilterMake}>
                    <SelectTrigger data-testid="select-filter-make">
                      <SelectValue placeholder={t("admin.filter.allMakes")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("admin.filter.allMakes")}</SelectItem>
                      {uniqueMakes.map((make) => (
                        <SelectItem key={make} value={make}>{make}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger data-testid="select-filter-year">
                      <SelectValue placeholder={t("admin.filter.allYears")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("admin.filter.allYears")}</SelectItem>
                      {uniqueYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger data-testid="select-filter-status">
                      <SelectValue placeholder={t("admin.filter.allStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("admin.filter.allStatus")}</SelectItem>
                      <SelectItem value="Purchased">{t("car.status.purchased")}</SelectItem>
                      <SelectItem value="Reserved">{t("car.status.reserved")}</SelectItem>
                      <SelectItem value="In Transit">{t("car.status.inTransit")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {loadingCars ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : filteredCars.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {hasActiveFilters ? t("admin.filter.results") + " 0" : "لا توجد سيارات بعد"}
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredCars.map((car) => (
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
                    <Label>الصورة الرئيسية {!editingCar && "*"}</Label>
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

                  <div className="space-y-2">
                    <Label>صور إضافية (اختياري)</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {existingAdditionalImages.map((img, idx) => (
                        <div key={`existing-${idx}`} className="relative">
                          <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeExistingAdditionalImage(idx)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center text-xs"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {additionalPreviews.map((preview, idx) => (
                        <div key={`new-${idx}`} className="relative">
                          <img src={preview} alt="" className="w-16 h-16 object-cover rounded-lg border-2 border-primary" />
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(idx)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center text-xs"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors w-fit">
                      <Plus className="w-4 h-4" />
                      <span>إضافة صور</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAdditionalImagesChange}
                        className="hidden"
                        data-testid="input-additional-images"
                      />
                    </label>
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
                    <Label>رابط مخصص (اختياري)</Label>
                    <Input
                      value={carForm.customUrl}
                      onChange={(e) => setCarForm({ ...carForm, customUrl: e.target.value })}
                      placeholder="https://..."
                      dir="ltr"
                      data-testid="input-custom-url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>سبب إضافة الرابط</Label>
                    <Textarea
                      value={carForm.customUrlReason}
                      onChange={(e) => setCarForm({ ...carForm, customUrlReason: e.target.value })}
                      placeholder="اشرح لماذا تمت إضافة هذا الرابط..."
                      data-testid="input-custom-url-reason"
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

        {/* Password Change Modal */}
        {showPasswordModal && selectedUserForPassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    {t("admin.changePassword")}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setSelectedUserForPassword(null);
                      setNewPassword("");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="font-bold">{selectedUserForPassword.firstName} {selectedUserForPassword.lastName}</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">{selectedUserForPassword.email}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t("admin.newPassword")}</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className={language === "ar" ? "pl-10" : "pr-10"}
                      data-testid="input-admin-new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className={`absolute ${language === "ar" ? "left-3" : "right-3"} top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors`}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  className="w-full"
                  disabled={changePasswordMutation.isPending || newPassword.length < 6}
                  onClick={() => {
                    if (selectedUserForPassword && newPassword.length >= 6) {
                      changePasswordMutation.mutate({
                        userId: selectedUserForPassword.id,
                        password: newPassword,
                      });
                    }
                  }}
                  data-testid="button-submit-password-change"
                >
                  {changePasswordMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t("admin.changePassword")
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
