export class CvSseSkillDto {
  id?: number;
  designation?: string;

  static fromRecord(skill: Record<string, unknown>): CvSseSkillDto {
    const dto = new CvSseSkillDto();

    if (typeof skill.id === 'number') {
      dto.id = skill.id;
    }

    if (typeof skill.designation === 'string') {
      dto.designation = skill.designation;
    }

    return dto;
  }
}
