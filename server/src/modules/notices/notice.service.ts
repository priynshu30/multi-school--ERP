import { Notice } from './notice.model.js';
import { NotFoundError } from '../../utils/appError.js';

export class NoticeService {
  static async listNotices(schoolId: string, audience?: string) {
    const filter: any = { schoolId };
    if (audience && audience !== 'ALL') {
      filter.$or = [{ audience: 'ALL' }, { audience }];
    }
    return Notice.find(filter).sort({ startDate: -1 }).lean();
  }

  static async createNotice(schoolId: string, data: any, authorName?: string) {
    return Notice.create({
      ...data,
      schoolId,
      authorName: authorName || 'School Administration',
    });
  }

  static async deleteNotice(schoolId: string, id: string) {
    const notice = await Notice.findOne({ _id: id, schoolId });
    if (!notice) throw new NotFoundError('Notice not found');
    await notice.deleteOne();
  }
}
