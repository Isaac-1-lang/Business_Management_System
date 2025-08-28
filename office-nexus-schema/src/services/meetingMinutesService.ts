
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

class MeetingMinutesService {
  private static readonly STORAGE_KEY = 'meeting-minutes';

  static getMeetings(): MeetingMinutes[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Return empty array when no data exists
    return [];
  }

  static saveMeetings(meetings: MeetingMinutes[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(meetings));
  }

  static addMeeting(meetingData: Omit<MeetingMinutes, 'id' | 'createdAt' | 'updatedAt'>): MeetingMinutes {
    const meetings = this.getMeetings();
    const newMeeting: MeetingMinutes = {
      ...meetingData,
      id: Math.max(0, ...meetings.map(m => m.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    meetings.unshift(newMeeting);
    this.saveMeetings(meetings);
    return newMeeting;
  }

  static updateMeeting(id: number, meetingData: Partial<MeetingMinutes>): MeetingMinutes | null {
    const meetings = this.getMeetings();
    const index = meetings.findIndex(m => m.id === id);
    
    if (index === -1) return null;

    meetings[index] = {
      ...meetings[index],
      ...meetingData,
      updatedAt: new Date().toISOString()
    };

    this.saveMeetings(meetings);
    return meetings[index];
  }

  static deleteMeeting(id: number): boolean {
    const meetings = this.getMeetings();
    const filteredMeetings = meetings.filter(m => m.id !== id);
    
    if (filteredMeetings.length === meetings.length) return false;

    this.saveMeetings(filteredMeetings);
    return true;
  }

  static getMeetingById(id: number): MeetingMinutes | null {
    const meetings = this.getMeetings();
    return meetings.find(m => m.id === id) || null;
  }

  static getMeetingsByType(type: string): MeetingMinutes[] {
    return this.getMeetings().filter(m => m.type === type);
  }

  static getMeetingsByStatus(status: string): MeetingMinutes[] {
    return this.getMeetings().filter(m => m.status === status);
  }

  static getMeetingsByDateRange(startDate: string, endDate: string): MeetingMinutes[] {
    return this.getMeetings().filter(m => m.date >= startDate && m.date <= endDate);
  }

  static getUpcomingMeetings(): MeetingMinutes[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getMeetings().filter(m => m.date >= today && m.status !== 'Completed');
  }

  static getStatistics() {
    const meetings = this.getMeetings();
    const thisYear = new Date().getFullYear();
    const thisMonth = new Date().getMonth();
    
    return {
      total: meetings.length,
      completed: meetings.filter(m => m.status === 'Completed').length,
      scheduled: meetings.filter(m => m.status === 'Scheduled').length,
      thisYear: meetings.filter(m => new Date(m.date).getFullYear() === thisYear).length,
      thisMonth: meetings.filter(m => {
        const meetingDate = new Date(m.date);
        return meetingDate.getFullYear() === thisYear && meetingDate.getMonth() === thisMonth;
      }).length,
      byType: meetings.reduce((acc, meeting) => {
        acc[meeting.type] = (acc[meeting.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

export default MeetingMinutesService;
