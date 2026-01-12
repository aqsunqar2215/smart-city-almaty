import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Send, Paperclip, Smile, Phone, Video, MoreVertical,
    Users, MessageSquare, Settings, LogOut, Plus, Check, CheckCheck,
    ArrowLeft, UserPlus, Hash, Volume2, Bell, BellOff, Trash2, Edit2,
    Image, File, Mic, X, Circle, Maximize2, Minimize2
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sticker as StickerIcon } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface ChatMessage {
    id: number;
    chat_id: number;
    sender_id: number;
    sender_name: string;
    sender_avatar?: string;
    content: string;
    message_type: string;
    reply_to?: number;
    is_edited: boolean;
    created_at: string;
}

interface Chat {
    id: number;
    type: string;
    name: string;
    avatar_url?: string;
    description?: string;
    member_count: number;
    unread_count: number;
    last_message?: {
        content: string;
        sender_id: number;
        created_at: string;
    };
    created_at: string;
}

interface UserProfile {
    id: number;
    username: string;
    email: string;
    bio?: string;
    avatar_url?: string;
    is_online: boolean;
    last_seen?: string;
}

interface Contact {
    id: number;
    user_id: number;
    username: string;
    nickname?: string;
    avatar_url?: string;
    is_online: boolean;
    last_seen?: string;
}

// ============================================
// API FUNCTIONS
// ============================================

const SERVER_URL = 'http://localhost:8000';
const API_BASE = `${SERVER_URL}/api/messenger`;

interface Sticker {
    id: string;
    url: string;
    name: string;
}


const api = {
    getChats: async (userId: number): Promise<Chat[]> => {
        const res = await fetch(`${API_BASE}/chats?user_id=${userId}`);
        return res.json();
    },

    createChat: async (data: { type: string; name?: string; member_ids: number[] }) => {
        const res = await fetch(`${API_BASE}/chats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    getMessages: async (chatId: number): Promise<ChatMessage[]> => {
        const res = await fetch(`${API_BASE}/chats/${chatId}/messages`);
        return res.json();
    },

    sendMessage: async (chatId: number, data: { sender_id: number; content: string; message_type?: string }) => {
        const res = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    getContacts: async (userId: number): Promise<Contact[]> => {
        const res = await fetch(`${API_BASE}/contacts?user_id=${userId}`);
        return res.json();
    },

    searchUsers: async (query: string): Promise<UserProfile[]> => {
        const res = await fetch(`${API_BASE}/users/search?query=${encodeURIComponent(query)}`);
        return res.json();
    },

    addContact: async (userId: number, contactId: number) => {
        const res = await fetch(`${API_BASE}/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, contact_id: contactId })
        });
        return res.json();
    },

    getProfile: async (userId: number): Promise<UserProfile> => {
        const res = await fetch(`${API_BASE}/profile/${userId}`);
        return res.json();
    },

    uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
    },

    getStickers: async (): Promise<Sticker[]> => {
        const res = await fetch(`${API_BASE}/stickers`);
        return res.json();
    }
};

const COMMON_EMOJIS = ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😕", "😟", "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠️", "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🙈", "🙉", "🙊", "💋", "💌", "💘", "💝", "💖", "💗", "💓", "💞", "💕", "💟", "❣️", "💔", "❤️", "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍", "💯", "💢", "💥", "💫", "💦", "💨", "🕳️", "💣", "💬", "👁️‍🗨️", "🗨️", "🗯️", "💭", "💤", "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦵", "🦿", "🦶", "👂", "🦻", "👃", "🧠", "🦷", "🦴", "👀", "👁️", "👅", "👄", "👶", "🧒", "👦", "👧", "🧑", "👱", "👨", "🧔", "👨‍🦰", "👨‍🦱", "👨‍🦳", "👨‍🦲", "👩", "👩‍🦰", "👩‍🦱", "👩‍🦳", "👩‍🦲", "👱‍♀️", "👱‍♂️", "🧓", "👴", "👵", "🙍", "🙍‍♂️", "🙍‍♀️", "🙎", "🙎‍♂️", "🙎‍♀️", "🙅", "🙅‍♂️", "🙅‍♀️", "🙆", "🙆‍♂️", "🙆‍♀️", "💁", "💁‍♂️", "💁‍♀️", "🙋", "🙋‍♂️", "🙋‍♀️", "🧏", "🧏‍♂️", "🧏‍♀️", "🙇", "🙇‍♂️", "🙇‍♀️", "🤦", "🤦‍♂️", "🤦‍♀️", "🤷", "🤷‍♂️", "🤷‍♀️"];


// ============================================
// SUB-COMPONENTS
// ============================================

const ChatListItem: React.FC<{
    chat: Chat;
    isActive: boolean;
    onClick: () => void;
    currentUserId: number;
}> = ({ chat, isActive, onClick, currentUserId }) => {
    const formatTime = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        } else if (diffDays < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <motion.div
            whileHover={{ backgroundColor: 'rgba(var(--primary), 0.1)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all ${isActive ? 'bg-primary/20 border-l-2 border-primary' : 'hover:bg-muted/30'
                }`}
        >
            <div className="relative">
                <Avatar className="w-12 h-12">
                    <AvatarImage src={chat.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-bold">
                        {chat.name?.charAt(0).toUpperCase() || '#'}
                    </AvatarFallback>
                </Avatar>
                {chat.type === 'GROUP' && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <Users className="w-3 h-3 text-white" />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate">{chat.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {formatTime(chat.last_message?.created_at)}
                    </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {chat.last_message?.content || 'No messages yet'}
                    </p>
                    {chat.unread_count > 0 && (
                        <Badge className="min-w-[20px] h-5 rounded-full bg-primary text-[10px] font-bold">
                            {chat.unread_count}
                        </Badge>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const MessageBubble: React.FC<{
    message: ChatMessage;
    isOwn: boolean;
    showAvatar: boolean;
}> = ({ message, isOwn, showAvatar }) => {
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    if (message.message_type === 'SYSTEM') {
        return (
            <div className="flex justify-center my-2">
                <span className="text-xs text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">
                    {message.content}
                </span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
        >
            {showAvatar && !isOwn ? (
                <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={message.sender_avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                        {message.sender_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            ) : (
                <div className="w-8 flex-shrink-0" />
            )}

            <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                {showAvatar && !isOwn && (
                    <span className="text-xs font-medium text-primary ml-1 mb-0.5 block">
                        {message.sender_name}
                    </span>
                )}
                <div
                    className={`rounded-2xl px-4 py-2 ${isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted/50 text-foreground rounded-bl-md'
                        }`}
                >
                    {message.message_type === 'IMAGE' ? (
                        <div className="flex flex-col gap-1">
                            <img
                                src={message.content.startsWith('/') ? `${SERVER_URL}${message.content}` : message.content}
                                alt="shared image"
                                className="rounded-lg max-w-full h-auto max-h-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(message.content.startsWith('/') ? `${SERVER_URL}${message.content}` : message.content, '_blank')}
                            />

                            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <span className={`text-[10px] ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {formatTime(message.created_at)}
                                </span>
                                {isOwn && (
                                    <CheckCheck className={`w-3 h-3 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`} />
                                )}
                            </div>
                        </div>
                    ) : message.message_type === 'FILE' ? (
                        <div className="flex flex-col gap-1">
                            <div
                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${isOwn ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}
                                onClick={() => window.open(message.content.startsWith('/') ? `${SERVER_URL}${message.content}` : message.content, '_blank')}
                                title="Download file"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <File className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">Attachment</p>
                                    <p className="text-[10px] opacity-70">Open file</p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <span className={`text-[10px] ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {formatTime(message.created_at)}
                                </span>
                                {isOwn && (
                                    <CheckCheck className={`w-3 h-3 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`} />
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <span className={`text-[10px] ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {formatTime(message.created_at)}
                                </span>
                                {isOwn && (
                                    <CheckCheck className={`w-3 h-3 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`} />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const NewChatDialog: React.FC<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentUserId: number;
    onChatCreated: () => void;
}> = ({ open, onOpenChange, currentUserId, onChatCreated }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
    const [isGroup, setIsGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (searchQuery.length >= 2) {
            api.searchUsers(searchQuery).then(setSearchResults);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const handleCreateChat = async () => {
        if (selectedUsers.length === 0) return;

        setLoading(true);
        try {
            const memberIds = [currentUserId, ...selectedUsers.map(u => u.id)];
            await api.createChat({
                type: selectedUsers.length > 1 || isGroup ? 'GROUP' : 'PRIVATE',
                name: isGroup ? groupName : undefined,
                member_ids: memberIds
            });
            toast.success('Chat created!');
            onChatCreated();
            onOpenChange(false);
            setSelectedUsers([]);
            setSearchQuery('');
            setGroupName('');
        } catch (e) {
            toast.error('Failed to create chat');
        }
        setLoading(false);
    };

    const toggleUser = (user: UserProfile) => {
        if (selectedUsers.find(u => u.id === user.id)) {
            setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-xl border-border/50">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        New Chat
                    </DialogTitle>
                    <DialogDescription>
                        Search for users to start a conversation
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-muted/30 border-border/50 rounded-xl"
                        />
                    </div>

                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.map(user => (
                                <Badge key={user.id} variant="secondary" className="gap-1 py-1 px-2">
                                    {user.username}
                                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleUser(user)} />
                                </Badge>
                            ))}
                        </div>
                    )}

                    {selectedUsers.length > 1 && (
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={isGroup}
                                    onChange={(e) => setIsGroup(e.target.checked)}
                                    className="rounded border-border"
                                />
                                Create as group chat
                            </label>
                            {isGroup && (
                                <Input
                                    placeholder="Group name"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="bg-muted/30 border-border/50 rounded-xl"
                                />
                            )}
                        </div>
                    )}

                    <ScrollArea className="h-[200px]">
                        {searchResults.filter(u => u.id !== currentUserId).map(user => (
                            <motion.div
                                key={user.id}
                                whileHover={{ backgroundColor: 'rgba(var(--primary), 0.1)' }}
                                onClick={() => toggleUser(user)}
                                className={`flex items-center gap-3 p-2 cursor-pointer rounded-lg ${selectedUsers.find(u => u.id === user.id) ? 'bg-primary/20' : ''
                                    }`}
                            >
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={user.avatar_url} />
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                                        {user.username?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="font-medium text-sm">{user.username}</div>
                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                </div>
                                {selectedUsers.find(u => u.id === user.id) && (
                                    <Check className="w-5 h-5 text-primary" />
                                )}
                            </motion.div>
                        ))}
                    </ScrollArea>

                    <Button
                        onClick={handleCreateChat}
                        disabled={selectedUsers.length === 0 || loading}
                        className="w-full rounded-xl bg-primary hover:bg-primary/90"
                    >
                        {loading ? 'Creating...' : `Start Chat${selectedUsers.length > 1 ? ` (${selectedUsers.length} users)` : ''}`}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

const MessengerApp: React.FC = () => {
    const { user: currentUser } = useAuth();
    const currentUserId = currentUser?.id ? parseInt(currentUser.id) || 0 : 0;

    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewChat, setShowNewChat] = useState(false);
    const [showMobileChat, setShowMobileChat] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [stickers, setStickers] = useState<Sticker[]>([]);


    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch chats
    const fetchChats = useCallback(async () => {
        if (!currentUserId) return;
        try {
            const data = await api.getChats(currentUserId);
            setChats(data);
        } catch (e) {
            console.error('Failed to fetch chats:', e);
        }
    }, [currentUserId]);

    // Fetch messages
    const fetchMessages = useCallback(async (chatId: number) => {
        try {
            const data = await api.getMessages(chatId);
            setMessages(prev => {
                // If messages hasn't changed, don't update state to avoid unnecessary effects
                if (prev.length === data.length &&
                    (prev.length === 0 || prev[prev.length - 1].id === data[data.length - 1].id)) {
                    return prev;
                }
                return data;
            });
        } catch (e) {
            console.error('Failed to fetch messages:', e);
        }
    }, []);

    useEffect(() => {
        fetchChats();
        api.getStickers().then(setStickers).catch(() => { });
        const interval = setInterval(fetchChats, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [fetchChats]);

    useEffect(() => {
        if (activeChat) {
            fetchMessages(activeChat.id);
            const interval = setInterval(() => fetchMessages(activeChat.id), 2000);
            return () => clearInterval(interval);
        }
    }, [activeChat, fetchMessages]);


    const handleSendMessage = async (contentOverride?: string, typeOverride?: string) => {
        const content = contentOverride || messageInput.trim();
        if (!content || !activeChat || !currentUserId) return;

        if (!contentOverride) setMessageInput('');

        try {
            await api.sendMessage(activeChat.id, {
                sender_id: currentUserId,
                content,
                message_type: typeOverride || 'TEXT'
            });
            fetchMessages(activeChat.id);
            fetchChats();
        } catch (e) {
            toast.error('Failed to send message');
            if (!contentOverride) setMessageInput(content);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeChat) return;

        setIsUploading(true);
        const toastId = toast.loading(`Uploading ${file.name}...`);

        try {
            const data = await api.uploadFile(file);
            await handleSendMessage(data.url, data.message_type);
            toast.success('File sent', { id: toastId });
        } catch (e) {
            toast.error('Upload failed', { id: toastId });
        }
        setIsUploading(false);
        e.target.value = ''; // Reset input
    };

    const addEmoji = (emoji: string) => {
        setMessageInput(prev => prev + emoji);
        inputRef.current?.focus();
    };


    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const selectChat = (chat: Chat) => {
        setMessages([]); // Clear messages immediately to avoid old content flash
        setActiveChat(chat);
        setShowMobileChat(true);
        fetchMessages(chat.id);
    };

    const filteredChats = chats.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!currentUser) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[500px] text-center p-8"
            >
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                    <MessageSquare className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Welcome to NexusChat</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                    Connect with citizens across Smart Almaty. Please log in to access the messenger.
                </p>
                <Button asChild className="rounded-xl bg-primary hover:bg-primary/90 cursor-pointer">
                    <a href="/auth">Open</a>
                </Button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={false}
            animate={{
                position: isFullscreen ? 'fixed' : 'relative',
                top: isFullscreen ? 0 : 'auto',
                left: isFullscreen ? 0 : 'auto',
                width: isFullscreen ? '100vw' : '100%',
                height: isFullscreen ? '100vh' : '600px',
                zIndex: isFullscreen ? 1000 : 0
            }}
            className={`flex overflow-hidden transition-all duration-300 ${isFullscreen ? 'rounded-0' : 'rounded-2xl border border-border/50 shadow-2xl'
                } bg-card/40 backdrop-blur-xl`}
        >
            {isFullscreen && (
                <Button
                    size="icon"
                    variant="secondary"
                    className="fixed top-4 right-4 z-[1001] rounded-full shadow-lg"
                    onClick={() => setIsFullscreen(false)}
                >
                    <Minimize2 className="w-5 h-5" />
                </Button>
            )}
            {/* Sidebar - Chat List */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-border/30 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-border/30">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            NexusChat
                        </h2>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-xl"
                            onClick={() => setShowNewChat(true)}
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-muted/30 border-border/50 rounded-xl h-10"
                        />
                    </div>
                </div>

                {/* Chat List */}
                <ScrollArea className="flex-1">
                    <div className="p-2">
                        <AnimatePresence>
                            {filteredChats.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No chats yet</p>
                                    <p className="text-xs mt-1">Start a new conversation!</p>
                                </div>
                            ) : (
                                filteredChats.map(chat => (
                                    <ChatListItem
                                        key={chat.id}
                                        chat={chat}
                                        isActive={activeChat?.id === chat.id}
                                        onClick={() => selectChat(chat)}
                                        currentUserId={currentUserId}
                                    />
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col ${!showMobileChat && !activeChat ? 'hidden md:flex' : 'flex'}`}>
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 px-4 flex items-center justify-between border-b border-border/30 bg-card/60">
                            <div className="flex items-center gap-3">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="md:hidden rounded-xl"
                                    onClick={() => setShowMobileChat(false)}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={activeChat.avatar_url} />
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-bold">
                                        {activeChat.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-sm">{activeChat.name}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {activeChat.type === 'GROUP'
                                            ? `${activeChat.member_count} members`
                                            : 'online'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <Button size="icon" variant="ghost" className="rounded-xl" onClick={() => setIsFullscreen(!isFullscreen)}>
                                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </Button>
                                <Button size="icon" variant="ghost" className="rounded-xl">
                                    <Phone className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="rounded-xl">
                                    <Video className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="rounded-xl">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-1">
                                {messages.map((msg, idx) => {
                                    const showAvatar = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id;
                                    return (
                                        <MessageBubble
                                            key={msg.id}
                                            message={msg}
                                            isOwn={msg.sender_id === currentUserId}
                                            showAvatar={showAvatar}
                                        />
                                    );
                                })}
                            </div>
                        </ScrollArea>

                        {/* Message Input */}
                        <div className="p-4 border-t border-border/30 bg-card/60">
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    id="messenger-file-upload"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="rounded-xl flex-shrink-0"
                                    onClick={() => document.getElementById('messenger-file-upload')?.click()}
                                    disabled={isUploading}
                                >
                                    <Paperclip className={`w-5 h-5 ${isUploading ? 'animate-pulse text-primary' : ''}`} />
                                </Button>
                                <div className="flex-1 relative">
                                    <Input
                                        ref={inputRef}
                                        placeholder="Type a message..."
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="pr-10 bg-muted/30 border-border/50 rounded-xl h-11"
                                    />
                                    <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors outline-none focus:outline-none bg-transparent hover:bg-transparent border-0 flex items-center justify-center transform-none hover:transform-none select-none"
                                                >
                                                    <Smile className="w-5 h-5" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                side="top"
                                                align="end"
                                                sideOffset={12}
                                                className="w-80 p-0 border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden pointer-events-auto"
                                            >
                                                <Tabs defaultValue="emojis" className="w-full">
                                                    <TabsList className="w-full grid grid-cols-2 rounded-none bg-muted/20 border-b border-border/30">
                                                        <TabsTrigger value="emojis" className="text-xs h-9">Emojis</TabsTrigger>
                                                        <TabsTrigger value="stickers" className="text-xs h-9">Stickers</TabsTrigger>
                                                    </TabsList>
                                                    <TabsContent value="emojis" className="m-0 focus-visible:outline-none">
                                                        <ScrollArea className="h-72 p-2">
                                                            <div className="grid grid-cols-8 gap-0.5">
                                                                {COMMON_EMOJIS.map((emoji, i) => (
                                                                    <button
                                                                        key={i}
                                                                        onClick={() => addEmoji(emoji)}
                                                                        className="text-xl p-1.5 hover:bg-primary/20 rounded-lg transition-colors border-0 bg-transparent"
                                                                    >
                                                                        {emoji}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </ScrollArea>
                                                    </TabsContent>
                                                    <TabsContent value="stickers" className="m-0 focus-visible:outline-none">
                                                        <ScrollArea className="h-72 p-2 focus-visible:outline-none">
                                                            {stickers.length === 0 ? (
                                                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
                                                                    <StickerIcon className="w-8 h-8 mb-2 opacity-20" />
                                                                    <p className="text-xs">No stickers available</p>
                                                                </div>
                                                            ) : (
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    {stickers.map((sticker) => (
                                                                        <button
                                                                            key={sticker.id}
                                                                            type="button"
                                                                            onClick={() => handleSendMessage(`${SERVER_URL}${sticker.url}`, 'IMAGE')}
                                                                            className="group relative aspect-square p-2 hover:bg-primary/20 rounded-xl transition-all border-0 bg-transparent"
                                                                        >
                                                                            <img
                                                                                src={`${SERVER_URL}${sticker.url}`}
                                                                                alt={sticker.name}
                                                                                className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                                                                            />
                                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/5 transition-opacity rounded-xl">
                                                                                <Send className="w-4 h-4 text-primary" />
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </ScrollArea>
                                                    </TabsContent>
                                                </Tabs>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                </div>
                                <Button
                                    size="icon"
                                    className="rounded-xl bg-primary hover:bg-primary/90 flex-shrink-0"
                                    onClick={() => handleSendMessage()}
                                    disabled={(!messageInput.trim() && !isUploading) || isUploading}
                                >
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-6">
                            <MessageSquare className="w-12 h-12 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Welcome to NexusChat</h3>
                        <p className="text-muted-foreground text-sm max-w-md mb-6">
                            Select a chat to start messaging or create a new conversation
                        </p>
                        <Button
                            className="rounded-xl bg-primary hover:bg-primary/90"
                            onClick={() => setShowNewChat(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Start New Chat
                        </Button>
                    </div>
                )}
            </div>

            {/* New Chat Dialog */}
            <NewChatDialog
                open={showNewChat}
                onOpenChange={setShowNewChat}
                currentUserId={currentUserId}
                onChatCreated={fetchChats}
            />
        </motion.div>
    );
};

export default MessengerApp;
