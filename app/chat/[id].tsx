import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ServiceChatScreen } from '../../src/features/public/screens/ServiceChatScreen';

export default function ChatRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return null;
  }

  return <ServiceChatScreen conversationId={id} />;
}
