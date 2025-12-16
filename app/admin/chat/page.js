'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlineAdmins, setOnlineAdmins] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [selectedChat, setSelectedChat] = useState('general'); // 'general', ID-ul adminului, sau 'group_ID'
  const [sidebarOpen, setSidebarOpen] = useState(false); // Pentru mobile
  const [unreadByChat, setUnreadByChat] = useState({}); // Mesaje necitite per chat
  const [editingMessage, setEditingMessage] = useState(null); // Mesajul în curs de editare
  const [editContent, setEditContent] = useState(''); // Conținutul editat
  const [messageMenu, setMessageMenu] = useState(null); // ID-ul mesajului cu meniu deschis
  const [sending, setSending] = useState(false); // Previne trimiterea multiplă
  
  // Grupuri
  const [groups, setGroups] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupImage, setGroupImage] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [editingGroup, setEditingGroup] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const groupImageRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isInitialLoad = useRef(true); // Pentru scroll automat doar la prima încărcare
  const isUserNearBottom = useRef(true); // Pentru a urmări dacă userul e la capăt

  // Funcție pentru a genera o culoare consistentă bazată pe email
  const getAvatarColor = (email) => {
    if (!email) return 'from-gray-400 to-gray-600';
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'from-red-400 to-red-600',
      'from-orange-400 to-orange-600',
      'from-amber-400 to-amber-600',
      'from-yellow-400 to-yellow-600',
      'from-lime-400 to-lime-600',
      'from-green-400 to-green-600',
      'from-emerald-400 to-emerald-600',
      'from-teal-400 to-teal-600',
      'from-cyan-400 to-cyan-600',
      'from-sky-400 to-sky-600',
      'from-blue-400 to-blue-600',
      'from-indigo-400 to-indigo-600',
      'from-violet-400 to-violet-600',
      'from-purple-400 to-purple-600',
      'from-fuchsia-400 to-fuchsia-600',
      'from-pink-400 to-pink-600',
      'from-rose-400 to-rose-600',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  // Funcție pentru a obține inițialele
  const getInitials = (name, email) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Detectează dacă utilizatorul nu este la capătul conversației
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
      isUserNearBottom.current = isNearBottom;
    }
  };

  // Check if super admin
  const checkSuperAdmin = async () => {
    try {
      const res = await fetch('/api/admin/check');
      if (res.ok) {
        const data = await res.json();
        setIsSuperAdmin(data.isSuperAdmin || false);
      }
    } catch (error) {
      console.error('Eroare la verificarea rolului:', error);
    }
  };

  // Fetch grupuri
  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/admin/groups');
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Eroare la încărcarea grupurilor:', error);
    }
  };

  // Fetch mesaje
  const fetchMessages = async () => {
    try {
      let url = '/api/admin/messages?limit=50';
      
      if (selectedChat.startsWith('group_')) {
        const groupId = selectedChat.replace('group_', '');
        url = `/api/admin/messages?groupId=${groupId}&limit=50`;
      } else if (selectedChat !== 'general') {
        url = `/api/admin/messages?receiverId=${selectedChat}&limit=50`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Eroare la încărcarea mesajelor:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch status online
  const fetchOnlineStatus = async () => {
    try {
      const res = await fetch('/api/admin/status');
      if (res.ok) {
        const data = await res.json();
        setOnlineAdmins(data.admins || []);
      }
    } catch (error) {
      console.error('Eroare la verificarea statusului:', error);
    }
  };

  // Fetch toți adminii pentru chat
  const fetchAllAdmins = async () => {
    try {
      const res = await fetch('/api/admin/chat-users');
      if (res.ok) {
        const data = await res.json();
        setAllAdmins(data.users || []);
      }
    } catch (error) {
      console.error('Eroare la încărcarea adminilor:', error);
    }
  };

  // Update status online
  const updateOnlineStatus = async () => {
    if (session?.user?.email) {
      try {
        await fetch('/api/admin/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oderId: session.user.id,
            email: session.user.email,
          }),
        });
      } catch (error) {
        console.error('Eroare la actualizarea statusului:', error);
      }
    }
  };

  // Marchează mesajele ca citite
  const markMessagesAsRead = async (chatId) => {
    try {
      await fetch('/api/admin/messages/unread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
      });
    } catch (error) {
      console.error('Eroare la marcarea mesajelor:', error);
    }
  };

  // Fetch mesaje necitite
  const fetchUnreadMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages/unread');
      if (res.ok) {
        const data = await res.json();
        setUnreadByChat(data.unreadByChat || {});
      }
    } catch (error) {
      console.error('Eroare la încărcarea mesajelor necitite:', error);
    }
  };

  // Editează mesaj - folosește newMessage din input-ul principal
  const handleEditMessage = async (messageId) => {
    const contentToSave = newMessage.trim() || editContent.trim();
    if (!contentToSave) return;
    
    try {
      const res = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentToSave }),
      });
      
      if (res.ok) {
        setEditingMessage(null);
        setEditContent('');
        setNewMessage('');
        fetchMessages();
      } else {
        const error = await res.json();
        alert(error.error || 'Eroare la editare');
      }
    } catch (error) {
      console.error('Eroare la editarea mesajului:', error);
    }
  };

  // Șterge mesaj
  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Sigur vrei să ștergi acest mesaj?')) return;
    
    try {
      const res = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        fetchMessages();
      } else {
        const error = await res.json();
        alert(error.error || 'Eroare la ștergere');
      }
    } catch (error) {
      console.error('Eroare la ștergerea mesajului:', error);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    if (status === 'authenticated') {
      fetchMessages();
      fetchOnlineStatus();
      fetchAllAdmins();
      updateOnlineStatus();
      fetchUnreadMessages();
      checkSuperAdmin();
      fetchGroups();

      // Polling pentru mesaje și status
      const messageInterval = setInterval(() => {
        fetchMessages();
        fetchUnreadMessages();
      }, 3000);
      const statusInterval = setInterval(() => {
        fetchOnlineStatus();
        updateOnlineStatus();
      }, 15000); // Update status la fiecare 15 secunde
      const groupInterval = setInterval(fetchGroups, 10000);

      // Cleanup la unmount
      return () => {
        clearInterval(messageInterval);
        clearInterval(statusInterval);
        clearInterval(groupInterval);
        // Marchează offline
        fetch('/api/admin/status', { method: 'DELETE' }).catch(() => {});
      };
    }
  }, [status, router, selectedChat]);

  // Refetch mesaje când se schimbă conversația și marchează ca citite
  useEffect(() => {
    if (status === 'authenticated') {
      setLoading(true);
      isInitialLoad.current = true; // Resetăm la schimbarea chat-ului
      fetchMessages();
      // Marchează mesajele ca citite când intri în conversație
      markMessagesAsRead(selectedChat);
    }
  }, [selectedChat]);

  // Scroll automat doar la prima încărcare sau când userul e la capăt
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      if (isInitialLoad.current) {
        // Prima încărcare - scroll instant la capăt
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
        isInitialLoad.current = false;
      }
    }
  }, [messages, loading]);

  // Funcție pentru a începe editarea în input-ul principal
  const startEditing = (message) => {
    setEditingMessage(message.id);
    setEditContent(message.content || '');
    setNewMessage(message.content || '');
  };

  // Funcție pentru a anula editarea
  const cancelEditing = () => {
    setEditingMessage(null);
    setEditContent('');
    setNewMessage('');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Previne trimiterea multiplă
    if (sending) return;
    
    // Dacă suntem în mod editare, salvăm editarea
    if (editingMessage) {
      if (!newMessage.trim()) return;
      setSending(true);
      try {
        await handleEditMessage(editingMessage);
        setNewMessage('');
      } finally {
        setSending(false);
      }
      return;
    }
    
    if (!newMessage.trim() || !session?.user?.id) return;

    const messageContent = newMessage.trim();
    
    // Optimistic UI - adaugă mesajul instant în UI
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      content: messageContent,
      senderId: session.user.id,
      senderName: session.user.name || session.user.email,
      senderEmail: session.user.email,
      senderImage: session.user.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      receiverId: selectedChat !== 'general' && !selectedChat.startsWith('group_') ? selectedChat : null,
      groupId: selectedChat.startsWith('group_') ? selectedChat.replace('group_', '') : null,
    };
    
    // Adaugă mesajul instant
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    
    // Scroll instant la capăt când trimiți mesaj
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'instant' }), 50);

    try {
      const messageData = {
        content: messageContent,
      };

      // Dacă e mesaj într-un grup
      if (selectedChat.startsWith('group_')) {
        messageData.groupId = selectedChat.replace('group_', '');
      } else if (selectedChat !== 'general') {
        // Dacă e mesaj privat
        messageData.receiverId = selectedChat;
      }

      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      if (res.ok) {
        const savedMessage = await res.json();
        // Înlocuiește mesajul optimistic cu cel real
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? { ...savedMessage, isOptimistic: false } : msg
        ));
      } else {
        // Elimină mesajul optimistic în caz de eroare
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
        const errorData = await res.json().catch(() => ({}));
        console.error('Eroare server:', res.status, errorData);
        alert(`Eroare ${res.status}: ${errorData.error || errorData.details || 'Încearcă din nou.'}`);
      }
    } catch (error) {
      // Elimină mesajul optimistic în caz de eroare
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      console.error('Eroare la trimiterea mesajului:', error);
      alert(`Eroare de conexiune: ${error.message}`);
    }
  };

  const isOnline = (email) => {
    const admin = onlineAdmins.find(a => a.email === email);
    return admin?.isOnline || false;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Azi';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Ieri';
    }
    return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
  };

  // Grupează mesaje pe zile
  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach(msg => {
      const date = new Date(msg.createdAt).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const getSelectedChatName = () => {
    if (selectedChat === 'general') return 'Chat General';
    if (selectedChat.startsWith('group_')) {
      const groupId = selectedChat.replace('group_', '');
      const group = groups.find(g => g.id === groupId);
      return group?.name || 'Grup';
    }
    const admin = allAdmins.find(a => a.id === selectedChat);
    return admin?.name || admin?.email || 'Conversație Privată';
  };

  // Funcții pentru grupuri
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('Te rog introdu un nume pentru grup');
      return;
    }
    
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName.trim(),
          description: groupDescription.trim(),
          image: groupImage,
          memberIds: selectedMembers
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setShowGroupModal(false);
        resetGroupForm();
        fetchGroups();
        setSelectedChat(`group_${data.group.id}`);
      } else {
        const error = await res.json();
        alert(error.error || 'Eroare la crearea grupului');
      }
    } catch (error) {
      console.error('Eroare la crearea grupului:', error);
      alert('Eroare la crearea grupului');
    }
  };

  const handleUpdateGroup = async () => {
    if (!selectedGroup) return;
    
    try {
      const res = await fetch(`/api/admin/groups/${selectedGroup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName.trim() || undefined,
          description: groupDescription.trim(),
          image: groupImage !== null ? groupImage : undefined,
          memberIds: selectedMembers.length > 0 ? selectedMembers : undefined
        })
      });
      
      if (res.ok) {
        setShowGroupSettings(false);
        resetGroupForm();
        fetchGroups();
      } else {
        const error = await res.json();
        alert(error.error || 'Eroare la actualizarea grupului');
      }
    } catch (error) {
      console.error('Eroare la actualizarea grupului:', error);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm('Sigur vrei să ștergi acest grup? Toate mesajele vor fi șterse.')) return;
    
    try {
      const res = await fetch(`/api/admin/groups/${groupId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setShowGroupSettings(false);
        setSelectedChat('general');
        fetchGroups();
      } else {
        const error = await res.json();
        alert(error.error || 'Eroare la ștergerea grupului');
      }
    } catch (error) {
      console.error('Eroare la ștergerea grupului:', error);
    }
  };

  const resetGroupForm = () => {
    setGroupName('');
    setGroupDescription('');
    setGroupImage(null);
    setSelectedMembers([]);
    setEditingGroup(false);
    setSelectedGroup(null);
  };

  const openGroupSettings = (group) => {
    setSelectedGroup(group);
    setGroupName(group.name);
    setGroupDescription(group.description || '');
    setGroupImage(group.image);
    setSelectedMembers(group.memberIds || []);
    setEditingGroup(true);
    setShowGroupSettings(true);
  };

  const handleGroupImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Imaginea este prea mare. Dimensiunea maximă este 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setGroupImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);
  const otherAdmins = allAdmins.filter(a => a.email !== session?.user?.email);

  // Funcție pentru a selecta chat și a închide sidebar-ul pe mobile
  const handleSelectChat = (chatId) => {
    setSelectedChat(chatId);
    setSidebarOpen(false);
  };

  // Găsește grupul curent dacă e selectat
  const currentGroup = selectedChat.startsWith('group_') 
    ? groups.find(g => g.id === selectedChat.replace('group_', ''))
    : null;

  return (
    <div className="flex h-full bg-gray-100 overflow-hidden" style={{ height: 'calc(100dvh - 73px)' }}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Lista de conversații */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 md:z-auto
        w-[85vw] max-w-[300px] sm:w-80 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:w-64 lg:w-72
        pb-[env(safe-area-inset-bottom,0px)]
      `}>
        <div className="p-2.5 sm:p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm sm:text-lg font-semibold text-gray-800">Conversații</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Chat General */}
        <div 
          onClick={() => handleSelectChat('general')}
          className={`p-2.5 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2 sm:gap-3 ${
            selectedChat === 'general' ? 'bg-amber-50 border-l-4 border-amber-500' : ''
          }`}
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
            👥
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">Chat General</p>
              {unreadByChat['general']?.count > 0 && selectedChat !== 'general' && (
                <span className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex-shrink-0">
                  {unreadByChat['general'].count}
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 truncate">
              {unreadByChat['general']?.count > 0 && selectedChat !== 'general' 
                ? `${unreadByChat['general'].senderName?.split(' ')[0]}: mesaj nou`
                : `${onlineAdmins.filter(a => a.isOnline).length} online`}
            </p>
          </div>
        </div>

        {/* Secțiunea Grupuri */}
        <div className="px-2.5 sm:px-4 py-1.5 bg-gray-50 flex items-center justify-between">
          <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Grupuri</p>
          {isSuperAdmin && (
            <button
              onClick={() => {
                resetGroupForm();
                setShowGroupModal(true);
              }}
              className="p-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded"
              title="Creează grup nou"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>

        {/* Lista de grupuri */}
        <div className="overflow-y-auto max-h-36 sm:max-h-48">
          {groups.map(group => (
            <div 
              key={group.id}
              onClick={() => handleSelectChat(`group_${group.id}`)}
              className={`p-2.5 sm:p-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                selectedChat === `group_${group.id}` ? 'bg-amber-50 border-l-4 border-amber-500' : ''
              }`}
            >
              <div className="relative flex-shrink-0">
                {group.image ? (
                  <img 
                    src={group.image} 
                    alt={group.name}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md`}>
                    {group.name?.substring(0, 2).toUpperCase() || 'GR'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate text-xs sm:text-sm">{group.name}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                  {group.memberIds?.length || 0} membri
                </p>
              </div>
              {isSuperAdmin && selectedChat === `group_${group.id}` && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openGroupSettings(group);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          
          {groups.length === 0 && (
            <div className="p-3 text-center text-gray-500 text-xs">
              {isSuperAdmin ? (
                <p>Creează primul grup</p>
              ) : (
                <p>Niciun grup disponibil</p>
              )}
            </div>
          )}
        </div>

        <div className="px-2.5 sm:px-4 py-1.5 bg-gray-50">
          <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Mesaje Private</p>
        </div>

        {/* Lista de admini pentru mesaje private */}
        <div className="flex-1 overflow-y-auto">
          {otherAdmins.map(admin => {
            const adminUnread = unreadByChat[admin.id];
            // Obține datele actualizate din onlineAdmins (care vin din DB)
            const adminData = onlineAdmins.find(a => a.id === admin.id) || admin;
            return (
              <div 
                key={admin.id}
                onClick={() => handleSelectChat(admin.id)}
                className={`p-2.5 sm:p-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                  selectedChat === admin.id ? 'bg-amber-50 border-l-4 border-amber-500' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  {adminData.image ? (
                    <img 
                      src={adminData.image} 
                      alt={adminData.name || adminData.email}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${getAvatarColor(adminData.email)} flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md`}>
                      {getInitials(adminData.name, adminData.email)}
                    </div>
                  )}
                  {isOnline(adminData.email) && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-medium text-gray-800 truncate text-xs sm:text-sm">{adminData.name || adminData.email}</p>
                    {adminUnread?.count > 0 && selectedChat !== admin.id && (
                      <span className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex-shrink-0">
                        {adminUnread.count}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                    {adminUnread?.count > 0 && selectedChat !== admin.id ? (
                      <span className="text-gray-700 font-medium">Mesaj nou</span>
                    ) : isOnline(adminData.email) ? (
                      <span className="text-green-600">Online</span>
                    ) : (
                      'Offline'
                    )}
                  </p>
                </div>
              </div>
            );
          })}
          
          {otherAdmins.length === 0 && (
            <div className="p-3 text-center text-gray-400 text-xs">
              <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>Se încarcă...</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col w-full min-w-0 relative">
        {/* Header */}
        <div className="p-2 sm:p-3 bg-white border-b border-gray-200 flex items-center gap-2">
          {/* Mobile menu button - în header pentru acces ușor */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:bg-amber-700 touch-manipulation flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {selectedChat === 'general' ? (
            <>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm flex-shrink-0">
                👥
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm truncate">Chat General</h3>
                <p className="text-[10px] sm:text-xs text-gray-500">{onlineAdmins.filter(a => a.isOnline).length} online</p>
              </div>
            </>
          ) : selectedChat.startsWith('group_') && currentGroup ? (
            <>
              {currentGroup.image ? (
                <img src={currentGroup.image} alt="" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold shadow-md text-xs sm:text-sm flex-shrink-0">
                  {currentGroup.name?.substring(0, 2).toUpperCase() || 'GR'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{currentGroup.name}</h3>
                <p className="text-[10px] sm:text-xs text-gray-500">{currentGroup.memberIds?.length || 0} membri</p>
              </div>
              {isSuperAdmin && (
                <button
                  onClick={() => openGroupSettings(currentGroup)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </>
          ) : (
            <>
              {(() => {
                const admin = allAdmins.find(a => a.id === selectedChat);
                // Obține datele actualizate din onlineAdmins
                const adminData = onlineAdmins.find(a => a.id === selectedChat) || admin;
                return adminData ? (
                  <>
                    {adminData.image ? (
                      <img src={adminData.image} alt="" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${getAvatarColor(adminData.email)} flex items-center justify-center text-white font-bold shadow-md text-xs sm:text-sm flex-shrink-0`}>
                        {getInitials(adminData.name, adminData.email)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{adminData.name || adminData.email}</h3>
                      <p className="text-[10px] sm:text-xs">
                        {isOnline(adminData.email) ? (
                          <span className="text-green-600">Online</span>
                        ) : (
                          <span className="text-gray-500">Offline</span>
                        )}
                      </p>
                    </div>
                  </>
                ) : null;
              })()}
            </>
          )}
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 sm:space-y-3 bg-gray-50 relative" 
          onClick={() => setMessageMenu(null)}
        >
          {/* Scroll to bottom button - poziționat mai sus pe mobil pentru a nu se suprapune cu butonul de chat */}
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-36 sm:bottom-24 right-4 z-20 p-2.5 sm:p-3 bg-white text-amber-600 rounded-full shadow-lg hover:bg-gray-50 active:bg-gray-100 transition-all border border-gray-200"
              style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          )}
          {Object.entries(groupedMessages).map(([date, dayMessages]) => (
            <div key={date}>
              <div className="flex justify-center mb-2 sm:mb-3">
                <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] sm:text-xs rounded-full">
                  {formatDate(dayMessages[0].createdAt)}
                </span>
              </div>
              {dayMessages.map((message) => {
                const isOwnMessage = message.senderEmail === session?.user?.email;
                const isEditing = editingMessage === message.id;
                // Obține datele actualizate ale expeditorului
                const senderData = onlineAdmins.find(a => a.email === message.senderEmail);
                const senderImage = senderData?.image || message.senderImage;
                const senderName = senderData?.name || message.senderName;
                return (
                  <div
                    key={message.id}
                    className={`flex items-end gap-1 sm:gap-1.5 mb-1.5 sm:mb-2 ${isOwnMessage ? 'flex-row-reverse' : ''} group`}
                  >
                    {/* Avatar */}
                    {!isOwnMessage && (
                      senderImage ? (
                        <img
                          src={senderImage}
                          alt={senderName}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br ${getAvatarColor(message.senderEmail)} flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold shadow-md flex-shrink-0`}>
                          {getInitials(senderName, message.senderEmail)}
                        </div>
                      )
                    )}
                    
                    {/* Message bubble */}
                    <div 
                      className={`max-w-[80%] sm:max-w-[75%] md:max-w-md ${isOwnMessage ? 'items-end' : 'items-start'} relative`}
                      onContextMenu={(e) => {
                        if (isOwnMessage && !isEditing) {
                          e.preventDefault();
                          setMessageMenu(message.id);
                        }
                      }}
                    >
                      {!isOwnMessage && (
                        <p className="text-[9px] sm:text-[10px] text-gray-500 mb-0.5 ml-1 truncate max-w-[150px] sm:max-w-none">{senderName}</p>
                      )}
                      
                      {/* Meniu acțiuni pentru mesajele proprii - vizibil pe hover sau când e activ */}
                      {isOwnMessage && !isEditing && (
                        <div className={`absolute ${isOwnMessage ? 'left-0 -translate-x-full pr-0.5' : 'right-0 translate-x-full pl-0.5'} top-1/2 -translate-y-1/2 ${messageMenu === message.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMessageMenu(messageMenu === message.id ? null : message.id);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          >
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          
                          {/* Dropdown meniu */}
                          {messageMenu === message.id && (
                            <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[90px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditing(message);
                                  setMessageMenu(null);
                                }}
                                className="w-full px-2.5 py-1 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-1.5"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editează
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMessage(message.id);
                                  setMessageMenu(null);
                                }}
                                className="w-full px-2.5 py-1 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Șterge
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-amber-500 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                        } ${isEditing ? 'ring-2 ring-amber-300' : ''}`}
                      >
                        {/* Conținutul mesajului - cu indicator dacă e în editare */}
                        {message.content && (
                          <p className="break-words text-xs sm:text-sm">{message.content}</p>
                        )}
                        {isEditing && (
                          <p className="text-[10px] mt-1 opacity-70">✏️ Editezi în input-ul de jos</p>
                        )}
                      </div>
                      <p className={`text-[9px] sm:text-[10px] text-gray-400 mt-0.5 ${isOwnMessage ? 'text-right mr-0.5' : 'ml-0.5'}`}>
                        {formatTime(message.createdAt)}
                        {message.isEdited && <span className="ml-0.5">(editat)</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="text-2xl sm:text-3xl mb-2">💬</p>
                <p className="text-xs sm:text-sm">Niciun mesaj încă</p>
                <p className="text-[10px] sm:text-xs">Începe conversația!</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-1.5 sm:p-3 bg-white border-t border-gray-200">
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Buton anulare editare */}
            {editingMessage && (
              <button
                type="button"
                onClick={cancelEditing}
                className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                title="Anulează editarea"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Message input */}
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={editingMessage ? "Editează mesajul..." : "Scrie..."}
              className={`flex-1 px-2.5 sm:px-3 py-1.5 border rounded-full focus:outline-none focus:ring-1 text-xs sm:text-sm min-w-0 text-gray-900 placeholder:text-gray-400 ${
                editingMessage 
                  ? 'border-amber-400 bg-amber-50 focus:border-amber-500 focus:ring-amber-500' 
                  : 'border-gray-300 focus:border-amber-500 focus:ring-amber-500'
              }`}
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={(!newMessage.trim() && !editingMessage) || sending}
              className={`p-1.5 text-white rounded-full transition-colors flex-shrink-0 ${
                editingMessage 
                  ? 'bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed' 
                  : 'bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {sending ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : editingMessage ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal pentru crearea unui grup nou */}
      {showGroupModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowGroupModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Creează Grup Nou</h3>
              <button
                onClick={() => setShowGroupModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Imaginea grupului */}
              <div className="flex flex-col items-center">
                <input
                  type="file"
                  ref={groupImageRef}
                  accept="image/*"
                  onChange={handleGroupImageSelect}
                  className="hidden"
                />
                <div 
                  onClick={() => groupImageRef.current?.click()}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                >
                  {groupImage ? (
                    <img src={groupImage} alt="Group" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">Click pentru a adăuga o imagine</p>
              </div>

              {/* Numele grupului */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numele grupului *</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Ex: Echipa de bucătari"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
                />
              </div>

              {/* Descrierea grupului */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descriere (opțional)</label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Descrierea grupului..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 resize-none"
                />
              </div>

              {/* Selectare membri */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adaugă membri</label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                  {allAdmins.map(admin => (
                    <label 
                      key={admin.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(admin.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMembers([...selectedMembers, admin.id]);
                          } else {
                            setSelectedMembers(selectedMembers.filter(id => id !== admin.id));
                          }
                        }}
                        className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                      />
                      {admin.image ? (
                        <img src={admin.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(admin.email)} flex items-center justify-center text-white text-xs font-bold`}>
                          {getInitials(admin.name, admin.email)}
                        </div>
                      )}
                      <span className="text-sm text-gray-700 truncate">{admin.name || admin.email}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-2 justify-end">
              <button
                onClick={() => setShowGroupModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Anulează
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                Creează grup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pentru setările grupului */}
      {showGroupSettings && selectedGroup && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowGroupSettings(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Setări Grup</h3>
              <button
                onClick={() => setShowGroupSettings(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Imaginea grupului */}
              <div className="flex flex-col items-center">
                <input
                  type="file"
                  ref={groupImageRef}
                  accept="image/*"
                  onChange={handleGroupImageSelect}
                  className="hidden"
                />
                <div 
                  onClick={() => groupImageRef.current?.click()}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden relative group"
                >
                  {groupImage ? (
                    <>
                      <img src={groupImage} alt="Group" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => groupImageRef.current?.click()}
                    className="text-xs text-amber-600 hover:text-amber-700"
                  >
                    Schimbă
                  </button>
                  {groupImage && (
                    <button
                      onClick={() => setGroupImage(null)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Șterge
                    </button>
                  )}
                </div>
              </div>

              {/* Numele grupului */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numele grupului</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
                />
              </div>

              {/* Descrierea grupului */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descriere</label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 resize-none"
                />
              </div>

              {/* Gestionare membri */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Membri ({selectedMembers.length})
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                  {allAdmins.map(admin => (
                    <label 
                      key={admin.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(admin.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMembers([...selectedMembers, admin.id]);
                          } else {
                            setSelectedMembers(selectedMembers.filter(id => id !== admin.id));
                          }
                        }}
                        className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                      />
                      {admin.image ? (
                        <img src={admin.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(admin.email)} flex items-center justify-center text-white text-xs font-bold`}>
                          {getInitials(admin.name, admin.email)}
                        </div>
                      )}
                      <span className="text-sm text-gray-700 truncate">{admin.name || admin.email}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => handleDeleteGroup(selectedGroup.id)}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Șterge grupul
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowGroupSettings(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Anulează
                </button>
                <button
                  onClick={handleUpdateGroup}
                  className="px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Salvează
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
