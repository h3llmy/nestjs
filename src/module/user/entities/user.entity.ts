import { Post } from 'src/module/post/entities/post.entity';
import Encript from 'src/utils/encryption';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Post, (post) => post.user, { cascade: true })
  posts: Post[];

  @Column({ default: Date.now() })
  createdAt: number;

  constructor(item: Partial<User>) {
    Object.assign(this, item);
  }

  @BeforeInsert()
  @BeforeUpdate()
  hashPassword() {
    this.password = Encript.hash(this.password);
  }
}
