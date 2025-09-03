"""
n8n Workflow Integration Client
Handles automation workflows for hiring processes
"""

import os
import httpx
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime

logger = logging.getLogger(__name__)

class N8NWorkflowClient:
    """Client for integrating with n8n workflow automation"""
    
    def __init__(self, webhook_url: Optional[str] = None, api_key: Optional[str] = None):
        """Initialize n8n client with configuration"""
        self.webhook_url = webhook_url or os.getenv("N8N_WEBHOOK_URL")
        self.api_key = api_key or os.getenv("N8N_API_KEY")
        self.base_url = os.getenv("N8N_BASE_URL", "https://app.n8n.cloud")
        
        # Workflow templates for common hiring processes
        self.workflow_templates = {
            "candidate_screening": {
                "name": "Smart Candidate Screening",
                "description": "Automated initial screening with AI analysis",
                "trigger_conditions": ["new_candidate", "resume_uploaded"],
                "steps": [
                    "extract_resume_data",
                    "ai_skills_analysis", 
                    "bias_detection_check",
                    "scoring_calculation",
                    "notification_to_recruiter"
                ]
            },
            "interview_scheduling": {
                "name": "Automated Interview Scheduling",
                "description": "Smart scheduling based on availability and preferences",
                "trigger_conditions": ["candidate_passed_screening", "manual_trigger"],
                "steps": [
                    "check_interviewer_availability",
                    "send_calendar_invites",
                    "prepare_interview_materials",
                    "send_confirmation_emails",
                    "create_interview_prep_document"
                ]
            },
            "reference_check": {
                "name": "Automated Reference Verification",
                "description": "Streamlined reference checking process",
                "trigger_conditions": ["final_interview_completed", "hr_approval"],
                "steps": [
                    "extract_reference_contacts",
                    "send_reference_request_emails",
                    "track_response_status",
                    "compile_reference_report",
                    "notify_hiring_manager"
                ]
            },
            "onboarding_preparation": {
                "name": "New Hire Onboarding Setup",
                "description": "Prepare systems and materials for new hires",
                "trigger_conditions": ["offer_accepted", "start_date_confirmed"],
                "steps": [
                    "create_employee_accounts",
                    "prepare_welcome_package",
                    "schedule_orientation",
                    "assign_buddy_mentor",
                    "setup_workspace_equipment"
                ]
            }
        }
        
        logger.info(f"N8N Workflow Client initialized. Webhook URL configured: {bool(self.webhook_url)}")

    async def trigger_workflow(self, workflow_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Trigger a specific workflow type with payload data"""
        try:
            if not self.webhook_url:
                logger.warning("N8N webhook URL not configured - using mock response")
                return self._mock_workflow_response(workflow_type, payload)

            # Enhance payload with workflow metadata
            enhanced_payload = {
                "workflow_type": workflow_type,
                "timestamp": datetime.now().isoformat(),
                "source": "HireIQ_Pro_AI_Copilot",
                "data": payload,
                "workflow_template": self.workflow_templates.get(workflow_type, {})
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                # Add authentication if API key is available
                headers = {"Content-Type": "application/json"}
                if self.api_key:
                    headers["Authorization"] = f"Bearer {self.api_key}"

                response = await client.post(
                    self.webhook_url,
                    json=enhanced_payload,
                    headers=headers
                )
                response.raise_for_status()
                
                result = response.json() if response.content else {}
                
                logger.info(f"Successfully triggered n8n workflow: {workflow_type}")
                
                return {
                    "success": True,
                    "workflow_id": result.get("workflow_id", f"n8n_{workflow_type}_{datetime.now().timestamp()}"),
                    "workflow_type": workflow_type,
                    "status": "initiated",
                    "response": result,
                    "estimated_completion": self._get_estimated_completion(workflow_type),
                    "triggered_at": datetime.now().isoformat()
                }

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error triggering n8n workflow {workflow_type}: {e}")
            return {
                "success": False,
                "error": f"HTTP {e.response.status_code}: {e.response.text}",
                "workflow_type": workflow_type,
                "fallback_action": self._get_fallback_action(workflow_type)
            }
        except Exception as e:
            logger.error(f"Error triggering n8n workflow {workflow_type}: {e}")
            return {
                "success": False,
                "error": str(e),
                "workflow_type": workflow_type,
                "fallback_action": self._get_fallback_action(workflow_type)
            }

    async def get_workflow_status(self, workflow_id: str) -> Dict[str, Any]:
        """Get the status of a running workflow"""
        try:
            if not self.base_url or not self.api_key:
                return self._mock_status_response(workflow_id)

            async with httpx.AsyncClient() as client:
                headers = {"Authorization": f"Bearer {self.api_key}"}
                
                response = await client.get(
                    f"{self.base_url}/api/v1/executions/{workflow_id}",
                    headers=headers
                )
                response.raise_for_status()
                
                execution_data = response.json()
                
                return {
                    "workflow_id": workflow_id,
                    "status": execution_data.get("status", "unknown"),
                    "progress": execution_data.get("progress", 0),
                    "completed_steps": execution_data.get("completedSteps", []),
                    "current_step": execution_data.get("currentStep"),
                    "started_at": execution_data.get("startedAt"),
                    "finished_at": execution_data.get("finishedAt"),
                    "result": execution_data.get("result", {})
                }

        except Exception as e:
            logger.error(f"Error getting workflow status for {workflow_id}: {e}")
            return {
                "workflow_id": workflow_id,
                "status": "error",
                "error": str(e)
            }

    async def trigger_candidate_screening(self, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        """Trigger automated candidate screening workflow"""
        payload = {
            "candidate_id": candidate_data.get("id"),
            "candidate_name": candidate_data.get("name"),
            "resume_text": candidate_data.get("resume_text"),
            "job_id": candidate_data.get("job_id"),
            "application_date": candidate_data.get("application_date", datetime.now().isoformat()),
            "source": candidate_data.get("source", "direct_application"),
            "priority": candidate_data.get("priority", "normal")
        }
        
        return await self.trigger_workflow("candidate_screening", payload)

    async def trigger_interview_scheduling(self, interview_data: Dict[str, Any]) -> Dict[str, Any]:
        """Trigger automated interview scheduling workflow"""
        payload = {
            "candidate_id": interview_data.get("candidate_id"),
            "candidate_email": interview_data.get("candidate_email"),
            "interviewer_ids": interview_data.get("interviewer_ids", []),
            "interview_type": interview_data.get("interview_type", "technical"),
            "duration_minutes": interview_data.get("duration", 60),
            "preferred_times": interview_data.get("preferred_times", []),
            "timezone": interview_data.get("timezone", "UTC"),
            "special_requirements": interview_data.get("special_requirements", [])
        }
        
        return await self.trigger_workflow("interview_scheduling", payload)

    async def trigger_reference_check(self, reference_data: Dict[str, Any]) -> Dict[str, Any]:
        """Trigger automated reference checking workflow"""
        payload = {
            "candidate_id": reference_data.get("candidate_id"),
            "candidate_name": reference_data.get("candidate_name"),
            "references": reference_data.get("references", []),
            "position_applied": reference_data.get("position"),
            "hiring_manager": reference_data.get("hiring_manager"),
            "urgency": reference_data.get("urgency", "normal"),
            "deadline": reference_data.get("deadline")
        }
        
        return await self.trigger_workflow("reference_check", payload)

    def get_available_workflows(self) -> List[Dict[str, Any]]:
        """Get list of available workflow templates"""
        return [
            {
                "type": workflow_type,
                "name": template["name"],
                "description": template["description"],
                "trigger_conditions": template["trigger_conditions"],
                "steps": template["steps"],
                "estimated_duration": self._get_estimated_completion(workflow_type)
            }
            for workflow_type, template in self.workflow_templates.items()
        ]

    def _mock_workflow_response(self, workflow_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Provide mock response when n8n is not configured"""
        return {
            "success": True,
            "workflow_id": f"mock_{workflow_type}_{datetime.now().timestamp()}",
            "workflow_type": workflow_type,
            "status": "mock_initiated",
            "message": f"Mock {workflow_type} workflow triggered successfully",
            "estimated_completion": self._get_estimated_completion(workflow_type),
            "triggered_at": datetime.now().isoformat(),
            "mock_mode": True,
            "payload_received": payload
        }

    def _mock_status_response(self, workflow_id: str) -> Dict[str, Any]:
        """Provide mock status response"""
        return {
            "workflow_id": workflow_id,
            "status": "completed",
            "progress": 100,
            "completed_steps": ["step_1", "step_2", "step_3"],
            "current_step": "completed",
            "started_at": datetime.now().isoformat(),
            "finished_at": datetime.now().isoformat(),
            "result": {"message": "Mock workflow completed successfully"},
            "mock_mode": True
        }

    def _get_estimated_completion(self, workflow_type: str) -> str:
        """Get estimated completion time for workflow types"""
        completion_times = {
            "candidate_screening": "15-30 minutes",
            "interview_scheduling": "5-15 minutes",
            "reference_check": "24-48 hours",
            "onboarding_preparation": "1-2 hours"
        }
        return completion_times.get(workflow_type, "30-60 minutes")

    def _get_fallback_action(self, workflow_type: str) -> str:
        """Get fallback action when workflow fails"""
        fallback_actions = {
            "candidate_screening": "Manual review required - check candidate profile in dashboard",
            "interview_scheduling": "Manual scheduling required - contact candidates directly",
            "reference_check": "Manual reference check needed - contact HR department",
            "onboarding_preparation": "Manual onboarding setup required - contact IT and HR"
        }
        return fallback_actions.get(workflow_type, "Manual intervention required")


# Global instance
n8n_client = N8NWorkflowClient()

def get_n8n_client() -> N8NWorkflowClient:
    """Get global n8n client instance"""
    return n8n_client

def initialize_n8n_client(webhook_url: str = None, api_key: str = None) -> N8NWorkflowClient:
    """Initialize global n8n client with configuration"""
    global n8n_client
    n8n_client = N8NWorkflowClient(webhook_url=webhook_url, api_key=api_key)
    return n8n_client
