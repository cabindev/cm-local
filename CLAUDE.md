@AGENTS.md

# Community Driven — cm-local

ระบบบันทึกและติดตามข้อมูลโครงการชุมชนสุขภาวะ (กพร.) ครอบคลุม 3 ปี

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.4 (Turbopack, App Router) |
| Auth | NextAuth v4 (Credentials Provider, JWT) |
| ORM | Prisma + MySQL |
| UI | Tailwind CSS + Lucide React |
| Charts | Recharts |
| Notifications | Telegram Bot API |
| Hosting | Plesk — blog.sdnthailand.com |

## Commands

```bash
npm run dev      # dev server (port 3000)
npm run build    # production build — run before push เสมอ
npm run start    # start production server
npx prisma migrate dev   # run migration
npx prisma studio        # DB GUI
```

## Project Structure

```
app/
  actions/          # Server Actions ('use server')
    dashboard.ts    # KPI stats สำหรับ dashboard
    person.ts       # CRUD สมาชิกรายบุคคล
    village.ts      # CRUD หมู่บ้าน
    village-data.ts # ข้อมูลเพิ่มเติมหมู่บ้าน (env, org, screening)
    user.ts         # toggleUserRole
  api/
    auth/           # NextAuth routes + signup + forgot/reset password
    report/export/  # Export Excel
    upload/         # File upload (community docs)
  components/auth/  # SignInForm, SignUpForm, SignOutButton
  dashboard/        # Protected pages (ADMIN/SUPERADMIN เท่านั้น)
    components/     # Charts, KPI cards, Sidebar, DashboardClient
    villages/       # รายการ/รายละเอียด/แก้ไข/ประเมินหมู่บ้าน
    members/        # รายชื่อสมาชิก
    users/          # จัดการ user roles
    report/         # รายงาน/export
  lib/
    auth.ts         # requireAdmin() — ใช้ใน server actions
    telegram.ts     # sendTelegram() — notifications
    prisma.ts       # Prisma client singleton
    province-zone.ts
proxy.ts            # Route protection (แทน middleware.ts)
server.js           # Production HTTP server
prisma/schema.prisma
```

## Auth & Roles

- Roles: `MEMBER` (default), `ADMIN`, `SUPERADMIN`
- Cookie name: `conmunity.session-token` (custom — ต้องระบุใน getToken ด้วย)
- **`proxy.ts`** ป้องกัน `/dashboard` ที่ edge level — **ห้ามสร้าง `middleware.ts`** (ขัดกัน)
- Server actions ใช้ `requireAdmin()` จาก `app/lib/auth.ts` ตรวจสอบอีกชั้น
- Dashboard layout (`'use client'`) ใช้ `useSession()` เป็น fallback

## Database Models (Prisma)

```
User, Village, ScreeningResult, CommunityBackground,
AlcoholMember, TobaccoMember, DrinkNotDriveMember,
EnvItem, CommunityOrg,
Person, PersonAlcohol, PersonTobacco, PersonDnd
```

## Environment Variables

| Variable | ใช้ที่ |
|----------|--------|
| `DATABASE_URL` | Prisma connection (URL-encode special chars ใน password) |
| `NEXTAUTH_SECRET` | JWT signing |
| `NEXTAUTH_URL` | ต้องตรงกับ domain จริง (`https://blog.sdnthailand.com` บน production) |
| `EMAIL_USER` / `EMAIL_PASS` | Reset password email |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Signup/signin notifications |

## Conventions

- Server actions ทุกตัวที่แก้ข้อมูลต้องเรียก `requireAdmin()` ก่อน
- ใช้ `revalidatePath()` หลัง mutate ทุกครั้ง
- Dashboard pages เป็น **Server Components** ยกเว้นส่วนที่ต้องการ interaction (`'use client'`)
- ไม่มี `middleware.ts` — ใช้ `proxy.ts` เท่านั้น
- `sendTelegram()` ใช้ try/catch ภายในแล้ว — ไม่ต้อง wrap อีกชั้น
- Build ต้องผ่านก่อน push เสมอ
