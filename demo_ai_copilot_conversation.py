"""
AI Copilot Demo - Mock Conversation Flow
Demonstrates realistic AI interactions without requiring API keys
"""

import asyncio
import json
from typing import Dict, List, Any
from datetime import datetime

# Mock the AI Orchestrator for demonstration
class MockAIOrchestratorDemo:
    """Demo version of AI Orchestrator using mock responses"""
    
    def __init__(self):
        # Import mock responses
        try:
            from backend.services.mock_ai_responses import mock_ai
            self.mock_ai = mock_ai
            self.mock_mode = True
            print("✅ Mock AI Copilot initialized successfully!")
        except ImportError:
            print("❌ Failed to import mock AI responses")
            self.mock_ai = None
            self.mock_mode = False

    async def chat_with_ai(self, message: str, context: str = "general") -> Dict[str, Any]:
        """Simulate chat with AI Copilot"""
        if not self.mock_ai:
            return {"response": "Mock AI not available", "error": True}
        
        # Route to appropriate response handler
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['candidate', 'analyze', 'sarah', 'michael', 'emma']):
            # Extract candidate ID if mentioned
            candidate_id = "1"  # Default to Sarah Johnson
            if "michael" in message_lower or "chen" in message_lower:
                candidate_id = "2"
            elif "emma" in message_lower or "rodriguez" in message_lower:
                candidate_id = "3"
            
            return self.mock_ai.get_candidate_analysis(candidate_id, message)
        
        elif any(word in message_lower for word in ['job', 'match', 'position', 'role']):
            return self.mock_ai.get_job_matching_response(message)
        
        elif any(word in message_lower for word in ['bias', 'fair', 'discrimination']):
            return self.mock_ai.get_bias_analysis(message)
        
        elif any(word in message_lower for word in ['workflow', 'automate', 'schedule']):
            workflow_type = "candidate_screening"
            if "interview" in message_lower:
                workflow_type = "interview_scheduling"
            elif "reference" in message_lower:
                workflow_type = "reference_check"
            
            return self.mock_ai.get_workflow_response(workflow_type, {"query": message})
        
        else:
            return self.mock_ai.get_general_response(message, context)

# Demo conversation scenarios
demo_scenarios = [
    {
        "title": "🤖 AI Copilot Introduction",
        "conversations": [
            {
                "user": "Hello! Can you help me with hiring?",
                "context": "greeting"
            },
            {
                "user": "What can you help me with?",
                "context": "capabilities"
            }
        ]
    },
    {
        "title": "👥 Candidate Analysis",
        "conversations": [
            {
                "user": "Can you analyze Sarah Johnson for me?",
                "context": "candidate_analysis"
            },
            {
                "user": "What are Sarah's key strengths?",
                "context": "candidate_analysis"
            },
            {
                "user": "Generate interview questions for Michael Chen",
                "context": "candidate_analysis"
            }
        ]
    },
    {
        "title": "⚖️ Bias Detection",
        "conversations": [
            {
                "user": "Can you check this job description for bias: Looking for a young, energetic developer who fits our team culture",
                "context": "bias_detection"
            },
            {
                "user": "How can I make my hiring process more fair?",
                "context": "bias_prevention"
            }
        ]
    },
    {
        "title": "🎯 Job Matching",
        "conversations": [
            {
                "user": "Help me find the best candidates for a Senior Software Engineer role",
                "context": "job_matching"
            },
            {
                "user": "What skills should I prioritize for this position?",
                "context": "job_matching"
            }
        ]
    },
    {
        "title": "🔄 Workflow Automation", 
        "conversations": [
            {
                "user": "Can you automate candidate screening for me?",
                "context": "workflow_automation"
            },
            {
                "user": "Set up interview scheduling automation",
                "context": "workflow_automation"
            },
            {
                "user": "I need help with reference check automation",
                "context": "workflow_automation"
            }
        ]
    },
    {
        "title": "💡 Best Practices & Guidance",
        "conversations": [
            {
                "user": "What are the best practices for unbiased hiring?",
                "context": "best_practices"
            },
            {
                "user": "How can I predict hiring success?",
                "context": "predictive_analytics"
            },
            {
                "user": "Give me some interview tips",
                "context": "interview_guidance"
            }
        ]
    }
]

async def run_demo_conversation():
    """Run interactive demo conversation"""
    print("=" * 80)
    print("🚀 AI COPILOT DEMO - MOCK CONVERSATION FLOW")
    print("=" * 80)
    print("This demo shows realistic AI Copilot interactions without requiring API keys.")
    print("The AI uses sophisticated mock responses that simulate real functionality.\n")
    
    # Initialize mock AI
    ai_copilot = MockAIOrchestratorDemo()
    
    if not ai_copilot.mock_mode:
        print("❌ Demo cannot run - mock AI not available")
        return
    
    print("Choose a demo scenario:")
    for i, scenario in enumerate(demo_scenarios, 1):
        print(f"{i}. {scenario['title']}")
    print("7. 🗨️  Interactive Chat (type your own messages)")
    print("8. 🎬 Run All Scenarios")
    
    try:
        choice = input("\nEnter your choice (1-8): ").strip()
        
        if choice == "7":
            await interactive_chat_demo(ai_copilot)
        elif choice == "8":
            await run_all_scenarios(ai_copilot)
        elif choice.isdigit() and 1 <= int(choice) <= 6:
            await run_scenario(ai_copilot, demo_scenarios[int(choice) - 1])
        else:
            print("Invalid choice. Running scenario 1...")
            await run_scenario(ai_copilot, demo_scenarios[0])
            
    except KeyboardInterrupt:
        print("\n\n👋 Demo ended by user")
    except Exception as e:
        print(f"\n❌ Demo error: {e}")

async def run_scenario(ai_copilot: MockAIOrchestratorDemo, scenario: Dict[str, Any]):
    """Run a specific demo scenario"""
    print(f"\n{'=' * 60}")
    print(f"📋 SCENARIO: {scenario['title']}")
    print(f"{'=' * 60}")
    
    for i, conv in enumerate(scenario['conversations'], 1):
        print(f"\n💬 Conversation {i}:")
        print(f"👤 User: {conv['user']}")
        print("🤖 AI Copilot: Thinking...")
        
        # Simulate processing time
        await asyncio.sleep(1)
        
        response = await ai_copilot.chat_with_ai(conv['user'], conv['context'])
        
        if response.get('error'):
            print(f"❌ Error: {response['response']}")
        else:
            print(f"🤖 AI Copilot: {response['response']}")
            
            # Show additional insights if available
            if 'ai_insights' in response:
                insights = response['ai_insights']
                print(f"\n📊 AI Insights:")
                for key, value in insights.items():
                    print(f"   • {key.replace('_', ' ').title()}: {value}")
            
            if 'recommendations' in response and response['recommendations']:
                print(f"\n💡 Recommendations:")
                for rec in response['recommendations'][:2]:  # Show first 2
                    if isinstance(rec, dict):
                        print(f"   • {rec.get('title', rec.get('description', str(rec)))}")
                    else:
                        print(f"   • {rec}")
        
        print("-" * 50)
        
        # Pause between conversations
        if i < len(scenario['conversations']):
            await asyncio.sleep(2)

async def run_all_scenarios(ai_copilot: MockAIOrchestratorDemo):
    """Run all demo scenarios"""
    print(f"\n{'=' * 60}")
    print("🎬 RUNNING ALL SCENARIOS")
    print(f"{'=' * 60}")
    
    for scenario in demo_scenarios:
        await run_scenario(ai_copilot, scenario)
        print("\n" + "🔄 Moving to next scenario..." + "\n")
        await asyncio.sleep(3)
    
    print(f"\n{'=' * 60}")
    print("✅ ALL SCENARIOS COMPLETED!")
    print(f"{'=' * 60}")

async def interactive_chat_demo(ai_copilot: MockAIOrchestratorDemo):
    """Interactive chat with the AI Copilot"""
    print(f"\n{'=' * 60}")
    print("🗨️  INTERACTIVE CHAT WITH AI COPILOT")
    print(f"{'=' * 60}")
    print("Type your messages to chat with the AI Copilot.")
    print("Type 'exit', 'quit', or 'bye' to end the conversation.")
    print("Type 'help' to see example questions.\n")
    
    conversation_history = []
    
    while True:
        try:
            user_message = input("👤 You: ").strip()
            
            if user_message.lower() in ['exit', 'quit', 'bye']:
                print("👋 AI Copilot: Goodbye! Thanks for trying the AI Copilot demo!")
                break
            
            if user_message.lower() == 'help':
                print_help_examples()
                continue
            
            if not user_message:
                continue
            
            print("🤖 AI Copilot: Thinking...")
            await asyncio.sleep(1)
            
            response = await ai_copilot.chat_with_ai(user_message, "interactive")
            
            if response.get('error'):
                print(f"❌ AI Copilot: {response['response']}")
            else:
                print(f"🤖 AI Copilot: {response['response']}")
                
                # Show relevant additional info
                if 'recommendations' in response and response['recommendations']:
                    rec_count = len(response['recommendations'])
                    if rec_count > 0:
                        print(f"\n💡 I also have {rec_count} recommendation{'s' if rec_count > 1 else ''} for you!")
            
            conversation_history.append({
                "user": user_message,
                "ai": response['response'],
                "timestamp": datetime.now().isoformat()
            })
            
            print()  # Add spacing
            
        except KeyboardInterrupt:
            print("\n👋 AI Copilot: Conversation ended. Thanks for chatting!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
            continue

def print_help_examples():
    """Print example questions for interactive chat"""
    examples = [
        "Analyze Sarah Johnson for the Senior Engineer role",
        "What are the best practices for bias-free hiring?",
        "Can you check this text for bias: Looking for a cultural fit",
        "Help me automate candidate screening",
        "Generate interview questions for a data scientist",
        "What skills should I look for in a UX designer?",
        "How can I predict hiring success?",
        "Set up workflow automation for interviews"
    ]
    
    print("\n💡 Example questions you can ask:")
    for i, example in enumerate(examples, 1):
        print(f"   {i}. {example}")
    print()

def display_demo_summary():
    """Display what the demo includes"""
    print("\n📋 DEMO FEATURES INCLUDED:")
    print("✅ Intelligent candidate analysis with AI insights")
    print("✅ Bias detection and fair hiring recommendations") 
    print("✅ Smart job-candidate matching algorithms")
    print("✅ Workflow automation setup and management")
    print("✅ Interview question generation")
    print("✅ Predictive hiring success analytics")
    print("✅ Best practices and guidance")
    print("✅ Interactive conversation capabilities")
    print("\n🔮 MOCK MODE BENEFITS:")
    print("• No API keys required - works immediately")
    print("• Realistic responses showing actual capabilities")
    print("• Safe for testing and demonstration")
    print("• Comprehensive coverage of all AI features")
    print("• Interactive exploration of functionality")

if __name__ == "__main__":
    print("🚀 Starting AI Copilot Demo...")
    display_demo_summary()
    asyncio.run(run_demo_conversation())
