import { 
  users, 
  assets, 
  purchases, 
  payments, 
  walletVerifications,
  type User, 
  type InsertUser,
  type Asset,
  type InsertAsset,
  type Purchase,
  type InsertPurchase,
  type Payment,
  type InsertPayment,
  type WalletVerification,
  type InsertWalletVerification
} from "@shared/schema";

export interface IStorage {
  // Users
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserVerification(walletAddress: string, kycStatus: string, affordabilityStatus?: string): Promise<User | undefined>;
  
  // Assets
  getAssets(): Promise<Asset[]>;
  getAssetById(id: number): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  
  // Purchases
  getPurchasesByUserId(userId: number): Promise<Purchase[]>;
  getPurchaseById(id: number): Promise<Purchase | undefined>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  updatePurchase(id: number, updates: Partial<Purchase>): Promise<Purchase | undefined>;
  
  // Payments
  getPaymentsByPurchaseId(purchaseId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, updates: Partial<Payment>): Promise<Payment | undefined>;
  
  // Wallet Verifications
  getWalletVerification(walletAddress: string): Promise<WalletVerification | undefined>;
  createWalletVerification(verification: InsertWalletVerification): Promise<WalletVerification>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private assets: Map<number, Asset> = new Map();
  private purchases: Map<number, Purchase> = new Map();
  private payments: Map<number, Payment> = new Map();
  private walletVerifications: Map<string, WalletVerification> = new Map();
  
  private currentUserId = 1;
  private currentAssetId = 1;
  private currentPurchaseId = 1;
  private currentPaymentId = 1;
  private currentVerificationId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed featured assets
    const featuredAssets: InsertAsset[] = [
      {
        name: "PSG Home Jersey 2025",
        symbol: "PSG-JERSEY",
        description: "Official Paris Saint-Germain Home Jersey 2025 Season",
        imageUrl: "/psg-jersey.avif",
        price: "89.99",
        category: "Merchandise",
        isActive: true
      },
      {
        name: "Air France Ticket to Paris",
        symbol: "AF-TICKET",
        description: "AF0072, New York (JFK) to Paris (CDG), 15 Nov 2025",
        imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        price: "499.99",
        category: "Travel",
        isActive: true
      },
      {
        name: "Marriott Bonvoy Paris 2-night stay",
        symbol: "MARRIOTT-PARIS",
        description: "Luxury 2-night stay at Marriott Bonvoy Paris",
        imageUrl: "https://images.unsplash.com/photo-1431274172761-fca41d930114?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        price: "299.99",
        category: "Hospitality",
        isActive: true
      },
      {
        name: "UEFA Champions League Ticket",
        symbol: "UCL-TICKET",
        description: "Paris Saint-Germain vs Manchester City, Parc des Princes, Paris, 26 November 2025",
        imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        price: "199.99",
        category: "Events",
        isActive: true
      }
    ];

    featuredAssets.forEach(asset => this.createAsset(asset));
  }

  // Users
  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.walletAddress === walletAddress);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      isVerified: insertUser.isVerified ?? false,
      kycStatus: insertUser.kycStatus ?? "pending",
      affordabilityStatus: insertUser.affordabilityStatus ?? "not_checked",
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserVerification(walletAddress: string, kycStatus: string, affordabilityStatus?: string): Promise<User | undefined> {
    const user = await this.getUserByWallet(walletAddress);
    if (!user) return undefined;
    
    const updated: User = {
      ...user,
      kycStatus,
      affordabilityStatus: affordabilityStatus || user.affordabilityStatus,
      isVerified: kycStatus === "verified"
    };
    
    this.users.set(user.id, updated);
    return updated;
  }

  // Assets
  async getAssets(): Promise<Asset[]> {
    return Array.from(this.assets.values()).filter(asset => asset.isActive);
  }

  async getAssetById(id: number): Promise<Asset | undefined> {
    return this.assets.get(id);
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const asset: Asset = {
      ...insertAsset,
      id: this.currentAssetId++,
      isActive: insertAsset.isActive ?? true
    };
    this.assets.set(asset.id, asset);
    return asset;
  }

  // Purchases
  async getPurchasesByUserId(userId: number): Promise<Purchase[]> {
    return Array.from(this.purchases.values()).filter(purchase => purchase.userId === userId);
  }

  async getPurchaseById(id: number): Promise<Purchase | undefined> {
    return this.purchases.get(id);
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const purchase: Purchase = {
      ...insertPurchase,
      id: this.currentPurchaseId++,
      status: insertPurchase.status ?? "pending",
      currentStep: insertPurchase.currentStep ?? 1,
      completedSteps: insertPurchase.completedSteps ?? [],
      yieldEnabled: insertPurchase.yieldEnabled ?? false,
      stakedAmount: insertPurchase.stakedAmount ?? "0",
      yieldEarned: insertPurchase.yieldEarned ?? "0",
      contractAddress: insertPurchase.contractAddress ?? null,
      transactionHash: insertPurchase.transactionHash ?? null,
      createdAt: new Date()
    };
    this.purchases.set(purchase.id, purchase);
    return purchase;
  }

  async updatePurchase(id: number, updates: Partial<Purchase>): Promise<Purchase | undefined> {
    const purchase = this.purchases.get(id);
    if (!purchase) return undefined;
    
    const updated: Purchase = { ...purchase, ...updates };
    this.purchases.set(id, updated);
    return updated;
  }

  // Payments
  async getPaymentsByPurchaseId(purchaseId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(payment => payment.purchaseId === purchaseId);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const payment: Payment = {
      ...insertPayment,
      id: this.currentPaymentId++,
      status: insertPayment.status ?? "pending",
      dueDate: insertPayment.dueDate ?? null,
      paidAt: insertPayment.paidAt ?? null,
      transactionHash: insertPayment.transactionHash ?? null
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  async updatePayment(id: number, updates: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updated: Payment = { ...payment, ...updates };
    this.payments.set(id, updated);
    return updated;
  }

  // Wallet Verifications
  async getWalletVerification(walletAddress: string): Promise<WalletVerification | undefined> {
    return this.walletVerifications.get(walletAddress);
  }

  async createWalletVerification(insertVerification: InsertWalletVerification): Promise<WalletVerification> {
    const verification: WalletVerification = {
      ...insertVerification,
      id: this.currentVerificationId++,
      transactionCount: insertVerification.transactionCount ?? 0,
      accountAge: insertVerification.accountAge ?? 0,
      isBlacklisted: insertVerification.isBlacklisted ?? false,
      verificationDate: new Date()
    };
    this.walletVerifications.set(verification.walletAddress, verification);
    return verification;
  }
}

export const storage = new MemStorage();
