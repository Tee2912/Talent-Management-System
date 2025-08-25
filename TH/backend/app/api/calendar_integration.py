from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import uuid

router = APIRouter()

# Mock data for calendar integration
CALENDAR_DATA = {
    "calendar_providers": [
        {
            "id": "google",
            "name": "Google Calendar",
            "enabled": True,
            "auth_url": "https://accounts.google.com/oauth2/auth",
            "scopes": ["https://www.googleapis.com/auth/calendar"]
        },
        {
            "id": "outlook",
            "name": "Microsoft Outlook",
            "enabled": True,
            "auth_url": "https://login.microsoftonline.com/oauth2/v2.0/authorize",
            "scopes": ["https://graph.microsoft.com/calendars.readwrite"]
        },
        {
            "id": "apple",
            "name": "Apple Calendar (iCloud)",
            "enabled": False,
            "auth_url": "https://appleid.apple.com/auth/authorize",
            "scopes": ["calendar"]
        }
    ],
    "connected_calendars": [
        {
            "id": 1,
            "user_id": 5,
            "user_name": "Sarah Wilson",
            "provider": "google",
            "calendar_id": "sarah.wilson@company.com",
            "calendar_name": "Sarah's Work Calendar",
            "connected_at": "2024-01-10T09:00:00",
            "last_sync": "2024-01-22T14:30:00",
            "sync_status": "active",
            "permissions": ["read", "write"],
            "default_calendar": True
        },
        {
            "id": 2,
            "user_id": 3,
            "user_name": "Mike Johnson",
            "provider": "outlook",
            "calendar_id": "mike.johnson@company.com",
            "calendar_name": "Mike's Calendar",
            "connected_at": "2024-01-12T11:15:00",
            "last_sync": "2024-01-22T14:25:00",
            "sync_status": "active",
            "permissions": ["read", "write"],
            "default_calendar": True
        }
    ],
    "calendar_events": [
        {
            "id": "cal_event_1",
            "interview_id": 101,
            "calendar_id": "sarah.wilson@company.com",
            "event_id": "google_event_123456",
            "title": "Interview: John Doe - Software Engineer",
            "description": "Technical interview for Software Engineer position\n\nCandidate: John Doe\nPosition: Software Engineer\nInterviewer: Sarah Wilson\n\nInterview Questions: https://company.com/interview/101/questions\nCandidate Profile: https://company.com/candidate/1",
            "start_time": "2024-01-25T10:00:00",
            "end_time": "2024-01-25T11:00:00",
            "timezone": "America/New_York",
            "location": "Conference Room A",
            "meeting_link": "https://meet.google.com/abc-defg-hij",
            "attendees": [
                {
                    "email": "sarah.wilson@company.com",
                    "name": "Sarah Wilson",
                    "role": "interviewer",
                    "response_status": "accepted"
                },
                {
                    "email": "john.doe@email.com",
                    "name": "John Doe",
                    "role": "candidate",
                    "response_status": "pending"
                }
            ],
            "reminders": [
                {"method": "email", "minutes": 60},
                {"method": "popup", "minutes": 15}
            ],
            "status": "confirmed",
            "created_at": "2024-01-20T15:30:00",
            "updated_at": "2024-01-22T09:15:00"
        },
        {
            "id": "cal_event_2",
            "interview_id": 102,
            "calendar_id": "mike.johnson@company.com",
            "event_id": "outlook_event_789012",
            "title": "Interview: Jane Smith - Data Scientist",
            "description": "Behavioral interview for Data Scientist position",
            "start_time": "2024-01-26T14:00:00",
            "end_time": "2024-01-26T15:00:00",
            "timezone": "America/New_York",
            "location": "Virtual Meeting",
            "meeting_link": "https://teams.microsoft.com/l/meetup-join/xyz",
            "attendees": [
                {
                    "email": "mike.johnson@company.com",
                    "name": "Mike Johnson",
                    "role": "interviewer",
                    "response_status": "accepted"
                },
                {
                    "email": "jane.smith@email.com",
                    "name": "Jane Smith",
                    "role": "candidate",
                    "response_status": "accepted"
                }
            ],
            "reminders": [
                {"method": "email", "minutes": 120},
                {"method": "popup", "minutes": 30}
            ],
            "status": "confirmed",
            "created_at": "2024-01-21T10:45:00",
            "updated_at": "2024-01-22T11:30:00"
        }
    ],
    "availability": {
        "sarah.wilson@company.com": [
            {
                "date": "2024-01-25",
                "time_slots": [
                    {"start": "09:00", "end": "10:00", "available": True},
                    {"start": "10:00", "end": "11:00", "available": False, "reason": "Interview scheduled"},
                    {"start": "11:00", "end": "12:00", "available": True},
                    {"start": "14:00", "end": "15:00", "available": True},
                    {"start": "15:00", "end": "16:00", "available": False, "reason": "Team meeting"}
                ]
            }
        ]
    },
    "calendar_settings": {
        "default_interview_duration": 60,
        "buffer_time_minutes": 15,
        "working_hours": {
            "start": "09:00",
            "end": "17:00"
        },
        "working_days": [1, 2, 3, 4, 5],  # Monday to Friday
        "time_zone": "America/New_York",
        "auto_accept_meetings": False,
        "send_reminders": True,
        "reminder_times": [60, 15],  # minutes before
        "include_interview_details": True,
        "meeting_link_provider": "google_meet"
    }
}

class CalendarService:
    @staticmethod
    def generate_meeting_link(provider: str = "google_meet") -> str:
        """Generate a meeting link based on provider"""
        if provider == "google_meet":
            return f"https://meet.google.com/{uuid.uuid4().hex[:12]}"
        elif provider == "teams":
            return f"https://teams.microsoft.com/l/meetup-join/{uuid.uuid4().hex}"
        elif provider == "zoom":
            return f"https://zoom.us/j/{uuid.uuid4().hex[:10]}"
        else:
            return ""

@router.get("/providers")
async def get_calendar_providers():
    """Get available calendar providers"""
    return {
        "success": True,
        "providers": CALENDAR_DATA["calendar_providers"]
    }

@router.get("/connected")
async def get_connected_calendars(user_id: Optional[int] = None):
    """Get connected calendars, optionally filtered by user"""
    calendars = CALENDAR_DATA["connected_calendars"]
    
    if user_id:
        calendars = [cal for cal in calendars if cal["user_id"] == user_id]
    
    return {
        "success": True,
        "calendars": calendars
    }

@router.post("/connect")
async def connect_calendar(connection_data: Dict[str, Any]):
    """Connect a new calendar"""
    try:
        required_fields = ["user_id", "provider", "calendar_id"]
        for field in required_fields:
            if field not in connection_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Check if provider is supported
        supported_providers = [p["id"] for p in CALENDAR_DATA["calendar_providers"] if p["enabled"]]
        if connection_data["provider"] not in supported_providers:
            raise HTTPException(status_code=400, detail="Unsupported calendar provider")
        
        # Create new calendar connection
        new_calendar = {
            "id": len(CALENDAR_DATA["connected_calendars"]) + 1,
            "user_id": connection_data["user_id"],
            "user_name": connection_data.get("user_name", f"User {connection_data['user_id']}"),
            "provider": connection_data["provider"],
            "calendar_id": connection_data["calendar_id"],
            "calendar_name": connection_data.get("calendar_name", "Default Calendar"),
            "connected_at": datetime.now().isoformat(),
            "last_sync": datetime.now().isoformat(),
            "sync_status": "active",
            "permissions": connection_data.get("permissions", ["read", "write"]),
            "default_calendar": connection_data.get("default_calendar", False),
            "access_token": connection_data.get("access_token", "encrypted_token"),
            "refresh_token": connection_data.get("refresh_token", "encrypted_refresh_token")
        }
        
        CALENDAR_DATA["connected_calendars"].append(new_calendar)
        
        return {
            "success": True,
            "message": "Calendar connected successfully",
            "calendar": new_calendar
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect calendar: {str(e)}")

@router.delete("/connected/{calendar_id}")
async def disconnect_calendar(calendar_id: int):
    """Disconnect a calendar"""
    try:
        for i, calendar in enumerate(CALENDAR_DATA["connected_calendars"]):
            if calendar["id"] == calendar_id:
                del CALENDAR_DATA["connected_calendars"][i]
                return {
                    "success": True,
                    "message": "Calendar disconnected successfully"
                }
        
        raise HTTPException(status_code=404, detail="Calendar not found")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to disconnect calendar: {str(e)}")

@router.post("/events")
async def create_calendar_event(event_data: Dict[str, Any]):
    """Create a calendar event for an interview"""
    try:
        required_fields = ["interview_id", "calendar_id", "title", "start_time", "end_time"]
        for field in required_fields:
            if field not in event_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Generate meeting link if not provided
        meeting_link = event_data.get("meeting_link")
        if not meeting_link:
            provider = CALENDAR_DATA["calendar_settings"]["meeting_link_provider"]
            meeting_link = CalendarService.generate_meeting_link(provider)
        
        # Create calendar event
        new_event = {
            "id": f"cal_event_{len(CALENDAR_DATA['calendar_events']) + 1}",
            "interview_id": event_data["interview_id"],
            "calendar_id": event_data["calendar_id"],
            "event_id": f"external_event_{uuid.uuid4().hex[:8]}",
            "title": event_data["title"],
            "description": event_data.get("description", ""),
            "start_time": event_data["start_time"],
            "end_time": event_data["end_time"],
            "timezone": event_data.get("timezone", CALENDAR_DATA["calendar_settings"]["time_zone"]),
            "location": event_data.get("location", ""),
            "meeting_link": meeting_link,
            "attendees": event_data.get("attendees", []),
            "reminders": event_data.get("reminders", [
                {"method": "email", "minutes": 60},
                {"method": "popup", "minutes": 15}
            ]),
            "status": "confirmed",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        CALENDAR_DATA["calendar_events"].append(new_event)
        
        return {
            "success": True,
            "message": "Calendar event created successfully",
            "event": new_event
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create calendar event: {str(e)}")

@router.put("/events/{event_id}")
async def update_calendar_event(event_id: str, update_data: Dict[str, Any]):
    """Update a calendar event"""
    try:
        # Find event
        event = None
        for e in CALENDAR_DATA["calendar_events"]:
            if e["id"] == event_id:
                event = e
                break
        
        if not event:
            raise HTTPException(status_code=404, detail="Calendar event not found")
        
        # Update fields
        for key, value in update_data.items():
            if key in event:
                event[key] = value
        
        event["updated_at"] = datetime.now().isoformat()
        
        return {
            "success": True,
            "message": "Calendar event updated successfully",
            "event": event
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update calendar event: {str(e)}")

@router.delete("/events/{event_id}")
async def delete_calendar_event(event_id: str):
    """Delete a calendar event"""
    try:
        for i, event in enumerate(CALENDAR_DATA["calendar_events"]):
            if event["id"] == event_id:
                del CALENDAR_DATA["calendar_events"][i]
                return {
                    "success": True,
                    "message": "Calendar event deleted successfully"
                }
        
        raise HTTPException(status_code=404, detail="Calendar event not found")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete calendar event: {str(e)}")

@router.get("/events")
async def get_calendar_events(
    calendar_id: Optional[str] = None,
    interview_id: Optional[int] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
):
    """Get calendar events with optional filters"""
    events = CALENDAR_DATA["calendar_events"]
    
    # Apply filters
    if calendar_id:
        events = [e for e in events if e["calendar_id"] == calendar_id]
    
    if interview_id:
        events = [e for e in events if e["interview_id"] == interview_id]
    
    if date_from:
        date_from_obj = datetime.fromisoformat(date_from)
        events = [e for e in events if datetime.fromisoformat(e["start_time"]) >= date_from_obj]
    
    if date_to:
        date_to_obj = datetime.fromisoformat(date_to)
        events = [e for e in events if datetime.fromisoformat(e["start_time"]) <= date_to_obj]
    
    return {
        "success": True,
        "events": events
    }

@router.get("/availability")
async def get_availability(
    calendar_id: str,
    date: str,
    duration: Optional[int] = None
):
    """Get availability for a specific calendar and date"""
    try:
        if duration is None:
            duration = CALENDAR_DATA["calendar_settings"]["default_interview_duration"]
        
        # Get availability data
        availability_data = CALENDAR_DATA["availability"].get(calendar_id, [])
        
        # Find availability for the requested date
        date_availability = None
        for avail in availability_data:
            if avail["date"] == date:
                date_availability = avail
                break
        
        if not date_availability:
            # Generate default availability if not found
            settings = CALENDAR_DATA["calendar_settings"]
            start_hour = int(settings["working_hours"]["start"].split(":")[0])
            end_hour = int(settings["working_hours"]["end"].split(":")[0])
            
            time_slots = []
            for hour in range(start_hour, end_hour):
                time_slots.append({
                    "start": f"{hour:02d}:00",
                    "end": f"{hour+1:02d}:00",
                    "available": True
                })
            
            date_availability = {
                "date": date,
                "time_slots": time_slots
            }
        
        # Filter slots that can accommodate the requested duration
        available_slots = []
        for slot in date_availability["time_slots"]:
            if slot.get("available", False):
                slot_start = datetime.strptime(slot["start"], "%H:%M")
                slot_end = datetime.strptime(slot["end"], "%H:%M")
                slot_duration = (slot_end - slot_start).total_seconds() / 60
                
                if slot_duration >= duration:
                    available_slots.append(slot)
        
        return {
            "success": True,
            "availability": {
                "calendar_id": calendar_id,
                "date": date,
                "requested_duration": duration,
                "available_slots": available_slots,
                "total_available_slots": len(available_slots)
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get availability: {str(e)}")

@router.get("/availability/bulk")
async def get_bulk_availability(
    calendar_ids: List[str],
    date_from: str,
    date_to: str,
    duration: Optional[int] = None
):
    """Get availability for multiple calendars over a date range"""
    try:
        if duration is None:
            duration = CALENDAR_DATA["calendar_settings"]["default_interview_duration"]
        
        bulk_availability = {}
        
        # Generate date range
        start_date = datetime.fromisoformat(date_from).date()
        end_date = datetime.fromisoformat(date_to).date()
        current_date = start_date
        
        while current_date <= end_date:
            date_str = current_date.isoformat()
            bulk_availability[date_str] = {}
            
            for calendar_id in calendar_ids:
                # Get availability for this calendar and date
                availability_response = await get_availability(calendar_id, date_str, duration)
                if availability_response["success"]:
                    bulk_availability[date_str][calendar_id] = availability_response["availability"]
            
            current_date += timedelta(days=1)
        
        return {
            "success": True,
            "bulk_availability": bulk_availability
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get bulk availability: {str(e)}")

@router.post("/schedule-interview")
async def schedule_interview_with_calendar(schedule_data: Dict[str, Any]):
    """Schedule an interview and create calendar event"""
    try:
        required_fields = ["interview_id", "calendar_id", "candidate_email", "interviewer_email", "start_time", "duration"]
        for field in required_fields:
            if field not in schedule_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Calculate end time
        start_time = datetime.fromisoformat(schedule_data["start_time"])
        end_time = start_time + timedelta(minutes=schedule_data["duration"])
        
        # Generate meeting link
        meeting_link = CalendarService.generate_meeting_link()
        
        # Create event data
        event_data = {
            "interview_id": schedule_data["interview_id"],
            "calendar_id": schedule_data["calendar_id"],
            "title": f"Interview: {schedule_data.get('candidate_name', 'Candidate')} - {schedule_data.get('position', 'Position')}",
            "description": f"""Interview for {schedule_data.get('position', 'Position')} position

Candidate: {schedule_data.get('candidate_name', 'Candidate')}
Interviewer: {schedule_data.get('interviewer_name', 'Interviewer')}
Duration: {schedule_data['duration']} minutes

Meeting Link: {meeting_link}

Preparation materials: {schedule_data.get('preparation_link', 'N/A')}
""",
            "start_time": schedule_data["start_time"],
            "end_time": end_time.isoformat(),
            "location": schedule_data.get("location", "Virtual Meeting"),
            "meeting_link": meeting_link,
            "attendees": [
                {
                    "email": schedule_data["interviewer_email"],
                    "name": schedule_data.get("interviewer_name", "Interviewer"),
                    "role": "interviewer",
                    "response_status": "accepted"
                },
                {
                    "email": schedule_data["candidate_email"],
                    "name": schedule_data.get("candidate_name", "Candidate"),
                    "role": "candidate",
                    "response_status": "pending"
                }
            ]
        }
        
        # Create calendar event
        event_response = await create_calendar_event(event_data)
        
        if event_response["success"]:
            return {
                "success": True,
                "message": "Interview scheduled and calendar event created successfully",
                "interview_id": schedule_data["interview_id"],
                "calendar_event": event_response["event"],
                "meeting_link": meeting_link
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to create calendar event")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to schedule interview: {str(e)}")

@router.put("/sync/{calendar_id}")
async def sync_calendar(calendar_id: int):
    """Sync a connected calendar"""
    try:
        # Find calendar
        calendar = None
        for cal in CALENDAR_DATA["connected_calendars"]:
            if cal["id"] == calendar_id:
                calendar = cal
                break
        
        if not calendar:
            raise HTTPException(status_code=404, detail="Calendar not found")
        
        # Update sync status
        calendar["last_sync"] = datetime.now().isoformat()
        calendar["sync_status"] = "active"
        
        # In a real implementation, you would sync with the external calendar API
        sync_results = {
            "events_synced": 15,
            "events_created": 3,
            "events_updated": 2,
            "events_deleted": 1,
            "sync_duration": 2.5,
            "last_sync": calendar["last_sync"]
        }
        
        return {
            "success": True,
            "message": "Calendar synced successfully",
            "sync_results": sync_results
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync calendar: {str(e)}")

@router.get("/settings")
async def get_calendar_settings():
    """Get calendar integration settings"""
    return {
        "success": True,
        "settings": CALENDAR_DATA["calendar_settings"]
    }

@router.put("/settings")
async def update_calendar_settings(settings: Dict[str, Any]):
    """Update calendar integration settings"""
    try:
        # Update settings
        for key, value in settings.items():
            if key in CALENDAR_DATA["calendar_settings"]:
                CALENDAR_DATA["calendar_settings"][key] = value
        
        return {
            "success": True,
            "message": "Calendar settings updated successfully",
            "settings": CALENDAR_DATA["calendar_settings"]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update settings: {str(e)}")

@router.get("/time-zones")
async def get_supported_timezones():
    """Get list of supported time zones"""
    timezones = [
        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",
        "Europe/London",
        "Europe/Paris",
        "Europe/Berlin",
        "Asia/Tokyo",
        "Asia/Shanghai",
        "Asia/Kolkata",
        "Australia/Sydney",
        "UTC"
    ]
    
    return {
        "success": True,
        "timezones": timezones
    }
