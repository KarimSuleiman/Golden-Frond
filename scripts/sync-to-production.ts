import pg from "pg";
const { Pool } = pg;

const PROD_URL = process.argv[2];
if (!PROD_URL) {
  console.error("Usage: npx tsx scripts/sync-to-production.ts <production-app-url>");
  console.error("Example: npx tsx scripts/sync-to-production.ts https://your-app.replit.app");
  process.exit(1);
}

const ADMIN_EMAIL = "amairehkareem@gmail.com";
const ADMIN_PASSWORD = "Karim123";

const devPool = new Pool({ connectionString: process.env.DATABASE_URL });

async function sync() {
  const devClient = await devPool.connect();

  try {
    console.log("Reading development database...");

    const { rows: devUsers } = await devClient.query("SELECT * FROM users");
    const { rows: devCars } = await devClient.query("SELECT * FROM cars");
    const { rows: devListings } = await devClient.query("SELECT * FROM listings");

    console.log(`Dev data: ${devUsers.length} users, ${devCars.length} cars, ${devListings.length} listings`);

    console.log("\nLogging into production...");
    const loginRes = await fetch(`${PROD_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      redirect: "manual",
    });

    if (!loginRes.ok) {
      console.error("Login failed:", await loginRes.text());
      process.exit(1);
    }

    const cookies = loginRes.headers.getSetCookie?.() || [];
    const sessionCookie = cookies.find((c: string) => c.startsWith("connect.sid"));
    if (!sessionCookie) {
      console.error("No session cookie received");
      process.exit(1);
    }
    const cookieValue = sessionCookie.split(";")[0];
    console.log("Logged in successfully");

    const syncData = {
      users: devUsers.map((u) => ({
        id: u.id,
        email: u.email,
        password: u.password,
        firstName: u.first_name,
        lastName: u.last_name,
        phone: u.phone,
        role: u.role,
        isAdmin: u.is_admin,
      })),
      cars: devCars.map((c) => ({
        id: c.id,
        userId: c.user_id,
        make: c.make,
        model: c.model,
        year: c.year,
        vin: c.vin,
        color: c.color,
        imageUrl: c.image_url,
        images: c.images,
        status: c.status,
        price: c.price,
        details: c.details,
        containerNumber: c.container_number,
        bookingNumber: c.booking_number,
        trackingUrl: c.tracking_url,
        customUrl: c.custom_url,
        customUrlReason: c.custom_url_reason,
      })),
      listings: devListings.map((l) => ({
        id: l.id,
        sellerId: l.seller_id,
        make: l.make,
        model: l.model,
        year: l.year,
        price: l.price,
        color: l.color,
        condition: l.condition,
        mileage: l.mileage,
        bodyType: l.body_type,
        transmission: l.transmission,
        fuelType: l.fuel_type,
        engineSize: l.engine_size,
        location: l.location,
        description: l.description,
        imageUrl: l.image_url,
        images: l.images,
        contactPhone: l.contact_phone,
        status: l.status,
      })),
    };

    console.log("\nSending data to production...");
    const syncRes = await fetch(`${PROD_URL}/api/admin/sync-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieValue,
      },
      body: JSON.stringify(syncData),
    });

    if (!syncRes.ok) {
      console.error("Sync failed:", await syncRes.text());
      process.exit(1);
    }

    const result = await syncRes.json();
    console.log("\nSync results:", result);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    devClient.release();
    await devPool.end();
  }
}

sync();
