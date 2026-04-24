import { Entity, Column } from "typeorm";
import { BaseModel } from "../shared/base.entity";
import { UserRole } from "./users.enum";
import { EvaluationMode } from "./evaluation-mode.enum";


@Entity()
export class Users extends BaseModel {
    @Column({ nullable: false, unique: false })
    fullName: string;

    @Column({ nullable: false, unique: true })
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column({ type: "enum", nullable: false, enum: UserRole })
    role: UserRole;

    @Column({
        type: "enum",
        nullable: false,
        enum: EvaluationMode,
        default: EvaluationMode.AI_AUTOMATED,
    })
    evaluationMode: EvaluationMode;
}
