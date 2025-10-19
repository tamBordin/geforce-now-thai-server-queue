# Copilot instructions for this repository

สรุปสั้น ๆ (TL;DR)

- โปรเจคเป็น React + TypeScript ที่รันด้วย Vite. ใช้ `vite` ในโหมด dev, `tsc -b && vite build` สำหรับ build, และ `eslint .` สำหรับ linting.
- โค้ดหลักอยู่ที่ `src/` — หน้าเดียว (single-page) ข้อมูลและ logic ส่วนใหญ่อยู่ใน `src/App.tsx`.

สำคัญ: คำแนะนำด้านภาษา

- ตอบเป็นภาษาไทยเสมอเมื่อทำงานใน repo นี้ (รวมตัวอย่างโค้ดที่อธิบายเป็นภาษาอังกฤษถ้าจำเป็น).

โครงสร้างและจุดสำคัญ

- `src/App.tsx` — แหล่งข้อมูลหลัก: fetch ข้อมูลคิวจาก
  `https://api.printedwaste.com/gfn/queue/cors/`, กรองเฉพาะ region ที่เป็นไทย (เช็ค `Region` เป็น `TH`, `THAI` หรือขึ้นต้นด้วย `TH`).

  - ข้อมูลคาดว่าเป็น Record<string, QueueEntry> (ดู `QueueEntry` interface ในนั้น).
  - ค่า `Last Updated` เป็น timestamp เป็นวินาที (เมื่อต้องแปลงเป็น Date ให้คูณด้วย 1000).
  - โค้ดจะ poll ทุก 60 วินาที (setInterval(load, 60000)). หากแก้ระยะเวลา ให้แก้ที่ไฟล์นี้.

- `src/main.tsx`, `index.html` — entry และ mount point (id `root`).
- `src/*.css` (`App.css`, `index.css`) — สไตล์รวม; class สำคัญที่ใช้โดยโค้ด: `server-card`, `pos-badge`, `pos-green`, `pos-yellow`, `pos-red`, `skeleton`, `ready`.
- `src/assets/title-logo.avif` — โลโก้ที่หน้าใช้.

สคริปต์ที่ต้องรู้ (จาก `package.json`)

- dev: `npm run dev` หรือ แนะนำใช้ pnpm: `pnpm dev` — รัน Vite dev server (HMR).
- build: `npm run build` หรือ `pnpm build` — จะเรียก `tsc -b && vite build`. ระวัง: repository ใช้ tsc แบบ build-mode (composite) — เช็ค `tsconfig.app.json` และ `tsconfig.node.json` ถ้ามีการแก้ TypeScript project references.
- preview: `npm run preview` — เปิดไฟล์ build ที่สร้างโดย Vite.
- lint: `npm run lint` — รัน ESLint ตาม `eslint.config.js`.

ข้อสังเกตเกี่ยวกับการตั้งค่าและข้อควรระวัง

- `vite.config.ts` ติดตั้ง plugin-react พร้อม `babel-plugin-react-compiler` — README ก็เตือนว่า React Compiler เปิดอยู่ (อาจกระทบ performance dev/build).
- `package.json` มี `overrides` สำหรับ `vite` -> `npm:rolldown-vite@7.1.14`. ระวัง dependency mismatch เมื่ออัพเกรด Vite / plugin-react.
- ไม่มีชุดเทส (no tests directory). ไม่มี CI config ใน repo (ถ้าต้องเพิ่ม ให้เพิ่ม task สำหรับ `pnpm build` และ `pnpm lint`).

การแก้ปัญหาและพัฒนาที่พบบ่อย (ตัวอย่างเฉพาะโค้ด)

- อยากเปลี่ยนเงื่อนไขการกรองเซิร์ฟเวอร์ไทย: แก้ใน `src/App.tsx` ฟังก์ชัน `fetchThaiServersInner` — ถ้ามี region ใหม่ ให้เพิ่มในเงื่อนไข `region === 'TH' || region === 'THAI' || region.startsWith('TH')`.
- เพิ่ม/แก้ polling interval: แก้ `setInterval(load, 60000)` (ค่าเป็น milliseconds).
- แปลง timestamp: ใช้ `new Date(entry['Last Updated'] * 1000)` (อย่าลืม \*1000).
- เพิ่มข้อมูลบนการ์ด server: แก้ JSX ใน `entries.map` ของ `src/App.tsx`.

การดีบักและรันตัวอย่าง

- แนะนำใช้ pnpm (repo มี `pnpm-lock.yaml`). ตัวอย่างคำสั่งที่ใช้บ่อย:
  - `pnpm install`
  - `pnpm dev` (หรือ `npm run dev`)
  - `pnpm build`
  - `pnpm preview`
  - `pnpm lint`

ไฟล์สำคัญให้เช็คเมื่อเปลี่ยนพฤติกรรม

- `src/App.tsx` — ฟีเจอร์หลักและ business logic (polling, filter, mapping to UI).
- `vite.config.ts` — plugin / babel config (มี react compiler).
- `eslint.config.js` — กฎ lint ที่ใช้ (types + react-hooks + vite refresh).
- `tsconfig.app.json`, `tsconfig.node.json` — ถ้าปรับ TypeScript ให้ตรวจไฟล์เหล่านี้.

เมื่อสร้าง PR หรือเปลี่ยน behavior:

- ให้ระบุไฟล์ที่เปลี่ยนและเหตุผลสั้น ๆ (เช่น "ปรับ polling เป็น 30s" หรือ "เพิ่มฟิลด์ region display")
- ถ้าเพิ่ม dependency ใหม่ ให้ระบุเหตุผลว่าจำเป็นจริง ๆ เพราะขนาดโปรเจคเล็กและไม่มี infra เพิ่มเติม.

คำถามหรือไม่ชัดเจน

- ถ้าต้องการให้เพิ่ม testing, CI, หรือกฎ commit conventions แจ้งมาว่าต้องการแบบใด (ฉันสามารถเพิ่มตัวอย่าง config ให้ได้).

---

โปรดบอกว่าต้องการให้ขยายส่วนใด (เช่น เพิ่มตัวอย่าง PR template, CI job, หรือเพิ่มคำแนะนำการทดสอบแบบหน่วย/อินทิเกรชัน)
