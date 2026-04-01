export class CreateCvDto {
  name!: string;
  firstname!: string;
  age!: number;
  cin!: string;
  job!: string;
  path?: string;
  userId!: number;
  skillIds?: number[];
}
