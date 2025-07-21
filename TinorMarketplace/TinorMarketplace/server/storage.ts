import { 
  users, shops, products, bookings,
  type User, type InsertUser,
  type Shop, type InsertShop,
  type Product, type InsertProduct,
  type Booking, type InsertBooking,
  type ProductWithShop, type BookingWithDetails
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Shop operations
  getShop(id: number): Promise<Shop | undefined>;
  getShopsByOwnerId(ownerId: number): Promise<Shop[]>;
  createShop(shop: InsertShop): Promise<Shop>;
  updateShop(id: number, shop: Partial<Shop>): Promise<Shop | undefined>;

  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByShopId(shopId: number): Promise<Product[]>;
  searchProducts(query: string, latitude?: number, longitude?: number, maxDistance?: number): Promise<ProductWithShop[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Booking operations
  getBooking(id: number): Promise<BookingWithDetails | undefined>;
  getBookingsByUserId(userId: number): Promise<BookingWithDetails[]>;
  getBookingsByShopId(shopId: number): Promise<BookingWithDetails[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<Booking>): Promise<Booking | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private shops: Map<number, Shop> = new Map();
  private products: Map<number, Product> = new Map();
  private bookings: Map<number, Booking> = new Map();
  private userIdCounter = 1;
  private shopIdCounter = 1;
  private productIdCounter = 1;
  private bookingIdCounter = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create sample shops
    const shop1: Shop = {
      id: this.shopIdCounter++,
      name: "Green Valley Store",
      ownerId: 1,
      address: "123 Main Street, Downtown",
      latitude: 28.6139,
      longitude: 77.2090,
      rating: 4.2,
      totalRatings: 150
    };

    const shop2: Shop = {
      id: this.shopIdCounter++,
      name: "Organic Mart",
      ownerId: 2,
      address: "456 Health Avenue, Central",
      latitude: 28.6200,
      longitude: 77.2100,
      rating: 4.8,
      totalRatings: 89
    };

    const shop3: Shop = {
      id: this.shopIdCounter++,
      name: "City Supermarket",
      ownerId: 3,
      address: "789 Commerce Road, East",
      latitude: 28.6150,
      longitude: 77.2150,
      rating: 4.1,
      totalRatings: 220
    };

    this.shops.set(shop1.id, shop1);
    this.shops.set(shop2.id, shop2);
    this.shops.set(shop3.id, shop3);

    // Create sample products
    const products = [
      {
        id: this.productIdCounter++,
        name: "Fresh Milk",
        brand: "Amul",
        price: "62.00",
        stock: 8,
        category: "Dairy",
        expiryDate: new Date("2024-01-25"),
        shopId: shop1.id
      },
      {
        id: this.productIdCounter++,
        name: "Organic Milk",
        brand: "Mother Dairy",
        price: "78.00",
        stock: 2,
        category: "Dairy",
        expiryDate: new Date("2024-01-22"),
        shopId: shop2.id
      },
      {
        id: this.productIdCounter++,
        name: "Full Cream Milk",
        brand: "Nestle",
        price: "58.00",
        stock: 15,
        category: "Dairy",
        expiryDate: new Date("2024-01-28"),
        shopId: shop3.id
      },
      {
        id: this.productIdCounter++,
        name: "Wheat Bread",
        brand: "Britannia",
        price: "25.00",
        stock: 0,
        category: "Bakery",
        expiryDate: new Date("2024-01-20"),
        shopId: shop1.id
      },
      {
        id: this.productIdCounter++,
        name: "Brown Bread",
        brand: "Harvest Gold",
        price: "30.00",
        stock: 12,
        category: "Bakery",
        expiryDate: new Date("2024-01-24"),
        shopId: shop2.id
      }
    ];

    products.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { ...insertUser, id: this.userIdCounter++ };
    this.users.set(user.id, user);
    return user;
  }

  // Shop operations
  async getShop(id: number): Promise<Shop | undefined> {
    return this.shops.get(id);
  }

  async getShopsByOwnerId(ownerId: number): Promise<Shop[]> {
    return Array.from(this.shops.values()).filter(shop => shop.ownerId === ownerId);
  }

  async createShop(insertShop: InsertShop): Promise<Shop> {
    const shop: Shop = { 
      ...insertShop, 
      id: this.shopIdCounter++,
      rating: 0,
      totalRatings: 0
    };
    this.shops.set(shop.id, shop);
    return shop;
  }

  async updateShop(id: number, updates: Partial<Shop>): Promise<Shop | undefined> {
    const shop = this.shops.get(id);
    if (!shop) return undefined;
    
    const updatedShop = { ...shop, ...updates };
    this.shops.set(id, updatedShop);
    return updatedShop;
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByShopId(shopId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.shopId === shopId);
  }

  async searchProducts(
    query: string, 
    latitude = 28.6139, 
    longitude = 77.2090, 
    maxDistance = 10
  ): Promise<ProductWithShop[]> {
    const searchTerm = query.toLowerCase();
    const results: ProductWithShop[] = [];

    for (const product of this.products.values()) {
      if (product.stock <= 0) continue;
      
      const nameMatch = product.name.toLowerCase().includes(searchTerm);
      const brandMatch = product.brand?.toLowerCase().includes(searchTerm);
      const categoryMatch = product.category.toLowerCase().includes(searchTerm);
      
      if (nameMatch || brandMatch || categoryMatch) {
        const shop = this.shops.get(product.shopId);
        if (shop) {
          const distance = this.calculateDistance(latitude, longitude, shop.latitude, shop.longitude);
          if (distance <= maxDistance) {
            results.push({
              ...product,
              shop,
              distance
            });
          }
        }
      }
    }

    return results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product: Product = { ...insertProduct, id: this.productIdCounter++ };
    this.products.set(product.id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Booking operations
  async getBooking(id: number): Promise<BookingWithDetails | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const product = this.products.get(booking.productId);
    const user = this.users.get(booking.userId);
    if (!product || !user) return undefined;

    const shop = this.shops.get(product.shopId);
    if (!shop) return undefined;

    return {
      ...booking,
      product,
      shop,
      user
    };
  }

  async getBookingsByUserId(userId: number): Promise<BookingWithDetails[]> {
    const userBookings = Array.from(this.bookings.values()).filter(b => b.userId === userId);
    const results: BookingWithDetails[] = [];

    for (const booking of userBookings) {
      const product = this.products.get(booking.productId);
      const user = this.users.get(booking.userId);
      if (!product || !user) continue;

      const shop = this.shops.get(product.shopId);
      if (!shop) continue;

      results.push({
        ...booking,
        product,
        shop,
        user
      });
    }

    return results;
  }

  async getBookingsByShopId(shopId: number): Promise<BookingWithDetails[]> {
    const results: BookingWithDetails[] = [];

    for (const booking of this.bookings.values()) {
      const product = this.products.get(booking.productId);
      if (!product || product.shopId !== shopId) continue;

      const user = this.users.get(booking.userId);
      const shop = this.shops.get(product.shopId);
      if (!user || !shop) continue;

      results.push({
        ...booking,
        product,
        shop,
        user
      });
    }

    return results;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const booking: Booking = {
      ...insertBooking,
      id: this.bookingIdCounter++,
      bookedAt: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
    };
    this.bookings.set(booking.id, booking);
    return booking;
  }

  async updateBooking(id: number, updates: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...updates };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

export const storage = new MemStorage();
