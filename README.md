
# GeForce Now Thai server queue

โปรเจคแสดงคิวเซิร์ฟเวอร์ GeForce Now สำหรับประเทศไทย

สรุปสั้น ๆ

- โปรเจคนี้เป็นเว็บเล็ก ๆ ที่เขียนด้วย React + TypeScript และรันด้วย Vite
- เป้าหมาย: ดึงข้อมูลคิวเซิร์ฟเวอร์จาก API ของบุคคลที่สาม และแสดงเฉพาะเซิร์ฟเวอร์ที่เป็น region ของประเทศไทย (TH)
- แนะนำใช้ pnpm (มี `pnpm-lock.yaml`) แต่คำสั่ง `npm` ก็ใช้ได้

ของที่อยู่ใน repo

- โค้ดหลัก: `src/` (หน้าเดียว - SPA)
  - `src/App.tsx` — business logic ทั้งหมด: ดึงข้อมูล, กรอง region, แปลง timestamp, และ polling
  - `src/main.tsx`, `index.html` — entry และ mount point
  - `src/*.css` — สไตล์ของหน้า
  - `src/assets/title-logo.avif` — โลโก้

สคริปต์ที่ใช้ (ดู `package.json`)

```bash
# รัน dev server (Vite + HMR)
pnpm dev
# หรือถ้าใช้ npm
npm run dev

# build (TypeScript build + vite build)
pnpm build
# หรือ
npm run build

# preview build
pnpm preview

# lint (ESLint)
pnpm lint
``` 

หมายเหตุสำคัญเกี่ยวกับ build

- คำสั่ง `build` จะรัน `tsc -b && vite build` ดังนั้น TypeScript ถูกตั้งค่าเป็น project references / build mode (ดู `tsconfig.app.json`, `tsconfig.node.json`) — ถ้าจะเปลี่ยนการตั้งค่า TypeScript ให้เช็คไฟล์พวกนี้ด้วย

ข้อมูลสำคัญที่ควรรู้เมื่ออ่านโค้ด (`src/App.tsx`)

- ฟetch API: `https://api.printedwaste.com/gfn/queue/cors/`
- โครงสร้างข้อมูลคาดว่าเป็น `Record<string, QueueEntry>` (ดู interface ใน `App.tsx`)
- การกรองเซิร์ฟเวอร์ไทย: โค้ดจะเลือกเฉพาะ entry ที่ `Region` เป็น `'TH'`, `'THAI'` หรือ `region.startsWith('TH')` — ถ้าต้องการเพิ่มประเทศ/รูปแบบอื่นให้แก้ที่ `fetchThaiServersInner`
- `Last Updated` ในข้อมูลเป็น timestamp เป็นวินาที — เมื่อต้องแปลงเป็น `Date` ให้คูณด้วย `1000` (เช่น `new Date(entry['Last Updated'] * 1000)`)
- การ poll: โค้ดจะเรียก `load()` ทุก 60 วินาที (`setInterval(load, 60000)`) — ถ้าจะเปลี่ยนความถี่ให้แก้ค่าใน `App.tsx`

React Compiler / Performance

- โครงการเปิดใช้งาน React Compiler (และมี `babel-plugin-react-compiler` ใน devDependencies) — นี่อาจกระทบ performance ของ dev/build เล็กน้อย หากต้องการปิดหรือเปลี่ยนพฤติกรรมให้ดู `vite.config.ts` และ plugin ที่ติดตั้ง

ข้อแนะนำการพัฒนาต่อ


- แนะนำใช้ `pnpm` เพื่อให้ตรงกับ `pnpm-lock.yaml` ใน repo:

```bash
pnpm install
pnpm dev
```

- เมื่อแก้ไข behavior หลัก เช่น เงื่อนไขการกรองหรือ polling interval ให้ระบุในการ PR ว่าเปลี่ยนอะไรและทำไม (ตัวอย่าง: "ปรับ polling เป็น 30s", "เพิ่ม region 'TH-SEA' ในการกรอง")

การดีบักเบื้องต้น

- ถ้าเจอปัญหาเกี่ยวกับ TypeScript build: รัน `pnpm build` แล้วอ่าน error จาก `tsc -b` — มักจะมาจากการตั้งค่า project references หรือขาดไฟล์ประกาศ type
- ถ้า CSS หรือ assets ไม่แสดง: ตรวจสอบ path ใน `index.html` และ `src/main.tsx` ว่า mount element (`id="root"`) อยู่ถูกต้อง

การเพิ่ม dependency

- โปรเจคค่อนข้างเล็ก — ก่อนเพิ่ม dependency ใหม่ ให้พิจารณาความจำเป็น เพราะจะเพิ่มความซับซ้อนและขนาด build

อื่น ๆ

- ไม่มีชุดทดสอบอัตโนมัติใน repo ชุดนี้ (ไม่มีโฟลเดอร์ `tests/`) — ถ้าต้องการให้เพิ่ม unit/integration tests แจ้งได้
- ถ้าต้องการ CI สำหรับ build + lint ผมช่วยเพิ่มตัวอย่าง GitHub Actions ได้

ติดต่อ/PR

เปิด PR พร้อมคำอธิบายสั้น ๆ ของการเปลี่ยนแปลงและวิธีทดสอบ (how to test) จะช่วยให้รีวิวเร็วขึ้น

---

ถ้าต้องการผมสามารถ:

- เพิ่มตัวอย่าง GitHub Actions สำหรับ `pnpm build` + `pnpm lint`
- เพิ่มคำสั่ง `README` เป็นภาษาอังกฤษด้วย
- หรือปรับ polling/region filter ให้ตามที่ต้องการและสร้าง PR ตัวอย่างให้

บอกได้เลยว่าจะให้ทำอย่างไหนต่อได้เลย
