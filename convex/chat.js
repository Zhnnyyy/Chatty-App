import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const newChat = query({
  args: {
    currentUser: v.id("Users"),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("Users")
      .filter((q) => q.neq(q.field("_id"), args.currentUser))
      .collect();
    return users;
  },
});

export const createChat = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const chatID = await ctx.db.insert("Chat", { name: args.name });
    return chatID;
  },
});

export const creatUserChat = mutation({
  args: {
    chatID: v.id("Chat"),
    userIDs: v.id("Users"),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("UserChat", {
      chat_id: args.chatID,
      user_id: args.userIDs,
    });
  },
});

export const allChat = query({
  handler: async (ctx, args) => {
    const chat = ctx.db.query("Chat").collect();
    return chat;
  },
});
export const allUserChat = query({
  handler: async (ctx, args) => {
    const user = ctx.db.query("UserChat").collect();
    return user;
  },
});

export const loadChatted = query({
  args: {
    user_id: v.id("Users"),
  },
  handler: async (ctx, args) => {
    const userChat = await ctx.db
      .query("UserChat")
      .filter((q) => q.eq(q.field("user_id"), args.user_id))
      .collect();
    const userChats = await ctx.db
      .query("UserChat")
      .filter((q) => q.neq(q.field("user_id"), args.user_id))
      .collect();

    const userChatID = userChat.map((chat) => chat.chat_id);
    let arr = [];
    for (const item of userChatID) {
      for (const item2 of userChats) {
        if (item === item2.chat_id) {
          arr.push(item2.user_id);
        }
      }
    }
    let user_arr = [];
    const user = await ctx.db.query("Users").collect();
    if (user) {
      for (const item of user) {
        for (const item2 of arr) {
          if (item._id === item2) {
            user_arr.push(item);
          }
        }
      }
    }
    let new_arr = await Promise.all(
      user_arr.map(async (item) => {
        let url = "";
        if (item.avatar !== "") {
          url = await ctx.storage.getUrl(item.avatar);
        }
        return { ...item, url: url };
      })
    );

    return new_arr;
  },
});

export const sendMessage = mutation({
  args: {
    chat_id: v.id("Chat"),
    user_id: v.id("Users"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.insert("Message", {
      chat_id: args.chat_id,
      user_id: args.user_id,
      message: args.message,
    });
    return message;
  },
});

export const loadMessage = query({
  args: {
    chat_id: v.string(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("Message")
      .filter((q) => q.eq(q.field("chat_id"), args.chat_id))
      .collect();
    return messages;
  },
});

export const deleteChat = mutation({
  args: {
    chat_id: v.id("Chat"),
  },
  handler: async (ctx, args) => {
    async function deleteChats() {
      try {
        await ctx.db.delete(args.chat_id);
        return true;
      } catch (error) {
        return false;
      }
    }
    async function deleteUserChat() {
      try {
        const userChat = await ctx.db
          .query("UserChat")
          .filter((q) => q.eq(q.field("chat_id"), args.chat_id))
          .collect();
        for (const chats of userChat) {
          await ctx.db.delete(chats._id);
        }
        return true;
      } catch (error) {
        return false;
      }
    }
    async function deleteMessage() {
      try {
        const message = await ctx.db
          .query("Message")
          .filter((q) => q.eq(q.field("chat_id"), args.chat_id))
          .collect();
        for (const messages of message) {
          await ctx.db.delete(messages._id);
        }
        return true;
      } catch (error) {
        return false;
      }
    }

    try {
      const result = await Promise.all([
        deleteUserChat(),
        deleteMessage(),
        deleteChats(),
      ]);
      return result;
    } catch (error) {
      throw error;
    }
  },
});
