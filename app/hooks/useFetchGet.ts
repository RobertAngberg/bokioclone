import { useEffect, useState } from "react";

function useFetchGet(url: string) {
  const [fetchData, setFetchData] = useState<any | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!url) return;

    const fetchData = async () => {
      try {
        const fullUrl = url.startsWith("http")
          ? url
          : `https://next-nu-brown.vercel.app${url.startsWith("/") ? "" : "/"}${url}`;

        const response = await fetch(fullUrl);

        if (!response.ok) {
          const msg = `Error ${response.status}: ${response.statusText}`;
          throw new Error(msg);
        }

        const jsonData = await response.json();
        setFetchData(jsonData);
      } catch (err) {
        console.error("❌ useFetchGet failed:", err);
        setError(err as Error);
      }
    };

    fetchData();
  }, [url]);

  return { error, fetchData };
}

export { useFetchGet };
