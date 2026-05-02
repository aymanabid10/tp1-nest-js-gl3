import { CvHistory } from '../entities/cv-history.entity';

export const CV_HISTORY_REPOSITORY = 'CV_HISTORY_REPOSITORY';

export abstract class CvHistoryRepositoryInterface {
  abstract save(cvHistory: CvHistory): Promise<CvHistory>;
  abstract findAll(): Promise<CvHistory[]>;
  abstract findByCvId(cvId: number): Promise<CvHistory[]>;
}
