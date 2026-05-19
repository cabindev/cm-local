# Agent Rules — cm-local

## Next.js Version Warning

ใช้ Next.js **16.2.4** ซึ่งมี breaking changes จากเวอร์ชันที่รู้จัก
อ่าน `node_modules/next/dist/docs/` ก่อนเขียนโค้ดใหม่เสมอ

## Critical Rules

### proxy.ts — ห้ามสร้าง middleware.ts
โปรเจกต์นี้ใช้ `proxy.ts` แทน `middleware.ts` สำหรับ route protection
การมีทั้งสองไฟล์พร้อมกันทำให้ build ล้มเหลว

### Cookie Name
NextAuth ใช้ custom cookie ชื่อ `conmunity.session-token`
ทุกที่ที่ใช้ `getToken()` ต้องระบุ `cookieName: 'conmunity.session-token'`

```ts
// ถูกต้อง
const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, cookieName: 'conmunity.session-token' })
```

### Server Actions
ทุก server action ที่แก้ไขข้อมูลต้องขึ้นต้นด้วย `requireAdmin()`:

```ts
import { requireAdmin } from '@/app/lib/auth'

export async function myAction() {
  await requireAdmin()
  // ...
}
```

### DATABASE_URL บน Production
รหัสผ่านที่มี `@` หรือ `/` ต้อง URL-encode ก่อน:
- `@` → `%40`
- `/` → `%2F`

### Telegram Notifications
ใช้ `sendTelegram()` จาก `app/lib/telegram.ts` ได้เลย — มี error handling ภายในแล้ว

## Build Requirement

รัน `npm run build` ก่อน commit และ push ทุกครั้ง
build error = ห้าม push

## Deployment

Production: **blog.sdnthailand.com** บน Plesk Node.js
- Startup file: `server.js`
- Environment variables กำหนดใน Plesk panel (ไม่ใช่ .env)
- `NEXTAUTH_URL` ต้องเป็น `https://blog.sdnthailand.com`
