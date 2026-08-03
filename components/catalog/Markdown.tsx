import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders a ported deep-spec doc body. The content is treated as GitHub-
 * flavored Markdown (tables, task lists, etc.) — not MDX — so arbitrary
 * ported prose and code never break the build. Raw HTML is ignored by default,
 * which keeps untrusted-looking content safe.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="doc-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
