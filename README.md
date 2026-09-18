# 경조사 장부

보낸 돈과 받은 돈을 사람별로 기록하는 웹앱.

## 실행

```bash
pnpm install
pnpm dev
```

Firebase 키가 없으면 이 기기에만 저장합니다.

## Firebase 배포

1. Firebase 콘솔에서 Authentication(Google, Email)과 Firestore를 켭니다.
2. `.env.example`을 `.env`로 복사하고 키를 넣습니다.
3. `.firebaserc`의 프로젝트 ID를 바꿉니다.
4. `pnpm deploy`
