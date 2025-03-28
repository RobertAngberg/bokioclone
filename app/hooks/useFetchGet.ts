import { useEffect, useState } from "react";

function useFetchGet(url: string) {
  const [fetchData, setFetchData] = useState<any | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!url) return;

    const fetchDataAsync = async () => {
      try {
        const fullUrl = url.startsWith("http")
          ? url
          : `https://next-nu-brown.vercel.app${url.startsWith("/") ? "" : "/"}${url}`;

        console.log("🌐 Fetching from:", fullUrl);

        const response = await fetch(fullUrl, { cache: "no-store" });

        if (!response.ok) {
          const msg = `Error ${response.status}: ${response.statusText}`;
          throw new Error(msg);
        }

        const json = await response.json();
        setFetchData(json);
      } catch (err) {
        console.error("❌ useFetchGet error:", err);
        setError(err as Error);
      }
    };

    fetchDataAsync();
  }, [url]);

  return { fetchData, error };
}

export { useFetchGet };
