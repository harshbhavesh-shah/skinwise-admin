// A point-in-time copy of the storefront's product catalog (name/brand/slug
// only) — skinwise-admin and skinwise-ecommerce are separate deployments
// with no runtime API between them, so this can't be a live import. Used
// only to seed missing inventory rows on first load of the Inventory page.
// When a new product is added to the storefront catalog, add its entry here
// too so it shows up in the inventory table.
export type CatalogSeedEntry = {
  slug: string;
  brand: string;
  name: string;
};

export const CATALOG_SEED: CatalogSeedEntry[] = [
  { slug: "bioderma-sensibio-h2o-micellar-water", brand: "Bioderma", name: "Sensibio H2O Micellar Water" },
  { slug: "bioderma-sebium-foaming-gel", brand: "Bioderma", name: "Sébium Foaming Gel" },
  { slug: "bioderma-atoderm-cream", brand: "Bioderma", name: "Atoderm Cream" },
  { slug: "bioderma-node-anti-dandruff-shampoo", brand: "Bioderma", name: "Node Anti-Dandruff Shampoo" },
  { slug: "bioderma-pigmentbio-foaming-cream", brand: "Bioderma", name: "Pigmentbio Foaming Cream" },
  { slug: "bioderma-atoderm-intensive-baume", brand: "Bioderma", name: "Atoderm Intensive Baume" },
  { slug: "cerave-foaming-facial-cleanser", brand: "CeraVe", name: "Foaming Facial Cleanser" },
  { slug: "cerave-hydrating-facial-cleanser", brand: "CeraVe", name: "Hydrating Facial Cleanser" },
  { slug: "cerave-moisturizing-cream", brand: "CeraVe", name: "Moisturizing Cream" },
  { slug: "cerave-sa-renewing-lotion", brand: "CeraVe", name: "SA Renewing Lotion" },
  { slug: "cerave-resurfacing-retinol-serum", brand: "CeraVe", name: "Resurfacing Retinol Serum" },
  { slug: "cerave-skin-renewing-vitamin-c-serum", brand: "CeraVe", name: "Skin Renewing Vitamin C Serum" },
  { slug: "cerave-dandruff-relief-shampoo", brand: "CeraVe", name: "Dandruff Relief Shampoo" },
  { slug: "cerave-blemish-control-cleanser", brand: "CeraVe", name: "Blemish Control Cleanser" },
  { slug: "la-roche-posay-effaclar-duo-acne-treatment", brand: "La Roche-Posay", name: "Effaclar Duo Acne Treatment" },
  { slug: "la-roche-posay-anthelios-sunscreen-spf-50", brand: "La Roche-Posay", name: "Anthelios Sunscreen SPF 50" },
  { slug: "la-roche-posay-toleriane-sensitive-cream", brand: "La Roche-Posay", name: "Toleriane Sensitive Cream" },
  { slug: "la-roche-posay-lipikar-balm-ap-plus", brand: "La Roche-Posay", name: "Lipikar Balm AP+" },
  { slug: "la-roche-posay-pigmentclar-serum", brand: "La Roche-Posay", name: "Pigmentclar Serum" },
  { slug: "la-roche-posay-mela-b3-serum", brand: "La Roche-Posay", name: "Mela B3 Serum" },
  { slug: "la-roche-posay-mela-b3-cleanser", brand: "La Roche-Posay", name: "Mela B3 Cleanser" },
  { slug: "la-roche-posay-anthelios-uvmune-400-fluide", brand: "La Roche-Posay", name: "Anthelios UVmune 400 Fluide Invisible SPF 50+" },
  { slug: "la-roche-posay-anthelios-uvmune-400-oil-control", brand: "La Roche-Posay", name: "Anthelios UVmune 400 Oil Control Fluide SPF 50+" },
  { slug: "neutrogena-hydro-boost-water-gel", brand: "Neutrogena", name: "Hydro Boost Water Gel" },
  { slug: "neutrogena-rapid-wrinkle-repair-serum", brand: "Neutrogena", name: "Rapid Wrinkle Repair Serum" },
  { slug: "neutrogena-ultra-sheer-sunscreen-spf-55", brand: "Neutrogena", name: "Ultra Sheer Sunscreen SPF 55" },
  { slug: "eucerin-advanced-repair-cream", brand: "Eucerin", name: "Advanced Repair Cream" },
  { slug: "eucerin-eczema-relief-cream", brand: "Eucerin", name: "Eczema Relief Cream" },
  { slug: "vanicream-gentle-facial-cleanser", brand: "Vanicream", name: "Gentle Facial Cleanser" },
  { slug: "avene-cicalfate-plus-repair-cream", brand: "Avène", name: "Cicalfate+ Repair Cream" },
  { slug: "nizoral-anti-dandruff-shampoo", brand: "Nizoral", name: "Anti-Dandruff Shampoo" },
];
