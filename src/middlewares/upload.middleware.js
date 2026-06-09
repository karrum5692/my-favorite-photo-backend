import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 1. 업로드된 이미지를 저장할 서버 폴더 경로 지정 (public/uploads)
const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// 방어 코드: 만약 서버 내에 'public/uploads' 폴더가 없다면 자동으로 생성해 줍니다.
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. 디스크 저장소(Disk Storage) 설정
const storage = multer.diskStorage({
  // 파일을 저장할 장소 지정
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  // 저장될 파일 이름 규칙 정의 (파일명 중복 방지)
  filename: (req, file, cb) => {
    // 원본 파일의 확장자 추출 (예: .png, .jpg)
    const ext = path.extname(file.originalname);
    // 원본 파일 이름에서 확장자 제외한 알맹이만 추출
    const basename = path.basename(file.originalname, ext);

    // 최종 파일명 포맷: 원본이름-현재시간타임스탬프.확장자
    // 예시: myphoto-1717834567890.png
    cb(null, `${basename}-${Date.now()}${ext}`);
  },
});

// 3. 파일 유효성 필터 및 용량 제한 설정 (옵션 방어벽)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 최대 용량 제한: 5MB 까지만 허용 (초과 시 에러)
  },
  fileFilter: (req, file, cb) => {
    // 이미지 파일 형식만 업로드 가능하도록 필터링
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true); // 통과
    }
    // 이미지 형식이 아니면 가차없이 튕겨내기
    cb(
      new Error(
        '포토카드는 이미지 파일(jpg, jpeg, png, gif, webp)만 업로드할 수 있습니다.'
      )
    );
  },
});

export default upload;
