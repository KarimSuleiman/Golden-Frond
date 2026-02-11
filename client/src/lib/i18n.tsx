import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "ar" | "en";

interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

const translations: Translations = {
  // Navbar
  "nav.home": { ar: "الرئيسية", en: "Home" },
  "nav.dashboard": { ar: "لوحة التحكم", en: "Dashboard" },
  "nav.admin": { ar: "إدارة", en: "Admin" },
  "nav.aboutUs": { ar: "من نحن", en: "About Us" },
  "nav.contactUs": { ar: "تواصل معنا", en: "Contact Us" },
  "nav.login": { ar: "تسجيل الدخول", en: "Login" },
  "nav.logout": { ar: "تسجيل الخروج", en: "Logout" },
  "nav.logout.confirm": { ar: "هل أنت متأكد من أنك تريد تسجيل الخروج؟", en: "Are you sure you want to logout?" },
  "nav.logout.yes": { ar: "نعم، خروج", en: "Yes, Logout" },
  "nav.logout.no": { ar: "لا، إلغاء", en: "No, Cancel" },
  
  // Landing - Hero
  "landing.tagline": { ar: "السعفة الذهبية لتجارة السيارات", en: "Golden Frond Car Trading" },
  "landing.title1": { ar: "تتبع سياراتك", en: "Track Your Cars" },
  "landing.title2": { ar: "بكل سهولة", en: "With Ease" },
  "landing.description": { 
    ar: "السعفة الذهبية توفر لك منصة رقمية حصرية لمتابعة سياراتك المحجوزة والمشتراة مع جميع تفاصيل الشحن والتتبع.", 
    en: "Golden Frond provides you an exclusive digital platform to track your reserved and purchased cars with all shipping and tracking details." 
  },
  "landing.login": { ar: "تسجيل الدخول", en: "Login" },
  "landing.myCars": { ar: "سياراتي", en: "My Cars" },
  "landing.years": { ar: "سنة خبرة", en: "Years Experience" },
  "landing.secure": { ar: "آمن وموثوق", en: "Safe & Trusted" },
  "landing.support": { ar: "دعم فني", en: "Technical Support" },
  "landing.exclusive": { ar: "مجموعة حصرية", en: "Exclusive Collection" },
  "landing.premium": { ar: "للعملاء المميزين", en: "For Premium Clients" },
  "landing.heroImageAlt": { ar: "سيارة فاخرة", en: "Luxury Car" },
  "landing.showroomImageAlt": { ar: "معرض السيارات", en: "Car Showroom" },
  
  // Landing - About
  "landing.about": { ar: "من نحن", en: "About Us" },
  "landing.about.text1": { 
    ar: "السعفة الذهبية هي شركة رائدة في مجال تجارة السيارات واستيرادها، تأسست في 29 أكتوبر 2011، ولدينا أكثر من 13 عاماً من الخبرة في توفير أفضل السيارات لعملائنا الكرام.", 
    en: "Golden Frond is a leading company in car trading and importing, established on October 29, 2011. We have over 13 years of experience providing the best cars for our valued customers." 
  },
  "landing.about.text2": { 
    ar: "نحن متخصصون في استيراد السيارات من أمريكا وأوروبا وتوفير خدمات التتبع والشحن لعملائنا، مع ضمان الجودة والشفافية في كل خطوة.", 
    en: "We specialize in importing cars from America and Europe, providing tracking and shipping services for our customers, with guaranteed quality and transparency at every step." 
  },
  "landing.founded": { ar: "تأسست في", en: "Founded" },
  "landing.foundedDate": { ar: "29 أكتوبر 2011", en: "Oct 29, 2011" },
  "landing.experience": { ar: "سنوات الخبرة", en: "Years of Experience" },
  "landing.experienceYears": { ar: "+13 سنة", en: "13+ Years" },
  "landing.yearsExp": { ar: "سنة خبرة", en: "Years Exp." },
  "landing.brandName": { ar: "السعفة الذهبية", en: "Golden Frond" },
  
  // Landing - Services
  "landing.services": { ar: "خدماتنا", en: "Our Services" },
  "landing.service1.title": { ar: "ملكية موثقة", en: "Verified Ownership" },
  "landing.service1.desc": { ar: "كل سيارة في حسابك موثقة برقم الشاصي والسجلات الرسمية.", en: "Every car in your account is verified with VIN and official records." },
  "landing.service2.title": { ar: "سيارات حصرية", en: "Exclusive Cars" },
  "landing.service2.desc": { ar: "الوصول إلى أفخم السيارات من جميع أنحاء العالم.", en: "Access to the finest cars from around the world." },
  "landing.service3.title": { ar: "تتبع مباشر", en: "Live Tracking" },
  "landing.service3.desc": { ar: "تابع حالة سيارتك من الحجز حتى التسليم بشكل مباشر.", en: "Track your car status from reservation to delivery in real-time." },
  
  // Landing - Testimonials
  "landing.testimonials": { ar: "آراء عملائنا", en: "What Our Clients Say" },
  "landing.testimonials.desc": { ar: "تجارب حقيقية من عملائنا الكرام", en: "Real experiences from our valued customers" },
  "landing.testimonial1.name": { ar: "أحمد محمود", en: "Ahmed Mahmoud" },
  "landing.testimonial1.role": { ar: "رجل أعمال", en: "Businessman" },
  "landing.testimonial1.text": { ar: "تجربة ممتازة مع السعفة الذهبية. استلمت سيارتي في الوقت المحدد وبحالة ممتازة. أنصح بهم بشدة!", en: "Excellent experience with Golden Frond. I received my car on time and in perfect condition. Highly recommend them!" },
  "landing.testimonial2.name": { ar: "محمد العلي", en: "Mohammed Al-Ali" },
  "landing.testimonial2.role": { ar: "مهندس", en: "Engineer" },
  "landing.testimonial2.text": { ar: "خدمة التتبع رائعة جداً. كنت أتابع سيارتي خطوة بخطوة من أمريكا حتى وصلت. شكراً لكم!", en: "The tracking service is amazing. I followed my car step by step from America until it arrived. Thank you!" },
  "landing.testimonial3.name": { ar: "خالد السعيد", en: "Khaled Al-Saeed" },
  "landing.testimonial3.role": { ar: "طبيب", en: "Doctor" },
  "landing.testimonial3.text": { ar: "أكثر من ١٣ سنة خبرة تظهر في جودة الخدمة والتعامل الراقي. سأتعامل معهم دائماً.", en: "Over 13 years of experience shows in their service quality and professional treatment. Will always deal with them." },
  
  // Contact Labels
  "contact.email": { ar: "البريد الإلكتروني", en: "Email" },
  "contact.whatsapp": { ar: "واتساب", en: "Whatsapp" },
  
  // Landing - Contact
  "landing.contact": { ar: "تواصل معنا", en: "Contact Us" },
  "landing.contact.desc": { ar: "نحن هنا لمساعدتك. تواصل معنا عبر أي من الوسائل التالية", en: "We are here to help. Contact us through any of the following methods" },
  "landing.phone": { ar: "الهاتف", en: "Phone" },
  "landing.email": { ar: "البريد الإلكتروني", en: "Email" },
  "landing.location": { ar: "الموقع", en: "Location" },
  "landing.address": { ar: "الزرقاء - المنطقة الحرة\nشارع ١٥ شمال", en: "Zarqa - Free Zone\nStreet 15 North" },
  "landing.facebook": { ar: "فيسبوك", en: "Facebook" },
  "landing.whatsapp": { ar: "واتساب", en: "WhatsApp" },
  "landing.copyright": { ar: "السعفة الذهبية لتجارة السيارات. جميع الحقوق محفوظة.", en: "Golden Frond Car Trading. All rights reserved." },
  "landing.taglineShort": { ar: "مستقبل تجارة السيارات في المنطقة", en: "The Future of Car Trading in MENA" },
  "landing.taglineDesc": { ar: "منصة سريعة وسهلة لتجارة السيارات مع تغطية جميع دول المنطقة.", en: "A fast and easy car trading platform covering all countries in the region." },
  
  // Footer Links
  "footer.quickLinks": { ar: "روابط سريعة", en: "Quick Links" },
  "footer.support": { ar: "الدعم", en: "Support" },
  "footer.contactUs": { ar: "تواصل معنا", en: "Contact us" },
  "footer.importantNotice": { ar: "إشعار مهم", en: "Important Notice" },
  "footer.terms": { ar: "الشروط والأحكام", en: "Terms and Conditions" },
  "footer.trackingTagline": { ar: "تتبع سيارتك بكل سهولة", en: "Track Your Car with Ease" },
  "footer.trackingDesc": { ar: "منصة السعفة الذهبية توفر لك نظام تتبع متكامل لمتابعة سياراتك من لحظة الشراء حتى وصولها إليك، مع تحديثات مباشرة لحالة الشحن.", en: "Golden Frond platform provides you with a complete tracking system to follow your cars from the moment of purchase until they reach you, with live shipping status updates." },
  "footer.home": { ar: "الرئيسية", en: "Home" },
  "footer.aboutUs": { ar: "من نحن", en: "About us" },
  "footer.login": { ar: "تسجيل الدخول", en: "Log in" },
  
  // Login
  "login.title": { ar: "تسجيل الدخول", en: "Login" },
  "login.desc": { ar: "أدخل بياناتك للوصول إلى حسابك", en: "Enter your credentials to access your account" },
  "login.email": { ar: "البريد الإلكتروني", en: "Email" },
  "login.emailPlaceholder": { ar: "example@email.com", en: "example@email.com" },
  "login.password": { ar: "كلمة المرور", en: "Password" },
  "login.passwordPlaceholder": { ar: "••••••••", en: "••••••••" },
  "login.submit": { ar: "دخول", en: "Login" },
  "login.loading": { ar: "جاري تسجيل الدخول...", en: "Logging in..." },
  "login.error": { ar: "خطأ في تسجيل الدخول", en: "Login Error" },
  "login.failed": { ar: "فشل تسجيل الدخول", en: "Login failed" },
  "login.welcome": { ar: "مرحباً بك", en: "Welcome" },
  "login.success": { ar: "تم تسجيل الدخول بنجاح", en: "Successfully logged in" },
  "login.enterCredentials": { ar: "يرجى إدخال البريد الإلكتروني وكلمة المرور", en: "Please enter email and password" },
  
  // Dashboard
  "dashboard.title": { ar: "سياراتي", en: "My Cars" },
  "dashboard.welcome": { ar: "مرحباً", en: "Welcome" },
  "dashboard.welcomeSuffix": { ar: "عزيزي العميل", en: "Dear Customer" },
  "dashboard.noCars": { ar: "لا توجد سيارات مسجلة في حسابك حالياً.", en: "No cars are currently registered in your account." },
  "dashboard.contactSupport": { ar: "تواصل مع فريق الدعم لإضافة سياراتك.", en: "Contact support to add your cars." },
  "dashboard.noCarsTitle": { ar: "لا توجد سيارات", en: "No Cars" },
  "dashboard.errorLoading": { ar: "خطأ في تحميل البيانات", en: "Error Loading Data" },
  "dashboard.errorDesc": { ar: "حدثت مشكلة أثناء جلب بيانات السيارات.", en: "An error occurred while fetching car data." },
  "dashboard.retry": { ar: "إعادة المحاولة", en: "Retry" },
  "dashboard.contactUs": { ar: "تواصل معنا", en: "Contact Us" },
  "dashboard.copyright": { ar: "السعفة الذهبية. جميع الحقوق محفوظة.", en: "Golden Frond. All rights reserved." },
  
  // Car Card
  "car.vin": { ar: "رقم الشاصي", en: "VIN" },
  "car.color": { ar: "اللون", en: "Color" },
  "car.model": { ar: "موديل", en: "Model" },
  "car.container": { ar: "رقم الكونتينر", en: "Container No." },
  "car.booking": { ar: "رقم الحجز", en: "Booking No." },
  "car.track": { ar: "تتبع الشحنة", en: "Track Shipment" },
  "car.details": { ar: "عرض التفاصيل", en: "View Details" },
  "car.photos": { ar: "صور", en: "Photos" },
  "car.shippingInfo": { ar: "معلومات الشحن", en: "Shipping Info" },
  "car.status.purchased": { ar: "تم الشراء", en: "Purchased" },
  "car.status.reserved": { ar: "محجوز", en: "Reserved" },
  "car.status.inTransit": { ar: "قيد الشحن", en: "In Transit" },
  
  // Car Detail
  "carDetail.back": { ar: "العودة لسياراتي", en: "Back to My Cars" },
  "carDetail.info": { ar: "معلومات السيارة", en: "Car Information" },
  "carDetail.customUrl": { ar: "رابط مخصص", en: "Custom URL" },
  "carDetail.customUrlReason": { ar: "سبب الرابط", en: "URL Reason" },
  "carDetail.openLink": { ar: "فتح الرابط", en: "Open Link" },
  "carDetail.make": { ar: "الشركة المصنعة", en: "Make" },
  "carDetail.model": { ar: "الموديل", en: "Model" },
  "carDetail.year": { ar: "سنة الصنع", en: "Year" },
  "carDetail.color": { ar: "اللون", en: "Color" },
  "carDetail.price": { ar: "السعر", en: "Price" },
  "carDetail.dateAdded": { ar: "تاريخ الإضافة", en: "Date Added" },
  "carDetail.additionalDetails": { ar: "تفاصيل إضافية", en: "Additional Details" },
  "carDetail.shippingInfo": { ar: "معلومات الشحن", en: "Shipping Information" },
  "carDetail.notFound": { ar: "السيارة غير موجودة", en: "Car Not Found" },
  "carDetail.notFoundDesc": { ar: "لم نتمكن من العثور على السيارة المطلوبة", en: "We couldn't find the requested car" },
  
  // Admin
  "admin.title": { ar: "لوحة التحكم", en: "Admin Panel" },
  "admin.addCar": { ar: "إضافة سيارة", en: "Add Car" },
  "admin.users": { ar: "المستخدمين", en: "Users" },
  "admin.cars": { ar: "السيارات", en: "Cars" },
  "admin.isAdmin": { ar: "مسؤول", en: "Admin" },
  "admin.role.user": { ar: "مستخدم شخصي", en: "Personal User" },
  "admin.role.trader": { ar: "تاجر", en: "Trader" },
  "admin.role.backup_admin": { ar: "أدمن احتياطي", en: "Backup Admin" },
  "admin.role.main_admin": { ar: "المسؤول الرئيسي", en: "Main Admin" },
  "admin.selectRole": { ar: "اختر الرتبة", en: "Select Role" },
  "admin.roleUpdated": { ar: "تم تحديث الرتبة بنجاح", en: "Role updated successfully" },
  "admin.owner": { ar: "المالك", en: "Owner" },
  "admin.edit": { ar: "تعديل", en: "Edit" },
  "admin.delete": { ar: "حذف", en: "Delete" },
  "admin.unauthorized": { ar: "غير مصرح لك بالوصول لهذه الصفحة", en: "You are not authorized to access this page" },
  "admin.adminOnly": { ar: "هذه الصفحة للمسؤولين فقط", en: "This page is for administrators only" },
  
  // Admin Form
  "admin.form.addCar": { ar: "إضافة سيارة جديدة", en: "Add New Car" },
  "admin.form.editCar": { ar: "تعديل السيارة", en: "Edit Car" },
  "admin.form.user": { ar: "المستخدم", en: "User" },
  "admin.form.selectUser": { ar: "اختر المستخدم", en: "Select User" },
  "admin.form.mainImage": { ar: "الصورة الرئيسية", en: "Main Image" },
  "admin.form.selectImage": { ar: "اختر صورة", en: "Select Image" },
  "admin.form.additionalImages": { ar: "صور إضافية (اختياري)", en: "Additional Images (optional)" },
  "admin.form.addImages": { ar: "إضافة صور", en: "Add Images" },
  "admin.form.make": { ar: "الشركة المصنعة", en: "Make" },
  "admin.form.model": { ar: "الموديل", en: "Model" },
  "admin.form.year": { ar: "سنة الصنع", en: "Year" },
  "admin.form.color": { ar: "اللون", en: "Color" },
  "admin.form.vin": { ar: "رقم الشاصي (VIN)", en: "VIN Number" },
  "admin.form.status": { ar: "الحالة", en: "Status" },
  "admin.form.price": { ar: "السعر (اختياري)", en: "Price (optional)" },
  "admin.form.container": { ar: "رقم الكونتينر", en: "Container Number" },
  "admin.form.booking": { ar: "رقم الحجز", en: "Booking Number" },
  "admin.form.tracking": { ar: "رابط التتبع", en: "Tracking URL" },
  "admin.form.customUrl": { ar: "رابط مخصص (اختياري)", en: "Custom URL (optional)" },
  "admin.form.customUrlReason": { ar: "سبب إضافة الرابط", en: "Reason for URL" },
  "admin.form.customUrlReasonPlaceholder": { ar: "اشرح لماذا تمت إضافة هذا الرابط...", en: "Explain why this URL was added..." },
  "admin.form.details": { ar: "تفاصيل إضافية", en: "Additional Details" },
  "admin.form.submit": { ar: "إضافة السيارة", en: "Add Car" },
  "admin.form.update": { ar: "تحديث السيارة", en: "Update Car" },
  "admin.form.cancel": { ar: "إلغاء", en: "Cancel" },
  
  // Admin Filters
  "admin.filter.all": { ar: "جميع السيارات", en: "All Cars" },
  "admin.filter.byUser": { ar: "سيارات المستخدم", en: "User's Cars" },
  "admin.filter.search": { ar: "بحث...", en: "Search..." },
  "admin.filter.searchPlaceholder": { ar: "ابحث بالاسم أو الموديل أو VIN...", en: "Search by name, model, or VIN..." },
  "admin.filter.make": { ar: "الشركة المصنعة", en: "Make" },
  "admin.filter.allMakes": { ar: "جميع الشركات", en: "All Makes" },
  "admin.filter.year": { ar: "السنة", en: "Year" },
  "admin.filter.allYears": { ar: "جميع السنوات", en: "All Years" },
  "admin.filter.status": { ar: "الحالة", en: "Status" },
  "admin.filter.allStatus": { ar: "جميع الحالات", en: "All Status" },
  "admin.filter.clear": { ar: "مسح الفلاتر", en: "Clear Filters" },
  "admin.filter.results": { ar: "نتيجة", en: "results" },
  
  // Forgot Password
  "forgot.title": { ar: "نسيت كلمة المرور", en: "Forgot Password" },
  "forgot.desc": { ar: "أدخل بريدك الإلكتروني لاستلام رمز إعادة التعيين", en: "Enter your email to receive a reset code" },
  "forgot.email": { ar: "البريد الإلكتروني", en: "Email" },
  "forgot.emailPlaceholder": { ar: "example@email.com", en: "example@email.com" },
  "forgot.submit": { ar: "إرسال رمز التعيين", en: "Send Reset Code" },
  "forgot.sending": { ar: "جاري الإرسال...", en: "Sending..." },
  "forgot.backToLogin": { ar: "العودة لتسجيل الدخول", en: "Back to Login" },
  "forgot.tokenSent": { ar: "تم إرسال رمز إعادة التعيين", en: "Reset Code Sent" },
  "forgot.tokenSentDesc": { ar: "تم إرسال رمز إعادة التعيين إلى بريدك الإلكتروني", en: "A reset code has been sent to your email" },
  "forgot.checkEmail": { ar: "تم إرسال الرمز إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد", en: "The code has been sent to your email. Please check your inbox" },
  "forgot.codeExpiry": { ar: "صالح لمدة ساعة واحدة", en: "Valid for 1 hour" },

  // Reset Password
  "reset.title": { ar: "تغيير كلمة المرور", en: "Reset Password" },
  "reset.desc": { ar: "أدخل رمز إعادة التعيين وكلمة المرور الجديدة", en: "Enter the reset code and your new password" },
  "reset.code": { ar: "رمز إعادة التعيين", en: "Reset Code" },
  "reset.codePlaceholder": { ar: "XXXXXX", en: "XXXXXX" },
  "reset.newPassword": { ar: "كلمة المرور الجديدة", en: "New Password" },
  "reset.newPasswordPlaceholder": { ar: "أدخل كلمة المرور الجديدة", en: "Enter new password" },
  "reset.confirmPassword": { ar: "تأكيد كلمة المرور", en: "Confirm Password" },
  "reset.confirmPlaceholder": { ar: "أعد إدخال كلمة المرور", en: "Re-enter password" },
  "reset.submit": { ar: "تغيير كلمة المرور", en: "Change Password" },
  "reset.changing": { ar: "جاري التغيير...", en: "Changing..." },
  "reset.success": { ar: "تم تغيير كلمة المرور بنجاح", en: "Password changed successfully" },
  "reset.successDesc": { ar: "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة", en: "You can now login with your new password" },
  "reset.passwordMismatch": { ar: "كلمات المرور غير متطابقة", en: "Passwords do not match" },
  "reset.passwordTooShort": { ar: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", en: "Password must be at least 6 characters" },

  // Admin Password
  "admin.changePassword": { ar: "تغيير كلمة المرور", en: "Change Password" },
  "admin.newPassword": { ar: "كلمة المرور الجديدة", en: "New Password" },
  "admin.passwordChanged": { ar: "تم تغيير كلمة المرور بنجاح", en: "Password changed successfully" },

  // Register
  "register.title": { ar: "إنشاء حساب جديد", en: "Create New Account" },
  "register.desc": { ar: "أنشئ حسابك للبدء في استخدام المنصة", en: "Create your account to start using the platform" },
  "register.firstName": { ar: "الاسم الأول", en: "First Name" },
  "register.lastName": { ar: "اسم العائلة", en: "Last Name" },
  "register.submit": { ar: "إنشاء الحساب", en: "Create Account" },
  "register.loading": { ar: "جاري إنشاء الحساب...", en: "Creating account..." },
  "register.welcome": { ar: "مرحباً بك", en: "Welcome" },
  "register.success": { ar: "تم إنشاء حسابك بنجاح", en: "Your account has been created successfully" },
  "register.failed": { ar: "فشل في إنشاء الحساب", en: "Failed to create account" },
  "register.fillRequired": { ar: "يرجى إدخال جميع البيانات المطلوبة", en: "Please fill in all required fields" },
  "register.haveAccount": { ar: "لديك حساب بالفعل؟", en: "Already have an account?" },
  "login.noAccount": { ar: "ليس لديك حساب؟", en: "Don't have an account?" },
  "login.register": { ar: "إنشاء حساب", en: "Register" },

  // Marketplace
  "nav.carsForSale": { ar: "سيارات للبيع", en: "Cars for Sale" },
  "marketplace.title": { ar: "سيارات للبيع", en: "Cars for Sale" },
  "marketplace.subtitle": { ar: "تصفح السيارات المتاحة للبيع", en: "Browse available cars for sale" },
  "marketplace.addListing": { ar: "أضف إعلان", en: "Add Listing" },
  "marketplace.searchPlaceholder": { ar: "ابحث عن سيارة...", en: "Search for a car..." },
  "marketplace.filter": { ar: "فلترة", en: "Filter" },
  "marketplace.allBrands": { ar: "جميع العلامات", en: "All Brands" },
  "marketplace.allConditions": { ar: "جميع الحالات", en: "All Conditions" },
  "marketplace.allPrices": { ar: "جميع الأسعار", en: "All Prices" },
  "marketplace.conditionNew": { ar: "جديد", en: "New" },
  "marketplace.conditionUsed": { ar: "مستعمل", en: "Used" },
  "marketplace.priceUnder10k": { ar: "أقل من 10,000", en: "Under 10,000" },
  "marketplace.price10to25k": { ar: "10,000 - 25,000", en: "10,000 - 25,000" },
  "marketplace.price25to50k": { ar: "25,000 - 50,000", en: "25,000 - 50,000" },
  "marketplace.priceOver50k": { ar: "أكثر من 50,000", en: "Over 50,000" },
  "marketplace.noListings": { ar: "لا توجد إعلانات حالياً", en: "No Listings Available" },
  "marketplace.noListingsDesc": { ar: "لم يتم العثور على سيارات مطابقة. جرب تغيير معايير البحث.", en: "No matching cars found. Try changing your search criteria." },
  "marketplace.addFirstListing": { ar: "أضف أول إعلان", en: "Add First Listing" },
  "marketplace.currency": { ar: "دينار", en: "JOD" },
  "marketplace.km": { ar: "كم", en: "km" },
  "marketplace.notFound": { ar: "الإعلان غير موجود", en: "Listing Not Found" },
  "marketplace.backToListings": { ar: "العودة للإعلانات", en: "Back to Listings" },
  "marketplace.condition": { ar: "الحالة", en: "Condition" },
  "marketplace.brand": { ar: "العلامة التجارية", en: "Brand" },
  "marketplace.model": { ar: "الموديل", en: "Model" },
  "marketplace.yearLabel": { ar: "سنة الصنع", en: "Year" },
  "marketplace.color": { ar: "اللون", en: "Color" },
  "marketplace.bodyType": { ar: "نوع الهيكل", en: "Body Type" },
  "marketplace.transmission": { ar: "ناقل الحركة", en: "Transmission" },
  "marketplace.fuelType": { ar: "نوع الوقود", en: "Fuel Type" },
  "marketplace.engineSize": { ar: "حجم المحرك", en: "Engine Size" },
  "marketplace.mileage": { ar: "عداد الكيلومترات", en: "Mileage" },
  "marketplace.location": { ar: "الموقع", en: "Location" },
  "marketplace.description": { ar: "الوصف", en: "Description" },
  "marketplace.priceLabel": { ar: "السعر", en: "Price" },
  "marketplace.contactPhone": { ar: "رقم الهاتف", en: "Contact Phone" },
  "marketplace.chat": { ar: "محادثة واتساب", en: "WhatsApp Chat" },
  "marketplace.saveListing": { ar: "حفظ", en: "Save" },
  "marketplace.saved": { ar: "محفوظ", en: "Saved" },
  "marketplace.seller": { ar: "البائع", en: "Seller" },
  "marketplace.linkCopied": { ar: "تم نسخ الرابط", en: "Link Copied" },
  "marketplace.fillRequired": { ar: "يرجى إدخال جميع البيانات المطلوبة", en: "Please fill in all required fields" },
  "marketplace.imageRequired": { ar: "يرجى إضافة صورة رئيسية", en: "Please add a main image" },
  "marketplace.listingCreated": { ar: "تم نشر الإعلان بنجاح", en: "Listing published successfully" },
  "marketplace.publishListing": { ar: "نشر الإعلان", en: "Publish Listing" },
  "marketplace.selectOption": { ar: "اختر", en: "Select" },
  "marketplace.automatic": { ar: "أوتوماتيك", en: "Automatic" },
  "marketplace.manual": { ar: "يدوي", en: "Manual" },
  "marketplace.petrol": { ar: "بنزين", en: "Petrol" },
  "marketplace.diesel": { ar: "ديزل", en: "Diesel" },
  "marketplace.hybrid": { ar: "هجين", en: "Hybrid" },
  "marketplace.electric": { ar: "كهربائي", en: "Electric" },
  "marketplace.myListings": { ar: "إعلاناتي", en: "My Listings" },
  "marketplace.favorites": { ar: "المفضلة", en: "Favorites" },
  "marketplace.priceOnRequest": { ar: "السعر عند الطلب", en: "Price on Request" },
  "marketplace.suggestedListings": { ar: "إعلانات أخرى قد تعجبك", en: "Other Listings You May Like" },
  "marketplace.share": { ar: "مشاركة", en: "Share" },
  "marketplace.copyLink": { ar: "نسخ الرابط", en: "Copy Link" },
  "marketplace.shareWhatsApp": { ar: "مشاركة عبر واتساب", en: "Share via WhatsApp" },
  "marketplace.shareFacebook": { ar: "مشاركة عبر فيسبوك", en: "Share via Facebook" },
  "marketplace.shareEmail": { ar: "مشاركة عبر البريد", en: "Share via Email" },
  "marketplace.bodySedan": { ar: "سيدان", en: "Sedan" },
  "marketplace.bodySUV": { ar: "جيب / SUV", en: "SUV" },
  "marketplace.bodyHatchback": { ar: "هاتشباك", en: "Hatchback" },
  "marketplace.bodyCoupe": { ar: "كوبيه", en: "Coupe" },
  "marketplace.bodyPickup": { ar: "بيك أب", en: "Pickup" },
  "marketplace.bodyVan": { ar: "فان", en: "Van" },
  "marketplace.bodyWagon": { ar: "ستيشن واغن", en: "Wagon" },
  "marketplace.bodyConvertible": { ar: "مكشوفة", en: "Convertible" },

  // Register
  "register.phone": { ar: "رقم الهاتف", en: "Phone Number" },
  "register.phoneInvalid": { ar: "رقم الهاتف يجب أن يتكون من 10 أرقام", en: "Phone number must be exactly 10 digits" },

  // Dashboard
  "dashboard.favorites": { ar: "المفضلة", en: "Favorites" },
  "dashboard.noFavoritesTitle": { ar: "لا توجد مفضلات", en: "No Favorites" },
  "dashboard.noFavorites": { ar: "لم تقم بإضافة أي سيارات إلى المفضلة بعد. تصفح السيارات المعروضة للبيع وأضف ما يعجبك.", en: "You haven't added any cars to your favorites yet. Browse cars for sale and add the ones you like." },
  "dashboard.browseCars": { ar: "تصفح السيارات", en: "Browse Cars" },

  // Admin role filter
  "admin.filter.role": { ar: "الرتبة", en: "Role" },
  "admin.filter.allRoles": { ar: "جميع الرتب", en: "All Roles" },

  // Common
  "common.loading": { ar: "جاري التحميل...", en: "Loading..." },
  "common.error": { ar: "خطأ", en: "Error" },
  "common.success": { ar: "نجاح", en: "Success" },
  "common.notFound": { ar: "الصفحة غير موجودة", en: "Page Not Found" },
  "common.goHome": { ar: "العودة للرئيسية", en: "Go Home" },
  "common.id": { ar: "رقم", en: "ID" },
  "common.langToggle": { ar: "EN", en: "عربي" },
  "common.langToggleFull": { ar: "English", en: "العربية" },
  "common.altLogo": { ar: "السعفة الذهبية", en: "Golden Frond" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "ar";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
