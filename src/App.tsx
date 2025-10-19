import { useEffect, useState } from "react";
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

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await fetchThaiServersInner();
        if (!mounted) return;
        setThaiServers(data);
        setError(null);
      } catch (err: unknown) {
        if (!mounted) return;
        let msg = "Unknown error";
        if (typeof err === "string") msg = err;
        else if (err && typeof err === "object") {
          const e = err as { message?: unknown };
          if (typeof e.message === "string") msg = e.message;
        }
        setError(msg);
      }
    }

    load();
    const id = setInterval(load, 60000); // fetch every 1 minute
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const entries = Object.entries(thaiServers);

  return (
    <div className="app-root">
      <header className="app-header">
        <img src={logo} alt="GeForce Now Logo" />
        <p className="subtitle">รีเฟรชทุก 1 นาที</p>
      </header>

      <main>
        {error && <div className="error">เกิดข้อผิดพลาด: {error}</div>}

        <section className="server-list" role="list">
          {entries.length === 0 ? (
            <div className="empty">ไม่พบเซิร์ฟเวอร์ในไทย</div>
          ) : (
            entries.map(([id, entry]) => {
              // แปลง id เป็นชื่อแผน
              const upId = id.toUpperCase();
              const tier = upId.includes("ULT")
                ? "Ultimate"
                : upId.includes("PREF") || upId.includes("PERF")
                ? "Performance"
                : "Lite";
              return (
                <div key={id} className="server-card" role="listitem">
                  <div className="server-id">{id}</div>
                  <div className="server-tier">แผน: {tier}</div>
                  <div className="server-pos">
                    ลำดับคิว: {entry.QueuePosition}
                  </div>
                  <div className="server-updated">
                    อัปเดต:{" "}
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
