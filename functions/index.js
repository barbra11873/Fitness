const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// Scheduled function that runs every minute. Deploy with Firebase Functions (Blaze plan may be required).
exports.scheduledNotifications = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
  const now = new Date();
  console.log('scheduledNotifications running at', now.toISOString());

  // Query all schedules that are not dismissed. Using collectionGroup for all users.
  const schedulesSnap = await db.collectionGroup('schedules').where('dismissed', '!=', true).get();
  console.log('Found schedules:', schedulesSnap.size);

  const sendPromises = [];
  schedulesSnap.forEach(docSnap => {
    const data = docSnap.data();
    const time = data.time;
    if (!time) return;
    const scheduled = new Date(time);
    if (scheduled <= now) {
      const parentPath = docSnap.ref.parent.parent.path; // users/{uid}
      const userRef = db.doc(parentPath);
      sendPromises.push((async () => {
        try {
          const userDoc = await userRef.get();
          const userData = userDoc.data() || {};
          const tokens = userData.fcmTokens || [];
          if (tokens.length === 0) {
            console.log('No tokens for', parentPath);
          } else {
            const message = {
              notification: {
                title: `Time for: ${data.title}`,
                body: `It's ${scheduled.toLocaleTimeString()}. Get ready to workout!`,
              },
              tokens: tokens,
            };
            const res = await admin.messaging().sendMulticast(message);
            console.log('Sent multicast', res.successCount, 'successes');
          }

          // Handle recurrence: if none -> mark notified, if daily/weekly -> advance time
          const recurrence = data.recurrence || 'none';
          if (recurrence === 'none') {
            await docSnap.ref.update({ notified: true });
          } else {
            const next = new Date(scheduled);
            if (recurrence === 'daily') next.setDate(next.getDate() + 1);
            if (recurrence === 'weekly') next.setDate(next.getDate() + 7);
            await docSnap.ref.update({ time: next.toISOString(), notified: false });
          }
        } catch (err) {
          console.error('Error processing schedule doc', docSnap.id, err);
        }
      })());
    }
  });

  await Promise.all(sendPromises);
  console.log('scheduledNotifications finished');
  return null;
});
