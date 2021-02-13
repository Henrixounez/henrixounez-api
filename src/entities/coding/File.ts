import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;
}
