from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import logging

router = APIRouter()

# Email configuration (in production, use environment variables)
EMAIL_CONFIG = {
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587,
    "email": "your-email@gmail.com",
    "password": "your-app-password",  # Use app password for Gmail
    "sender_name": "Fair Hiring System"
}

# Mock data for demonstration
NOTIFICATIONS_DATA = {
    "email_templates": {
        "interview_reminder": {
            "subject": "Interview Reminder - {position} at {company}",
            "body": """
Dear {candidate_name},

This is a friendly reminder about your upcoming interview:

Position: {position}
Date: {interview_date}
Time: {interview_time}
Duration: {duration} minutes
Location: {location}
Interviewer: {interviewer_name}

Meeting Link: {meeting_link}

Please prepare the following:
- Updated resume
- Portfolio/work samples (if applicable)
- Questions about the role and company

If you need to reschedule, please contact us at least 24 hours in advance.

Best regards,
{company} Hiring Team
            """
        },
        "interview_confirmation": {
            "subject": "Interview Scheduled - {position} Position",
            "body": """
Dear {candidate_name},

Your interview has been successfully scheduled:

Position: {position}
Date: {interview_date}
Time: {interview_time}
Duration: {duration} minutes
Interviewer: {interviewer_name}

We look forward to meeting you!

Best regards,
{company} Hiring Team
            """
        },
        "status_update": {
            "subject": "Application Status Update - {position}",
            "body": """
Dear {candidate_name},

We wanted to update you on the status of your application for the {position} position.

Current Status: {status}
Next Steps: {next_steps}

{additional_message}

Thank you for your interest in joining our team.

Best regards,
{company} Hiring Team
            """
        },
        "interviewer_reminder": {
            "subject": "Interview Reminder - {candidate_name} for {position}",
            "body": """
Dear {interviewer_name},

You have an upcoming interview scheduled:

Candidate: {candidate_name}
Position: {position}
Date: {interview_date}
Time: {interview_time}
Duration: {duration} minutes
Location: {location}

Candidate Profile: {candidate_profile_link}
Interview Questions: {questions_link}

Please review the candidate's profile before the interview.

Best regards,
HR Team
            """
        }
    },
    "notification_history": [
        {
            "id": 1,
            "type": "interview_reminder",
            "recipient": "john.doe@email.com",
            "candidate_name": "John Doe",
            "subject": "Interview Reminder - Software Engineer",
            "sent_at": "2024-01-15T09:00:00",
            "status": "sent",
            "template_used": "interview_reminder"
        },
        {
            "id": 2,
            "type": "status_update",
            "recipient": "jane.smith@email.com",
            "candidate_name": "Jane Smith",
            "subject": "Application Status Update - Data Scientist",
            "sent_at": "2024-01-14T14:30:00",
            "status": "sent",
            "template_used": "status_update"
        }
    ],
    "scheduled_notifications": [
        {
            "id": 1,
            "type": "interview_reminder",
            "recipient": "alex.jones@email.com",
            "candidate_name": "Alex Jones",
            "scheduled_for": "2024-01-16T08:00:00",
            "interview_date": "2024-01-16T10:00:00",
            "status": "pending",
            "template_data": {
                "position": "Frontend Developer",
                "interviewer_name": "Sarah Wilson",
                "location": "Conference Room A",
                "duration": 60
            }
        }
    ]
}

class EmailService:
    @staticmethod
    def send_email(to_email: str, subject: str, body: str, attachments: List[str] = None) -> bool:
        """Send email using SMTP"""
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = f"{EMAIL_CONFIG['sender_name']} <{EMAIL_CONFIG['email']}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add body
            msg.attach(MIMEText(body, 'plain'))
            
            # Add attachments if any
            if attachments:
                for file_path in attachments:
                    try:
                        with open(file_path, "rb") as attachment:
                            part = MIMEBase('application', 'octet-stream')
                            part.set_payload(attachment.read())
                            encoders.encode_base64(part)
                            part.add_header(
                                'Content-Disposition',
                                f'attachment; filename= {file_path.split("/")[-1]}',
                            )
                            msg.attach(part)
                    except Exception as e:
                        logging.warning(f"Failed to attach file {file_path}: {e}")
            
            # Connect to server and send email
            server = smtplib.SMTP(EMAIL_CONFIG['smtp_server'], EMAIL_CONFIG['smtp_port'])
            server.starttls()
            server.login(EMAIL_CONFIG['email'], EMAIL_CONFIG['password'])
            text = msg.as_string()
            server.sendmail(EMAIL_CONFIG['email'], to_email, text)
            server.quit()
            
            return True
        except Exception as e:
            logging.error(f"Failed to send email: {e}")
            return False

@router.get("/templates")
async def get_email_templates():
    """Get all available email templates"""
    return {
        "success": True,
        "templates": NOTIFICATIONS_DATA["email_templates"]
    }

@router.post("/send")
async def send_notification(
    background_tasks: BackgroundTasks,
    notification_data: Dict[str, Any]
):
    """Send immediate email notification"""
    try:
        template_name = notification_data.get("template")
        recipient = notification_data.get("recipient")
        template_data = notification_data.get("data", {})
        
        if not template_name or not recipient:
            raise HTTPException(status_code=400, detail="Template and recipient are required")
        
        template = NOTIFICATIONS_DATA["email_templates"].get(template_name)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        # Format template with data
        subject = template["subject"].format(**template_data)
        body = template["body"].format(**template_data)
        
        # Add to background task for async sending
        background_tasks.add_task(
            EmailService.send_email,
            recipient,
            subject,
            body,
            notification_data.get("attachments", [])
        )
        
        # Log notification
        notification_record = {
            "id": len(NOTIFICATIONS_DATA["notification_history"]) + 1,
            "type": template_name,
            "recipient": recipient,
            "candidate_name": template_data.get("candidate_name", ""),
            "subject": subject,
            "sent_at": datetime.now().isoformat(),
            "status": "sent",
            "template_used": template_name
        }
        NOTIFICATIONS_DATA["notification_history"].append(notification_record)
        
        return {
            "success": True,
            "message": "Notification sent successfully",
            "notification_id": notification_record["id"]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send notification: {str(e)}")

@router.post("/schedule")
async def schedule_notification(notification_data: Dict[str, Any]):
    """Schedule a notification to be sent later"""
    try:
        template_name = notification_data.get("template")
        recipient = notification_data.get("recipient")
        scheduled_for = notification_data.get("scheduled_for")
        template_data = notification_data.get("data", {})
        
        if not all([template_name, recipient, scheduled_for]):
            raise HTTPException(
                status_code=400, 
                detail="Template, recipient, and scheduled_for are required"
            )
        
        scheduled_notification = {
            "id": len(NOTIFICATIONS_DATA["scheduled_notifications"]) + 1,
            "type": template_name,
            "recipient": recipient,
            "candidate_name": template_data.get("candidate_name", ""),
            "scheduled_for": scheduled_for,
            "status": "pending",
            "template_data": template_data,
            "created_at": datetime.now().isoformat()
        }
        
        NOTIFICATIONS_DATA["scheduled_notifications"].append(scheduled_notification)
        
        return {
            "success": True,
            "message": "Notification scheduled successfully",
            "scheduled_id": scheduled_notification["id"]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to schedule notification: {str(e)}")

@router.get("/history")
async def get_notification_history(limit: int = 50, offset: int = 0):
    """Get notification history"""
    history = NOTIFICATIONS_DATA["notification_history"]
    total = len(history)
    
    # Apply pagination
    paginated_history = history[offset:offset + limit]
    
    return {
        "success": True,
        "history": paginated_history,
        "total": total,
        "limit": limit,
        "offset": offset
    }

@router.get("/scheduled")
async def get_scheduled_notifications():
    """Get all scheduled notifications"""
    return {
        "success": True,
        "scheduled_notifications": NOTIFICATIONS_DATA["scheduled_notifications"]
    }

@router.put("/scheduled/{notification_id}")
async def update_scheduled_notification(notification_id: int, update_data: Dict[str, Any]):
    """Update a scheduled notification"""
    try:
        # Find the notification
        notification = None
        for notif in NOTIFICATIONS_DATA["scheduled_notifications"]:
            if notif["id"] == notification_id:
                notification = notif
                break
        
        if not notification:
            raise HTTPException(status_code=404, detail="Scheduled notification not found")
        
        # Update fields
        for key, value in update_data.items():
            if key in notification:
                notification[key] = value
        
        notification["updated_at"] = datetime.now().isoformat()
        
        return {
            "success": True,
            "message": "Scheduled notification updated successfully",
            "notification": notification
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update notification: {str(e)}")

@router.delete("/scheduled/{notification_id}")
async def cancel_scheduled_notification(notification_id: int):
    """Cancel a scheduled notification"""
    try:
        # Find and remove the notification
        for i, notif in enumerate(NOTIFICATIONS_DATA["scheduled_notifications"]):
            if notif["id"] == notification_id:
                del NOTIFICATIONS_DATA["scheduled_notifications"][i]
                return {
                    "success": True,
                    "message": "Scheduled notification cancelled successfully"
                }
        
        raise HTTPException(status_code=404, detail="Scheduled notification not found")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cancel notification: {str(e)}")

@router.get("/settings")
async def get_notification_settings():
    """Get notification settings"""
    return {
        "success": True,
        "settings": {
            "email_enabled": True,
            "reminder_hours_before": [24, 2, 0.5],  # 24h, 2h, 30min before
            "auto_reminders": True,
            "interviewer_notifications": True,
            "candidate_notifications": True,
            "status_update_notifications": True,
            "daily_digest": True,
            "weekly_report": True
        }
    }

@router.put("/settings")
async def update_notification_settings(settings: Dict[str, Any]):
    """Update notification settings"""
    return {
        "success": True,
        "message": "Notification settings updated successfully",
        "settings": settings
    }

@router.post("/test")
async def send_test_notification(email: str):
    """Send a test notification to verify email configuration"""
    try:
        subject = "Test Notification - Fair Hiring System"
        body = """
This is a test notification from the Fair Hiring System.

If you received this email, your notification system is working correctly.

Best regards,
Fair Hiring System
        """
        
        success = EmailService.send_email(email, subject, body)
        
        if success:
            return {
                "success": True,
                "message": "Test notification sent successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to send test notification")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send test notification: {str(e)}")

@router.post("/bulk-send")
async def send_bulk_notifications(
    background_tasks: BackgroundTasks,
    bulk_data: Dict[str, Any]
):
    """Send notifications to multiple recipients"""
    try:
        template_name = bulk_data.get("template")
        recipients = bulk_data.get("recipients", [])
        template_data = bulk_data.get("data", {})
        
        if not template_name or not recipients:
            raise HTTPException(status_code=400, detail="Template and recipients are required")
        
        template = NOTIFICATIONS_DATA["email_templates"].get(template_name)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        sent_count = 0
        failed_count = 0
        
        for recipient_data in recipients:
            try:
                recipient_email = recipient_data.get("email")
                recipient_template_data = {**template_data, **recipient_data.get("data", {})}
                
                # Format template with data
                subject = template["subject"].format(**recipient_template_data)
                body = template["body"].format(**recipient_template_data)
                
                # Add to background task
                background_tasks.add_task(
                    EmailService.send_email,
                    recipient_email,
                    subject,
                    body
                )
                
                # Log notification
                notification_record = {
                    "id": len(NOTIFICATIONS_DATA["notification_history"]) + 1,
                    "type": template_name,
                    "recipient": recipient_email,
                    "candidate_name": recipient_template_data.get("candidate_name", ""),
                    "subject": subject,
                    "sent_at": datetime.now().isoformat(),
                    "status": "sent",
                    "template_used": template_name
                }
                NOTIFICATIONS_DATA["notification_history"].append(notification_record)
                sent_count += 1
                
            except Exception as e:
                logging.error(f"Failed to send notification to {recipient_data.get('email', 'unknown')}: {e}")
                failed_count += 1
        
        return {
            "success": True,
            "message": f"Bulk notifications processed: {sent_count} sent, {failed_count} failed",
            "sent_count": sent_count,
            "failed_count": failed_count
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send bulk notifications: {str(e)}")
