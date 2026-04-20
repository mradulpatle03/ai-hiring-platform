import api from './axios'

export const fetchMyConversations    = () =>
  api.get('/conversations').then(r => r.data)

export const fetchOrCreateConversation = (applicationId) =>
  api.get(`/conversations/application/${applicationId}`).then(r => r.data)

export const fetchMessages = (conversationId, page = 1) =>
  api.get(`/conversations/${conversationId}/messages`, { params: { page } }).then(r => r.data)