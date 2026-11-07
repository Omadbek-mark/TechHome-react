# TechHome frontend

Faol papka: `/Users/omadbek/Desktop/TechHome-react`. Arxivdagi eski papkada ko‘chirilganlik eslatmasi bor; alohida dastur nusxasi yo‘q.

React 18, Redux va mavjud React Router 5 route’lari Vite asosida ishlaydi. Testlar Vitest va React Testing Library bilan; CRA ishlatilmaydi. [AGENTS.md](AGENTS.md), [upgrade rejasi](../TechHome/docs/upgrade-plan.md), [joriy hisobot](../TechHome/docs/stage-6-summary.md).

## Ishga tushirish

Node 22 (`nvm use`), **Yarn Classic 1.22.22** va yagona `yarn.lock` ishlatiladi. Backend alohida npm’da qoladi. Frontendda npm bilan install qilmang yoki `package-lock.json` yaratmang.

```sh
yarn install --frozen-lockfile
```

`.env.example` asosida lokal `.env.local` yarating va `VITE_API_URL`ni development backend manziliga yo‘naltiring. Eski lokal CRA qiymati mavjud bo‘lsa migratsiyada `.env.local`ga ko‘chirilgan. Faqat public URL; `VITE_*` ichiga token, parol yoki AI key yozmang. Git faqat `.env.example` namunasini kuzatadi. Lokal env fayllar ignore qilinadi.

```sh
yarn dev
yarn typecheck
yarn test --run
yarn build
yarn preview
```

Dev va preview: `http://127.0.0.1:3000`; API: `http://127.0.0.1:3002`. Cookie auth uchun development’da loopback API hostname ochilgan sahifaga avtomatik moslanadi; productionda frontend/API bir sayt doirasida aniq sozlanadi; backend `WEB_ORIGINS` frontend originini ruxsat qilishi kerak. Productionda HTTPS va bir sayt ostidagi frontend/API domenlari ishlatiladi. [Auth kontrakti](../TechHome/docs/auth-security.md). Band port yashirin almashtirilmaydi. Build output: `build/`. `yarn build` TypeScriptni ham tekshiradi; `yarn test` watch, `yarn test:run` bir martalik.

`yarn preview` lokal build tekshiruvi uchun; Vite preview production hosting serveri sifatida qo‘llanmaydi. Production image Nginx orqali `8080` portida statik build va SPA fallback beradi. `VITE_API_URL=https://api.example.test sh deploy.sh` lokal image quradi. Coolify’da haqiqiy public API origin’ini build argument sifatida bering. [Deploy qo‘llanmasi](../TechHome/docs/production-deploy.md).

## Izolyatsiyalangan testlar

Testlar haqiqiy backendga ulanmaydi: API chaqiruvlari mock qilinadi, qolib ketgan real request adapter tomonidan rad etiladi. Mavjud Swiper ESM moduli testda haqiqiy import qilinadi; jsdom uchun `matchMedia` taqdim etilgan. Bu responsive layout sinovining o‘rnini bosmaydi.

Test qamrovi: bosh sahifa/katalog, product detail, login modal, API config/data/error, serverdan session tiklash, CSRF, protected route gate, logout/cache va identity race. Browser sinovi faqat alohida fixture backendda; fixture’lar production katalogi/session manbasi sifatida ulanmagan.

## Tillar va responsive

Standart UZ, qo‘shimcha RU/EN. Navbar’dagi til tanlovi localStorage’da saqlanadi, route/filter/auth’ni o‘zgartirmaydi. `src/lib/i18n` umumiy UI/xato tarjimasi; katalogning original ma’lumoti taxminiy tarjima qilinmaydi. Responsive va keyboard/focus tekshiruvi [5-bosqich hisobotida](../TechHome/docs/stage-5-summary.md); [kontrakt](../TechHome/docs/ui-language-errors.md).

## Katalog va comparison

[Katalog kontrakti](../TechHome/docs/catalog-contract.md): public `/product/catalog` total va pagination bilan; URL filter/search/brand/deals/sort saqlanadi. Detail/compare server specs va narxlarini ko‘rsatadi, unknown qiymatlar “Not provided”. Comparison uchtagacha, products/advisor route guruhidagi xotirada; ular orasida tanlov saqlanadi, reload yoki boshqa bo‘limga chiqishda tozalanadi. Xatoda retry bor, eski javob joriy filter/detail ustiga yozilmaydi.

## TechHome Product Assistant

Public `/advisor` foydalanish, parvarish va xarid oldi savollariga UZ/RU/ENda matnli javob beradi. Savol namunalari faqat inputni to‘ldiradi. Suhbat sahifa xotirasida saqlanadi. Backend AI sozlamalari, quota va xavfsizlik qoidalari amaldagi kontraktda. [Product Assistant kontrakti](../TechHome/docs/advisor-contract.md)

## Buyurtma va demo payment

[Order kontrakti](../TechHome/docs/order-checkout.md): browser faqat product ID/quantity va barqaror retry key yuboradi; yakuniy narx/stock/total backenddan. Submit/status amallari double-click’dan himoyalangan. Xatoda savat va niyat key’i saqlanadi; muvaffaqiyatda mos savat tozalanadi. Storage tozalangan yoki buyurtma holati noaniq bo‘lsa Orders’ni tekshiring. Card/CVV formasi yo‘q; demo confirmation haqiqiy pul yechmaydi. Legacy orderlar faqat ko‘rish uchun.
