/**
 * Renders a JSON-LD <script> for structured data. Server component — safe to
 * drop into any layout or page. The payload is trusted (built in-app), and we
 * escape "<" to avoid any chance of breaking out of the script tag.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
