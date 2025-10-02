
export interface Attendee {
  id: string;
  name: string;
  role: string;
}

export interface MeetingMinutes {
  id: number;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  chairperson: string;
  secretary: string;
  attendees: Attendee[];
  agenda: string[];
  discussions: string;
  decisions: string[];
  actionItems: string[];
  nextMeetingDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

import { apiService } from './apiService';

class MeetingMinutesService {
  static async getMeetings(): Promise<MeetingMinutes[]> {
    const res = await apiService.getMeetings();
    if (res.success && res.data?.meetings) return res.data.meetings as MeetingMinutes[];
    console.warn('Failed to fetch meetings:', res.error || res.message);
    return [];
  }

  static async addMeeting(meetingData: Omit<MeetingMinutes, 'id' | 'createdAt' | 'updatedAt'>): Promise<MeetingMinutes | null> {
    const res = await apiService.createMeeting(meetingData);
    if (res.success && res.data?.meeting) return res.data.meeting as MeetingMinutes;
    console.error('Failed to create meeting:', res.error || res.message);
    return null;
  }

  static async updateMeeting(id: number, meetingData: Partial<MeetingMinutes>): Promise<MeetingMinutes | null> {
    const res = await apiService.updateMeeting(id, meetingData);
    if (res.success && res.data?.meeting) return res.data.meeting as MeetingMinutes;
    console.error('Failed to update meeting:', res.error || res.message);
    return null;
  }

  static async deleteMeeting(id: number): Promise<boolean> {
    const res = await apiService.deleteMeeting(id);
    return !!res.success;
  }

  static async getMeetingById(id: number): Promise<MeetingMinutes | null> {
    const meetings = await this.getMeetings();
    return meetings.find(m => m.id === id) || null;
  }

  static async getMeetingsByType(type: string): Promise<MeetingMinutes[]> {
    const meetings = await this.getMeetings();
    return meetings.filter(m => m.type === type);
  }

  static async getMeetingsByStatus(status: string): Promise<MeetingMinutes[]> {
    const meetings = await this.getMeetings();
    return meetings.filter(m => m.status === status);
  }

  static async getMeetingsByDateRange(startDate: string, endDate: string): Promise<MeetingMinutes[]> {
    const meetings = await this.getMeetings();
    return meetings.filter(m => m.date >= startDate && m.date <= endDate);
  }

  static async getUpcomingMeetings(): Promise<MeetingMinutes[]> {
    const today = new Date().toISOString().split('T')[0];
    const meetings = await this.getMeetings();
    return meetings.filter(m => m.date >= today && m.status !== 'Completed');
  }

  static async getStatistics() {
    // Get current company ID from localStorage
    const companyId = localStorage.getItem('selectedCompanyId') || 'test-company-uuid';
    const res = await apiService.request(`/meetings/statistics?companyId=${companyId}`);
    if (res.success && res.data) return res.data;
    console.warn('Failed to fetch meeting statistics:', res.error || res.message);
    return {
      total: 0,
      completed: 0,
      scheduled: 0,
      thisYear: 0,
      thisMonth: 0,
      byType: {}
    };
  }
}

export default MeetingMinutesService;
