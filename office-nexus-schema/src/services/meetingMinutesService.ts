
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

    // Default sample data
    const defaultMeetings: MeetingMinutes[] = [
      {
        id: 1,
        title: "Annual General Meeting 2024",
        type: "AGM",
        date: "2024-01-15",
        time: "10:00",
        location: "Conference Room A",
        chairperson: "John Doe",
        secretary: "Jane Smith",
        attendees: [
          { id: '1', name: 'John Doe', role: 'Chairman' },
          { id: '2', name: 'Jane Smith', role: 'Secretary' },
          { id: '3', name: 'Bob Johnson', role: 'Director' },
          { id: '4', name: 'Alice Brown', role: 'Treasurer' },
          { id: '5', name: 'Mike Wilson', role: 'Member' }
        ],
        agenda: [
          "Review of previous meeting minutes",
          "Financial report presentation",
          "Election of board members",
          "Strategic planning for 2024"
        ],
        discussions: "The meeting opened with a review of the previous year's performance. Financial reports were presented showing strong growth. Discussion on strategic initiatives for 2024 including market expansion and digital transformation.",
        decisions: [
          "Approved financial reports for 2023",
          "Elected new board members",
          "Approved budget for 2024 initiatives",
          "Authorized market expansion project"
        ],
        actionItems: [
          "Prepare quarterly reports - Due: March 31",
          "Begin market research for expansion - Due: February 28",
          "Implement new accounting software - Due: April 15"
        ],
        nextMeetingDate: "2024-04-15",
        status: "Completed",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T12:30:00Z"
      },
      {
        id: 2,
        title: "Board Meeting - Q4 Review",
        type: "Board",
        date: "2023-12-20",
        time: "14:00",
        location: "Board Room",
        chairperson: "John Doe",
        secretary: "Jane Smith",
        attendees: [
          { id: '1', name: 'John Doe', role: 'Chairman' },
          { id: '2', name: 'Jane Smith', role: 'Secretary' },
          { id: '3', name: 'Bob Johnson', role: 'Director' }
        ],
        agenda: [
          "Q4 performance review",
          "Year-end financial closure",
          "Planning for AGM"
        ],
        discussions: "Quarterly performance exceeded expectations. Discussion on year-end procedures and AGM preparation.",
        decisions: [
          "Approved Q4 results",
          "Confirmed AGM date",
          "Approved year-end bonuses"
        ],
        actionItems: [
          "Prepare AGM materials - Due: January 10",
          "Process year-end bonuses - Due: December 31"
        ],
        nextMeetingDate: "2024-01-15",
        status: "Completed",
        createdAt: "2023-12-20T14:00:00Z",
        updatedAt: "2023-12-20T16:00:00Z"
      },
      {
        id: 3,
        title: "Extraordinary General Meeting",
        type: "EGM",
        date: "2023-11-10",
        time: "11:00",
        location: "Main Hall",
        chairperson: "John Doe",
        secretary: "Jane Smith",
        attendees: [
          { id: '1', name: 'John Doe', role: 'Chairman' },
          { id: '2', name: 'Jane Smith', role: 'Secretary' },
          { id: '3', name: 'Bob Johnson', role: 'Director' },
          { id: '4', name: 'Alice Brown', role: 'Treasurer' }
        ],
        agenda: [
          "Emergency budget approval",
          "New business partnership",
          "Policy amendments"
        ],
        discussions: "Urgent matters requiring immediate board approval including emergency funding and new partnership opportunities.",
        decisions: [
          "Approved emergency budget allocation",
          "Approved new partnership agreement",
          "Amended company policies"
        ],
        actionItems: [
          "Execute partnership agreement - Due: November 20",
          "Update company documentation - Due: November 30"
        ],
        nextMeetingDate: "2023-12-20",
        status: "Completed",
        createdAt: "2023-11-10T11:00:00Z",
        updatedAt: "2023-11-10T13:00:00Z"
      }
    ];

    this.saveMeetings(defaultMeetings);
    return defaultMeetings;
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
