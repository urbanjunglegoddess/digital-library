import { redirect } from "next/navigation";

// Component detail moved under the Knowledge Hub. Redirect old links.
export default async function CatalogSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/knowledge/${slug}`);
}
