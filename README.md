# 🎴 최애의 포토

포토카드를 등록·판매하고 포인트로 교환하는 웹 서비스

**🔗 [서비스 바로가기](https://my-favorite-photo-frontend.vercel.app/)** · [Frontend Repository](https://github.com/karrum5692/my-favorite-photo-frontend)

---

## 개요

| | |
|---|---|
| 기간 | 2026.06.01 ~ 2026.06.23 (4주) |
| 인원 | 6명 |
| 담당 | 공통 기반(헤더·모달·인증 가드), 로그 시스템, 도메인 간 연동 결함 통합 |

---

## Tech Stack

**Backend**

![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)

**Auth**

![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![OAuth 2.0](https://img.shields.io/badge/OAuth_2.0-EB5424?style=flat-square&logo=auth0&logoColor=white)

**Logging & Monitoring**

![Winston](https://img.shields.io/badge/Winston-231F20?style=flat-square)
![Morgan](https://img.shields.io/badge/Morgan-231F20?style=flat-square)
![Sentry](https://img.shields.io/badge/Sentry-362D59?style=flat-square&logo=sentry&logoColor=white)

**Convention**

![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=flat-square&logo=prettier&logoColor=black)
![Husky](https://img.shields.io/badge/Husky-42B983?style=flat-square)
![Commitlint](https://img.shields.io/badge/Commitlint-000000?style=flat-square&logo=commitlint&logoColor=white)
![CodeRabbit](https://img.shields.io/badge/CodeRabbit-FF570A?style=flat-square)
---


## 팀 구성

| 팀원 | 역할 | 담당 기능 |
|---|---|---|
| 김상우 | 유저/인증 | 회원가입, 로그인, 인증 세션 구성 |
| 정다희 | 마켓플레이스 | 검색, 조회, 상세, 생성 |
| 임주연 | 포토카드 거래 | 구매/판매 기능 |
| 최광헌 | 포토카드 교환 | 양측 수락 로직 및 상태 관리 |
| 윤이준 | 마이갤러리, 포토카드 생성 | 유저 프로필, 포토 목록, 포인트 관리 |
| 심현수 | **PM**, 공통 기반 | 공통 모달, 헤더, 랜딩 페이지, 랜덤 포인트, 알림 | 


---

## Project Structure

```
src
├── config
├── constants
├── lib
├── middlewares
├── modules
├── types
├── utils
├── app.ts
└── server.ts
```

---

## Getting Started

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

`.env`

```
PORT=
DATABASE_URL=
JWT_SECRET=
REFRESH_SECRET=
```

---

## Branch Strategy

```
feature/* → dev → main
```

## Commit Convention

| Type | Description |
|---|---|
| feat | 기능 추가 |
| fix | 버그 수정 |
| docs | 문서 수정 |
| refactor | 리팩토링 |
| chore | 설정 변경 |
