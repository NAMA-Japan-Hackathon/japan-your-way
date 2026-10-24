import type { MetroData } from "@/lib/metro";
export const networkLoaders: Record<string, () => Promise<MetroData>> = {
  Sapporo: () => import("./sapporo.json").then((m) => m.default),
  Sendai: () => import("./sendai.json").then((m) => m.default),
  Tokyo: () => import("./tokyo.json").then((m) => m.default),
  Yokohama: () => import("./yokohama.json").then((m) => m.default),
  Nagoya: () => import("./nagoya.json").then((m) => m.default),
  Kyoto: () => import("./kyoto.json").then((m) => m.default),
  Osaka: () => import("./osaka.json").then((m) => m.default),
  Kobe: () => import("./kobe.json").then((m) => m.default),
  Fukuoka: () => import("./fukuoka.json").then((m) => m.default),
  Naha: () => import("./naha.json").then((m) => m.default),
};
