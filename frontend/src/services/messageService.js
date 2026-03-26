import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Dynamic URL config for Production vs Local
const API_URL = import.meta.env.VITE_API_BASE_URL 
    ? `${import.meta.env.VITE_API_BASE_URL}/messages` 
    : 'http://localhost:8081/api/messages';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8081/ws';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const messageAPI = {
    sendMessage: (data) => axios.post(API_URL, data, { headers: getAuthHeader() }),
    getConversation: (otherUserId) => axios.get(`${API_URL}/conversation/${otherUserId}`, { headers: getAuthHeader() }),
    getUnreadCount: () => axios.get(`${API_URL}/unread-count`, { headers: getAuthHeader() }),
    markAsRead: (id) => axios.put(`${API_URL}/${id}/read`, {}, { headers: getAuthHeader() }),
    getContacts: () => axios.get(`${API_URL}/contacts`, { headers: getAuthHeader() })
};

export class ChatClient {
    constructor(onMessageReceived) {
        this.onMessageReceived = onMessageReceived;
        this.stompClient = null;
    }

    connect() {
        const socket = new SockJS(WS_URL);
        this.stompClient = new Client({
            webSocketFactory: () => socket,
            connectHeaders: getAuthHeader(),
            debug: (str) => console.log(str),
            onConnect: () => {
                const userEmail = JSON.parse(localStorage.getItem('user'))?.email;
                if (userEmail) {
                    this.stompClient.subscribe(`/user/${userEmail}/queue/messages`, (message) => {
                        this.onMessageReceived(JSON.parse(message.body));
                    });
                }
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            }
        });

        this.stompClient.activate();
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.deactivate();
        }
    }

    send(messageDto) {
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.publish({
                destination: '/app/chat',
                body: JSON.stringify(messageDto)
            });
        }
    }
}
