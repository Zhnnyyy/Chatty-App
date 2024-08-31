"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function AuthPage() {
  const router = useRouter();
  if (localStorage.getItem("USER_ID")) return router.push("/chat");
  const createUser = useMutation(api.user.createUser);
  const [regForm, setRegForm] = useState({
    username: "",
    email: "",
    password: "",
    avatar: "",
  });

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const checkUser = useQuery(api.user.checkUser, { email: regForm.email });
  const login_user = useQuery(api.user.loginUser, loginForm);
  const login_onChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const reg_onChange = (e) => {
    const { name, value } = e.target;
    setRegForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const loginUser = (e) => {
    e.preventDefault();
    if (
      regForm.email === "" ||
      regForm.password === "" ||
      regForm.username === ""
    ) {
      return alert("Please fill all fields");
    }
    if (login_user?.length > 0) {
      localStorage.setItem("USER_ID", login_user[0]._id);
      router.push("/chat");
    } else {
      alert("Incorrect Credentials");
    }
  };

  const registerUser = async (e) => {
    e.preventDefault();
    if (checkUser.length > 0) {
      return alert("Email already exists");
    }
    if (
      regForm.email === "" ||
      regForm.password === "" ||
      regForm.username === ""
    ) {
      return alert("Please fill all fields");
    }

    const result = await createUser(regForm);
    if (result) {
      alert("User has been created");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Login or create an account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form className="space-y-4" onSubmit={loginUser}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="m@example.com"
                    type="email"
                    autoCapitalize="none"
                    name="email"
                    onChange={login_onChange}
                    autoComplete="email"
                    autoCorrect="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    onChange={login_onChange}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form className="space-y-4" onSubmit={registerUser}>
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Name</Label>
                  <Input
                    id="signup-name"
                    placeholder="Username"
                    onChange={reg_onChange}
                    name="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    placeholder="m@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    name="email"
                    onChange={reg_onChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    onChange={reg_onChange}
                    name="password"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
