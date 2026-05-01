import { CvSseSkillDto } from './cv-sse-skill.dto';

export class CvSsePayloadDto {
  id?: number;
  name?: string;
  firstname?: string;
  age?: number;
  cin?: string;
  job?: string;
  path?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deletedAt?: Date | string | null;
  userId?: number;
  skills?: CvSseSkillDto[];

  static fromRecord(payload: Record<string, unknown>): CvSsePayloadDto | null {
    const dto = new CvSsePayloadDto();

    dto.assignNumber('id', payload.id);
    dto.assignString('name', payload.name);
    dto.assignString('firstname', payload.firstname);
    dto.assignNumber('age', payload.age);
    dto.assignString('cin', payload.cin);
    dto.assignString('job', payload.job);
    dto.assignNullableString('path', payload.path);
    dto.assignDateLike('createdAt', payload.createdAt);
    dto.assignDateLike('updatedAt', payload.updatedAt);
    dto.assignNullableDateLike('deletedAt', payload.deletedAt);
    dto.userId = CvSsePayloadDto.extractEntityId(payload.user);
    dto.skills = CvSsePayloadDto.toSkillDtos(payload.skills);

    return dto.hasValues() ? dto : null;
  }

  private assignNumber(
    field: 'id' | 'age',
    value: unknown,
  ): void {
    if (typeof value === 'number') {
      this[field] = value;
    }
  }

  private assignString(
    field: 'name' | 'firstname' | 'cin' | 'job',
    value: unknown,
  ): void {
    if (typeof value === 'string') {
      this[field] = value;
    }
  }

  private assignNullableString(field: 'path', value: unknown): void {
    if (typeof value === 'string' || value === null) {
      this[field] = value;
    }
  }

  private assignDateLike(
    field: 'createdAt' | 'updatedAt',
    value: unknown,
  ): void {
    if (typeof value === 'string' || value instanceof Date) {
      this[field] = value;
    }
  }

  private assignNullableDateLike(
    field: 'deletedAt',
    value: unknown,
  ): void {
    if (typeof value === 'string' || value instanceof Date || value === null) {
      this[field] = value;
    }
  }

  private hasValues(): boolean {
    return Object.values(this).some((value) => value !== undefined);
  }

  private static toSkillDtos(skills: unknown): CvSseSkillDto[] | undefined {
    if (!Array.isArray(skills)) {
      return undefined;
    }

    return skills
      .filter(CvSsePayloadDto.isRecord)
      .map((skill) => CvSseSkillDto.fromRecord(skill));
  }

  private static extractEntityId(entity: unknown): number | undefined {
    if (!CvSsePayloadDto.isRecord(entity)) {
      return undefined;
    }

    return typeof entity.id === 'number' ? entity.id : undefined;
  }

  private static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
