
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
    const today = new Date();
    const fiveDaysFromNow = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);

    // VAT deadline check
    const nextVATDue = new Date(today.getFullYear(), today.getMonth() + 1, 15);
    if (nextVATDue <= fiveDaysFromNow) {
      this.createNotification({
        user_id: 'current-user',
        title: 'VAT Filing Due Soon',
        message: `VAT return filing is due on ${nextVATDue.toLocaleDateString()}`,
        type: 'alert',
        priority: 'high',
        due_date: nextVATDue.toISOString(),
        action_url: '/tax-returns'
      });
    }

    // PAYE deadline check
    const nextPAYEDue = new Date(today.getFullYear(), today.getMonth() + 1, 9);
    if (nextPAYEDue <= fiveDaysFromNow) {
      this.createNotification({
        user_id: 'current-user',
        title: 'PAYE Returns Due Soon',
        message: `PAYE returns are due on ${nextPAYEDue.toLocaleDateString()}`,
        type: 'alert',
        priority: 'high',
        due_date: nextPAYEDue.toISOString(),
        action_url: '/payroll-hr'
      });
    }
  }

  // Check for missing documents
  static checkMissingDocuments(): void {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const requiredDocs = ['rdb-registration', 'trading-licenses', 'tax-filing'];
    
    requiredDocs.forEach(category => {
      const hasDoc = documents.some((doc: any) => doc.category === category);
      if (!hasDoc) {
        this.createNotification({
          user_id: 'current-user',
          title: 'Missing Required Document',
          message: `Please upload ${category.replace('-', ' ')} documents to ensure compliance`,
          type: 'warning',
          priority: 'medium',
          action_url: '/document-vault'
        });
      }
    });
  }

  // Initialize with some sample notifications
  static initialize(): void {
    this.checkComplianceDeadlines();
    this.checkMissingDocuments();
  }
}

export default NotificationService;
