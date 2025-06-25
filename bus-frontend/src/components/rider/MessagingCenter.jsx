import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageAPI } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Send, 
  User, 
  Clock,
  AlertTriangle,
  Star,
  Car
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';

const MessagingCenter = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');

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

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      recipient_id: selectedConversation.other_user_id,
      content: newMessage,
      booking_id: selectedConversation.booking_id
    });
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
          other_user_role: message.sender_id === message.current_user_id ? 
            message.recipient?.role : message.sender?.role,
          driver_info: message.sender_id === message.current_user_id ? 
            message.recipient?.driver_profile : message.sender?.driver_profile,
          booking_id: message.booking_id,
          booking_info: message.booking,
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
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Messages</h2>
        <p className="text-gray-600 mt-2">
          Communicate with your children's drivers.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{conversations.length}</div>
            <p className="text-sm text-gray-600">Active Conversations</p>
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
              <CardDescription>Messages with drivers</CardDescription>
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
                      <div className="flex items-center space-x-3 mb-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.driver_info?.profile_image} />
                          <AvatarFallback>
                            {conversation.other_user_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {conversation.other_user_name}
                            </p>
                            {conversation.unread_count > 0 && (
                              <Badge variant="default" className="text-xs">
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                          {conversation.driver_info && (
                            <div className="flex items-center space-x-1 mt-1">
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-3 w-3 ${
                                      i < Math.floor(conversation.driver_info.rating || 0) 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-gray-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                ({conversation.driver_info.total_ratings || 0})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {conversation.booking_info && (
                        <div className="text-xs text-gray-500 mb-2">
                          <Car className="h-3 w-3 inline mr-1" />
                          {conversation.booking_info.route?.route_name}
                        </div>
                      )}
                      
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
                    Messages with drivers will appear here.
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
                {selectedConversation ? (
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedConversation.driver_info?.profile_image} />
                      <AvatarFallback>
                        {selectedConversation.other_user_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedConversation.other_user_name}</p>
                      {selectedConversation.booking_info && (
                        <p className="text-sm text-gray-500">
                          {selectedConversation.booking_info.route?.route_name}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  'Select a conversation'
                )}
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

      {/* Safety Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-blue-600" />
            Communication Guidelines
          </CardTitle>
          <CardDescription>
            Best practices for communicating with drivers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Be Respectful</h4>
              <p className="text-sm text-blue-700">
                Maintain professional and courteous communication with all drivers.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Share Important Info</h4>
              <p className="text-sm text-green-700">
                Communicate any changes in pickup times, locations, or special requirements.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Emergency Contact</h4>
              <p className="text-sm text-purple-700">
                For urgent matters, use the emergency messaging feature or call directly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagingCenter;

