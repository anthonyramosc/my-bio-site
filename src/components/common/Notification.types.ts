export type NotificationType = 'success' | 'error' | '';

export interface NotificationProps {
  type: NotificationType;
  message: string;
  onClose?: () => void;
  duration?: number;
} 