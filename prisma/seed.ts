import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// --- Device category data ---

const CATEGORIES = [
  { name: "手机", nameEn: "Smartphone", slug: "smartphone", sortOrder: 1 },
  { name: "平板", nameEn: "Tablet", slug: "tablet", sortOrder: 2 },
  { name: "笔记本", nameEn: "Laptop", slug: "laptop", sortOrder: 3 },
  { name: "台式机/一体机", nameEn: "Desktop/AIO", slug: "desktop", sortOrder: 4 },
  { name: "游戏机", nameEn: "Gaming Console", slug: "console", sortOrder: 5 },
];

// --- Repair types per category ---

const REPAIR_TYPES: Record<string, { name: string; nameEn: string; sortOrder: number }[]> = {
  smartphone: [
    { name: "换屏幕", nameEn: "Screen Replacement", sortOrder: 1 },
    { name: "换电池", nameEn: "Battery Replacement", sortOrder: 2 },
    { name: "充电口维修", nameEn: "Charging Port Repair", sortOrder: 3 },
    { name: "摄像头维修", nameEn: "Camera Repair", sortOrder: 4 },
    { name: "后盖更换", nameEn: "Back Cover Replacement", sortOrder: 5 },
    { name: "扬声器/麦克风", nameEn: "Speaker/Mic Repair", sortOrder: 6 },
    { name: "进水修复", nameEn: "Water Damage Repair", sortOrder: 7 },
    { name: "软件/刷机", nameEn: "Software/Unlock", sortOrder: 8 },
  ],
  tablet: [
    { name: "换屏幕", nameEn: "Screen Replacement", sortOrder: 1 },
    { name: "换电池", nameEn: "Battery Replacement", sortOrder: 2 },
    { name: "充电口维修", nameEn: "Charging Port Repair", sortOrder: 3 },
    { name: "摄像头维修", nameEn: "Camera Repair", sortOrder: 4 },
    { name: "扬声器维修", nameEn: "Speaker Repair", sortOrder: 5 },
    { name: "后盖更换", nameEn: "Back Cover Replacement", sortOrder: 6 },
  ],
  laptop: [
    { name: "换屏幕", nameEn: "Screen Replacement", sortOrder: 1 },
    { name: "换电池", nameEn: "Battery Replacement", sortOrder: 2 },
    { name: "键盘更换", nameEn: "Keyboard Replacement", sortOrder: 3 },
    { name: "触控板维修", nameEn: "Trackpad Repair", sortOrder: 4 },
    { name: "充电口维修", nameEn: "Charging Port Repair", sortOrder: 5 },
    { name: "存储升级/更换", nameEn: "Storage Upgrade", sortOrder: 6 },
    { name: "内存升级", nameEn: "RAM Upgrade", sortOrder: 7 },
    { name: "散热清洁", nameEn: "Cleaning/Cooling", sortOrder: 8 },
  ],
  desktop: [
    { name: "换显示屏", nameEn: "Screen Replacement", sortOrder: 1 },
    { name: "电源维修/更换", nameEn: "Power Supply Repair", sortOrder: 2 },
    { name: "内存升级", nameEn: "RAM Upgrade", sortOrder: 3 },
    { name: "存储升级/更换", nameEn: "Storage Upgrade", sortOrder: 4 },
    { name: "散热清洁", nameEn: "Cleaning/Cooling", sortOrder: 5 },
    { name: "系统重装", nameEn: "OS Reinstall", sortOrder: 6 },
  ],
  console: [
    { name: "换屏幕", nameEn: "Screen Replacement", sortOrder: 1 },
    { name: "换电池", nameEn: "Battery Replacement", sortOrder: 2 },
    { name: "手柄/摇杆维修", nameEn: "Controller/Joystick Repair", sortOrder: 3 },
    { name: "光驱维修", nameEn: "Disc Drive Repair", sortOrder: 4 },
    { name: "HDMI接口维修", nameEn: "HDMI Port Repair", sortOrder: 5 },
    { name: "散热/风扇维修", nameEn: "Fan/Cooling Repair", sortOrder: 6 },
  ],
};

// --- Brand + model data ---

type ModelDef = { name: string; year?: number; tier: "premium" | "mid" | "budget" };

const BRANDS: Record<string, { name: string; slug: string; models: ModelDef[] }[]> = {
  smartphone: [
    {
      name: "Apple",
      slug: "apple",
      models: [
        { name: "iPhone 16 Pro Max", year: 2024, tier: "premium" },
        { name: "iPhone 16 Pro", year: 2024, tier: "premium" },
        { name: "iPhone 16 Plus", year: 2024, tier: "mid" },
        { name: "iPhone 16", year: 2024, tier: "mid" },
        { name: "iPhone 15 Pro Max", year: 2023, tier: "premium" },
        { name: "iPhone 15 Pro", year: 2023, tier: "premium" },
        { name: "iPhone 15 Plus", year: 2023, tier: "mid" },
        { name: "iPhone 15", year: 2023, tier: "mid" },
        { name: "iPhone 14 Pro Max", year: 2022, tier: "premium" },
        { name: "iPhone 14 Pro", year: 2022, tier: "premium" },
        { name: "iPhone 14 Plus", year: 2022, tier: "mid" },
        { name: "iPhone 14", year: 2022, tier: "mid" },
        { name: "iPhone 13 Pro Max", year: 2021, tier: "premium" },
        { name: "iPhone 13 Pro", year: 2021, tier: "premium" },
        { name: "iPhone 13", year: 2021, tier: "mid" },
        { name: "iPhone 13 mini", year: 2021, tier: "mid" },
        { name: "iPhone 12 Pro Max", year: 2020, tier: "premium" },
        { name: "iPhone 12 Pro", year: 2020, tier: "premium" },
        { name: "iPhone 12", year: 2020, tier: "mid" },
        { name: "iPhone 12 mini", year: 2020, tier: "mid" },
        { name: "iPhone SE (3rd Gen)", year: 2022, tier: "budget" },
        { name: "iPhone SE (2nd Gen)", year: 2020, tier: "budget" },
        { name: "iPhone 11 Pro Max", year: 2019, tier: "premium" },
        { name: "iPhone 11 Pro", year: 2019, tier: "premium" },
        { name: "iPhone 11", year: 2019, tier: "mid" },
        { name: "iPhone XS Max", year: 2018, tier: "mid" },
        { name: "iPhone XS", year: 2018, tier: "mid" },
        { name: "iPhone XR", year: 2018, tier: "budget" },
        { name: "iPhone X", year: 2017, tier: "mid" },
        { name: "iPhone 8 Plus", year: 2017, tier: "budget" },
      ],
    },
    {
      name: "Samsung",
      slug: "samsung",
      models: [
        { name: "Galaxy S24 Ultra", year: 2024, tier: "premium" },
        { name: "Galaxy S24+", year: 2024, tier: "premium" },
        { name: "Galaxy S24 FE", year: 2024, tier: "mid" },
        { name: "Galaxy S24", year: 2024, tier: "mid" },
        { name: "Galaxy S23 Ultra", year: 2023, tier: "premium" },
        { name: "Galaxy S23+", year: 2023, tier: "premium" },
        { name: "Galaxy S23 FE", year: 2023, tier: "mid" },
        { name: "Galaxy S23", year: 2023, tier: "mid" },
        { name: "Galaxy S22 Ultra", year: 2022, tier: "premium" },
        { name: "Galaxy S22+", year: 2022, tier: "premium" },
        { name: "Galaxy S22 FE", year: 2022, tier: "mid" },
        { name: "Galaxy S22", year: 2022, tier: "mid" },
        { name: "Galaxy S21 Ultra", year: 2021, tier: "premium" },
        { name: "Galaxy S21+", year: 2021, tier: "premium" },
        { name: "Galaxy S21 FE", year: 2021, tier: "mid" },
        { name: "Galaxy S21", year: 2021, tier: "mid" },
        { name: "Galaxy S20 Ultra", year: 2020, tier: "premium" },
        { name: "Galaxy S20+", year: 2020, tier: "premium" },
        { name: "Galaxy S20 FE", year: 2020, tier: "mid" },
        { name: "Galaxy S20", year: 2020, tier: "mid" },
        { name: "Galaxy Z Fold 6", year: 2024, tier: "premium" },
        { name: "Galaxy Z Fold 5", year: 2023, tier: "premium" },
        { name: "Galaxy Z Fold 4", year: 2022, tier: "premium" },
        { name: "Galaxy Z Fold 3", year: 2021, tier: "premium" },
        { name: "Galaxy Z Flip 6", year: 2024, tier: "premium" },
        { name: "Galaxy Z Flip 5", year: 2023, tier: "premium" },
        { name: "Galaxy Z Flip 4", year: 2022, tier: "premium" },
        { name: "Galaxy Z Flip 3", year: 2021, tier: "premium" },
        { name: "Galaxy Note 20 Ultra", year: 2020, tier: "premium" },
        { name: "Galaxy Note 20", year: 2020, tier: "mid" },
        { name: "Galaxy Note 10+", year: 2019, tier: "premium" },
        { name: "Galaxy Note 10", year: 2019, tier: "mid" },
        { name: "Galaxy A55 5G", year: 2024, tier: "mid" },
        { name: "Galaxy A35 5G", year: 2024, tier: "mid" },
        { name: "Galaxy A25 5G", year: 2024, tier: "budget" },
        { name: "Galaxy A15 5G", year: 2024, tier: "budget" },
        { name: "Galaxy A05s", year: 2023, tier: "budget" },
        { name: "Galaxy A54 5G", year: 2023, tier: "mid" },
        { name: "Galaxy A34 5G", year: 2023, tier: "mid" },
        { name: "Galaxy A24", year: 2023, tier: "budget" },
        { name: "Galaxy A14 5G", year: 2023, tier: "budget" },
        { name: "Galaxy A04s", year: 2022, tier: "budget" },
        { name: "Galaxy A73 5G", year: 2022, tier: "mid" },
        { name: "Galaxy A53 5G", year: 2022, tier: "mid" },
        { name: "Galaxy A33 5G", year: 2022, tier: "mid" },
        { name: "Galaxy A23", year: 2022, tier: "budget" },
        { name: "Galaxy A13", year: 2022, tier: "budget" },
        { name: "Galaxy M55 5G", year: 2024, tier: "mid" },
        { name: "Galaxy M35 5G", year: 2024, tier: "mid" },
        { name: "Galaxy M15 5G", year: 2024, tier: "budget" },
        { name: "Galaxy F55 5G", year: 2024, tier: "mid" },
        { name: "Galaxy F15 5G", year: 2024, tier: "budget" },
        { name: "Galaxy A52s 5G", year: 2021, tier: "mid" },
        { name: "Galaxy A52 5G", year: 2021, tier: "mid" },
        { name: "Galaxy A32 5G", year: 2021, tier: "budget" },
        { name: "Galaxy A22 5G", year: 2021, tier: "budget" },
        { name: "Galaxy A12", year: 2021, tier: "budget" },
        { name: "Galaxy A02s", year: 2021, tier: "budget" },
        { name: "Galaxy A72", year: 2021, tier: "mid" },
        { name: "Galaxy A42 5G", year: 2020, tier: "mid" },
        { name: "Galaxy A51 5G", year: 2020, tier: "mid" },
        { name: "Galaxy A51", year: 2020, tier: "mid" },
        { name: "Galaxy A31", year: 2020, tier: "budget" },
        { name: "Galaxy A21s", year: 2020, tier: "budget" },
        { name: "Galaxy A11", year: 2020, tier: "budget" },
        { name: "Galaxy A01", year: 2020, tier: "budget" },
        { name: "Galaxy A71 5G", year: 2020, tier: "mid" },
        { name: "Galaxy A70s", year: 2019, tier: "mid" },
        { name: "Galaxy A50s", year: 2019, tier: "mid" },
        { name: "Galaxy A30s", year: 2019, tier: "budget" },
        { name: "Galaxy A20s", year: 2019, tier: "budget" },
        { name: "Galaxy A10s", year: 2019, tier: "budget" },
        { name: "Galaxy Xcover 7", year: 2024, tier: "mid" },
        { name: "Galaxy Xcover 6 Pro", year: 2022, tier: "mid" },
        { name: "Galaxy Quantum 5", year: 2024, tier: "mid" },
        { name: "Galaxy W25", year: 2024, tier: "premium" },
        { name: "Galaxy W24 Flip", year: 2023, tier: "premium" },
        { name: "Galaxy Z Flip 5 Maison Margiela Edition", year: 2023, tier: "premium" },
        { name: "Galaxy Z Fold 5 x Thom Browne Edition", year: 2023, tier: "premium" },
      ],
    },
    {
      name: "Huawei",
      slug: "huawei",
      models: [
        { name: "Pura 70 Ultra", year: 2024, tier: "premium" },
        { name: "Pura 70 Pro+", year: 2024, tier: "premium" },
        { name: "Pura 70 Pro", year: 2024, tier: "premium" },
        { name: "Pura 70", year: 2024, tier: "mid" },
        { name: "P60 Pro", year: 2023, tier: "premium" },
        { name: "P60 Art", year: 2023, tier: "premium" },
        { name: "P60", year: 2023, tier: "mid" },
        { name: "P50 Pro", year: 2021, tier: "premium" },
        { name: "P50 Pocket", year: 2021, tier: "premium" },
        { name: "P50", year: 2021, tier: "mid" },
        { name: "P40 Pro+", year: 2020, tier: "premium" },
        { name: "P40 Pro", year: 2020, tier: "premium" },
        { name: "P40", year: 2020, tier: "mid" },
        { name: "P30 Pro", year: 2019, tier: "premium" },
        { name: "P30", year: 2019, tier: "mid" },
        { name: "Mate 60 Pro+", year: 2023, tier: "premium" },
        { name: "Mate 60 Pro", year: 2023, tier: "premium" },
        { name: "Mate 60", year: 2023, tier: "mid" },
        { name: "Mate 50 Pro", year: 2022, tier: "premium" },
        { name: "Mate 50", year: 2022, tier: "mid" },
        { name: "Mate 50 RS Porsche Design", year: 2022, tier: "premium" },
        { name: "Mate 40 Pro+", year: 2020, tier: "premium" },
        { name: "Mate 40 Pro", year: 2020, tier: "premium" },
        { name: "Mate 40", year: 2020, tier: "mid" },
        { name: "Mate 30 Pro", year: 2019, tier: "premium" },
        { name: "Mate 30", year: 2019, tier: "mid" },
        { name: "nova 12 Ultra", year: 2024, tier: "mid" },
        { name: "nova 12 Pro", year: 2024, tier: "mid" },
        { name: "nova 12", year: 2024, tier: "mid" },
        { name: "nova 11 Ultra", year: 2023, tier: "mid" },
        { name: "nova 11 Pro", year: 2023, tier: "mid" },
        { name: "nova 11", year: 2023, tier: "mid" },
        { name: "nova 10 Pro", year: 2022, tier: "mid" },
        { name: "nova 10", year: 2022, tier: "mid" },
        { name: "nova 9 Pro", year: 2021, tier: "mid" },
        { name: "nova 9", year: 2021, tier: "mid" },
        { name: "Pocket 2", year: 2024, tier: "premium" },
        { name: "Pocket 2 Art Custom Edition", year: 2024, tier: "premium" },
        { name: "Maimang 20", year: 2024, tier: "budget" },
        { name: "Maimang 10 Pro", year: 2022, tier: "mid" },
        { name: "Enjoy 60 Pro", year: 2024, tier: "budget" },
        { name: "Enjoy 60", year: 2024, tier: "budget" },
        { name: "Y70 Plus", year: 2022, tier: "budget" },
        { name: "Y61", year: 2022, tier: "budget" },
        { name: "Mate X5", year: 2023, tier: "premium" },
        { name: "Mate X3", year: 2023, tier: "premium" },
      ],
    },
    {
      name: "Honor",
      slug: "honor",
      models: [
        { name: "Magic6 Pro", year: 2024, tier: "premium" },
        { name: "Magic6 Lite", year: 2024, tier: "mid" },
        { name: "Magic6", year: 2024, tier: "premium" },
        { name: "Magic5 Pro", year: 2023, tier: "premium" },
        { name: "Magic5 Lite", year: 2023, tier: "mid" },
        { name: "Magic5", year: 2023, tier: "premium" },
        { name: "Magic4 Pro", year: 2022, tier: "premium" },
        { name: "Magic4 Lite 5G", year: 2022, tier: "mid" },
        { name: "Magic4 Ultimate Edition", year: 2022, tier: "premium" },
        { name: "Magic3 Pro+", year: 2021, tier: "premium" },
        { name: "Magic3 Pro", year: 2021, tier: "premium" },
        { name: "Magic3", year: 2021, tier: "mid" },
        { name: "90 Pro", year: 2023, tier: "mid" },
        { name: "90 Lite", year: 2023, tier: "budget" },
        { name: "90", year: 2023, tier: "mid" },
        { name: "80 Pro", year: 2023, tier: "mid" },
        { name: "80", year: 2023, tier: "mid" },
        { name: "70 Pro+", year: 2022, tier: "mid" },
        { name: "70 Pro", year: 2022, tier: "mid" },
        { name: "70 Lite 5G", year: 2022, tier: "budget" },
        { name: "70", year: 2022, tier: "mid" },
        { name: "X9b", year: 2024, tier: "mid" },
        { name: "X8b", year: 2023, tier: "mid" },
        { name: "X8", year: 2023, tier: "mid" },
        { name: "200 Pro", year: 2024, tier: "premium" },
        { name: "200", year: 2024, tier: "mid" },
      ],
    },
    {
      name: "Xiaomi",
      slug: "xiaomi",
      models: [
        { name: "Xiaomi 14 Ultra", year: 2024, tier: "premium" },
        { name: "Xiaomi 14 Pro", year: 2024, tier: "premium" },
        { name: "Xiaomi 14", year: 2024, tier: "mid" },
        { name: "Xiaomi 13 Ultra", year: 2023, tier: "premium" },
        { name: "Xiaomi 13 Pro", year: 2023, tier: "premium" },
        { name: "Xiaomi 13 Lite", year: 2023, tier: "mid" },
        { name: "Xiaomi 13", year: 2023, tier: "mid" },
        { name: "Xiaomi 12 Pro", year: 2022, tier: "premium" },
        { name: "Xiaomi 12 Lite", year: 2022, tier: "mid" },
        { name: "Xiaomi 12", year: 2022, tier: "mid" },
        { name: "Xiaomi 12T Pro", year: 2022, tier: "premium" },
        { name: "Xiaomi 12T", year: 2022, tier: "mid" },
        { name: "Xiaomi 11T Pro", year: 2021, tier: "premium" },
        { name: "Xiaomi 11T", year: 2021, tier: "mid" },
        { name: "Xiaomi 11 Lite 5G NE", year: 2021, tier: "mid" },
        { name: "Xiaomi 11", year: 2021, tier: "mid" },
        { name: "Xiaomi 11i HyperCharge", year: 2022, tier: "mid" },
        { name: "Mi 11 Ultra", year: 2021, tier: "premium" },
        { name: "Mi 10T Pro", year: 2020, tier: "premium" },
        { name: "Mi 10T Lite", year: 2020, tier: "mid" },
        { name: "Mi 10T", year: 2020, tier: "mid" },
        { name: "Mi 10 Pro", year: 2020, tier: "premium" },
        { name: "Mi 10", year: 2020, tier: "mid" },
        { name: "Mi 9T Pro", year: 2019, tier: "mid" },
        { name: "Mi 9T", year: 2019, tier: "mid" },
        { name: "Mi 9", year: 2019, tier: "mid" },
        { name: "MIX Fold 4", year: 2024, tier: "premium" },
        { name: "MIX Fold 3", year: 2023, tier: "premium" },
        { name: "Civi 4 Pro", year: 2024, tier: "mid" },
        { name: "Civi 3", year: 2023, tier: "mid" },
        { name: "Xiaomi 14C", year: 2024, tier: "budget" },
        { name: "Xiaomi Pad 6S Pro 12.4", year: 2024, tier: "premium" },
      ],
    },
    {
      name: "Redmi",
      slug: "redmi",
      models: [
        { name: "Redmi Note 13 Pro+ 5G", year: 2024, tier: "mid" },
        { name: "Redmi Note 13 Pro 5G", year: 2024, tier: "mid" },
        { name: "Redmi Note 13 5G", year: 2024, tier: "budget" },
        { name: "Redmi Note 13", year: 2024, tier: "budget" },
        { name: "Redmi Note 12 Pro+", year: 2023, tier: "mid" },
        { name: "Redmi Note 12 Pro 5G", year: 2023, tier: "mid" },
        { name: "Redmi Note 12 5G", year: 2023, tier: "budget" },
        { name: "Redmi Note 12", year: 2023, tier: "budget" },
        { name: "Redmi Note 12S", year: 2023, tier: "budget" },
        { name: "Redmi Note 12R", year: 2023, tier: "budget" },
        { name: "Redmi Note 11 Pro+ 5G", year: 2022, tier: "mid" },
        { name: "Redmi Note 11 Pro 5G", year: 2022, tier: "mid" },
        { name: "Redmi Note 11 5G", year: 2022, tier: "budget" },
        { name: "Redmi Note 11", year: 2022, tier: "budget" },
        { name: "Redmi Note 11S 5G", year: 2022, tier: "budget" },
        { name: "Redmi Note 11S", year: 2022, tier: "budget" },
        { name: "Redmi Note 10 Pro", year: 2021, tier: "mid" },
        { name: "Redmi Note 10 5G", year: 2021, tier: "budget" },
        { name: "Redmi Note 10", year: 2021, tier: "budget" },
        { name: "Redmi Note 9 Pro 5G", year: 2020, tier: "mid" },
        { name: "Redmi Note 9 Pro", year: 2020, tier: "mid" },
        { name: "Redmi Note 9 5G", year: 2020, tier: "budget" },
        { name: "Redmi Note 9", year: 2020, tier: "budget" },
        { name: "Redmi K70 Ultra", year: 2024, tier: "premium" },
        { name: "Redmi K70 Pro", year: 2024, tier: "premium" },
        { name: "Redmi K70E", year: 2024, tier: "mid" },
        { name: "Redmi K70", year: 2024, tier: "mid" },
        { name: "Redmi K60 Ultra", year: 2023, tier: "premium" },
        { name: "Redmi K60 Pro", year: 2023, tier: "premium" },
        { name: "Redmi K60", year: 2023, tier: "mid" },
        { name: "Redmi 13C 5G", year: 2024, tier: "budget" },
        { name: "Redmi 13C", year: 2024, tier: "budget" },
        { name: "Redmi 13", year: 2024, tier: "budget" },
        { name: "Redmi 12C", year: 2023, tier: "budget" },
      ],
    },
    {
      name: "POCO",
      slug: "poco",
      models: [
        { name: "POCO X6 Pro 5G", year: 2024, tier: "mid" },
        { name: "POCO X6 5G", year: 2024, tier: "mid" },
        { name: "POCO X5 Pro 5G", year: 2023, tier: "mid" },
        { name: "POCO X5 5G", year: 2023, tier: "budget" },
        { name: "POCO X4 Pro 5G", year: 2022, tier: "mid" },
        { name: "POCO X4 GT", year: 2022, tier: "mid" },
        { name: "POCO X4 5G", year: 2022, tier: "budget" },
        { name: "POCO X3 Pro", year: 2021, tier: "mid" },
        { name: "POCO X3 NFC", year: 2020, tier: "mid" },
        { name: "POCO F6 Pro", year: 2024, tier: "premium" },
        { name: "POCO F6 5G", year: 2024, tier: "mid" },
        { name: "POCO F5 Pro", year: 2023, tier: "premium" },
        { name: "POCO F5 5G", year: 2023, tier: "mid" },
        { name: "POCO F4 GT", year: 2022, tier: "premium" },
        { name: "POCO F4 5G", year: 2022, tier: "mid" },
        { name: "POCO F3 5G", year: 2021, tier: "mid" },
        { name: "POCO M6 Pro 5G", year: 2024, tier: "budget" },
        { name: "POCO M6 Pro", year: 2024, tier: "budget" },
        { name: "POCO M6 5G", year: 2024, tier: "budget" },
        { name: "POCO M5s", year: 2022, tier: "budget" },
        { name: "POCO M5 5G", year: 2022, tier: "budget" },
        { name: "POCO M4 Pro 5G", year: 2021, tier: "budget" },
        { name: "POCO C65", year: 2024, tier: "budget" },
        { name: "POCO C61", year: 2024, tier: "budget" },
        { name: "POCO C55", year: 2023, tier: "budget" },
      ],
    },
    {
      name: "OPPO",
      slug: "oppo",
      models: [
        { name: "Find X7 Ultra", year: 2024, tier: "premium" },
        { name: "Find X7 Pro", year: 2024, tier: "premium" },
        { name: "Find X7", year: 2024, tier: "premium" },
        { name: "Find X6 Pro", year: 2023, tier: "premium" },
        { name: "Find X6", year: 2023, tier: "premium" },
        { name: "Find X5 Pro", year: 2022, tier: "premium" },
        { name: "Find X5 Lite", year: 2022, tier: "mid" },
        { name: "Find X5", year: 2022, tier: "premium" },
        { name: "Find X3 Pro", year: 2021, tier: "premium" },
        { name: "Find X3 Lite", year: 2021, tier: "mid" },
        { name: "Find X3 Neo", year: 2021, tier: "mid" },
        { name: "Reno12 Pro 5G", year: 2024, tier: "mid" },
        { name: "Reno12 5G", year: 2024, tier: "mid" },
        { name: "Reno12 F 5G", year: 2024, tier: "mid" },
        { name: "Reno11 Pro 5G", year: 2024, tier: "mid" },
        { name: "Reno11 F 5G", year: 2024, tier: "mid" },
        { name: "Reno11 5G", year: 2023, tier: "mid" },
        { name: "Reno10 Pro+ 5G", year: 2023, tier: "premium" },
        { name: "Reno10 Pro 5G", year: 2023, tier: "mid" },
        { name: "Reno10 5G", year: 2023, tier: "mid" },
        { name: "Reno8 Pro 5G", year: 2022, tier: "mid" },
        { name: "Reno8 5G", year: 2022, tier: "mid" },
        { name: "Reno8 T 5G", year: 2023, tier: "mid" },
        { name: "A98 5G", year: 2023, tier: "mid" },
        { name: "A79 5G", year: 2024, tier: "mid" },
        { name: "A78 5G", year: 2023, tier: "mid" },
        { name: "A78 4G", year: 2023, tier: "budget" },
        { name: "A60", year: 2024, tier: "budget" },
        { name: "A58 5G", year: 2023, tier: "budget" },
        { name: "A58 4G", year: 2023, tier: "budget" },
        { name: "A38", year: 2023, tier: "budget" },
        { name: "A18", year: 2023, tier: "budget" },
        { name: "A17", year: 2022, tier: "budget" },
        { name: "A97 5G", year: 2022, tier: "mid" },
        { name: "A77 5G", year: 2022, tier: "mid" },
        { name: "A57 5G", year: 2022, tier: "budget" },
        { name: "A57 4G", year: 2022, tier: "budget" },
      ],
    },
    {
      name: "OnePlus",
      slug: "oneplus",
      models: [
        { name: "OnePlus 12", year: 2024, tier: "premium" },
        { name: "OnePlus 12R", year: 2024, tier: "mid" },
        { name: "OnePlus 11", year: 2023, tier: "premium" },
        { name: "OnePlus 11R", year: 2023, tier: "mid" },
        { name: "OnePlus 10 Pro", year: 2022, tier: "premium" },
        { name: "OnePlus 10T", year: 2022, tier: "premium" },
        { name: "OnePlus 10R", year: 2022, tier: "mid" },
        { name: "OnePlus 9 Pro", year: 2021, tier: "premium" },
        { name: "OnePlus 9RT", year: 2021, tier: "mid" },
        { name: "OnePlus 9R", year: 2021, tier: "mid" },
        { name: "OnePlus 9", year: 2021, tier: "mid" },
        { name: "OnePlus 8T", year: 2020, tier: "mid" },
        { name: "OnePlus 8 Pro", year: 2020, tier: "premium" },
        { name: "OnePlus 8", year: 2020, tier: "mid" },
        { name: "OnePlus Nord 4", year: 2024, tier: "mid" },
        { name: "OnePlus Nord CE4 Lite 5G", year: 2024, tier: "budget" },
        { name: "OnePlus Nord CE4", year: 2024, tier: "mid" },
        { name: "OnePlus Nord 3 5G", year: 2023, tier: "mid" },
        { name: "OnePlus Nord CE3 Lite 5G", year: 2023, tier: "budget" },
        { name: "OnePlus Nord CE3 5G", year: 2023, tier: "mid" },
        { name: "OnePlus Nord CE2 Lite 5G", year: 2022, tier: "budget" },
        { name: "OnePlus Nord CE2 5G", year: 2022, tier: "mid" },
        { name: "OnePlus Nord 2T", year: 2022, tier: "mid" },
        { name: "OnePlus Nord 2 5G", year: 2021, tier: "mid" },
        { name: "OnePlus Nord CE 5G", year: 2021, tier: "mid" },
        { name: "OnePlus Nord N30 5G", year: 2023, tier: "budget" },
        { name: "OnePlus Nord N20 5G", year: 2022, tier: "budget" },
      ],
    },
    {
      name: "realme",
      slug: "realme",
      models: [
        { name: "realme GT 6", year: 2024, tier: "premium" },
        { name: "realme GT 6T", year: 2024, tier: "mid" },
        { name: "realme GT 5 Pro", year: 2024, tier: "premium" },
        { name: "realme GT 5", year: 2023, tier: "premium" },
        { name: "realme GT3", year: 2023, tier: "premium" },
        { name: "realme GT2 Pro", year: 2022, tier: "premium" },
        { name: "realme GT2 Explorer Master Edition", year: 2022, tier: "premium" },
        { name: "realme GT2", year: 2022, tier: "mid" },
        { name: "realme GT Neo6 SE", year: 2024, tier: "mid" },
        { name: "realme GT Neo5 SE", year: 2023, tier: "mid" },
        { name: "realme GT Neo5", year: 2023, tier: "mid" },
        { name: "realme GT Neo3T", year: 2022, tier: "mid" },
        { name: "realme GT Neo3", year: 2022, tier: "mid" },
        { name: "realme 12 Pro+ 5G", year: 2024, tier: "mid" },
        { name: "realme 12 Pro 5G", year: 2024, tier: "mid" },
        { name: "realme 12 5G", year: 2024, tier: "budget" },
        { name: "realme 12x 5G", year: 2024, tier: "budget" },
        { name: "realme 11 Pro+ 5G", year: 2023, tier: "mid" },
        { name: "realme 11 Pro 5G", year: 2023, tier: "mid" },
        { name: "realme 11 5G", year: 2023, tier: "budget" },
        { name: "realme 10 Pro+ 5G", year: 2023, tier: "mid" },
        { name: "realme 10 Pro 5G", year: 2023, tier: "mid" },
        { name: "realme 10", year: 2022, tier: "budget" },
        { name: "realme C67 5G", year: 2024, tier: "budget" },
        { name: "realme C63 5G", year: 2024, tier: "budget" },
        { name: "realme C53", year: 2023, tier: "budget" },
        { name: "realme C55", year: 2023, tier: "budget" },
      ],
    },
    {
      name: "vivo",
      slug: "vivo",
      models: [
        { name: "X100 Ultra", year: 2024, tier: "premium" },
        { name: "X100 Pro", year: 2024, tier: "premium" },
        { name: "X100", year: 2024, tier: "mid" },
        { name: "X90 Pro+", year: 2023, tier: "premium" },
        { name: "X90 Pro", year: 2023, tier: "premium" },
        { name: "X90s", year: 2023, tier: "mid" },
        { name: "X90", year: 2023, tier: "mid" },
        { name: "X80 Pro", year: 2022, tier: "premium" },
        { name: "X80", year: 2022, tier: "mid" },
        { name: "X70 Pro+", year: 2021, tier: "premium" },
        { name: "X70 Pro", year: 2021, tier: "premium" },
        { name: "X70", year: 2021, tier: "mid" },
        { name: "V30 Pro 5G", year: 2024, tier: "mid" },
        { name: "V30 Lite 5G", year: 2024, tier: "mid" },
        { name: "V30 5G", year: 2024, tier: "mid" },
        { name: "V29 Pro 5G", year: 2023, tier: "mid" },
        { name: "V29e 5G", year: 2023, tier: "mid" },
        { name: "V29 5G", year: 2023, tier: "mid" },
        { name: "V27 Pro 5G", year: 2023, tier: "mid" },
        { name: "V27 5G", year: 2023, tier: "mid" },
        { name: "Y200 Pro 5G", year: 2024, tier: "mid" },
        { name: "Y100A 5G", year: 2024, tier: "budget" },
        { name: "Y100 5G", year: 2023, tier: "budget" },
        { name: "Y56 5G", year: 2023, tier: "budget" },
        { name: "Y36 5G", year: 2023, tier: "budget" },
        { name: "Y17s", year: 2023, tier: "budget" },
        { name: "iQOO 12 Pro", year: 2024, tier: "premium" },
        { name: "iQOO 12", year: 2024, tier: "premium" },
        { name: "iQOO Neo9 Pro", year: 2024, tier: "mid" },
        { name: "iQOO Neo9", year: 2024, tier: "mid" },
      ],
    },
    {
      name: "Google",
      slug: "google",
      models: [
        { name: "Pixel 9 Pro XL", year: 2024, tier: "premium" },
        { name: "Pixel 9 Pro Fold", year: 2024, tier: "premium" },
        { name: "Pixel 9 Pro", year: 2024, tier: "premium" },
        { name: "Pixel 9", year: 2024, tier: "mid" },
        { name: "Pixel 8a", year: 2024, tier: "mid" },
        { name: "Pixel 8 Pro", year: 2023, tier: "premium" },
        { name: "Pixel 8", year: 2023, tier: "mid" },
        { name: "Pixel 7a", year: 2023, tier: "mid" },
        { name: "Pixel 7 Pro", year: 2022, tier: "premium" },
        { name: "Pixel 7", year: 2022, tier: "mid" },
        { name: "Pixel 6a", year: 2022, tier: "mid" },
        { name: "Pixel 6 Pro", year: 2021, tier: "premium" },
        { name: "Pixel 6", year: 2021, tier: "mid" },
        { name: "Pixel 5a", year: 2021, tier: "mid" },
        { name: "Pixel 5", year: 2020, tier: "mid" },
        { name: "Pixel 4a 5G", year: 2020, tier: "mid" },
        { name: "Pixel 4a", year: 2020, tier: "budget" },
        { name: "Pixel 4 XL", year: 2019, tier: "premium" },
        { name: "Pixel 4", year: 2019, tier: "mid" },
        { name: "Pixel 3a XL", year: 2019, tier: "budget" },
        { name: "Pixel 3a", year: 2019, tier: "budget" },
        { name: "Pixel Fold", year: 2023, tier: "premium" },
        { name: "Pixel Tablet", year: 2023, tier: "mid" },
        { name: "Pixel Watch 3", year: 2024, tier: "premium" },
      ],
    },
  ],

  tablet: [
    {
      name: "Apple",
      slug: "apple",
      models: [
        { name: "iPad Pro 13-inch (M4)", year: 2024, tier: "premium" },
        { name: "iPad Pro 11-inch (M4)", year: 2024, tier: "premium" },
        { name: "iPad Pro 12.9-inch (M2)", year: 2022, tier: "premium" },
        { name: "iPad Pro 11-inch (M2)", year: 2022, tier: "premium" },
        { name: "iPad Pro 12.9-inch (M1)", year: 2021, tier: "premium" },
        { name: "iPad Pro 11-inch (M1)", year: 2021, tier: "premium" },
        { name: "iPad Air 13-inch (M2)", year: 2024, tier: "mid" },
        { name: "iPad Air 11-inch (M2)", year: 2024, tier: "mid" },
        { name: "iPad Air (5th Gen)", year: 2022, tier: "mid" },
        { name: "iPad Air (4th Gen)", year: 2020, tier: "mid" },
        { name: "iPad mini (7th Gen)", year: 2024, tier: "mid" },
        { name: "iPad mini (6th Gen)", year: 2021, tier: "mid" },
        { name: "iPad (10th Gen)", year: 2022, tier: "budget" },
        { name: "iPad (9th Gen)", year: 2021, tier: "budget" },
        { name: "iPad (8th Gen)", year: 2020, tier: "budget" },
        { name: "iPad Pro 12.9-inch (2020)", year: 2020, tier: "premium" },
        { name: "iPad Pro 11-inch (2020)", year: 2020, tier: "premium" },
        { name: "iPad Pro 12.9-inch (2019)", year: 2019, tier: "premium" },
        { name: "iPad Pro 11-inch (2018)", year: 2018, tier: "premium" },
        { name: "iPad Air (3rd Gen)", year: 2019, tier: "mid" },
        { name: "iPad mini (5th Gen)", year: 2019, tier: "mid" },
        { name: "iPad (7th Gen)", year: 2019, tier: "budget" },
        { name: "iPad (6th Gen)", year: 2018, tier: "budget" },
      ],
    },
    {
      name: "Samsung",
      slug: "samsung",
      models: [
        { name: "Galaxy Tab S10 Ultra", year: 2024, tier: "premium" },
        { name: "Galaxy Tab S10+", year: 2024, tier: "premium" },
        { name: "Galaxy Tab S10 FE", year: 2024, tier: "mid" },
        { name: "Galaxy Tab S10 5G", year: 2024, tier: "mid" },
        { name: "Galaxy Tab S9 Ultra", year: 2023, tier: "premium" },
        { name: "Galaxy Tab S9+", year: 2023, tier: "premium" },
        { name: "Galaxy Tab S9 FE+", year: 2023, tier: "mid" },
        { name: "Galaxy Tab S9 FE", year: 2023, tier: "mid" },
        { name: "Galaxy Tab S9 5G", year: 2023, tier: "mid" },
        { name: "Galaxy Tab S8 Ultra", year: 2022, tier: "premium" },
        { name: "Galaxy Tab S8+", year: 2022, tier: "premium" },
        { name: "Galaxy Tab S8 5G", year: 2022, tier: "mid" },
        { name: "Galaxy Tab S7 FE", year: 2021, tier: "mid" },
        { name: "Galaxy Tab S7+", year: 2021, tier: "premium" },
        { name: "Galaxy Tab S7 5G", year: 2021, tier: "mid" },
        { name: "Galaxy Tab A9+", year: 2023, tier: "budget" },
        { name: "Galaxy Tab A9 5G", year: 2023, tier: "budget" },
        { name: "Galaxy Tab A9", year: 2023, tier: "budget" },
        { name: "Galaxy Tab A8 (2022)", year: 2022, tier: "budget" },
        { name: "Galaxy Tab A7 Lite", year: 2021, tier: "budget" },
        { name: "Galaxy Tab A7 (2020)", year: 2020, tier: "budget" },
        { name: "Galaxy Tab Active5 5G", year: 2024, tier: "mid" },
        { name: "Galaxy Tab Active4 Pro 5G", year: 2022, tier: "mid" },
      ],
    },
    {
      name: "Huawei",
      slug: "huawei",
      models: [
        { name: "MatePad Pro 13.2 (2024)", year: 2024, tier: "premium" },
        { name: "MatePad Pro 11 (2024)", year: 2024, tier: "premium" },
        { name: "MatePad Pro 12.6 (2021)", year: 2021, tier: "premium" },
        { name: "MatePad 11.5 S", year: 2024, tier: "mid" },
        { name: "MatePad 11.5 (2023)", year: 2023, tier: "mid" },
        { name: "MatePad 11 (2023)", year: 2023, tier: "mid" },
        { name: "MatePad SE 11 (2023)", year: 2023, tier: "budget" },
        { name: "MatePad SE 10.4 (2022)", year: 2022, tier: "budget" },
        { name: "MatePad T10s", year: 2021, tier: "budget" },
        { name: "MatePad T10", year: 2021, tier: "budget" },
        { name: "MatePad (2022)", year: 2022, tier: "budget" },
      ],
    },
    {
      name: "Xiaomi",
      slug: "xiaomi",
      models: [
        { name: "Xiaomi Pad 7 Pro", year: 2025, tier: "premium" },
        { name: "Xiaomi Pad 7", year: 2025, tier: "mid" },
        { name: "Xiaomi Pad 6S Pro 12.4", year: 2024, tier: "premium" },
        { name: "Xiaomi Pad 6 Pro", year: 2023, tier: "premium" },
        { name: "Xiaomi Pad 6", year: 2023, tier: "mid" },
        { name: "Xiaomi Pad 5 Pro 12.4", year: 2022, tier: "premium" },
        { name: "Xiaomi Pad 5 Pro 5G", year: 2021, tier: "premium" },
        { name: "Xiaomi Pad 5 Pro", year: 2021, tier: "mid" },
        { name: "Xiaomi Pad 5", year: 2021, tier: "mid" },
      ],
    },
  ],

  laptop: [
    {
      name: "Apple",
      slug: "apple",
      models: [
        { name: "MacBook Pro 16-inch (M4 Max)", year: 2024, tier: "premium" },
        { name: "MacBook Pro 16-inch (M4 Pro)", year: 2024, tier: "premium" },
        { name: "MacBook Pro 14-inch (M4 Max)", year: 2024, tier: "premium" },
        { name: "MacBook Pro 14-inch (M4 Pro)", year: 2024, tier: "premium" },
        { name: "MacBook Pro 14-inch (M4)", year: 2024, tier: "premium" },
        { name: "MacBook Pro 16-inch (M3 Max)", year: 2023, tier: "premium" },
        { name: "MacBook Pro 16-inch (M3 Pro)", year: 2023, tier: "premium" },
        { name: "MacBook Pro 14-inch (M3 Max)", year: 2023, tier: "premium" },
        { name: "MacBook Pro 14-inch (M3 Pro)", year: 2023, tier: "premium" },
        { name: "MacBook Pro 14-inch (M3)", year: 2023, tier: "premium" },
        { name: "MacBook Pro 16-inch (M2 Max)", year: 2023, tier: "premium" },
        { name: "MacBook Pro 16-inch (M2 Pro)", year: 2023, tier: "premium" },
        { name: "MacBook Pro 14-inch (M2 Max)", year: 2023, tier: "premium" },
        { name: "MacBook Pro 14-inch (M2 Pro)", year: 2023, tier: "premium" },
        { name: "MacBook Pro 13-inch (M2)", year: 2022, tier: "premium" },
        { name: "MacBook Air 15-inch (M3)", year: 2024, tier: "premium" },
        { name: "MacBook Air 13-inch (M3)", year: 2024, tier: "premium" },
        { name: "MacBook Air 15-inch (M2)", year: 2023, tier: "premium" },
        { name: "MacBook Air 13-inch (M2)", year: 2022, tier: "premium" },
        { name: "MacBook Air 13-inch (M1)", year: 2020, tier: "mid" },
        { name: "MacBook Pro 13-inch (M1)", year: 2020, tier: "mid" },
      ],
    },
    {
      name: "Lenovo",
      slug: "lenovo",
      models: [
        { name: "ThinkPad X1 Carbon Gen 12", year: 2024, tier: "premium" },
        { name: "ThinkPad X1 Carbon Gen 11", year: 2023, tier: "premium" },
        { name: "ThinkPad T14s Gen 5", year: 2024, tier: "mid" },
        { name: "ThinkPad T14 Gen 5", year: 2024, tier: "mid" },
        { name: "ThinkPad L14 Gen 5", year: 2024, tier: "mid" },
        { name: "ThinkPad E14 Gen 6", year: 2024, tier: "budget" },
        { name: "ThinkPad P16s Gen 3", year: 2024, tier: "premium" },
        { name: "IdeaPad Slim 5 16", year: 2024, tier: "mid" },
        { name: "IdeaPad Slim 5 14", year: 2024, tier: "mid" },
        { name: "IdeaPad 5 15", year: 2023, tier: "mid" },
        { name: "IdeaPad 3 15", year: 2024, tier: "budget" },
        { name: "Yoga Pro 9i 16", year: 2024, tier: "premium" },
        { name: "Yoga 9i 14", year: 2024, tier: "premium" },
        { name: "Yoga 7i 16", year: 2024, tier: "mid" },
        { name: "Legion 9i Gen 9", year: 2024, tier: "premium" },
        { name: "Legion Pro 7i Gen 9", year: 2024, tier: "premium" },
        { name: "Legion 5i Pro Gen 8", year: 2023, tier: "premium" },
        { name: "Legion 5 Gen 8", year: 2023, tier: "mid" },
      ],
    },
    {
      name: "Dell",
      slug: "dell",
      models: [
        { name: "XPS 15 (9530)", year: 2023, tier: "premium" },
        { name: "XPS 14 (9440)", year: 2024, tier: "premium" },
        { name: "XPS 13 Plus (9320)", year: 2023, tier: "premium" },
        { name: "XPS 13 (9315)", year: 2022, tier: "mid" },
        { name: "Inspiron 16 Plus", year: 2024, tier: "mid" },
        { name: "Inspiron 15 (3535)", year: 2024, tier: "budget" },
        { name: "Inspiron 14 (5440)", year: 2024, tier: "mid" },
        { name: "Latitude 15 5550", year: 2024, tier: "mid" },
        { name: "Latitude 14 5440", year: 2023, tier: "mid" },
        { name: "Precision 5490", year: 2024, tier: "premium" },
        { name: "Alienware m18 R2", year: 2024, tier: "premium" },
        { name: "Alienware m16 R2", year: 2024, tier: "premium" },
        { name: "G16 Gaming (7630)", year: 2023, tier: "mid" },
        { name: "G15 Gaming (5530)", year: 2023, tier: "mid" },
      ],
    },
    {
      name: "HP",
      slug: "hp",
      models: [
        { name: "Spectre x360 14", year: 2024, tier: "premium" },
        { name: "Spectre x360 16", year: 2024, tier: "premium" },
        { name: "Envy x360 15", year: 2024, tier: "mid" },
        { name: "Envy x360 14", year: 2024, tier: "mid" },
        { name: "Pavilion 15", year: 2024, tier: "budget" },
        { name: "Pavilion x360 14", year: 2024, tier: "budget" },
        { name: "EliteBook 840 G11", year: 2024, tier: "premium" },
        { name: "EliteBook 1040 G11", year: 2024, tier: "premium" },
        { name: "ProBook 450 G11", year: 2024, tier: "mid" },
        { name: "OMEN 16", year: 2024, tier: "premium" },
        { name: "Victus 16", year: 2024, tier: "mid" },
        { name: "ZBook Fury 16 G11", year: 2024, tier: "premium" },
      ],
    },
    {
      name: "ASUS",
      slug: "asus",
      models: [
        { name: "ZenBook Pro Duo 15 OLED", year: 2022, tier: "premium" },
        { name: "ZenBook 14 OLED (UX3405)", year: 2024, tier: "mid" },
        { name: "ZenBook S 13 OLED", year: 2023, tier: "premium" },
        { name: "VivoBook S 15 OLED", year: 2024, tier: "mid" },
        { name: "VivoBook 15", year: 2024, tier: "budget" },
        { name: "ExpertBook B9 OLED", year: 2024, tier: "premium" },
        { name: "ROG Zephyrus G16", year: 2024, tier: "premium" },
        { name: "ROG Zephyrus G14", year: 2024, tier: "premium" },
        { name: "ROG Strix SCAR 16", year: 2024, tier: "premium" },
        { name: "TUF Gaming A16", year: 2024, tier: "mid" },
        { name: "TUF Gaming F15", year: 2024, tier: "mid" },
        { name: "ProArt Studiobook 16 OLED", year: 2024, tier: "premium" },
      ],
    },
    {
      name: "Acer",
      slug: "acer",
      models: [
        { name: "Swift X 14 (SFX14-72G)", year: 2024, tier: "mid" },
        { name: "Swift Go 14 (SFG14-73)", year: 2024, tier: "mid" },
        { name: "Swift Go 16", year: 2023, tier: "mid" },
        { name: "Aspire 5 (A515-58)", year: 2023, tier: "budget" },
        { name: "Aspire 3 (A315-44P)", year: 2023, tier: "budget" },
        { name: "Predator Helios Neo 16", year: 2024, tier: "premium" },
        { name: "Predator Helios 18", year: 2024, tier: "premium" },
        { name: "Nitro V 15 ANV15-51", year: 2024, tier: "mid" },
        { name: "Nitro 5 AN515-58", year: 2023, tier: "mid" },
        { name: "ConceptD 7 Ezel Pro", year: 2022, tier: "premium" },
      ],
    },
  ],

  desktop: [
    {
      name: "Apple",
      slug: "apple",
      models: [
        { name: "iMac 24-inch (M4)", year: 2024, tier: "premium" },
        { name: "iMac 24-inch (M3)", year: 2023, tier: "premium" },
        { name: "iMac 24-inch (M1)", year: 2021, tier: "premium" },
        { name: "Mac mini (M4 Pro)", year: 2024, tier: "premium" },
        { name: "Mac mini (M4)", year: 2024, tier: "mid" },
        { name: "Mac mini (M2 Pro)", year: 2023, tier: "premium" },
        { name: "Mac mini (M2)", year: 2023, tier: "mid" },
        { name: "Mac mini (M1)", year: 2020, tier: "mid" },
        { name: "Mac Studio (M4 Max)", year: 2025, tier: "premium" },
        { name: "Mac Studio (M2 Ultra)", year: 2023, tier: "premium" },
        { name: "Mac Studio (M2 Max)", year: 2023, tier: "premium" },
        { name: "Mac Studio (M1 Ultra)", year: 2022, tier: "premium" },
        { name: "Mac Pro (M2 Ultra)", year: 2023, tier: "premium" },
        { name: "Mac Pro (Intel, 2019)", year: 2019, tier: "premium" },
      ],
    },
    {
      name: "Lenovo",
      slug: "lenovo",
      models: [
        { name: "ThinkCentre M90q Gen 4 Tiny", year: 2023, tier: "mid" },
        { name: "ThinkCentre M70q Gen 4 Tiny", year: 2023, tier: "budget" },
        { name: "ThinkStation P3 Tiny", year: 2023, tier: "premium" },
        { name: "IdeaCentre AIO 5i 27", year: 2023, tier: "mid" },
        { name: "IdeaCentre 3 07IAB7", year: 2022, tier: "budget" },
        { name: "Legion Tower 7i Gen 9", year: 2024, tier: "premium" },
      ],
    },
    {
      name: "Dell",
      slug: "dell",
      models: [
        { name: "XPS Desktop 8960", year: 2023, tier: "premium" },
        { name: "Inspiron 27 AIO (7720)", year: 2023, tier: "mid" },
        { name: "OptiPlex 7010 Ultra", year: 2023, tier: "mid" },
        { name: "Precision 3680 Tower", year: 2024, tier: "premium" },
        { name: "Alienware Aurora R16", year: 2024, tier: "premium" },
      ],
    },
    {
      name: "HP",
      slug: "hp",
      models: [
        { name: "ENVY All-in-One 34", year: 2023, tier: "premium" },
        { name: "Pavilion All-in-One 24", year: 2023, tier: "mid" },
        { name: "EliteDesk 800 G9 Mini", year: 2022, tier: "mid" },
        { name: "OMEN 45L GT22-0014", year: 2024, tier: "premium" },
        { name: "OMEN 25L GT15-0015", year: 2024, tier: "mid" },
      ],
    },
    {
      name: "Custom PC",
      slug: "custom-pc",
      models: [
        { name: "Custom Build - Intel Core i9", year: 2024, tier: "premium" },
        { name: "Custom Build - Intel Core i7", year: 2024, tier: "premium" },
        { name: "Custom Build - Intel Core i5", year: 2024, tier: "mid" },
        { name: "Custom Build - AMD Ryzen 9", year: 2024, tier: "premium" },
        { name: "Custom Build - AMD Ryzen 7", year: 2024, tier: "mid" },
        { name: "Custom Build - AMD Ryzen 5", year: 2024, tier: "mid" },
        { name: "Custom Build - Budget (i3/Ryzen 3)", year: 2024, tier: "budget" },
      ],
    },
  ],

  console: [
    {
      name: "Nintendo",
      slug: "nintendo",
      models: [
        { name: "Nintendo Switch OLED", year: 2021, tier: "mid" },
        { name: "Nintendo Switch V2", year: 2019, tier: "mid" },
        { name: "Nintendo Switch (Original)", year: 2017, tier: "budget" },
        { name: "Nintendo Switch Lite", year: 2019, tier: "budget" },
        { name: "Nintendo 3DS XL", year: 2012, tier: "budget" },
      ],
    },
    {
      name: "Sony PlayStation",
      slug: "playstation",
      models: [
        { name: "PlayStation 5 Pro", year: 2024, tier: "premium" },
        { name: "PlayStation 5 Slim (Disc)", year: 2023, tier: "premium" },
        { name: "PlayStation 5 Slim (Digital)", year: 2023, tier: "premium" },
        { name: "PlayStation 5 (Original Disc)", year: 2020, tier: "premium" },
        { name: "PlayStation 5 (Digital Edition)", year: 2020, tier: "mid" },
        { name: "PlayStation 4 Pro", year: 2016, tier: "mid" },
        { name: "PlayStation 4 Slim", year: 2016, tier: "budget" },
        { name: "PlayStation 4 (Original)", year: 2013, tier: "budget" },
      ],
    },
    {
      name: "Microsoft Xbox",
      slug: "xbox",
      models: [
        { name: "Xbox Series X", year: 2020, tier: "premium" },
        { name: "Xbox Series S", year: 2020, tier: "mid" },
        { name: "Xbox One X", year: 2017, tier: "mid" },
        { name: "Xbox One S", year: 2016, tier: "budget" },
      ],
    },
    {
      name: "Valve",
      slug: "valve",
      models: [
        { name: "Steam Deck OLED", year: 2023, tier: "premium" },
        { name: "Steam Deck (Original)", year: 2022, tier: "mid" },
      ],
    },
  ],
};

// --- Price range helpers ---

type PriceRange = { min: number; max: number; duration: number };

function phonePrices(tier: ModelDef["tier"], repairTypeEn: string): PriceRange {
  const base: Record<string, Record<string, PriceRange>> = {
    premium: {
      "Screen Replacement":     { min: 180, max: 350, duration: 60 },
      "Battery Replacement":    { min: 70,  max: 120, duration: 45 },
      "Charging Port Repair":   { min: 60,  max: 100, duration: 60 },
      "Camera Repair":          { min: 90,  max: 180, duration: 60 },
      "Back Cover Replacement": { min: 80,  max: 160, duration: 60 },
      "Speaker/Mic Repair":     { min: 60,  max: 110, duration: 45 },
      "Water Damage Repair":    { min: 90,  max: 180, duration: 120 },
      "Software/Unlock":        { min: 40,  max: 70,  duration: 30 },
    },
    mid: {
      "Screen Replacement":     { min: 80,  max: 200, duration: 60 },
      "Battery Replacement":    { min: 45,  max: 90,  duration: 45 },
      "Charging Port Repair":   { min: 45,  max: 80,  duration: 60 },
      "Camera Repair":          { min: 60,  max: 130, duration: 60 },
      "Back Cover Replacement": { min: 50,  max: 110, duration: 60 },
      "Speaker/Mic Repair":     { min: 45,  max: 90,  duration: 45 },
      "Water Damage Repair":    { min: 70,  max: 140, duration: 120 },
      "Software/Unlock":        { min: 35,  max: 60,  duration: 30 },
    },
    budget: {
      "Screen Replacement":     { min: 50,  max: 120, duration: 60 },
      "Battery Replacement":    { min: 35,  max: 65,  duration: 45 },
      "Charging Port Repair":   { min: 35,  max: 65,  duration: 60 },
      "Camera Repair":          { min: 45,  max: 90,  duration: 60 },
      "Back Cover Replacement": { min: 35,  max: 75,  duration: 60 },
      "Speaker/Mic Repair":     { min: 35,  max: 70,  duration: 45 },
      "Water Damage Repair":    { min: 60,  max: 110, duration: 120 },
      "Software/Unlock":        { min: 30,  max: 50,  duration: 30 },
    },
  };
  return base[tier][repairTypeEn] ?? { min: 40, max: 100, duration: 60 };
}

function tabletPrices(tier: ModelDef["tier"], repairTypeEn: string): PriceRange {
  const base: Record<string, Record<string, PriceRange>> = {
    premium: {
      "Screen Replacement":     { min: 200, max: 450, duration: 90 },
      "Battery Replacement":    { min: 100, max: 180, duration: 60 },
      "Charging Port Repair":   { min: 70,  max: 120, duration: 60 },
      "Camera Repair":          { min: 90,  max: 180, duration: 60 },
      "Speaker Repair":         { min: 70,  max: 130, duration: 60 },
      "Back Cover Replacement": { min: 90,  max: 170, duration: 75 },
    },
    mid: {
      "Screen Replacement":     { min: 100, max: 280, duration: 90 },
      "Battery Replacement":    { min: 70,  max: 130, duration: 60 },
      "Charging Port Repair":   { min: 55,  max: 95,  duration: 60 },
      "Camera Repair":          { min: 70,  max: 140, duration: 60 },
      "Speaker Repair":         { min: 55,  max: 100, duration: 60 },
      "Back Cover Replacement": { min: 65,  max: 130, duration: 75 },
    },
    budget: {
      "Screen Replacement":     { min: 70,  max: 180, duration: 90 },
      "Battery Replacement":    { min: 55,  max: 100, duration: 60 },
      "Charging Port Repair":   { min: 45,  max: 80,  duration: 60 },
      "Camera Repair":          { min: 55,  max: 110, duration: 60 },
      "Speaker Repair":         { min: 45,  max: 85,  duration: 60 },
      "Back Cover Replacement": { min: 50,  max: 100, duration: 75 },
    },
  };
  return base[tier][repairTypeEn] ?? { min: 60, max: 150, duration: 75 };
}

function laptopPrices(tier: ModelDef["tier"], repairTypeEn: string): PriceRange {
  const base: Record<string, Record<string, PriceRange>> = {
    premium: {
      "Screen Replacement":  { min: 250, max: 600, duration: 120 },
      "Battery Replacement": { min: 130, max: 250, duration: 90 },
      "Keyboard Replacement":{ min: 120, max: 280, duration: 90 },
      "Trackpad Repair":     { min: 100, max: 220, duration: 90 },
      "Charging Port Repair":{ min: 90,  max: 180, duration: 75 },
      "Storage Upgrade":     { min: 150, max: 450, duration: 60 },
      "RAM Upgrade":         { min: 100, max: 350, duration: 45 },
      "Cleaning/Cooling":    { min: 70,  max: 130, duration: 60 },
    },
    mid: {
      "Screen Replacement":  { min: 130, max: 380, duration: 120 },
      "Battery Replacement": { min: 90,  max: 180, duration: 90 },
      "Keyboard Replacement":{ min: 90,  max: 200, duration: 90 },
      "Trackpad Repair":     { min: 80,  max: 170, duration: 90 },
      "Charging Port Repair":{ min: 70,  max: 140, duration: 75 },
      "Storage Upgrade":     { min: 100, max: 350, duration: 60 },
      "RAM Upgrade":         { min: 80,  max: 280, duration: 45 },
      "Cleaning/Cooling":    { min: 55,  max: 110, duration: 60 },
    },
    budget: {
      "Screen Replacement":  { min: 90,  max: 250, duration: 120 },
      "Battery Replacement": { min: 70,  max: 140, duration: 90 },
      "Keyboard Replacement":{ min: 70,  max: 160, duration: 90 },
      "Trackpad Repair":     { min: 65,  max: 130, duration: 90 },
      "Charging Port Repair":{ min: 60,  max: 110, duration: 75 },
      "Storage Upgrade":     { min: 80,  max: 280, duration: 60 },
      "RAM Upgrade":         { min: 60,  max: 200, duration: 45 },
      "Cleaning/Cooling":    { min: 45,  max: 90,  duration: 60 },
    },
  };
  return base[tier][repairTypeEn] ?? { min: 70, max: 200, duration: 90 };
}

function desktopPrices(tier: ModelDef["tier"], repairTypeEn: string): PriceRange {
  const base: Record<string, Record<string, PriceRange>> = {
    premium: {
      "Screen Replacement":    { min: 250, max: 700, duration: 120 },
      "Power Supply Repair":   { min: 100, max: 250, duration: 90 },
      "RAM Upgrade":           { min: 100, max: 350, duration: 30 },
      "Storage Upgrade":       { min: 120, max: 450, duration: 45 },
      "Cleaning/Cooling":      { min: 70,  max: 140, duration: 60 },
      "OS Reinstall":          { min: 60,  max: 120, duration: 90 },
    },
    mid: {
      "Screen Replacement":    { min: 150, max: 450, duration: 120 },
      "Power Supply Repair":   { min: 80,  max: 200, duration: 90 },
      "RAM Upgrade":           { min: 80,  max: 280, duration: 30 },
      "Storage Upgrade":       { min: 90,  max: 380, duration: 45 },
      "Cleaning/Cooling":      { min: 55,  max: 110, duration: 60 },
      "OS Reinstall":          { min: 50,  max: 100, duration: 90 },
    },
    budget: {
      "Screen Replacement":    { min: 100, max: 320, duration: 120 },
      "Power Supply Repair":   { min: 70,  max: 160, duration: 90 },
      "RAM Upgrade":           { min: 60,  max: 200, duration: 30 },
      "Storage Upgrade":       { min: 70,  max: 300, duration: 45 },
      "Cleaning/Cooling":      { min: 45,  max: 90,  duration: 60 },
      "OS Reinstall":          { min: 45,  max: 85,  duration: 90 },
    },
  };
  return base[tier][repairTypeEn] ?? { min: 60, max: 200, duration: 60 };
}

function consolePrices(tier: ModelDef["tier"], repairTypeEn: string): PriceRange {
  const base: Record<string, Record<string, PriceRange>> = {
    premium: {
      "Screen Replacement":      { min: 100, max: 280, duration: 90 },
      "Battery Replacement":     { min: 55,  max: 110, duration: 60 },
      "Controller/Joystick Repair": { min: 50, max: 120, duration: 60 },
      "Disc Drive Repair":       { min: 80,  max: 180, duration: 90 },
      "HDMI Port Repair":        { min: 70,  max: 150, duration: 75 },
      "Fan/Cooling Repair":      { min: 60,  max: 130, duration: 75 },
    },
    mid: {
      "Screen Replacement":      { min: 70,  max: 200, duration: 90 },
      "Battery Replacement":     { min: 40,  max: 90,  duration: 60 },
      "Controller/Joystick Repair": { min: 40, max: 100, duration: 60 },
      "Disc Drive Repair":       { min: 65,  max: 150, duration: 90 },
      "HDMI Port Repair":        { min: 55,  max: 120, duration: 75 },
      "Fan/Cooling Repair":      { min: 50,  max: 110, duration: 75 },
    },
    budget: {
      "Screen Replacement":      { min: 50,  max: 140, duration: 90 },
      "Battery Replacement":     { min: 35,  max: 70,  duration: 60 },
      "Controller/Joystick Repair": { min: 35, max: 80, duration: 60 },
      "Disc Drive Repair":       { min: 50,  max: 110, duration: 90 },
      "HDMI Port Repair":        { min: 45,  max: 95,  duration: 75 },
      "Fan/Cooling Repair":      { min: 40,  max: 90,  duration: 75 },
    },
  };
  return base[tier][repairTypeEn] ?? { min: 40, max: 120, duration: 60 };
}

const PRICE_FN: Record<string, (tier: ModelDef["tier"], repairTypeEn: string) => PriceRange> = {
  smartphone: phonePrices,
  tablet: tabletPrices,
  laptop: laptopPrices,
  desktop: desktopPrices,
  console: consolePrices,
};

// --- Main seed function ---

async function main() {
  console.log("🌱 Seeding IERepair device catalog...");

  // 1. Admin user
  const passwordHash = await bcrypt.hash(process.env.ADMIN_INIT_PASSWORD ?? "Admin@123456", 12);
  await prisma.adminUser.upsert({
    where: { email: process.env.ADMIN_INIT_EMAIL ?? "admin@ierepair.ie" },
    update: {},
    create: {
      email: process.env.ADMIN_INIT_EMAIL ?? "admin@ierepair.ie",
      passwordHash,
      name: "Platform Admin",
      role: "admin",
    },
  });
  console.log("  ✓ Admin user ready");

  // 2. Device categories
  const categoryMap = new Map<string, number>();
  for (const cat of CATEGORIES) {
    const record = await prisma.deviceCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, nameEn: cat.nameEn, sortOrder: cat.sortOrder },
      create: cat,
    });
    categoryMap.set(cat.slug, record.id);
  }
  console.log(`  ✓ ${CATEGORIES.length} categories ready`);

  // 3. Repair types per category
  const repairTypeMap = new Map<string, number>(); // key: `${categorySlug}:${nameEn}`
  for (const [catSlug, types] of Object.entries(REPAIR_TYPES)) {
    const catId = categoryMap.get(catSlug)!;
    for (const rt of types) {
      const record = await prisma.repairType.upsert({
        where: { categoryId_nameEn: { categoryId: catId, nameEn: rt.nameEn } },
        update: { name: rt.name, sortOrder: rt.sortOrder },
        create: { name: rt.name, nameEn: rt.nameEn, categoryId: catId, sortOrder: rt.sortOrder },
      });
      repairTypeMap.set(`${catSlug}:${rt.nameEn}`, record.id);
    }
  }
  console.log("  ✓ Repair types ready");

  // 4. Brands, models, and services
  let totalModels = 0;
  let totalServices = 0;

  for (const [catSlug, brandList] of Object.entries(BRANDS)) {
    const catId = categoryMap.get(catSlug)!;
    const priceFn = PRICE_FN[catSlug];
    const repairTypes = REPAIR_TYPES[catSlug];

    for (const brandDef of brandList) {
      const brand = await prisma.deviceBrand.upsert({
        where: { categoryId_slug: { categoryId: catId, slug: brandDef.slug } },
        update: { name: brandDef.name },
        create: { name: brandDef.name, slug: brandDef.slug, categoryId: catId },
      });

      for (const modelDef of brandDef.models) {
        const model = await prisma.deviceModel.upsert({
          where: { brandId_name: { brandId: brand.id, name: modelDef.name } },
          update: { year: modelDef.year },
          create: { name: modelDef.name, brandId: brand.id, year: modelDef.year },
        });
        totalModels++;

        for (const rt of repairTypes) {
          const rtId = repairTypeMap.get(`${catSlug}:${rt.nameEn}`)!;
          const price = priceFn(modelDef.tier, rt.nameEn);
          await prisma.repairService.upsert({
            where: { deviceModelId_repairTypeId: { deviceModelId: model.id, repairTypeId: rtId } },
            update: { basePriceMin: price.min, basePriceMax: price.max, durationMinutes: price.duration },
            create: {
              deviceModelId: model.id,
              repairTypeId: rtId,
              basePriceMin: price.min,
              basePriceMax: price.max,
              durationMinutes: price.duration,
            },
          });
          totalServices++;
        }
      }
    }
    console.log(`  ✓ [${catSlug}] brands & models ready`);
  }

  // 5. Demo merchants
  const merchantHash = await bcrypt.hash("merchant123", 10);
  const merchants = [
    {
      name: "FonFix City Centre",
      email: "merchant@ierepair.ie",
      passwordHash: merchantHash,
      phone: "+353 1 234 5678",
      address: "15 Abbey Street Lower, Dublin 1",
      eircode: "D01 W2X2",
      lat: 53.3478,
      lng: -6.2601,
      mustChangePassword: false,
    },
    {
      name: "FonFix Rathmines",
      email: "rathmines@ierepair.ie",
      passwordHash: merchantHash,
      phone: "+353 1 234 5679",
      address: "44 Rathmines Road Lower, Dublin 6",
      eircode: "D06 X9P2",
      lat: 53.3241,
      lng: -6.2633,
      mustChangePassword: false,
    },
    {
      name: "FonFix Swords",
      email: "swords@ierepair.ie",
      passwordHash: merchantHash,
      phone: "+353 1 234 5680",
      address: "22 Main Street, Swords, Co. Dublin",
      eircode: "K67 X2F5",
      lat: 53.4597,
      lng: -6.2181,
      mustChangePassword: false,
    },
  ];

  const merchantIds: number[] = [];
  for (const m of merchants) {
    const record = await prisma.merchant.upsert({
      where: { email: m.email },
      update: { name: m.name, phone: m.phone, address: m.address, eircode: m.eircode, lat: m.lat, lng: m.lng },
      create: m,
    });
    merchantIds.push(record.id);
  }
  console.log(`  ✓ ${merchants.length} demo merchants ready`);

  // 6. Merchant hours (Mon–Sat open, Sun closed)
  const HOURS = [
    { dayOfWeek: 1, openTime: "09:00", closeTime: "18:00", isClosed: false },
    { dayOfWeek: 2, openTime: "09:00", closeTime: "18:00", isClosed: false },
    { dayOfWeek: 3, openTime: "09:00", closeTime: "18:00", isClosed: false },
    { dayOfWeek: 4, openTime: "09:00", closeTime: "18:00", isClosed: false },
    { dayOfWeek: 5, openTime: "09:00", closeTime: "18:00", isClosed: false },
    { dayOfWeek: 6, openTime: "10:00", closeTime: "17:00", isClosed: false },
    { dayOfWeek: 0, openTime: null,    closeTime: null,    isClosed: true  },
  ];
  for (const merchantId of merchantIds) {
    for (const h of HOURS) {
      await prisma.merchantHours.upsert({
        where: { merchantId_dayOfWeek: { merchantId, dayOfWeek: h.dayOfWeek } },
        update: { openTime: h.openTime, closeTime: h.closeTime, isClosed: h.isClosed },
        create: { merchantId, ...h },
      });
    }
  }
  console.log("  ✓ Merchant hours ready");

  // 7. Merchant services
  const cityCentreId = merchantIds[0];
  const rathminesId  = merchantIds[1];
  const swordsId     = merchantIds[2];

  type SvcDef = { slug: string; modelName: string; repairTypeEn: string; price: number };

  async function upsertMerchantServices(merchantId: number, services: SvcDef[]) {
    for (const svc of services) {
      const catId = categoryMap.get(svc.slug);
      if (!catId) continue;
      const brand = await prisma.deviceBrand.findFirst({
        where: { categoryId: catId, models: { some: { name: svc.modelName } } },
      });
      if (!brand) continue;
      const model = await prisma.deviceModel.findFirst({ where: { brandId: brand.id, name: svc.modelName } });
      if (!model) continue;
      const rt = await prisma.repairType.findFirst({ where: { categoryId: catId, nameEn: svc.repairTypeEn } });
      if (!rt) continue;
      const repairService = await prisma.repairService.findFirst({
        where: { deviceModelId: model.id, repairTypeId: rt.id },
      });
      if (!repairService) continue;
      await prisma.merchantService.upsert({
        where: { merchantId_repairServiceId: { merchantId, repairServiceId: repairService.id } },
        update: { price: svc.price },
        create: { merchantId, repairServiceId: repairService.id, price: svc.price },
      });
    }
  }

  // City Centre — premium iPhone & Samsung flagship specialist
  await upsertMerchantServices(cityCentreId, [
    { slug: "smartphone", modelName: "iPhone 15",       repairTypeEn: "Screen Replacement",  price: 159 },
    { slug: "smartphone", modelName: "iPhone 15",       repairTypeEn: "Battery Replacement", price: 79  },
    { slug: "smartphone", modelName: "iPhone 15 Pro",   repairTypeEn: "Screen Replacement",  price: 219 },
    { slug: "smartphone", modelName: "iPhone 15 Pro",   repairTypeEn: "Battery Replacement", price: 89  },
    { slug: "smartphone", modelName: "iPhone 14",       repairTypeEn: "Screen Replacement",  price: 129 },
    { slug: "smartphone", modelName: "iPhone 14",       repairTypeEn: "Battery Replacement", price: 69  },
    { slug: "smartphone", modelName: "Galaxy S24",      repairTypeEn: "Screen Replacement",  price: 149 },
    { slug: "smartphone", modelName: "Galaxy S24",      repairTypeEn: "Battery Replacement", price: 69  },
    { slug: "smartphone", modelName: "Galaxy S24 Ultra",repairTypeEn: "Screen Replacement",  price: 269 },
    { slug: "smartphone", modelName: "iPhone 13",       repairTypeEn: "Water Damage Repair", price: 119 },
  ]);

  // Rathmines — Samsung & Android specialist, also covers mid-range iPhones
  await upsertMerchantServices(rathminesId, [
    { slug: "smartphone", modelName: "Galaxy S23",      repairTypeEn: "Screen Replacement",  price: 139 },
    { slug: "smartphone", modelName: "Galaxy S23",      repairTypeEn: "Battery Replacement", price: 65  },
    { slug: "smartphone", modelName: "Galaxy S23 Ultra",repairTypeEn: "Screen Replacement",  price: 249 },
    { slug: "smartphone", modelName: "Galaxy S22",      repairTypeEn: "Screen Replacement",  price: 119 },
    { slug: "smartphone", modelName: "Galaxy S22",      repairTypeEn: "Battery Replacement", price: 59  },
    { slug: "smartphone", modelName: "Galaxy A54 5G",   repairTypeEn: "Screen Replacement",  price: 89  },
    { slug: "smartphone", modelName: "Galaxy A54 5G",   repairTypeEn: "Battery Replacement", price: 49  },
    { slug: "smartphone", modelName: "iPhone 13",       repairTypeEn: "Screen Replacement",  price: 109 },
    { slug: "smartphone", modelName: "iPhone 13",       repairTypeEn: "Battery Replacement", price: 59  },
    { slug: "smartphone", modelName: "iPhone 12",       repairTypeEn: "Screen Replacement",  price: 89  },
    { slug: "smartphone", modelName: "iPhone 12",       repairTypeEn: "Battery Replacement", price: 49  },
    { slug: "smartphone", modelName: "Galaxy S23",      repairTypeEn: "Water Damage Repair", price: 109 },
    { slug: "smartphone", modelName: "Galaxy S22",      repairTypeEn: "Charging Port Repair",price: 55  },
  ]);

  // Swords — budget-friendly, older models & everyday repairs
  await upsertMerchantServices(swordsId, [
    { slug: "smartphone", modelName: "iPhone 12",       repairTypeEn: "Screen Replacement",  price: 85  },
    { slug: "smartphone", modelName: "iPhone 12",       repairTypeEn: "Battery Replacement", price: 45  },
    { slug: "smartphone", modelName: "iPhone 11",       repairTypeEn: "Screen Replacement",  price: 75  },
    { slug: "smartphone", modelName: "iPhone 11",       repairTypeEn: "Battery Replacement", price: 45  },
    { slug: "smartphone", modelName: "iPhone 11",       repairTypeEn: "Charging Port Repair",price: 45  },
    { slug: "smartphone", modelName: "Galaxy A54 5G",   repairTypeEn: "Screen Replacement",  price: 79  },
    { slug: "smartphone", modelName: "Galaxy A54 5G",   repairTypeEn: "Battery Replacement", price: 45  },
    { slug: "smartphone", modelName: "Galaxy A54 5G",   repairTypeEn: "Charging Port Repair",price: 40  },
    { slug: "smartphone", modelName: "Pixel 7",         repairTypeEn: "Screen Replacement",  price: 109 },
    { slug: "smartphone", modelName: "Pixel 7",         repairTypeEn: "Battery Replacement", price: 55  },
    { slug: "smartphone", modelName: "iPhone 13",       repairTypeEn: "Battery Replacement", price: 55  },
    { slug: "smartphone", modelName: "iPhone 12",       repairTypeEn: "Water Damage Repair", price: 89  },
  ]);

  console.log("  ✓ Demo merchant services ready (3 stores)");

  // 8. Demo repair bookings — all 3 merchants, all statuses
  async function findSvc(modelName: string, repairTypeEn: string) {
    const catId = categoryMap.get("smartphone")!;
    const model = await prisma.deviceModel.findFirst({
      where: { name: modelName, brand: { categoryId: catId } },
    });
    if (!model) return null;
    const rt = await prisma.repairType.findFirst({ where: { categoryId: catId, nameEn: repairTypeEn } });
    if (!rt) return null;
    return prisma.repairService.findFirst({ where: { deviceModelId: model.id, repairTypeId: rt.id } });
  }

  const svcs = {
    i15Screen:     await findSvc("iPhone 15",  "Screen Replacement"),
    i15Battery:    await findSvc("iPhone 15",  "Battery Replacement"),
    gs23Screen:    await findSvc("Galaxy S23", "Screen Replacement"),
    gs23Battery:   await findSvc("Galaxy S23", "Battery Replacement"),
    i12Screen:     await findSvc("iPhone 12",  "Screen Replacement"),
    i11Battery:    await findSvc("iPhone 11",  "Battery Replacement"),
    ga54Screen:    await findSvc("Galaxy A54 5G", "Screen Replacement"),
  };

  const now = new Date();
  const dt = (offsetDays: number, hour = 10) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  const bookingData = [
    // --- City Centre (4 bookings, all statuses) ---
    {
      orderNumber: "RB-DEMO-0001", merchantId: cityCentreId,
      repairServiceId: svcs.i15Screen?.id,
      status: "pending_confirm", userName: "Aoife Murphy",
      userPhone: "+353 87 123 4567", userEmail: "aoife@example.com",
      appointmentTime: dt(1), quotedPrice: 159,
    },
    {
      orderNumber: "RB-DEMO-0002", merchantId: cityCentreId,
      repairServiceId: svcs.i15Battery?.id,
      status: "confirmed", userName: "Ciarán O'Brien",
      userPhone: "+353 85 987 6543", userEmail: "ciaran@example.com",
      appointmentTime: dt(5, 14), quotedPrice: 79,
    },
    {
      orderNumber: "RB-DEMO-0003", merchantId: cityCentreId,
      repairServiceId: svcs.i15Screen?.id,
      status: "completed", userName: "Siobhán Walsh",
      userPhone: "+353 86 555 1234", userEmail: "siobhan@example.com",
      appointmentTime: dt(-7, 11), quotedPrice: 159, actualPrice: 159,
    },
    {
      orderNumber: "RB-DEMO-0004", merchantId: cityCentreId,
      repairServiceId: svcs.i15Battery?.id,
      status: "cancelled", userName: "Pádraig Kelly",
      userPhone: "+353 83 444 5678",
      appointmentTime: dt(-9, 15), quotedPrice: 79,
      cancelReason: "Customer requested cancellation",
    },
    // --- Rathmines (3 bookings) ---
    {
      orderNumber: "RB-DEMO-0005", merchantId: rathminesId,
      repairServiceId: svcs.gs23Screen?.id,
      status: "pending_confirm", userName: "Fionnuala Brady",
      userPhone: "+353 87 222 3344", userEmail: "fionnuala@example.com",
      appointmentTime: dt(2, 11), quotedPrice: 139,
    },
    {
      orderNumber: "RB-DEMO-0006", merchantId: rathminesId,
      repairServiceId: svcs.gs23Battery?.id,
      status: "confirmed", userName: "Darragh Quinn",
      userPhone: "+353 86 333 4455",
      appointmentTime: dt(3, 14), quotedPrice: 65,
    },
    {
      orderNumber: "RB-DEMO-0007", merchantId: rathminesId,
      repairServiceId: svcs.gs23Screen?.id,
      status: "completed", userName: "Niamh Ryan",
      userPhone: "+353 85 111 9988", userEmail: "niamh@example.com",
      appointmentTime: dt(-5, 10), quotedPrice: 139, actualPrice: 139,
    },
    // --- Swords (3 bookings) ---
    {
      orderNumber: "RB-DEMO-0008", merchantId: swordsId,
      repairServiceId: svcs.i12Screen?.id,
      status: "pending_confirm", userName: "Conor Fitzgerald",
      userPhone: "+353 83 777 8899", userEmail: "conor@example.com",
      appointmentTime: dt(1, 13), quotedPrice: 85,
    },
    {
      orderNumber: "RB-DEMO-0009", merchantId: swordsId,
      repairServiceId: svcs.i11Battery?.id,
      status: "in_progress", userName: "Roisín Gallagher",
      userPhone: "+353 87 555 6677",
      appointmentTime: dt(0, 10), quotedPrice: 45,
    },
    {
      orderNumber: "RB-DEMO-0010", merchantId: swordsId,
      repairServiceId: svcs.ga54Screen?.id,
      status: "completed", userName: "Seán McCarthy",
      userPhone: "+353 86 666 7788",
      appointmentTime: dt(-3, 14), quotedPrice: 79, actualPrice: 79,
    },
  ].filter((b) => b.repairServiceId != null);

  let bookingCount = 0;
  for (const b of bookingData) {
    await prisma.repairBooking.upsert({
      where: { orderNumber: b.orderNumber },
      update: {},
      create: b as Parameters<typeof prisma.repairBooking.create>[0]["data"],
    });
    bookingCount++;
  }
  console.log(`  ✓ Demo repair bookings ready (${bookingCount} across 3 stores)`);

  console.log(`\n✅ Seed complete:`);
  console.log(`   Categories:     ${CATEGORIES.length}`);
  console.log(`   Device models:  ${totalModels}`);
  console.log(`   Repair services:${totalServices}`);
  console.log(`   Merchants:      ${merchants.length}`);
  console.log(`   Bookings:       ${bookingCount} demo bookings (City Centre 4, Rathmines 3, Swords 3)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
