import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, messaging } from '../../firebase';
import { collection, onSnapshot, doc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';

type ScheduleItem = {
  id: string;
  title: string;
  time: string; // ISO string
  notified?: boolean;
};

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    // register FCM token for this user (web push)
    (async () => {
      try {
        // TODO: replace VAPID_KEY with your Web Push certificate key from Firebase console
        const vapidKey = process.env.REACT_APP_VAPID_KEY || 'REPLACE_WITH_VAPID_KEY';
        const token = await getToken(messaging, { vapidKey });
        if (token) {
          // store token in user doc
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, { fcmTokens: arrayUnion(token) }, { merge: true } as any);
        }
      } catch (err) {
        console.warn('FCM token registration failed', err);
      }
    })();

    const colRef = collection(db, 'users', user.uid, 'schedules');
    const unsub = onSnapshot(colRef, (snapshot) => {
      const items: ScheduleItem[] = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setSchedules(items.sort((a,b) => new Date(a.time).getTime() - new Date(b.time).getTime()));
    });
    return () => unsub();
  }, [user]);

  // Check for due schedules and trigger browser notification (client fallback)
  useEffect(() => {
    if (!user) return;
    const checkDue = async () => {
      const now = new Date();
      for (const s of schedules) {
        try {
          const scheduledTime = new Date(s.time);
          // if dismissed skip
          if (s.dismissed) continue;
          if (!s.notified && scheduledTime <= now) {
            // show browser notification if possible
            if (typeof Notification !== 'undefined') {
              if (Notification.permission === 'default') {
                await Notification.requestPermission();
              }
              if (Notification.permission === 'granted') {
                new Notification(`Time for: ${s.title}`, { body: `It's ${scheduledTime.toLocaleTimeString()}. Get ready to workout!` });
              }
            }
            // mark as notified for single-run schedules
            const docRef = doc(db, 'users', user.uid, 'schedules', s.id);
            if (!s.recurrence || s.recurrence === 'none') {
              await updateDoc(docRef, { notified: true });
            } else {
              // for recurring schedules, advance time
              const next = new Date(scheduledTime);
              if (s.recurrence === 'daily') next.setDate(next.getDate() + 1);
              if (s.recurrence === 'weekly') next.setDate(next.getDate() + 7);
              await updateDoc(docRef, { time: next.toISOString(), notified: false });
            }
          }
        } catch (err) {
          console.error('Error handling schedule notification', err);
        }
      }
    };

    checkDue();
    const id = setInterval(checkDue, 30000);
    return () => clearInterval(id);
  }, [schedules, user]);

  const pendingCount = schedules.filter(s => !s.notified && new Date(s.time) <= new Date()).length;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        <button onClick={() => setOpen(o => !o)} className="p-2 rounded-full bg-orange-600 text-white shadow-lg">
          🔔
          {pendingCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2">{pendingCount}</span>
          )}
        </button>
        {open && (
          <div className="mt-2 w-80 bg-gray-800 text-white rounded-lg shadow-lg p-3">
            <h4 className="font-semibold mb-2">Notifications</h4>
            {schedules.length === 0 && <div className="text-sm text-gray-300">No scheduled activities</div>}
            <ul className="space-y-2 max-h-64 overflow-auto">
              {schedules.map(s => (
                <li key={s.id} className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-gray-300">{new Date(s.time).toLocaleString()}</div>
                    {s.notified && <div className="text-xs text-green-300">Notified</div>}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <button onClick={async () => {
                      // mark as unread (undo notify)
                      if (!user) return;
                      const docRef = doc(db, 'users', user.uid, 'schedules', s.id);
                      await updateDoc(docRef, { notified: false });
                    }} className="text-xs px-2 py-1 bg-orange-600 rounded">Mark Unread</button>
                    <button onClick={async () => {
                      // remove notification doc
                      if (!user) return;
                      const docRef = doc(db, 'users', user.uid, 'schedules', s.id);
                      await updateDoc(docRef, { dismissed: true });
                    }} className="text-xs px-2 py-1 bg-gray-700 rounded">Dismiss</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationBell;
