const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendDeadlineReminder(userEmail, userName, taskTitle, dueDate) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `⏰ Deadline Reminder: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">⏰ Deadline Reminder</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">TaskFlow - Your Personal Task Manager</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
            <p style="color: #666; line-height: 1.6;">
              This is a friendly reminder that your task <strong>"${taskTitle}"</strong> is due soon!
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0; font-size: 16px;">📅 Due Date:</h3>
              <p style="color: #667eea; font-size: 18px; font-weight: bold; margin: 5px 0;">
                ${new Date(dueDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block;
                        font-weight: bold;">
                View Task
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
              Stay organized and productive with TaskFlow! 🚀
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Deadline reminder sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending deadline reminder:', error);
      return false;
    }
  }

  async sendTaskCompleted(userEmail, userName, taskTitle) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `🎉 Task Completed: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🎉 Task Completed!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Great job staying productive!</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
            <p style="color: #666; line-height: 1.6;">
              Congratulations! You've successfully completed <strong>"${taskTitle}"</strong>. Keep up the great work! 🌟
            </p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #38ef7d;">
              <h3 style="color: #333; margin-top: 0; font-size: 16px;">✅ Achievement Unlocked!</h3>
              <p style="color: #11998e; font-weight: bold; margin: 5px 0;">
                Another task completed successfully!
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/dashboard" 
                 style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block;
                        font-weight: bold;">
                View All Tasks
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
              Keep crushing your goals with TaskFlow! 🚀
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Task completion email sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending task completion email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
