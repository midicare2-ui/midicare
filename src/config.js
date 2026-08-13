/* ==========================================================================
   MEDICARE — SUPABASE CONFIGURATION & ENVIRONMENT KEYS
   Centralized configuration for Supabase backend integration
   ========================================================================== */

window.MEDICARE_CONFIG = {
  // Replace these placeholders with your live Supabase project credentials
  SUPABASE_URL: window.ENV_SUPABASE_URL || 'https://icmpgdkosxyjihlgbjkd.supabase.co',
  SUPABASE_ANON_KEY: window.ENV_SUPABASE_ANON_KEY || 'sb_publishable_O5zIcoIgNRum1Sj2wsGf6A_PEBXQplt',
  
  // App Defaults
  DEFAULT_CURRENCY: 'DZD',
  PRODUCTS_PER_PAGE: 16,
  FREE_SHIPPING_THRESHOLD: 35000,
  AUTO_LOGOUT_MINUTES: 15
};
