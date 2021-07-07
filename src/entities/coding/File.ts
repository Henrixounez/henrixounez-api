import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  sessionId: string;

  @Column()
  text: string;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
