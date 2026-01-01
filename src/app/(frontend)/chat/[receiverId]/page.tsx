// app/(frontend)/chat/[receiverId]/page.tsx
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ChatClient from "../../components/chat/ChatClient";
import MessageService from "@/services/message.service";
import User from "@/models/user.model";
import dbConnect from "@/lib/dbConnect";
import { SocketProvider } from "../../providers/SocketProvider";

interface ChatPageProps {
  params: Promise<{ receiverId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  await dbConnect();
  
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) redirect("/sign-in");

  // Await params for Next.js 15+ compatibility
  const props = await params;
  const { receiverId } = props;

  // Prevent chatting with yourself
  if (session.user._id === receiverId) {
    redirect("/chat");
  }

  // Server-side initial data fetching
  const [initialMessages, receiverInfo] = await Promise.all([
    // Load last 50 messages
    MessageService.getDMs(session.user._id, receiverId, 50),
    // Load receiver profile
    User.findById(receiverId).select("username avatar _id").lean(),
  ]);

  // If the user doesn't exist, go back to main chat list
  if (!receiverInfo) {
    notFound();
  }

  const serializedReceiver = {
    _id: (receiverInfo as any)._id.toString(),
    username: (receiverInfo as any).username,
    avatar: (receiverInfo as any).avatar,
  };

  return (
    <SocketProvider currentUserId={session.user._id}>
      <div className="min-h-screen bg-[rgb(var(--color-bg))] transition-colors duration-500">
        {/* Container spacing:
            - pb-32: Ensures the chat input and messages don't get cut off by the Floating Dock.
            - max-w-5xl: Matches the width of the main chat list for visual consistency.
        */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-32">
          
          <ChatClient
            currentUserId={session.user._id}
            receiverId={receiverId}
            receiverInfo={serializedReceiver}
            initialMessages={JSON.parse(JSON.stringify(initialMessages))} // Ensure plain objects for client component
          />
          
        </div>
      </div>
    </SocketProvider>
  );
}