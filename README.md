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

**Backend** Node.js · Express · TypeScript · Prisma ORM · PostgreSQL
**Auth** JWT · OAuth 2.0
**Logging** Winston · Morgan · Sentry
**Convention** ESLint · Prettier · Husky · Commitlint · CodeRabbit

---

## 주요 작업

### 도메인 경계에서 발생하는 결함 통합

6명이 인증·포토카드·거래·포인트·알림을 나눠 맡는 구조에서, 각 영역은 정상 동작하지만 합치면 깨지는 문제가 반복됐습니다. 담당자를 특정하기 어려워 통합 브랜치가 깨진 채로 남아 있었고, 기능을 더 만드는 것보다 연동이 끊기는 지점을 메우는 것이 급하다고 판단했습니다.

경계를 넘나들며 수정한 항목입니다.

- OAuth 콜백 및 토큰 갱신 흐름 정리
- 로그인·로그아웃 시 리렌더링 누락
- 거래 제안에서 제안자 닉네임 미전달
- 포인트 조회 시 `lastEventAt` 누락
- 회원가입 시 포인트 테이블 미생성

프론트 16건, 백엔드 16건의 PR을 통해 인증·포인트·거래·알림·Prisma 전 영역에 걸쳐 작업했습니다.

### 로그 수집 체계 구축

결함 하나당 원인 추적에 시간이 반복적으로 소모되어, Winston·Morgan·Sentry로 요청 로그와 에러를 수집하는 체계를 세웠습니다. 이후 "어디서 깨졌나"를 묻는 대신 로그를 확인하는 흐름으로 전환됐습니다.

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
