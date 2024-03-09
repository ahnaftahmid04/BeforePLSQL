const router=require('express').Router();
const moment=require('moment');
const pool=require('../db.js');
const authorize=require('../middleware/authorization.js');

// Event Notification
router.post('/eventNotifications', authorize, async (req, res) => {
    const userId = req.userId;

    try {
        // Call the stored procedure to check for event notifications
        await pool.query('CALL check_event_notification($1)', [userId]);

        res.status(200).json({ message: 'Event notifications checked successfully!' });
    } catch (error) {
        console.error('Error checking event notifications:', error);
        res.status(500).send('Server error');
    }
});

// Get Notifications
router.get('/', authorize, async (req, res) => {
    try {
        const userId = req.userId;
        const query = 'SELECT * FROM notification WHERE user_id=$1 ORDER BY created_at DESC LIMIT 30';
        const result = await pool.query(query, [userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).send('Error fetching notifications');
    }
});

// Update Notification seen_status
router.put('/',authorize, async (req, res) => {
    const userId=req.userId;
    try {
        
        const query = 'UPDATE notification SET seen_status = true WHERE seen_status = false AND user_id=$1';
        await pool.query(query, [userId]);
        res.status(200).send('Notification seen_status updated successfully');
    } catch (error) {
        console.error('Error updating notification seen_status:', error);
        res.status(500).send('Error updating notification seen_status');
    }
});

// Get Notifications
router.get('/unseen/', authorize, async (req, res) => {
    try {
        const userId = req.userId;
        const query = 'SELECT * FROM notification WHERE user_id=$1 AND seen_status = false ORDER BY created_at DESC LIMIT 30';
        const result = await pool.query(query, [userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).send('Error fetching notifications');
    }
});

module.exports = router;