import { Entity, Column } from "typeorm";
import { BaseModel } from "../shared/base.entity";
import { UserRole } from "./users.enum";


@Entity()
export class User extends BaseModel {
    @Column({ nullable: false, unique: true })
    username!: string;

    @Column({ nullable: false })
    password!: string;

    @Column({ type: "enum", nullable: false, enum: UserRole })
    role!: UserRole;
}