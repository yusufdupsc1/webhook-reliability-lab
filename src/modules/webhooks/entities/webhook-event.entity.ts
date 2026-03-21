import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { GatewayType } from '../../../common/types';

@Entity('webhook_events')
@Index(['gateway', 'eventId'], { unique: true })
@Index(['processed'])
@Index(['createdAt'])
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: GatewayType,
  })
  gateway: GatewayType;

  @Column({ name: 'event_id' })
  eventId: string;

  @Column({ name: 'event_type' })
  eventType: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ default: false })
  processed: boolean;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
