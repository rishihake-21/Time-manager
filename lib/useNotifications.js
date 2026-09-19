"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useNotifications(userId, settings) {
  const [permission, setPermission] = useState(Notification.permission);
  const [supported, setSupported] = useState("Notification" in window);

  useEffect(() => {
    if (supported) {
      setPermission(Notification.permission);
    }
  }, [supported]);

  const requestPermission = async () => {
    if (!supported) return false;
    const perm = await Notification.requestPermission();
    setPermission(perm);
    return perm === "granted";
  };

  const showNotification = (title, options = {}) => {
    if (permission !== "granted" || !supported) return;
    new Notification(title, {
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      ...options,
    });
  };

  // Check for upcoming events and show reminders
  useEffect(() => {
    if (!userId || !settings?.notification_enabled) return;
    
    const reminderMinutes = settings.default_reminder_minutes || 10;
    
    const checkReminders = async () => {
      try {
        const now = new Date();
        const reminderTime = new Date(now.getTime() + reminderMinutes * 60000);
        
        const { data: events } = await supabase
          .from("events")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "scheduled")
          .lte("start_datetime", reminderTime.toISOString())
          .gte("start_datetime", now.toISOString())
          .order("start_datetime", { ascending: true })
          .limit(10);
        
        if (events) {
          for (const event of events) {
            const eventStart = new Date(event.start_datetime);
            const diffMinutes = Math.round((eventStart - now) / 60000);
            
            if (diffMinutes <= reminderMinutes && diffMinutes >= 0) {
              // Check if we already showed a reminder for this event recently
              const lastReminder = localStorage.getItem(`reminder_${event.id}`);
              const lastReminderTime = lastReminder ? parseInt(lastReminder) : 0;
              
              if (Date.now() - lastReminderTime > 5 * 60 * 1000) { // 5 min cooldown
                showNotification(`${event.title} starts soon`, {
                  body: `${event.category} · ${eventStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                  tag: `event_${event.id}`,
                  data: { eventId: event.id },
                });
                localStorage.setItem(`reminder_${event.id}`, Date.now().toString());
              }
            }
          }
        }
      } catch (err) {
        console.error("Reminder check failed:", err);
      }
    };

    // Check immediately
    checkReminders();
    
    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [userId, settings?.notification_enabled, settings?.default_reminder_minutes]);

  return { permission, supported, requestPermission, showNotification };
}

// Service Worker registration with push notification support
export function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").then((registration) => {
      console.log("SW registered:", registration.scope);
      
      // Request push notification subscription
      if ("PushManager" in window) {
        registration.pushManager.getSubscription().then((subscription) => {
          if (!subscription) {
            // Optionally subscribe to push
            // This would require VAPID keys from the server
          }
        });
      }
    }).catch((err) => {
      console.log("SW registration failed:", err);
    });
  }
}