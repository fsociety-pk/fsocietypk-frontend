import api from './api';
export type TicketStatus = 'open' | 'in_progress' | 'resolved';
export const ticketStatuses: Record<TicketStatus, string> = { open: 'Open', in_progress: 'In progress', resolved: 'Resolved' };
export const ticketCategories = { technical: 'Technical issue', account: 'My account', challenge: 'Challenge help', feedback: 'Feedback & ideas', other: 'Something else' };
export type TicketCategory = keyof typeof ticketCategories;
export interface Ticket {
  _id: string; subject: string; category: TicketCategory; status: TicketStatus; createdAt: string; updatedAt: string;
  userId: { username: string } | null;
  messages?: { _id: string; author: 'member' | 'admin'; body: string; createdAt: string }[];
}
export const supportService = {
  list: async (admin: boolean, status: string, page: number) => (await api.get<{ data: Ticket[]; meta: { total: number; totalPages: number } }>(admin ? '/admin/support' : '/support', { params: { status, page } })).data,
  get: async (admin: boolean, id: string) => (await api.get<{ data: Ticket }>(`${admin ? '/admin/support' : '/support'}/${id}`)).data.data,
  create: async (input: { subject: string; category: TicketCategory; message: string }) => (await api.post<{ data: Ticket }>('/support', input)).data.data,
  update: async (admin: boolean, id: string, input: { message?: string; status?: TicketStatus }) => (await api.patch<{ data: Ticket }>(`${admin ? '/admin/support' : '/support'}/${id}`, input)).data.data,
};
