# TechHome frontend — agent yo‘riqnomasi

## Ishlash tartibi

- Joriy faol repository: `/Users/omadbek/Desktop/TechHome-react`. Qo‘shni backend/frontend ham Desktop’da. Arxivdagi eski papkada Desktop’ga ko‘chirilganlik eslatmasi bor; yangi alohida nusxa yaratmang. Birlashtirish tarixi: [hisobot](../TechHome/docs/desktop-consolidation-2026-11-04.md).

- Foydalanuvchiga o‘zbekcha: o‘zgarish, sabab, tekshiruv natijasi va cheklovlarni tushuntiring.
- [Tasdiqlangan upgrade rejasi](../TechHome/docs/upgrade-plan.md) va [boshlang‘ich o‘zgarishlar](../TechHome/docs/upgrade-baseline-2026-11-01.md)ni hisobga oling. Joriy foydalanuvchi topshirig‘i ustun.
- Bog‘liq ish **backend → backend testlari → frontend → integratsiya → foydalanuvchi review** tartibida. Backend `../TechHome`da; backend/frontend tahrirlarini parallel bajarmang.
- Har raqamlangan bosqichdan so‘ng natijani ko‘rsatib review uchun to‘xtang; keyingi bosqich faqat tasdiqdan keyin. Bosqich ichida backenddan frontendga o‘tish uchun yana tasdiq shart emas.
- Oldindan mavjud tracked/untracked o‘zgarishlarni saqlang; reset/revert yoki ommaviy overwrite qilmang. Faylni avval o‘qing.
- Commit, push, merge, serverga yozish va deploy alohida foydalanuvchi ko‘rsatmasi bilan. `deploy.sh` faqat lokal Docker image quradi.

## Stack, API va session

- `src/index.tsx`da MUI styles/theme modullarini App/feature komponentlaridan oldin import qiling; aks holda Vite dev optimizer’da createTheme initialization xatosi qaytishi mumkin. Buni faqat build emas, dev browser bilan ham tekshiring.
- Hozir React 18, Vite, Vitest/React Testing Library, TypeScript 5, React Router 5, Redux, MUI 5/CSS. CRA va MUI 4 olib tashlangan; React/Redux, mavjud route va dizayn saqlangan. Next.js migratsiyasi yo‘q.
- Mavjud `src/app/screens`, `components`, `services`, `src/lib/types/enums` va `src/css` tuzilmasini saqlang. Sababsiz yangi framework yoki abstraksiya qo‘shmang.
- Backend kontrakti demo/fixture yoki frontend taxminidan ustun. Backend qo‘llamagan amalni ishlaydi deb ko‘rsatmang; route/response o‘zgarsa avval backend testlari o‘tgan bo‘lsin.
- API `import.meta.env.VITE_API_URL`dan olinadi; development’da faqat loopback API/frontend hostlari `resolveApiUrl` bilan bir xil hostname’ga moslanadi (CSRF session cookie uchun), remote va production URL o‘zgarmaydi. [Auth tuzatishi](../TechHome/docs/auth-localhost-fix-2026-11-04.md); `.env.example` va lokal `.env.local`, faqat public config. Lokal `.env` Git kuzatuvidan chiqarilgan. Secretlar frontend env yoki bundle’ga kirmasin.
- Session backend `/member/detail` javobidan tiklanadi; cookie/`memberData`dan identity o‘qilmaydi. HttpOnly JWT browser storage’da yoki JS cookie reader’da bo‘lmasin. Auth loading/error holatida protected ekranlar mount qilinmaydi.
- Credential bilan so‘rovlarda `src/lib/api/client.ts`dan foydalaning: CSRF, session epoch, 401 event. Login yangi CSRF qaytaradi; POST retry avtomatik emas. Logout/identity/window-tab change private cache va eski javoblarni bekor qiladi. Joriy [auth kontrakti](../TechHome/docs/auth-security.md), [hisobot](../TechHome/docs/stage-2-summary.md).
- Narx/stock/total/status serverdan. Savat estimate yakuniy summa emas. Double-submitni bloklang; bitta niyatning retry’sida `Idempotency-Key` o‘zgarmasin.
- 5-bosqich: UI matni `src/lib/i18n`dagi `useI18n`/`translate` orqali UZ/RU/ENda bo‘lsin. `errorMessage` stable code’ni tarjima qiladi, raw server message’ni chiqarmaydi. Til setter’ida route/query/auth yoki savatni reset qilmang. Katalog nom/tavsifi original ma’lumot, taxminiy tarjima yo‘q. Yangi key uch tilda va bir xil interpolation tokenlari bilan; `responsive.css`dagi feature override tartibini saqlang. [Kontrakt](../TechHome/docs/ui-language-errors.md), [hisobot](../TechHome/docs/stage-5-summary.md).
- 4-bosqich [katalog kontrakti](../TechHome/docs/catalog-contract.md): `/product/catalog` haqiqiy total bilan, query helper `src/lib/catalog/query.ts`; sort/filter o‘zgarishi page=1. Comparison provider products/advisor route guruhida, max 3, ochilganda current detail qayta olinadi. Missing specs, unavailable va error/retry ajratilsin; frontend installmentni o‘zi hisoblamasin.
- 3-bosqich [order kontrakti](../TechHome/docs/order-checkout.md): `src/lib/order/checkout.ts` retry niyatini member/cart signature bo‘yicha sessionStorage’da saqlaydi. Snapshot itemlar current productData’dan ustun, legacy `readOnly` orderlarda amal yo‘q. Server javobisiz status/summa muvaffaqiyatini ko‘rsatmang.
- Payment demo: haqiqiy karta/CVV yig‘mang, saqlamang yoki loglamang; demo tasdiqlashni real payment deb atamang.
- Frontendda GraphQL yoki Hotelia’ga xos kontraktni qo‘shmang: TechHome REST API’dan foydalanadi.

## Dizayn va foydalanuvchi oqimlari

- Auth oynasidagi asl `/img/auth1.webp` rasm va rasm/form ikki ustunli dizaynni saqlang; mobil ekranda rasm tepada. Funksional auth tahriri bahonasida rasmni olib tashlamang yoki dizaynni soddalashtirmang.
- Mavjud forest/amber/paper ranglari, typography, ProductTile va UI uslubini saqlang. UI library avlodlarini sababsiz ko‘paytirmang.
- Loading, haqiqiy empty, network error va retry’ni ajrating; background refresh sahifani pirpiratmasin. Route ID almashsa detail yangilansin.
- Filter/pagination URL’da; til almashganda route/query saqlanadi. Joriy UZ/RU/EN tizimidan foydalaning.
- Mahsulot specs noma’lum bo‘lsa uydirmang. Statik rating yoki tasdiqlanmagan delivery/trade-in va’dasini haqiqiy imkoniyat sifatida ko‘rsatmang.
- Comparison uchtagacha mahsulot bilan; noma’lum qiymatlar ochiq ko‘rsatiladi. Zero-stock qo‘shishni bloklang; server baribir yakuniy tekshiradi.
- Fallback rasm fayli mavjud bo‘lsin; image error, noto‘g‘ri localStorage JSON va bo‘sh natijadan tiklanishni saqlang.
- 360/390/768/1440px, gorizontal overflow, contrast, focus, keyboard, input label va modal dismissal tekshirilsin.
- 2026-11-05 foydalanuvchi ko‘rsatmasi: `/advisor` endi **TechHome Product Assistant**, foydalanish/parvarish/xarid oldi suhbat yordamchisi. Provider nomini sahifa/menyu/error matnlarida chiqarmang. `AdvisorService` bounded plain-text `answer`ni tekshiradi; HTML/Markdown execution yo‘q, mahsulot kartalari bu sahifada yo‘q. Savol namunalari faqat inputni to‘ldiradi, avtomatik yubormaydi. [Amaldagi kontrakt](../TechHome/docs/advisor-contract.md).
- Bounded user-only kontekst, sahifa xotirasidagi javoblar, reset/identity/unmount abort va kech javob guard saqlansin; transcript storagega yozilmaydi. AI xato qilishi mumkinligi va shaxsiy ma’lumot yubormaslik eslatmasi, limit/timeout/error hamda katalog linki saqlansin. Backend model specs/manualni uydirmasligi kerak; buyurtma/payment amali yo‘q.

## Tekshiruv va deploy

- Jonli bazada oddiy test order/profile/payment yozuvi yaratmang. Fixture/mock va alohida test bazasi; integratsiyada backend avval ishga tayyor bo‘lsin.
- Foydalanuvchi tanlovi: **frontendda Yarn Classic 1.22.22, backendda npm**. Frontend Node 22 va yagona `yarn.lock` bilan; `yarn install --frozen-lockfile`, `yarn typecheck`, `yarn test --run`, `yarn build`. Vite build ichida ham Yarn ishlatiladi; CRA/Jest CLI flaglari ishlatilmaydi.
- Testlar haqiqiy Swiper importi, jsdom `matchMedia`, mock API, session restoration/CSRF/race tekshiruvlari bilan. 2-bosqich browser sinovi ham faqat xotiradagi backend fixture bilan; jonli DB E2E yoki mobil layout tasdig‘i emas.
- Docker/CI sozlamalari repository’da. Hujjat-only tahrirda link/diff tekshiruvi yetarli; funksional o‘zgarishda tegishli test va kerakli visual tekshiruvlar.
- Frontendda `npm install/ci` ishlatmang va `package-lock.json` yaratmang. Dependency qo‘shish/yangilash Yarn orqali; frozen lockfile bilan tekshiring, engine/peer tekshiruvlarini chetlab o‘tmang. Preview lokal tekshiruv uchun, production hosting emas.
- Frontend static image va SPA fallback bilan; public API URL o‘zgarsa qayta build kerak. Env’lar image context’iga kirmaydi.
- Coolify’da backend health tekshirilgach frontend chiqariladi; umumiy VPS’dagi boshqa servis/proxy/firewallga tegmang. Buildlar ketma-ket. Production va auto-deploy alohida tasdiqdan keyin.
