
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

const SETTINGS_STORAGE_KEY = 'dailyflow-settings';

interface AppSettings {
  defaultTaskDuration: string; // in hours
  enableNotifications: boolean;
  userName: string;
  userEmail: string;
  profilePictureUrl: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings>({
    defaultTaskDuration: "1",
    enableNotifications: false,
    userName: "",
    userEmail: "",
    profilePictureUrl: "",
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error("Error reading settings from local storage:", error);
      }
      setIsInitialized(true);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setSettings(prev => ({ ...prev, enableNotifications: checked }));
  };

  const handleSaveSettings = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        toast({
          title: "Settings Saved",
          description: "Your preferences have been updated.",
        });
      } catch (error) {
        console.error("Error saving settings to local storage:", error);
        toast({
          title: "Save Failed",
          description: "Could not save settings.",
          variant: "destructive",
        });
      }
    }
  };
  
  if (!isInitialized) {
    return (
      <>
        <Header />
        <main className="container mx-auto max-w-3xl px-4 py-8">
          <h2 className="text-2xl font-semibold mb-6 font-headline">Settings</h2>
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
            </CardContent>
          </Card>
           <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2 flex-1">
                   <Skeleton className="h-4 w-32" />
                   <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-24" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6 font-headline">Settings</h2>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your personal information. Actual authentication is not yet implemented.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={settings.profilePictureUrl} alt={settings.userName || "User"} data-ai-hint="abstract geometric" />
                <AvatarFallback>
                  {settings.userName ? settings.userName.substring(0, 2).toUpperCase() : <User className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Label htmlFor="profilePictureUrl">Profile Picture URL</Label>
                <Input
                  id="profilePictureUrl"
                  name="profilePictureUrl"
                  type="url"
                  value={settings.profilePictureUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/avatar.png"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="userName">Name</Label>
              <Input
                id="userName"
                name="userName"
                type="text"
                value={settings.userName}
                onChange={handleInputChange}
                placeholder="Your Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                name="userEmail"
                type="email"
                value={settings.userEmail}
                onChange={handleInputChange}
                placeholder="your@email.com"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Task Preferences</CardTitle>
            <CardDescription>Manage default settings for new tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultTaskDuration">Default Task Duration (hours)</Label>
              <Input
                id="defaultTaskDuration"
                name="defaultTaskDuration"
                type="number"
                value={settings.defaultTaskDuration}
                onChange={handleInputChange}
                placeholder="e.g., 1.5"
                min="0.1"
                step="0.1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="enableNotifications"
                checked={settings.enableNotifications}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="enableNotifications">Enable Browser Notifications</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              (Actual notification functionality would require browser permissions and further implementation.)
            </p>
          </CardContent>
        </Card>
        
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </div>
      </main>
    </>
  );
}

