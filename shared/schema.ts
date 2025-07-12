import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  isVerified: boolean("is_verified").default(false),
  kycStatus: text("kyc_status").default("pending"), // pending, verified, failed
  affordabilityStatus: text("affordability_status").default("not_checked"), // not_checked, verified, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  isActive: boolean("is_active").default(true),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  downPaymentAmount: decimal("down_payment_amount", { precision: 10, scale: 2 }).notNull(),
  installmentAmount: decimal("installment_amount", { precision: 10, scale: 2 }).notNull(),
  finalPaymentAmount: decimal("final_payment_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, active, completed, defaulted
  currentStep: integer("current_step").default(1),
  completedSteps: jsonb("completed_steps").default([]),
  yieldEnabled: boolean("yield_enabled").default(false),
  stakedAmount: decimal("staked_amount", { precision: 10, scale: 2 }).default("0"),
  yieldEarned: decimal("yield_earned", { precision: 10, scale: 2 }).default("0"),
  contractAddress: text("contract_address"),
  transactionHash: text("transaction_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").references(() => purchases.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentType: text("payment_type").notNull(), // down_payment, installment, final_payment
  status: text("status").notNull().default("pending"), // pending, completed, failed
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  transactionHash: text("transaction_hash"),
});

export const walletVerifications = pgTable("wallet_verifications", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  transactionCount: integer("transaction_count").default(0),
  accountAge: integer("account_age").default(0), // in days
  isBlacklisted: boolean("is_blacklisted").default(false),
  verificationDate: timestamp("verification_date").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAssetSchema = createInsertSchema(assets).omit({ id: true });
export const insertPurchaseSchema = createInsertSchema(purchases).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true });
export const insertWalletVerificationSchema = createInsertSchema(walletVerifications).omit({ id: true, verificationDate: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type WalletVerification = typeof walletVerifications.$inferSelect;
export type InsertWalletVerification = z.infer<typeof insertWalletVerificationSchema>;
