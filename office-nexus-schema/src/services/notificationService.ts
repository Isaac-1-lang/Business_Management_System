
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'alert' | 'reminder' | 'info' | 'warning';
  is_read: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  due_date?: string;
  action_url?: string;
}

class NotificationService {
  private static notifications: Notification[] = [];

  static createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      is_read: false
    };

    this.notifications.unshift(newNotification);
    console.log('Notification created:', newNotification);
  }

  static getNotifications(userId?: string): Notification[] {
    return this.notifications
      .filter(n => !userId || n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.is_read = true;
    }
  }

  static getUnreadCount(userId?: string): number {
    return this.notifications
      .filter(n => !n.is_read && (!userId || n.user_id === userId))
      .length;
  }

  // Check for compliance deadlines and create notifications
  static checkComplianceDeadlines(): void {
    // This will be implemented with real data from the backend
    // For now, it's empty to avoid dummy data
  }

  // Check for missing documents
  static checkMissingDocuments(): void {
    // This will be implemented with real data from the backend
    // For now, it's empty to avoid dummy data
  }

  // Initialize notifications (empty for now)
  static initialize(): void {
    // This will be implemented with real data from the backend
    // For now, it's empty to avoid dummy data
  }
}

export default NotificationService;
