import React, { useState } from 'react';
import {
  Search,
  Send,
  Paperclip,
  Phone,
  User as UserIcon,
  ShieldCheck,
  MoreHorizontal,
  MessageSquare,
} from 'lucide-react';
import { Role } from '../enums';
import type { User } from '../types';

interface MessagesProps {
  user: User;
}

const CONVERSATIONS = [
  {
    id: 'landlord',
    name: 'Musa Omari (Landlord)',
    lastMsg: 'I have checked your maintenance request.',
    time: '10:30 AM',
    unread: 2,
    unit: 'Property Owner',
    type: 'Landlord',
  },
  {
    id: 'mgmt',
    name: 'Amani Management',
    lastMsg: 'The utility invoice is ready.',
    time: 'Yesterday',
    unread: 0,
    unit: 'Main Office',
    type: 'Support',
  },
  {
    id: 't2',
    name: 'Bob Smith',
    lastMsg: 'When will the AC be fixed?',
    time: 'Yesterday',
    unread: 0,
    unit: 'Amani Heights #102',
    type: 'Tenant',
  },
  {
    id: 't3',
    name: 'Charlie Davis',
    lastMsg: 'Thanks for the reminder.',
    time: '2 days ago',
    unread: 0,
    unit: 'Campus #5',
    type: 'Tenant',
  },
];

export const Messages: React.FC<MessagesProps> = ({ user }) => {
  // Filter conversations: Tenants can only see Landlord/Support. Landlords see all.
  const filteredConversations = CONVERSATIONS.filter((conv) => {
    if (user.role === Role.LANDLORD) return true;
    return conv.type === 'Landlord' || conv.type === 'Support';
  });

  const [selectedConv, setSelectedConv] = useState(filteredConversations[0]);
  const [msgInput, setMsgInput] = useState('');

  return (
    <div className="bg-white rounded-[40px] shadow-xl shadow-slate-100 border border-slate-100 h-[calc(100vh-14rem)] flex overflow-hidden animate-in fade-in duration-500">
      {/* Conversation Sidebar */}
      <div className="w-full md:w-80 border-r flex flex-col bg-slate-50/50">
        <div className="p-6 border-b bg-white">
          <h3 className="text-xl font-black text-slate-900 mb-4">Messages</h3>
          {user.role === Role.LANDLORD && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search contacts..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              />
            </div>
          )}
          {user.role === Role.TENANT && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Secure Direct Channel</span>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConv(conv)}
              className={`w-full p-4 flex gap-3 text-left rounded-3xl transition-all relative ${selectedConv.id === conv.id ? 'bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100' : 'hover:bg-white/50'}`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${conv.type === 'Landlord' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}
              >
                <UserIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="font-black text-slate-900 text-sm truncate">{conv.name}</h4>
                  <span className="text-[10px] text-slate-400 font-black whitespace-nowrap">{conv.time}</span>
                </div>
                <p className="text-xs text-slate-500 truncate font-medium">{conv.lastMsg}</p>
              </div>
              {conv.unread > 0 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] font-black flex items-center justify-center border-4 border-white">
                  {conv.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden md:flex flex-1 flex-col bg-white">
        {/* Chat Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedConv.type === 'Landlord' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 leading-tight">{selectedConv.name}</h4>
              <p className="text-xs text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                {selectedConv.unit}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-2xl transition-all">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-2xl transition-all">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20">
          <div className="flex justify-center">
            <span className="text-[10px] font-black text-slate-400 bg-white px-4 py-1.5 rounded-full uppercase tracking-widest border border-slate-100 shadow-sm">
              May 31, 2024
            </span>
          </div>

          <div className="flex items-start gap-4 max-w-[70%]">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0 border border-slate-200">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="bg-white p-5 rounded-[24px] rounded-tl-none border border-slate-100 shadow-sm">
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                Hello {user.name.split(' ')[0]}, I just wanted to confirm the receipt of your maintenance
                request for the leaky sink. We've assigned a plumber for tomorrow morning.
              </p>
              <span className="text-[10px] text-slate-400 font-black mt-3 block uppercase tracking-wider">
                10:30 AM • Sent by Landlord
              </span>
            </div>
          </div>

          <div className="flex items-start gap-4 max-w-[70%] ml-auto flex-row-reverse">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-indigo-100">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="bg-indigo-600 p-5 rounded-[24px] rounded-tr-none shadow-xl shadow-indigo-100">
              <p className="text-sm text-white leading-relaxed font-medium">
                Thank you Musa! Tomorrow morning works perfectly. I'll be home to let them in.
              </p>
              <span className="text-[10px] text-indigo-200 font-black mt-3 block uppercase tracking-wider text-right">
                10:35 AM • Delivered
              </span>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="p-6 bg-white">
          <form
            className="flex items-center gap-4 p-2 bg-slate-50 rounded-[28px] border border-slate-100"
            onSubmit={(e) => {
              e.preventDefault();
              setMsgInput('');
            }}
          >
            <button
              type="button"
              className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder="Type your message to Landlord..."
              className="flex-1 px-4 py-3 bg-transparent border-none rounded-2xl text-sm focus:ring-0 outline-none font-medium text-slate-700"
            />
            <button
              type="submit"
              disabled={!msgInput.trim()}
              className="p-4 bg-indigo-600 text-white rounded-[22px] hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-200"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Placeholder */}
      <div className="md:hidden flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mb-6">
          <MessageSquare className="w-10 h-10" />
        </div>
        <h4 className="text-xl font-black text-slate-900 mb-2">Select a conversation</h4>
        <p className="text-sm text-slate-400 font-medium">
          Select a thread from the list to start messaging.
        </p>
      </div>
    </div>
  );
};
