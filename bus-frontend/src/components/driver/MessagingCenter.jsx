import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageAPI } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  User, 
  Clock,
  AlertTriangle,
  Megaphone
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';

const MessagingCenter = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isBroadcastDialogOpen, setIsBroadcastDialogOpen] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    route_id: '',
    subject: '',
    content: '',
    is_emergency: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch messages
  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['my-messages'],
    queryFn: () => messageAPI.getMyMessages().then(res => res.data)
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: messageAPI.sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-messages']);
      setNewMessage('');
      toast({
        title: "Success",
        description: "Message sent successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to send message",
        variant: "destructive",
      });
    }
  });

  // Send broadcast mutation
  const sendBroadcastMutation = useMutation({
    mutationFn: messageAPI.sendBroadcast,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-messages']);
      setIsBroadcastDialogOpen(false);
      setBroadcastData({
        route_id: '',
        subject: '',
        content: '',
        is_emergency: false
      });
      toast({
        title: "Success",
        description: "Broadcast message sent successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to send broadcast",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      recipient_id: selectedConversation.other_user_id,
      content: newMessage,
      booking_id: selectedConversation.booking_id
    });
  };

  const handleSendBroadcast = () => {
    if (!broadcastData.content.trim() || !broadcastData.route_id) return;

    sendBroadcastMutation.mutate(broadcastData);
  };

  const groupMessagesByConversation = (messages) => {
    const conversations = {};
    
    messages?.forEach(message => {
      const otherUserId = message.sender_id === message.current_user_id ? 
        message.recipient_id : message.sender_id;
      
      const key = `${otherUserId}-${message.booking_id || 'general'}`;
      
      if (!conversations[key]) {
        conversations[key] = {
          other_user_id: otherUserId,
          other_user_name: message.sender_id === message.current_user_id ? 
            `${message.recipient?.first_name} ${message.recipient?.last_name}` :
            `${message.sender?.first_name} ${message.sender?.last_name}`,
          booking_id: message.booking_id,
          messages: [],
          last_message: message,
          unread_count: 0
        };
      }
      
      conversations[key].messages.push(message);
      
      if (message.status === 'unread' && message.recipient_id === message.current_user_id) {
        conversations[key].unread_count++;
      }
      
      if (new Date(message.created_at) > new Date(conversations[key].last_message.created_at)) {
        conversations[key].last_message = message;
      }
    });
    
    return Object.values(conversations);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load messages. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  const conversations = groupMessagesByConversation(messages);
  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Messages</h2>
          <p className="text-gray-600 mt-2">
            Communicate with families and send updates.
          </p>
        </div>
        <Dialog open={isBroadcastDialogOpen} onOpenChange={setIsBroadcastDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Megaphone className="h-4 w-4 mr-2" />
              Send Broadcast
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Broadcast Message</DialogTitle>
              <DialogDescription>
                Send a message to all families on a specific route.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Route</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={broadcastData.route_id}
                  onChange={(e) => setBroadcastData(prev => ({
                    ...prev,
                    route_id: e.target.value
                  }))}
                >
                  <option value="">Select a route</option>
                  {/* This would be populated with actual routes */}
                  <option value="1">Route 1</option>
                  <option value="2">Route 2</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={broadcastData.subject}
                  onChange={(e) => setBroadcastData(prev => ({
                    ...prev,
                    subject: e.target.value
                  }))}
                  placeholder="Message subject"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={broadcastData.content}
                  onChange={(e) => setBroadcastData(prev => ({
                    ...prev,
                    content: e.target.value
                  }))}
                  placeholder="Type your message here..."
                  rows={4}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emergency"
                  checked={broadcastData.is_emergency}
                  onChange={(e) => setBroadcastData(prev => ({
                    ...prev,
                    is_emergency: e.target.checked
                  }))}
                />
                <label htmlFor="emergency" className="text-sm">
                  Mark as emergency message
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBroadcastDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendBroadcast}
                disabled={sendBroadcastMutation.isPending}
              >
                {sendBroadcastMutation.isPending ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Broadcast'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{conversations.length}</div>
            <p className="text-sm text-gray-600">Total Conversations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-sm text-gray-600">Unread Messages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{messages?.length || 0}</div>
            <p className="text-sm text-gray-600">Total Messages</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>Recent messages from families</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {conversations.length > 0 ? (
                <div className="space-y-1">
                  {conversations.map((conversation, index) => (
                    <div
                      key={index}
                      className={`p-4 cursor-pointer hover:bg-gray-50 border-b ${
                        selectedConversation === conversation ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-sm">
                            {conversation.other_user_name}
                          </span>
                        </div>
                        {conversation.unread_count > 0 && (
                          <Badge variant="default" className="text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.last_message.content}
                      </p>
                      <div className="flex items-center text-xs text-gray-400 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {new Date(conversation.last_message.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-500">
                    Messages from families will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>
                {selectedConversation ? 
                  `Conversation with ${selectedConversation.other_user_name}` : 
                  'Select a conversation'
                }
              </CardTitle>
            </CardHeader>
            
            {selectedConversation ? (
              <>
                <CardContent className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === message.current_user_id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === message.current_user_id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {message.is_emergency && (
                            <div className="flex items-center mb-2">
                              <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                              <span className="text-xs font-medium text-red-500">EMERGENCY</span>
                            </div>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs mt-1 opacity-75">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                      rows={2}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    >
                      {sendMessageMutation.isPending ? (
                        <LoadingSpinner size="small" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a conversation from the list to start messaging.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MessagingCenter;

