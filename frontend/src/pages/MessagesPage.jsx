import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChatClient, messageAPI } from '../services/messageService';
import { FiMessageSquare, FiUser, FiSend, FiChevronLeft } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const MessagesPage = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [contacts, setContacts] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [chatClient, setChatClient] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const params = new URLSearchParams(location.search);
        const contactId = params.get('contactId');
        const contactName = params.get('contactName');

        fetchContacts(contactId, contactName);

        const client = new ChatClient((msg) => {
            setChatMessages(prev => [...prev, msg]);
            // Also refresh contacts to update last message/order
            fetchContacts();
        });
        client.connect();
        setChatClient(client);

        return () => client.disconnect();
    }, [isAuthenticated, location.search]);

    const fetchContacts = async (targetContactId, targetContactName) => {
        try {
            const res = await messageAPI.getContacts();
            const fetchedContacts = res.data?.data || [];
            setContacts(fetchedContacts);

            if (targetContactId) {
                const existing = fetchedContacts.find(c => c.id === parseInt(targetContactId));
                if (existing) {
                    handleSelectContact(existing);
                } else if (targetContactName) {
                    // Start a new conversation placeholder
                    const newContact = { id: parseInt(targetContactId), name: targetContactName };
                    setActiveContact(newContact);
                    setChatMessages([]);
                }
            }
        } catch (error) {
            toast.error('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectContact = async (contact) => {
        setActiveContact(contact);
        try {
            const res = await messageAPI.getConversation(contact.id);
            setChatMessages(res.data?.data || []);
        } catch (error) {
            toast.error('Failed to load conversation');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !activeContact) return;

        const messageDto = {
            receiverId: activeContact.id,
            content: chatInput
        };

        try {
            // Send via HTTP and let WebSocket handle the arrival (or add locally)
            const res = await messageAPI.sendMessage(messageDto);
            setChatMessages(prev => [...prev, res.data.data]);
            setChatInput('');
            // Update sidebar if it's a new contact
            if (!contacts.find(c => c.id === activeContact.id)) {
                fetchContacts();
            }
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    if (loading) return <div className="page-loading"><div className="spinner" /></div>;

    return (
        <div className="messages-page container">
            <div className="messages-header">
                <button className="back-btn" onClick={() => navigate(-1)}><FiChevronLeft /> Back</button>
                <h1>My Messages</h1>
            </div>

            <div className="chat-layout shadow-lg">
                <div className="chat-sidebar">
                    <div className="sidebar-header">
                        <h3>All Chats</h3>
                    </div>
                    <div className="contact-list">
                        {contacts.length === 0 && !activeContact ? (
                            <p className="no-contacts">No conversations found</p>
                        ) : (
                            <>
                                {activeContact && !contacts.find(c => c.id === activeContact.id) && (
                                    <div className="contact-item active">
                                        <div className="contact-avatar"><FiUser /></div>
                                        <div className="contact-info">
                                            <p className="contact-name">{activeContact.name} (New)</p>
                                            <p className="contact-email">Starting conversation...</p>
                                        </div>
                                    </div>
                                )}
                                {contacts.map(contact => (
                                    <div 
                                        key={contact.id} 
                                        className={`contact-item ${activeContact?.id === contact.id ? 'active' : ''}`}
                                        onClick={() => handleSelectContact(contact)}
                                    >
                                        <div className="contact-avatar"><FiUser /></div>
                                        <div className="contact-info">
                                            <p className="contact-name">{contact.name}</p>
                                            <p className="contact-email">{contact.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                <div className="chat-main">
                    {activeContact ? (
                        <>
                            <div className="chat-header">
                                <div className="header-info">
                                    <div className="avatar"><FiUser /></div>
                                    <div>
                                        <h4>{activeContact.name}</h4>
                                        <span>{activeContact.email || 'Direct Chat'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="messages-list">
                                {chatMessages.length === 0 ? (
                                    <div className="chat-placeholder">
                                        <p>No messages yet. Say hello!</p>
                                    </div>
                                ) : (
                                    chatMessages.map((msg, i) => (
                                        <div key={i} className={`message-wrapper ${msg.senderId === user.id ? 'sent' : 'received'}`}>
                                            <div className="message-bubble">
                                                <p>{msg.content}</p>
                                                <span className="time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <form className="chat-footer" onSubmit={handleSendMessage}>
                                <input 
                                    type="text" 
                                    placeholder="Type a message..." 
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit" disabled={!chatInput.trim()}><FiSend /></button>
                            </form>
                        </>
                    ) : (
                        <div className="chat-placeholder">
                            <FiMessageSquare size={48} />
                            <p>Select a contact to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
