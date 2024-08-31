"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  SendHorizontal,
  User,
  Plus,
  Trash2,
  LogOutIcon,
  Menu,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const router = useRouter();
  const [USERID, setUSERID] = useState();

  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [haveChat, setHaveChat] = useState(false);
  const [convo, setConvo] = useState({});
  const [searchChatted, setSearchChatted] = useState("");
  const [activeChatID, setActiveChatID] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // useEffect(() => {
  //   if (!USERID) {
  //     router.push("/");
  //   }
  // }, [USERID]);

  useEffect(() => {
    if (window.localStorage.getItem("USER_ID")) {
      setUSERID(window.localStorage.getItem("USER_ID"));
    }
  }, []);
  const newChat = useQuery(api.chat.newChat, {
    currentUser: USERID,
  });
  const newChatID = useMutation(api.chat.createChat);
  const deleteChat = useMutation(api.chat.deleteChat);
  const newUserChat = useMutation(api.chat.creatUserChat);
  const fetchChat = useQuery(api.chat.allChat);
  const fetchUserChat = useQuery(api.chat.allUserChat);
  const fetchUsers = useQuery(api.user.allUser);
  const loadChatted = useQuery(api.chat.loadChatted, {
    user_id: USERID || "",
  });

  const handleDeleteChat = (id) => {
    setConversations(conversations.filter((conv) => conv.id !== id));
  };

  const filteredUser = newChat?.filter((user) => {
    return user.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredChatted = loadChatted?.filter((user) => {
    return user.username.toLowerCase().includes(searchChatted.toLowerCase());
  });

  const ChatSelected = async (e) => {
    setActiveChatID("");
    setIsSidebarOpen(false);
    const arr = [USERID, e];
    let haveChat = false;
    let chattyID;
    for (const item of fetchChat) {
      const chatID = item._id;
      const filteredUserChat = fetchUserChat.filter((item) => {
        return item.chat_id.includes(chatID);
      });
      chattyID = filteredUserChat[0].chat_id;
      if (filteredUserChat.length == 2) {
        if (
          filteredUserChat[0].user_id == arr[0] &&
          filteredUserChat[1].user_id == arr[1]
        ) {
          haveChat = true;
          break;
        }
        if (
          filteredUserChat[0].user_id == arr[1] &&
          filteredUserChat[1].user_id == arr[0]
        ) {
          haveChat = true;
          break;
        }
      }
    }
    if (!haveChat) {
      const chat_ID = await newChatID({ name: "" });
      setActiveChatID(chat_ID);
      arr.forEach(async (element) => {
        await newUserChat({ chatID: chat_ID, userIDs: element });
      });
      const filteredUser = fetchUsers.filter((item) => {
        return item._id == e;
      });
      setConvo(filteredUser);
      setHaveChat(true);
      return;
    }
    const filteredUser = fetchUsers.filter((item) => {
      return item._id == e;
    });
    setActiveChatID(chattyID);
    setConvo(filteredUser);
    setHaveChat(true);
  };

  const deleteUser = async (e) => {
    const arr = [USERID, e];
    let chattyID;
    for (const item of fetchChat) {
      const chatID = item._id;
      const filteredUserChat = fetchUserChat.filter((item) => {
        return item.chat_id.includes(chatID);
      });
      chattyID = filteredUserChat[0].chat_id;
      if (filteredUserChat.length == 2) {
        if (
          filteredUserChat[0].user_id == arr[0] &&
          filteredUserChat[1].user_id == arr[1]
        ) {
          break;
        }
        if (
          filteredUserChat[0].user_id == arr[1] &&
          filteredUserChat[1].user_id == arr[0]
        ) {
          break;
        }
      }
    }
    await deleteChat({ chat_id: chattyID });
    setHaveChat(false);
    setActiveChatID("");
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="w-full p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold app-title">{`Chats`}</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" onClick={(e) => {}}>
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <ScrollArea className="h-[300px] mt-4">
                  {filteredUser?.map((item, index) => (
                    <NewChat
                      object={item}
                      index={index}
                      key={index}
                      handleClick={ChatSelected}
                      onClose={setIsNewMessageOpen}
                    />
                  ))}
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              window.localStorage.removeItem("USER_ID");
              setTimeout(() => {
                router.push("/");
              }, 1000);
            }}
          >
            <LogOutIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`absolute inset-y-0 left-0 w-64 bg-white border-r transform lg:relative lg:transform-none transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } z-40`}
        >
          <div className="p-4 border-b">
            <Input
              placeholder="Search conversations..."
              onChange={(e) => setSearchChatted(e.target.value)}
            />
          </div>
          <ScrollArea className="flex-grow">
            {filteredChatted?.map((item, index) => (
              <Chatted
                key={index}
                object={item}
                index={index}
                handleClick={ChatSelected}
                doDelete={deleteUser}
              />
            ))}
          </ScrollArea>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {!haveChat || !activeChatID ? (
            <div
              className="flex justify-center items-center h-full"
              onClick={(e) => setIsSidebarOpen(false)}
            >
              <h1>SELECT USER TO START CHATTING</h1>
            </div>
          ) : (
            <Conversation
              object={convo}
              chatID={activeChatID}
              sidebarClose={setIsSidebarOpen}
            />
          )}
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 lg:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  );
}

const Chatted = (props) => {
  return (
    <div
      className="flex items-center p-4 hover:bg-gray-100 cursor-pointer group"
      onClick={(e) => {
        props.handleClick(props.object._id);
      }}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={
            props.object.url == ""
              ? "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
              : props.object.url
          }
        />
        <AvatarFallback>{props.object.username.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="ml-4 flex-grow">
        <p className="text-sm font-medium">{props.object.username}</p>
        {/* <p className="text-xs text-gray-500">{"conversation.lastMessage"}</p> */}
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your chat with {"conversation.name"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => props.doDelete(props.object._id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const Conversation = (props) => {
  const [message, setMessage] = useState("");
  const sendMessage = useMutation(api.chat.sendMessage);
  const loadMessage = useQuery(api.chat.loadMessage, {
    chat_id: props.chatID,
  });
  const scrollArea = useRef(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    await sendMessage({
      chat_id: props.chatID,
      user_id: localStorage.getItem("USER_ID"),
      message: message,
    });
    setMessage("");
  };
  useEffect(() => {
    if (scrollArea.current) {
      scrollArea.current.scrollTop = scrollArea.current.scrollHeight;
    }
  }, [loadMessage]);
  return (
    <div className="flex-1 flex flex-col">
      {/* Chat header */}
      <div className="p-4 border-b flex items-center">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={
              props.object[0].url == ""
                ? "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                : props.object[0].url
            }
          />

          <AvatarFallback>{props.object[0].username.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="ml-4 font-medium">{props.object[0]?.username}</span>
      </div>

      {/* Messages */}
      {/* <ScrollArea className="flex-1 p-4" ref={scrollAreaEl}> */}
      {/* Sample messages */}
      <div
        className="space-y-4  overflow-auto p-4 flex-1"
        ref={scrollArea}
        onClick={(e) => props.sidebarClose(false)}
      >
        {loadMessage?.map((item, index) => {
          if (item.user_id == localStorage.getItem("USER_ID")) {
            return (
              <div className="flex justify-end" key={index}>
                <div className="bg-primary text-primary-foreground rounded-lg p-2 max-w-xs">
                  {item.message}
                </div>
              </div>
            );
          } else {
            return (
              <div className="flex justify-start" key={index}>
                <div className="bg-muted rounded-lg p-2 max-w-xs">
                  {item.message}
                </div>
              </div>
            );
          }
        })}

        {/* <div className="flex justify-end">
            <div className="bg-primary text-primary-foreground rounded-lg p-2 max-w-xs">
              Hey, how are you?
            </div>
          </div>

          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-2 max-w-xs">
              I'm good, thanks! How about you?
            </div>
          </div> */}
      </div>
      {/* </ScrollArea> */}

      {/* Message input */}
      <div className="p-4 border-t">
        <form className="flex items-center" onSubmit={handleSendMessage}>
          <Input
            className="flex-1"
            placeholder="Type a message..."
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            value={message}
          />
          <Button
            type="submit"
            size="icon"
            className="ml-2"
            disabled={message.length == 0 ? true : false}
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

const NewChat = (props) => {
  return (
    <div
      className="flex items-center p-4 hover:bg-gray-100 cursor-pointer group"
      onClick={(e) => {
        props.handleClick(props.object._id);
        props.onClose(false);
      }}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={
            props.object?.url == ""
              ? "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
              : props.object?.url
          }
        />
        <AvatarFallback>{props.object.username.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="ml-4 flex-grow">
        <p className="text-sm font-medium">{props.object.username}</p>
        {/* <p className="text-xs text-gray-500">{"item"}</p> */}
      </div>
    </div>
  );
};
