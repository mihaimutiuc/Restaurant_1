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
  const [selectedChat, setSelectedChat] = useState('general'); // 'general' sau ID-ul adminului
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Pentru mobile
  const [enlargedImage, setEnlargedImage] = useState(null); // Pentru zoom imagine
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch mesaje
  const fetchMessages = async () => {
    try {
      const receiverId = selectedChat === 'general' ? '' : selectedChat;
      const url = receiverId 
        ? `/api/admin/messages?receiverId=${receiverId}&limit=50`
        : `/api/admin/messages?limit=50`;
      
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

  // Fetch toți adminii
  const fetchAllAdmins = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        const admins = data.users?.filter(u => u.isAdmin) || [];
        setAllAdmins(admins);
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

      // Polling pentru mesaje și status
      const messageInterval = setInterval(fetchMessages, 3000);
      const statusInterval = setInterval(() => {
        fetchOnlineStatus();
        updateOnlineStatus();
      }, 10000);

      // Cleanup la unmount
      return () => {
        clearInterval(messageInterval);
        clearInterval(statusInterval);
        // Marchează offline
        fetch('/api/admin/status', { method: 'DELETE' }).catch(() => {});
      };
    }
  }, [status, router, selectedChat]);

  // Refetch mesaje când se schimbă conversația și marchează ca citite
  useEffect(() => {
    if (status === 'authenticated') {
      setLoading(true);
      fetchMessages();
      // Marchează mesajele ca citite când intri în conversație
      markMessagesAsRead(selectedChat);
    }
  }, [selectedChat]);

  // Upload imagine - convertește în base64 pentru a funcționa pe Vercel
  const handleImageUpload = async (file) => {
    if (!file) return null;
    
    setUploadingImage(true);
    
    try {
      // Validare dimensiune (max 2MB pentru base64)
      if (file.size > 2 * 1024 * 1024) {
        alert('Imaginea este prea mare. Dimensiunea maximă este 2MB.');
        setUploadingImage(false);
        return null;
      }
      
      // Convertește în base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadingImage(false);
          resolve(e.target.result); // Returnează base64 data URL
        };
        reader.onerror = () => {
          setUploadingImage(false);
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Eroare la procesarea imaginii:', error);
      setUploadingImage(false);
      return null;
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validare tip
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Tip de fișier invalid. Doar imagini (JPG, PNG, WebP, GIF).');
        return;
      }
      // Validare dimensiune
      if (file.size > 2 * 1024 * 1024) {
        alert('Imaginea este prea mare. Dimensiunea maximă este 2MB.');
        return;
      }
      // Preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !imagePreview) || !session?.user) return;

    // Folosește imagePreview direct (este deja base64)
    let imageUrl = imagePreview;

    try {
      const messageData = {
        content: newMessage.trim() || (imageUrl ? '📷 Imagine' : ''),
        senderId: session.user.id,
        senderName: session.user.name || session.user.email,
        senderEmail: session.user.email,
        senderImage: session.user.image,
        imageUrl: imageUrl,
      };

      // Dacă e mesaj privat
      if (selectedChat !== 'general') {
        messageData.receiverId = selectedChat;
      }

      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      if (res.ok) {
        setNewMessage('');
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
        fetchMessages();
      }
    } catch (error) {
      console.error('Eroare la trimiterea mesajului:', error);
    }
  };

  const isOnline = (email) => {
    return onlineAdmins.some(admin => admin.email === email);
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
    const admin = allAdmins.find(a => a.id === selectedChat);
    return admin?.name || admin?.email || 'Conversație Privată';
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

  return (
    <div className="flex h-[calc(100vh-120px)] bg-gray-100 rounded-lg overflow-hidden relative">
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
        w-72 sm:w-80 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:w-72 lg:w-80
      `}>
        <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">Conversații</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Chat General */}
        <div 
          onClick={() => handleSelectChat('general')}
          className={`p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2 sm:gap-3 ${
            selectedChat === 'general' ? 'bg-amber-50 border-l-4 border-amber-500' : ''
          }`}
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
            👥
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 text-sm sm:text-base">Chat General</p>
            <p className="text-xs sm:text-sm text-gray-500">{onlineAdmins.length} admini online</p>
          </div>
        </div>

        <div className="px-3 sm:px-4 py-2 bg-gray-50">
          <p className="text-xs font-medium text-gray-500 uppercase">Mesaje Private</p>
        </div>

        {/* Lista de admini pentru mesaje private */}
        <div className="flex-1 overflow-y-auto">
          {otherAdmins.map(admin => (
            <div 
              key={admin.id}
              onClick={() => handleSelectChat(admin.id)}
              className={`p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2 sm:gap-3 ${
                selectedChat === admin.id ? 'bg-amber-50 border-l-4 border-amber-500' : ''
              }`}
            >
              <div className="relative flex-shrink-0">
                {admin.image ? (
                  <img 
                    src={admin.image} 
                    alt={admin.name || admin.email}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${getAvatarColor(admin.email)} flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md`}>
                    {getInitials(admin.name, admin.email)}
                  </div>
                )}
                {isOnline(admin.email) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate text-sm sm:text-base">{admin.name || admin.email}</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {isOnline(admin.email) ? (
                    <span className="text-green-600">Online</span>
                  ) : (
                    'Offline'
                  )}
                </p>
              </div>
            </div>
          ))}
          
          {otherAdmins.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              <p>Nu există alți administratori</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <div className="p-3 sm:p-4 bg-white border-b border-gray-200 flex items-center gap-2 sm:gap-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {selectedChat === 'general' ? (
            <>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm sm:text-lg flex-shrink-0">
                👥
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">Chat General</h3>
                <p className="text-xs sm:text-sm text-gray-500">{onlineAdmins.length} admin{onlineAdmins.length !== 1 ? 'i' : ''} online</p>
              </div>
            </>
          ) : (
            <>
              {(() => {
                const admin = allAdmins.find(a => a.id === selectedChat);
                return admin ? (
                  <>
                    {admin.image ? (
                      <img src={admin.image} alt="" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${getAvatarColor(admin.email)} flex items-center justify-center text-white font-bold shadow-md text-sm sm:text-base flex-shrink-0`}>
                        {getInitials(admin.name, admin.email)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{admin.name || admin.email}</h3>
                      <p className="text-xs sm:text-sm">
                        {isOnline(admin.email) ? (
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
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
          {Object.entries(groupedMessages).map(([date, dayMessages]) => (
            <div key={date}>
              <div className="flex justify-center mb-3 sm:mb-4">
                <span className="px-2 sm:px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                  {formatDate(dayMessages[0].createdAt)}
                </span>
              </div>
              {dayMessages.map((message) => {
                const isOwnMessage = message.senderEmail === session?.user?.email;
                return (
                  <div
                    key={message.id}
                    className={`flex items-end gap-1.5 sm:gap-2 mb-2 sm:mb-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    {!isOwnMessage && (
                      message.senderImage ? (
                        <img
                          src={message.senderImage}
                          alt={message.senderName}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br ${getAvatarColor(message.senderEmail)} flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shadow-md flex-shrink-0`}>
                          {getInitials(message.senderName, message.senderEmail)}
                        </div>
                      )
                    )}
                    
                    {/* Message bubble */}
                    <div className={`max-w-[75%] sm:max-w-xs md:max-w-md lg:max-w-lg ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                      {!isOwnMessage && (
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 ml-1">{message.senderName}</p>
                      )}
                      <div
                        className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-amber-500 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                        }`}
                      >
                        {message.imageUrl && (
                          <img 
                            src={message.imageUrl} 
                            alt="Imagine" 
                            className="max-w-full max-h-48 sm:max-h-64 rounded-lg mb-1 sm:mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setEnlargedImage(message.imageUrl)}
                          />
                        )}
                        {message.content && message.content !== '📷 Imagine' && (
                          <p className="break-words text-sm sm:text-base">{message.content}</p>
                        )}
                      </div>
                      <p className={`text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 ${isOwnMessage ? 'text-right mr-1' : 'ml-1'}`}>
                        {formatTime(message.createdAt)}
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
                <p className="text-3xl sm:text-4xl mb-2">💬</p>
                <p className="text-sm sm:text-base">Niciun mesaj încă</p>
                <p className="text-xs sm:text-sm">Începe conversația!</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="p-2 sm:p-3 bg-white border-t border-gray-200">
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-16 sm:h-20 rounded-lg" />
              <button 
                onClick={() => {
                  setImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                  if (cameraInputRef.current) cameraInputRef.current.value = '';
                }}
                className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 text-sm"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-2 sm:p-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* File upload button */}
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              title="Încarcă imagine"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Camera button - visible on mobile */}
            <input 
              type="file" 
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 sm:hidden"
              title="Fă o poză"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            {/* Camera button - visible on desktop */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="hidden sm:block p-2 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              title="Fă o poză"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Message input */}
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Scrie un mesaj..."
              className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-full focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm sm:text-base min-w-0 text-gray-900 placeholder:text-gray-500"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={(!newMessage.trim() && !imagePreview) || uploadingImage}
              className="p-1.5 sm:p-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              {uploadingImage ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal pentru imaginea mărită */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <button
            onClick={() => setEnlargedImage(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img 
            src={enlargedImage} 
            alt="Imagine mărită" 
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
