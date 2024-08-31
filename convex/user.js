import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createUser = mutation({
  args: {
    username: v.string(),
    email: v.string(),
    password: v.string(),
    avatar: v.string(),
  },
  handler: async (ctx, args) => {
    const newUser = await ctx.db.insert("Users", {
      username: args.username,
      email: args.email,
      password: args.password,
      avatar: "",
    });
    return newUser;
  },
});

export const checkUser = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("Users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    return user;
  },
});

export const loginUser = query({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const isValid = await ctx.db
      .query("Users")
      .filter((q) =>
        q.and(
          q.eq(q.field("email"), args.email),
          q.eq(q.field("password"), args.password)
        )
      )
      .collect();

    return isValid;
  },
});

export const allUser = query({
  handler: async (ctx, args) => {
    const users = await ctx.db.query("Users").collect();

    let arr = await Promise.all(
      users.map(async (user) => {
        let url = "";
        if (user.avatar !== "") {
          url = await ctx.storage.getUrl(user.avatar);
        }
        return { ...user, url: url };
      })
    );

    return arr;
  },
});

export const uploadURL = mutation({
  handler: async (ctx, args) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateProfile = mutation({
  args: {
    currentID: v.id("Users"),
    username: v.string(),
    email: v.string(),
    avatar: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const lastAvatar = await ctx.db
      .query("Users")
      .filter((q) => q.eq(q.field("_id"), args.currentID))
      .collect();

    async function deleteCurrentLink() {
      try {
        await ctx.storage.delete(lastAvatar[0].avatar);
        return true;
      } catch (error) {
        return false;
      }
    }

    async function updateNow() {
      try {
        await ctx.db.patch(args.currentID, {
          username: args.username,
          email: args.email,
          avatar: args.avatar,
        });
        return true;
      } catch (error) {
        return false;
      }
    }
    try {
      const result = await Promise.all([deleteCurrentLink(), updateNow()]);
      return result;
    } catch (error) {
      return error;
    }
  },
});

export const userInfo = query({
  args: {
    userID: v.id("Users"),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db
        .query("Users")
        .filter((q) => q.eq(q.field("_id"), args.userID))
        .collect();
      let url = "";
      if (user[0].avatar !== "") {
        url = await ctx.storage.getUrl(user[0].avatar);
      }

      return { ...user[0], url: url };
    } catch (error) {
      return { error: error.message };
    }
  },
});
