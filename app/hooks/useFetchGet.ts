import { useEffect, useState } from "react";

function useFetchGet<T = any>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!url) return;

    const fetchData = async () => {
      try {
        const fullUrl = url.startsWith("http")
          ? url
          : `https://next-nu-brown.vercel.app${url.startsWith("/") ? "" : "/"}${url}`;

        console.log("🌐 Fetching from:", fullUrl);

        const response = await fetch(fullUrl, {
          cache: "no-store", // Force fresh data
        });

        if (!response.ok) {
          const msg = `Error ${response.status}: ${response.statusText}`;
          throw new Error(msg);
        }

        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error("❌ useFetchGet error:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, error, loading };
}

export { useFetchGet };
