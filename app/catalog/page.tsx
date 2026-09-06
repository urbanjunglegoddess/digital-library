import { redirect } from "next/navigation";

// The catalog moved to the Knowledge Hub. Keep this path working for old links.
export default function CatalogRedirect() {
  redirect("/knowledge");
}
