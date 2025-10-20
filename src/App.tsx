import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import logo from "./assets/title-logo.avif";

export interface QueueEntry {
  QueuePosition: number;
  "Last Updated": number;
  Region: string;
}

export type QueueResponse = Record<string, QueueEntry>;

function App() {
  const [thaiServers, setThaiServers] = useState<QueueResponse>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const firstLoadRef = useRef(true);
  const isMountedRef = useRef(true);

  async function fetchThaiServersInner() {
    const res = await fetch("https://api.printedwaste.com/gfn/queue/cors/");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as QueueResponse;
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([, entry]) => {
        const region = (entry.Region ?? "").toString().toUpperCase();
        return region === "TH" || region === "THAI" || region.startsWith("TH");
      })
    ) as QueueResponse;
    return filtered;
  }

  // Fetch with retry: attempts times, delayMs between attempts
  const fetchWithRetry = useCallback(
    async (attempts = 3, delayMs = 5000): Promise<QueueResponse> => {
      let lastErr: unknown = null;
      for (let i = 0; i < attempts; i++) {
        try {
          const data = await fetchThaiServersInner();
          return data;
        } catch (e) {
          lastErr = e;
          // if this was the last attempt, rethrow
          if (i === attempts - 1) break;
          // otherwise wait delayMs before next try
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          // if unmounted while waiting, stop
          if (!isMountedRef.current) throw new Error("unmounted");
        }
      }
      throw lastErr;
    },
    []
  );

  useEffect(() => {
    isMountedRef.current = true;

    async function load() {
      try {
        if (firstLoadRef.current) setIsLoading(true);
        const data = await fetchWithRetry(3, 5000);
        if (!isMountedRef.current) return;
        setThaiServers(data);
        setError(null);
        if (firstLoadRef.current) {
          firstLoadRef.current = false;
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!isMountedRef.current) return;
        let msg = "Unknown error";
        if (typeof err === "string") msg = err;
        else if (err && typeof err === "object") {
          const e = err as { message?: unknown };
          if (typeof e.message === "string") msg = e.message;
        }
        setError(msg);
        if (firstLoadRef.current) {
          firstLoadRef.current = false;
          setIsLoading(false);
        }
      }
    }

    load();
    const id = setInterval(load, 60000); // fetch every 1 minute
    return () => {
      isMountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchWithRetry]);

  const entries = Object.entries(thaiServers);

  const getPosClass = (pos: number) => {
    if (pos === 0) return "pos-green";
    if (pos > 0 && pos <= 20) return "pos-yellow";
    return "pos-red";
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <img src={logo} alt="GeForce Now Logo" />
        <p className="subtitle">รีเฟรชทุก 1 นาที</p>
      </header>

      <main>
        {error && <div className="error">เกิดข้อผิดพลาด: {error}</div>}

        <section className="server-list" role="list">
          {isLoading ? (
            // show 3 skeleton cards while first load
            new Array(3)
              .fill(null)
              .map((_, i) => (
                <div key={`skeleton-${i}`} className="server-card skeleton" />
              ))
          ) : entries.length === 0 ? (
            <div className="empty">ไม่พบเซิร์ฟเวอร์ในไทย</div>
          ) : (
            entries.map(([id, entry]) => {
              // แปลง id เป็นชื่อแผน
              const upId = id.toUpperCase();
              const tier = upId.includes("ULT")
                ? "Ultimate"
                : upId.includes("PREF")
                ? "Performance"
                : "Lite";

              return (
                <div
                  key={id}
                  className={`server-card ${
                    entry.QueuePosition === 0 ? "ready" : ""
                  }`}
                  role="listitem"
                >
                  <div className="server-tier">แผน: {tier}</div>
                  <div className="server-pos">
                    ลำดับคิว:
                    <span
                      className={`pos-badge ${getPosClass(
                        entry.QueuePosition
                      )}`}
                    >
                      {entry.QueuePosition}
                    </span>
                  </div>
                  <div className="server-updated">
                    อัปเดต:
                    {new Date(entry["Last Updated"] * 1000).toLocaleString(
                      "th-TH"
                    )}
                  </div>
                  <div className="server-region">ภูมิภาค: {entry.Region}</div>
                </div>
              );
            })
          )}
        </section>
      </main>

      <footer className="app-footer">
        <small>ตรวจสอบล่าสุดทุก 1 นาที</small>
      </footer>
    </div>
  );
}

export default App;
