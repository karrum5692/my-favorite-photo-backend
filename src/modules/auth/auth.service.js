import userRepository from './auth.repository.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { HttpError } from '../../middlewares/HttpError.js';

async function createUser(user) {
  const { email, nickname, password, passwordConfirm } = user;

  if (!email || !nickname || !password || !passwordConfirm) {
    throw new HttpError(400, '이메일, 닉네임, 비밀번호가 모두 필요합니다.');
  }

  const trimmedEmail = email.trim();
  const trimmedNickname = nickname.trim();

  if (!trimmedEmail) {
    throw new HttpError(400, '이메일을 입력해주세요.');
  }

  if (!trimmedNickname) {
    throw new HttpError(400, '닉네임을 입력해주세요.');
  }

  if (email !== trimmedEmail || /\s/.test(trimmedEmail)) {
    throw new HttpError(400, '이메일에는 공백을 사용할 수 없습니다.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) {
    throw new HttpError(400, '올바른 이메일 형식이 아닙니다.');
  }

  if (nickname !== trimmedNickname) {
    throw new HttpError(400, '닉네임에는 앞뒤 공백을 사용할 수 없습니다.');
  }

  if (/\s/.test(password)) {
    throw new HttpError(400, '비밀번호에는 공백을 사용할 수 없습니다.');
  }

  if (password !== passwordConfirm) {
    throw new HttpError(400, '비밀번호가 일치하지 않습니다.');
  }

  if (password.length < 8) {
    throw new HttpError(400, '비밀번호는 8자 이상이어야 합니다.');
  }

  if (!/[A-Za-z]/.test(password)) {
    throw new HttpError(400, '비밀번호에 영문자를 포함해야 합니다.');
  }

  if (!/\d/.test(password)) {
    throw new HttpError(400, '비밀번호에 숫자를 포함해야 합니다.');
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    throw new HttpError(400, '비밀번호에 특수문자를 포함해야 합니다.');
  }

  const existedUser = await userRepository.findByEmail(trimmedEmail);

  if (existedUser) {
    const error = new HttpError(409, '이미 가입된 이메일입니다.');
    error.field = 'email';
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const createdUser = await userRepository.create({
    email: trimmedEmail,
    nickname: trimmedNickname,
    password: hashedPassword,
  });

  return filterUserData(createdUser);
}

function filterUserData(user) {
  const { password, ...rest } = user;
  return rest;
}

async function loginUser(email, password) {
  if (!email || !password) {
    throw new HttpError(400, '이메일과 비밀번호를 모두 입력해주세요');
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new HttpError(404, '존재하지 않는 이메일입니다.');
    error.field = 'email';
    throw error;
  }

  // 소셜 로그인 전용 계정(비밀번호 없음) 방어
  if (!user.password) {
    const error = new HttpError(400, '소셜 로그인으로 가입된 계정입니다.');
    error.field = 'email';
    throw error;
  }

  await passwordCheck(password, user.password);

  return filterUserData(user);
}

async function passwordCheck(inputPassword, hashedPassword) {
  const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
  if (!isMatch) {
    const error = new HttpError(401, '비밀번호가 일치하지 않습니다.');
    error.field = 'password';
    throw error;
  }
}

function createToken(user, type) {
  const payload = { userId: user.id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: type === 'refresh' ? '1d' : '1h',
  });
  return token;
}

async function refreshToken(userId, clientRefreshToken) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new HttpError(404, '존재하지 않는 유저입니다.');
  }

  // RefreshToken은 별도 테이블(릴레이션)이므로 직접 조회해야 한다
  const storedToken = await userRepository.findRefreshTokenByUserId(userId);

  if (!storedToken) {
    throw new HttpError(401, '토큰이 존재하지 않습니다. 다시 로그인해주세요.');
  }

  if (storedToken.token !== clientRefreshToken) {
    throw new HttpError(
      401,
      '토큰이 일치하지 않습니다. 유효하지 않은 접근입니다.'
    );
  }

  if (storedToken.expiresAt < new Date()) {
    throw new HttpError(401, '토큰이 만료되었습니다. 다시 로그인해주세요.');
  }

  const newAccessToken = createToken(user);
  const newRefreshToken = createToken(user, 'refresh');

  await userRepository.updateRefreshToken(user.id, newRefreshToken);

  return { newAccessToken, newRefreshToken };
}

async function updateRefreshToken(userId, token) {
  return userRepository.updateRefreshToken(userId, token);
}

async function deleteRefreshToken(token) {
  return userRepository.deleteRefreshToken(token);
}

export default {
  createUser,
  loginUser,
  createToken,
  updateRefreshToken,
  refreshToken,
  deleteRefreshToken,
};
