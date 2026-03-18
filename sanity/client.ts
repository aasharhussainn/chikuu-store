import { createClient } from "next-sanity";

export const client = createClient({
  projectId: 'b4nguh40', 
  dataset: "production",
  apiVersion: "2024-03-14",
  useCdn: false,
});