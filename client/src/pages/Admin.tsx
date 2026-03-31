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
import { Loader2, Plus, Users, Car, Upload, Trash2, Edit, X, Search, Filter, Key, Eye, EyeOff, Heart, Clock, FileText, ShoppingCart } from "lucide-react";
import type { Car as CarType, Listing } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  isAdmin: string | null;
  role: string;
  createdAt: Date | null;
  lastActiveAt: string | null;
  favoritesCount: number;
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
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [listingForm, setListingForm] = useState<Partial<Listing>>({});
  const [listingImageFile, setListingImageFile] = useState<File | null>(null);
  const [listingImagePreview, setListingImagePreview] = useState<string>("");

  // Filter states
  const [filterByUserId, setFilterByUserId] = useState<string>("");
  const [filterByRole, setFilterByRole] = useState<string>("");
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
    interiorFeatures: [] as string[],
    exteriorFeatures: [] as string[],
  });

  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [pdfFileNames, setPdfFileNames] = useState<string[]>([]);
  const [existingPdfUrls, setExistingPdfUrls] = useState<string[]>([]);

  const { data: users = [], isLoading: loadingUsers } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: cars = [], isLoading: loadingCars } = useQuery<CarType[]>({
    queryKey: ["/api/admin/cars"],
  });

  const { data: allListings = [], isLoading: loadingListings } = useQuery<Listing[]>({
    queryKey: ["/api/listings"],
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

  const uploadPdfMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("pdf", file);
      const res = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("فشل رفع ملف PDF");
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

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cars"] });
      toast({ title: t("admin.userDeleted") });
      setExpandedUserId(null);
      setFilterByUserId("");
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
      toast({ title: t("admin.carDeleted") });
    },
    onError: (error: Error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const updateListingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Listing> }) => {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("فشل تحديث الإعلان");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      setEditingListing(null);
      toast({ title: "تم تحديث الإعلان" });
    },
    onError: (error: Error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const deleteListingMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("فشل حذف الإعلان");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({ title: "تم حذف الإعلان" });
    },
    onError: (error: Error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const openEditListing = (listing: Listing) => {
    setEditingListing(listing);
    setListingForm({ ...listing });
    setListingImageFile(null);
    setListingImagePreview("");
  };

  const handleSaveListing = async () => {
    if (!editingListing) return;
    let imageUrl = listingForm.imageUrl || editingListing.imageUrl;
    if (listingImageFile) {
      const formData = new FormData();
      formData.append("image", listingImageFile);
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) {
        toast({ title: "خطأ", description: "فشل رفع الصورة", variant: "destructive" });
        return;
      }
      const data = await res.json();
      imageUrl = data.imageUrl;
    }
    updateListingMutation.mutate({ id: editingListing.id, data: { ...listingForm, imageUrl } });
  };

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
      interiorFeatures: [],
      exteriorFeatures: [],
    });
    setSelectedUserId("");
    setImageFile(null);
    setImagePreview("");
    setAdditionalImages([]);
    setAdditionalPreviews([]);
    setExistingAdditionalImages([]);
    setPdfFiles([]);
    setPdfFileNames([]);
    setExistingPdfUrls([]);
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

    // Image is optional — no required check

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

    // Upload any new PDFs
    const uploadedPdfUrls: string[] = [...existingPdfUrls];
    for (const file of pdfFiles) {
      try {
        const result = await uploadPdfMutation.mutateAsync(file);
        uploadedPdfUrls.push(result.pdfUrl);
      } catch {
        toast({ title: "خطأ", description: "فشل رفع أحد ملفات PDF", variant: "destructive" });
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
      pdfUrl: uploadedPdfUrls[0] || null,
      pdfUrls: uploadedPdfUrls.length > 0 ? uploadedPdfUrls : null,
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
      interiorFeatures: car.interiorFeatures || [],
      exteriorFeatures: car.exteriorFeatures || [],
    });
    setImagePreview(car.imageUrl);
    setExistingAdditionalImages(car.images || []);
    setExistingPdfUrls(car.pdfUrls || (car.pdfUrl ? [car.pdfUrl] : []));
    setPdfFiles([]);
    setPdfFileNames([]);
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
          <h1 className="text-2xl font-bold text-foreground">{t("admin.unauthorized")}</h1>
          <p className="text-muted-foreground mt-4">{t("admin.adminOnly")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <div className="container py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t("admin.title")}</h1>
          <Button onClick={() => setShowAddCar(true)} data-testid="button-add-car">
            <Plus className="w-4 h-4 ml-2" />
            {t("admin.addCar")}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t("admin.users")} ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <Select value={filterByRole} onValueChange={setFilterByRole}>
                  <SelectTrigger data-testid="select-filter-role">
                    <SelectValue placeholder={t("admin.filter.allRoles")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("admin.filter.allRoles")}</SelectItem>
                    <SelectItem value="user">{t("admin.role.user")}</SelectItem>
                    <SelectItem value="trader">{t("admin.role.trader")}</SelectItem>
                    <SelectItem value="backup_admin">{t("admin.role.backup_admin")}</SelectItem>
                    <SelectItem value="main_admin">{t("admin.role.main_admin")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                  {users.filter((u) => !filterByRole || filterByRole === "all" || u.role === filterByRole).map((user) => {
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
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {user.favoritesCount}
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
                        
                        {isExpanded && (
                          <div className="border-t border-border p-3 space-y-3">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">{t("register.phone")}:</span>
                                <span className="font-medium text-foreground" dir="ltr">{user.phone || "-"}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">{t("admin.favorites")}:</span>
                                <span className="font-medium text-foreground flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  {user.favoritesCount}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">{t("admin.lastActive")}:</span>
                                <span className="font-medium text-foreground text-xs" dir="ltr" data-testid={`text-last-active-${user.id}`}>
                                  {user.lastActiveAt
                                    ? new Date(user.lastActiveAt).toLocaleString(language === "ar" ? "ar-JO" : "en-US", { dateStyle: "short", timeStyle: "short" })
                                    : t("admin.neverActive")}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">{t("login.password")}:</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">{"••••••••"}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedUserForPassword(user);
                                      setShowPasswordModal(true);
                                    }}
                                    data-testid={`button-inline-change-pw-${user.id}`}
                                  >
                                    <Key className="w-3 h-3" />
                                    <span className={language === "ar" ? "mr-1" : "ml-1"}>{t("admin.changePassword")}</span>
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {userCars.length > 0 ? (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                  {t("admin.cars")} ({userCars.length})
                                </p>
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
                            ) : (
                              <p className="text-center text-sm text-muted-foreground">
                                {t("dashboard.noCars")}
                              </p>
                            )}

                            {user.role !== "main_admin" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2 text-red-500 border-red-500/30"
                                    data-testid={`button-delete-user-${user.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span className={language === "ar" ? "mr-1" : "ml-1"}>{t("admin.deleteUser")}</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t("admin.deleteUser")}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t("admin.deleteUserConfirm")}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t("admin.form.cancel")}</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteUserMutation.mutate(user.id)}
                                      className="bg-red-500 text-white"
                                      data-testid={`button-confirm-delete-user-${user.id}`}
                                    >
                                      {t("admin.deleteUser")}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
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
                  {hasActiveFilters ? t("admin.filter.results") + " 0" : t("admin.noCars")}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredCars.map((car) => (
                    <div
                      key={car.id}
                      className="rounded-lg bg-secondary border border-border overflow-hidden"
                      data-testid={`car-card-${car.id}`}
                    >
                      <div className="relative h-32">
                        <img
                          src={car.imageUrl}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-full object-cover"
                        />
                        <span
                          className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full ${
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
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-sm text-foreground leading-tight">
                          {car.make} {car.model} {car.year}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{car.color}</p>
                        <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">VIN: {car.vin}</p>
                        <p className="text-xs text-primary mt-1 truncate">{t("admin.owner")}: {getUserName(car.userId)}</p>
                        <div className="flex gap-1.5 mt-2">
                          <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => handleEdit(car)} data-testid={`button-edit-car-${car.id}`}>
                            <Edit className="w-3 h-3 ml-1" />
                            {t("admin.edit")}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs px-2"
                            onClick={() => deleteCarMutation.mutate(car.id)}
                            disabled={deleteCarMutation.isPending}
                            data-testid={`button-delete-car-${car.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
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

        {/* Marketplace Listings Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                {t("admin.marketplace")} ({allListings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingListings ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : allListings.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">{t("admin.noListings")}</p>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {allListings.map((listing) => (
                    <div key={listing.id} className="border border-border rounded-lg overflow-hidden">
                      <div className="relative h-36">
                        <img
                          src={listing.imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full ${listing.status === "active" ? "bg-green-500/20 text-green-700" : "bg-gray-400/20 text-gray-600"}`}>
                          {listing.status === "active" ? t("admin.listing.active") : t("admin.listing.hidden")}
                        </span>
                      </div>
                      <div className="p-3 space-y-1">
                        <p className="font-semibold text-sm truncate">{listing.make} {listing.model} {listing.year}</p>
                        <p className="text-xs text-muted-foreground">{listing.price ? `${listing.price.toLocaleString()} د.أ` : "-"}</p>
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => openEditListing(listing)} data-testid={`button-edit-listing-${listing.id}`}>
                            <Edit className="w-3 h-3 ml-1" />
                            {t("admin.edit")}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 border-red-500/30" data-testid={`button-delete-listing-${listing.id}`}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("admin.deleteListing.title")}</AlertDialogTitle>
                                <AlertDialogDescription>{t("admin.deleteListing.desc")}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("admin.form.cancel")}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteListingMutation.mutate(listing.id)} className="bg-red-500 text-white">
                                  {t("admin.delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit Listing Modal */}
        {editingListing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle>{t("admin.editListing")}</CardTitle>
                <Button size="icon" variant="ghost" onClick={() => setEditingListing(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image */}
                <div className="space-y-2">
                  <Label>{t("admin.form.mainImage")}</Label>
                  <div className="flex items-center gap-3">
                    <img src={listingImagePreview || editingListing.imageUrl} alt="" className="w-20 h-20 object-cover rounded-lg" />
                    <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors text-sm">
                      <Upload className="w-4 h-4" />
                      {t("admin.form.selectImage")}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setListingImageFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => setListingImagePreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>{t("admin.form.make")}</Label>
                    <Input value={listingForm.make || ""} onChange={(e) => setListingForm(f => ({ ...f, make: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>{t("admin.form.model")}</Label>
                    <Input value={listingForm.model || ""} onChange={(e) => setListingForm(f => ({ ...f, model: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>{t("admin.form.year")}</Label>
                    <Input type="number" value={listingForm.year || ""} onChange={(e) => setListingForm(f => ({ ...f, year: parseInt(e.target.value) || null }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>{t("admin.form.price")}</Label>
                    <Input type="number" value={listingForm.price || ""} onChange={(e) => setListingForm(f => ({ ...f, price: parseInt(e.target.value) || null }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>{t("admin.form.color")}</Label>
                    <Input value={listingForm.color || ""} onChange={(e) => setListingForm(f => ({ ...f, color: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>{t("listing.mileage")}</Label>
                    <Input type="number" value={listingForm.mileage || ""} onChange={(e) => setListingForm(f => ({ ...f, mileage: parseInt(e.target.value) || null }))} />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>{t("listing.description")}</Label>
                  <Textarea rows={3} value={listingForm.description || ""} onChange={(e) => setListingForm(f => ({ ...f, description: e.target.value }))} />
                </div>

                <div className="space-y-1">
                  <Label>{t("listing.contact")}</Label>
                  <Input value={listingForm.contactPhone || ""} onChange={(e) => setListingForm(f => ({ ...f, contactPhone: e.target.value }))} />
                </div>

                <div className="space-y-1">
                  <Label>{t("admin.form.status")}</Label>
                  <Select value={listingForm.status || "active"} onValueChange={(v) => setListingForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t("admin.listing.active")}</SelectItem>
                      <SelectItem value="hidden">{t("admin.listing.hidden")}</SelectItem>
                      <SelectItem value="sold">{t("listing.sold")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button className="flex-1" onClick={handleSaveListing} disabled={updateListingMutation.isPending}>
                    {updateListingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t("admin.saveChanges")}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingListing(null)}>{t("admin.form.cancel")}</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showAddCar && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle>{editingCar ? t("admin.form.editCar") : t("admin.form.addCar")}</CardTitle>
                <Button size="icon" variant="ghost" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!editingCar && (
                    <div className="space-y-2">
                      <Label>{t("admin.form.user")} *</Label>
                      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                        <SelectTrigger data-testid="select-user">
                          <SelectValue placeholder={t("admin.form.selectUser")} />
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
                    <Label>{t("admin.form.mainImage")}</Label>
                    <div className="flex items-center gap-4">
                      {imagePreview && (
                        <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                      )}
                      <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>{t("admin.form.selectImage")}</span>
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
                    <Label>{t("admin.form.additionalImages")}</Label>
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
                    <label
                      className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors w-fit"
                      onClick={(e) => {
                        const input = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
                        if (input) input.click();
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t("admin.form.addImages")}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAdditionalImagesChange}
                        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, overflow: 'hidden' }}
                        data-testid="input-additional-images"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("admin.form.make")}</Label>
                      <Input
                        value={carForm.make}
                        onChange={(e) => setCarForm({ ...carForm, make: e.target.value })}
                        placeholder="Toyota"
                        data-testid="input-make"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.form.model")}</Label>
                      <Input
                        value={carForm.model}
                        onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
                        placeholder="Land Cruiser"
                        data-testid="input-model"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("admin.form.year")}</Label>
                      <Input
                        type="number"
                        value={carForm.year}
                        onChange={(e) => setCarForm({ ...carForm, year: parseInt(e.target.value) })}
                        data-testid="input-year"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.form.color")}</Label>
                      <Input
                        value={carForm.color}
                        onChange={(e) => setCarForm({ ...carForm, color: e.target.value })}
                        placeholder="أبيض لؤلؤي"
                        data-testid="input-color"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("admin.form.vin")}</Label>
                    <Input
                      value={carForm.vin}
                      onChange={(e) => setCarForm({ ...carForm, vin: e.target.value })}
                      placeholder="JTMHT05J123456789"
                      dir="ltr"
                      data-testid="input-vin"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("admin.form.status")}</Label>
                      <Select
                        value={carForm.status}
                        onValueChange={(value) => setCarForm({ ...carForm, status: value })}
                      >
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Purchased">{t("car.status.purchased")}</SelectItem>
                          <SelectItem value="Reserved">{t("car.status.reserved")}</SelectItem>
                          <SelectItem value="In Transit">{t("car.status.inTransit")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.form.price")}</Label>
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
                      <Label>{t("admin.form.container")}</Label>
                      <Input
                        value={carForm.containerNumber}
                        onChange={(e) => setCarForm({ ...carForm, containerNumber: e.target.value })}
                        placeholder="MSCU7654321"
                        dir="ltr"
                        data-testid="input-container"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.form.booking")}</Label>
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
                    <Label>{t("admin.form.tracking")}</Label>
                    <Input
                      value={carForm.trackingUrl}
                      onChange={(e) => setCarForm({ ...carForm, trackingUrl: e.target.value })}
                      placeholder="https://..."
                      dir="ltr"
                      data-testid="input-tracking"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("admin.form.customUrl")}</Label>
                    <Input
                      value={carForm.customUrl}
                      onChange={(e) => setCarForm({ ...carForm, customUrl: e.target.value })}
                      placeholder="https://..."
                      dir="ltr"
                      data-testid="input-custom-url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("admin.form.customUrlReason")}</Label>
                    <Textarea
                      value={carForm.customUrlReason}
                      onChange={(e) => setCarForm({ ...carForm, customUrlReason: e.target.value })}
                      placeholder={t("admin.form.customUrlReasonPlaceholder")}
                      data-testid="input-custom-url-reason"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("admin.form.details")}</Label>
                    <Textarea
                      value={carForm.details}
                      onChange={(e) => setCarForm({ ...carForm, details: e.target.value })}
                      placeholder={t("admin.form.detailsPlaceholder")}
                      data-testid="input-details"
                    />
                  </div>

                  {/* Interior Features */}
                  <div className="space-y-2">
                    <Label>{t("filter.interiorSpecs")}</Label>
                    <div className="flex flex-wrap gap-2">
                      {["auxUsb","airbags","powerSeats","steeringControl","seatMemory","powerWindows","centralLock","heatedSeats","cdPlayer","leatherSeats","sportSeats","heatedSteering","rearElectric","cooledSeats","ac","alarm"].map(f => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => {
                            const arr = carForm.interiorFeatures;
                            setCarForm({ ...carForm, interiorFeatures: arr.includes(f) ? arr.filter(i => i !== f) : [...arr, f] });
                          }}
                          className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                            carForm.interiorFeatures.includes(f)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-secondary text-secondary-foreground border-border"
                          }`}
                          data-testid={`chip-admin-int-${f}`}
                        >
                          {t(`filter.int${f.charAt(0).toUpperCase() + f.slice(1)}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Exterior Features */}
                  <div className="space-y-2">
                    <Label>{t("filter.exteriorSpecs")}</Label>
                    <div className="flex flex-wrap gap-2">
                      {["daytimeLights","spareTire","alloyWheels","frontSensors","rearSensors","keylessEntry","sunroof","panorama","powerMirrors","foldingMirrors","xenonLights","ledLights","sportEdition","rearHook"].map(f => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => {
                            const arr = carForm.exteriorFeatures;
                            setCarForm({ ...carForm, exteriorFeatures: arr.includes(f) ? arr.filter(i => i !== f) : [...arr, f] });
                          }}
                          className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                            carForm.exteriorFeatures.includes(f)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-secondary text-secondary-foreground border-border"
                          }`}
                          data-testid={`chip-admin-ext-${f}`}
                        >
                          {t(`filter.ext${f.charAt(0).toUpperCase() + f.slice(1)}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("admin.form.pdf")}</Label>
                    <div className="space-y-2">
                      {/* Existing saved PDFs */}
                      {existingPdfUrls.map((url, idx) => (
                        <div key={`existing-${idx}`} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary">
                          <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-sm text-foreground flex-grow truncate">{t("carDetail.viewPdf")} {idx + 1}</span>
                          <div className="flex gap-2">
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">{t("carDetail.openLink")}</a>
                            <button
                              type="button"
                              onClick={() => setExistingPdfUrls(prev => prev.filter((_, i) => i !== idx))}
                              className="text-xs text-destructive hover:underline"
                            >
                              {t("admin.delete")}
                            </button>
                          </div>
                        </div>
                      ))}
                      {/* New PDFs queued for upload */}
                      {pdfFileNames.map((name, idx) => (
                        <div key={`new-${idx}`} className="flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
                          <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-sm text-foreground flex-grow truncate">{name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setPdfFiles(prev => prev.filter((_, i) => i !== idx));
                              setPdfFileNames(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="text-xs text-destructive hover:underline"
                          >
                            {t("admin.delete")}
                          </button>
                        </div>
                      ))}
                      {/* Add PDF button */}
                      <label
                        className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-secondary transition-colors"
                        data-testid="label-pdf-upload"
                      >
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{t("admin.form.addPdf")}</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setPdfFiles(prev => [...prev, ...files]);
                            setPdfFileNames(prev => [...prev, ...files.map(f => f.name)]);
                            e.target.value = "";
                          }}
                          data-testid="input-pdf"
                        />
                      </label>
                    </div>
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
                      {editingCar ? t("admin.form.update") : t("admin.form.submit")}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      {t("admin.form.cancel")}
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
