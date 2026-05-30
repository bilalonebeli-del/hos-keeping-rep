// Housekeeping Pro
// Author: [Bilal]
// Developed: May 2026
// Stack: Next.js 14 + Supabase
//
// IDs match Supabase: staff.id = LTR-xxxx, stores.id = AUxx

import type { Staff, Store } from "@/lib/types";

export const CATALOG_STAFF: Staff[] = [
  { id: "LTR-1444", name: "Anees Ahamed Anwar Din", employee_id: "LTR-1444" },
  { id: "LTR-2526", name: "Belal Ahmad", employee_id: "LTR-2526" },
  { id: "LTR-1772", name: "Beth Gakenia Wanjiku", employee_id: "LTR-1772" },
  { id: "LTR-2625", name: "Ddiba Abbas", employee_id: "LTR-2625" },
  { id: "LTR-2614", name: "Jeferson Viernes Gumangan", employee_id: "LTR-2614" },
  { id: "LTR-2408", name: "Mahendhar Simharaju", employee_id: "LTR-2408" },
  { id: "LTR-1769", name: "Michael Kawalya", employee_id: "LTR-1769" },
  { id: "LTR-1916", name: "Mohamed Safran Mohamed Kaleel", employee_id: "LTR-1916" },
  { id: "LTR-2435", name: "Netra Bahadur Mahato", employee_id: "LTR-2435" },
  { id: "LTR-1917", name: "Nisha Dhungana", employee_id: "LTR-1917" },
  { id: "LTR-2422", name: "Oshada Chathuranga Migalahandi", employee_id: "LTR-2422" },
  { id: "LTR-2547", name: "Santila Paudel Rena", employee_id: "LTR-2547" },
  { id: "LTR-1762", name: "Shankar Yogi", employee_id: "LTR-1762" },
];

export const CATALOG_STORES: Store[] = [
  { id: "AU01", code: "AU01", name: "Flagship ADDF Supermarket" },
  { id: "AU02", code: "AU02", name: "Le Gourmet" },
  { id: "AU03", code: "AU03", name: "Entry to Pier C - RU2027" },
  { id: "AU04", code: "AU04", name: "Beauty Studio - RU2028" },
  { id: "AU05", code: "AU05", name: "Entry to Pier B - RU2041" },
  { id: "AU06", code: "AU06", name: "Le Club - RU2101" },
  { id: "AU07", code: "AU07", name: "Last minute D - RU2141" },
  { id: "AU09", code: "AU09", name: "Last minute B - RU2163" },
  { id: "AU10", code: "AU10", name: "Little Scent - RU2099" },
  { id: "AU11", code: "AU11", name: "Last Minute A - RU2114" },
  { id: "AU12", code: "AU12", name: "Arrival store - RU1001" },
  { id: "AU13", code: "AU13", name: "SAMSONITE" },
  { id: "AU14", code: "AU14", name: "Last Minute C-RU2156" },
];
