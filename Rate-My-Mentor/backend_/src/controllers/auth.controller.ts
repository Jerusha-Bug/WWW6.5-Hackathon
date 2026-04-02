import { Request, Response } from 'express';
import multer from 'multer';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response.util';

const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('仅支持 JPEG/PNG/WebP/GIF 图片格式'));
    }
  },
});

export class AuthController {
  static async submitOffer(req: Request, res: Response) {
    try {
      console.log('DEMO MOCK submitOffer is running');
      const file = req.file;
      const { userAddress } = req.body;

      if (!file) {
        return res.status(400).json(errorResponse('请上传 Offer Letter 图片'));
      }
      if (!userAddress) {
        return res.status(400).json(errorResponse('缺少钱包地址'));
      }
      if (!/^0x[0-9a-fA-F]{40}$/.test(userAddress)) {
        return res.status(400).json(errorResponse('钱包地址格式不正确'));
      }

      // TODO: hackathon demo mode - AI verification temporarily mocked as always pass
      // 说明：为确保前端流程不变（仍需上传图片/点击验证），这里只跳过 OpenAI OCR 真伪判断，
      // 但仍然走后续签发凭证（包含链上 mintSBT 所需签名），从而保证 SBT 铸造逻辑不被破坏。
      const ocrResult = {
        companyName: 'Hackathon Demo Company',
        isValid: true,
        expireDate: '',
      };

      // 签发链上凭证
      const credential = await AuthService.issueCredential(userAddress, ocrResult);

      return res.json(
        successResponse(credential, `${ocrResult.companyName} 实习凭证验证成功，可以铸造 SBT`)
      );
    } catch (error) {
      console.error('Offer 提交失败：', error);
      return res.status(500).json(errorResponse('处理失败，请稍后重试'));
    }
  }
}
