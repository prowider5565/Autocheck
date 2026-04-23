import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class BaseModel {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;
}