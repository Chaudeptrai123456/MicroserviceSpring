export interface UserProfile {
  user_id: string;
  email: string;
  orders: {
    total_orders: number;
    confirmed_orders: number;
    cancelled_orders: number;
    confirmation_rate: number;
    repeat_purchase_rate: number;
    avg_days_between_orders: number;
  };
  revenue: {
    total_revenue: number;
    avg_order_value: number;
    avg_revenue_per_confirmed_order: number;
    customer_lifetime_value: number;
  };
  profit: {
    avg_profit_per_order: number;
    total_estimated_profit: number;
    profit_margin: number;
  };
  price_behavior: {
    price_sensitivity: number;
    discount_usage_rate: number;
    avg_discount_rate_used: number;
  };
  behavior: {
    purchase_frequency_score: number;
    churn_risk: number;
    loyalty_score: number;
  };
  preferences: {
    favorite_categories: string[];
    top_products: string[];
    embedding?: number[];
  };
  segment: string;
  last_updated: string;
}

export interface AIAnalysis {
  summary: string;
  recommendations: string[];
  strategic_score: number;
}
export interface DashboardData {
  totalRevenue: number;
  totalCost: number;
  profitMargin: number;
  totalOrders: number;
  totalCustomers: number;
  orderFrequency: number;
  avgOrderValue: number;
}
export interface ProductChartInfo {
  cost: number;
  date: Date;
  margin: number;
  name: string;
  revenue: number;
}
export interface ProductCompositeChartProps {
  orders: ProductChartInfo[];
}
export type Feature = {
  name: string;
  value: string;
};
export type category = {
  id: string;
  name: string;
  description: string;
};
export type Product = {
  id: string;
  name: string;
  price: number;
  avgCost: number;
  quantity: number;
  description: string;
  category: category;
  images?: ProductImage[];
  features?: Feature[];
};
export type Category = {
  id: string;
  name: string;
};
export type ProductImage = {
  contentType: string;
  filename: string;
  id: number;
  url: string;
};
export type CategorySearch = {
  name: string;
  description: string;
};
export type ProductSearch = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string[];
  category: CategorySearch;
  feature: Feature[];
};
