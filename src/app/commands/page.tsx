import { Metadata } from 'next';
import { CommandsApp } from '@/components/commands/CommandsApp';

export const metadata: Metadata = {
  title: "Stream Commands | Antonic",
  description: "YouTube/Twitch Chat Commands List for Antonic's stream",
};

export default function CommandsPage() {
  return <CommandsApp />;
}
