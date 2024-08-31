"use client";
import { useState, useRef, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Camera } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [USERID, setUSERID] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [tempImage, settempImage] = useState(
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
  );
  const [profileImage, setProfileImage] = useState(null);
  const profileInformation = useQuery(api.user.userInfo, {
    userID: USERID,
  });

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
  const [frmdata, setFormData] = useState({
    email: "",
    username: "",
  });
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setProfileImage(file);
    settempImage(URL.createObjectURL(file));

    console.log(URL.createObjectURL(file));
  };

  const InputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...frmdata, [name]: value });
  };

  const getPostUrl = useMutation(api.user.uploadURL);
  const updateProfile = useMutation(api.user.updateProfile);
  const handleSave = async () => {
    const postURL = await getPostUrl();
    const result = await fetch(postURL, {
      method: "POST",
      headers: { "Content-Type": profileImage.type },
      body: profileImage,
    });
    const { storageId } = await result.json();
    let newObj = {
      ...frmdata,
      avatar: storageId,
      currentID: USERID,
    };
    const update = await updateProfile(newObj);
    if (update) {
      alert("Profile has been updated");
      setIsEditing(false);
    }
  };

  useEffect(() => {
    setFormData({
      email: profileInformation?.email,
      username: profileInformation?.username,
    });
  }, [profileInformation]);
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Profile</CardTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Manage your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={
                    profileInformation?.url !== ""
                      ? tempImage.match("pixabay")
                        ? profileInformation?.url
                        : tempImage
                      : tempImage.match("pixabay")
                        ? tempImage
                        : tempImage
                  }
                />

                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 right-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
              <Input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
            <h2 className="text-2xl font-bold">
              {profileInformation?.username}
            </h2>
            <p className="text-gray-500">{profileInformation?.email}</p>
          </div>
          <form className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                // defaultValue="john@example.com"
                readOnly={!isEditing}
                className={isEditing ? "" : "bg-gray-100"}
                name="email"
                value={frmdata.email}
                onChange={InputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={frmdata.username}
                // defaultValue="johndoe"
                readOnly={!isEditing}
                className={isEditing ? "" : "bg-gray-100"}
                onChange={InputChange}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" disabled={!isEditing} onClick={handleSave}>
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
