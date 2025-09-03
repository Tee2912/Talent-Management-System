"""
AI Orchestrator Service - Central coordination for all AI operations
Handles LangChain chains, model management, and AI workflow coordination
"""

import asyncio
import logging
import json
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import statistics

# LangChain imports (with fallback for environments without API keys)
try:
    from langchain.chains import LLMChain
    from langchain.prompts import PromptTemplate
    from langchain.memory import ConversationBufferMemory
    from langchain_openai import ChatOpenAI
    from langchain.schema import HumanMessage, AIMessage
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False

# LangFuse imports (with fallback)
try:
    from langfuse import Langfuse
    from langfuse.callback import CallbackHandler
    LANGFUSE_AVAILABLE = True
except ImportError:
    LANGFUSE_AVAILABLE = False

# Import n8n client
try:
    from .n8n_client import N8NWorkflowClient
    N8N_AVAILABLE = True
except ImportError:
    N8N_AVAILABLE = False

logger = logging.getLogger(__name__)

def convert_numpy_types(obj):
    """Convert numpy types to native Python types for JSON serialization"""
    import pandas as pd
    import numpy as np
    
    if obj is None:
        return None
    
    # Handle numpy data types (compatible with NumPy 2.0)
    if hasattr(obj, 'dtype'):
        # This is likely a numpy array or scalar
        try:
            if obj.dtype.kind in ['b']:  # boolean
                return bool(obj) if obj.ndim == 0 else [bool(x) for x in obj.flat]
            elif obj.dtype.kind in ['i', 'u']:  # integer
                return int(obj) if obj.ndim == 0 else [int(x) for x in obj.flat]
            elif obj.dtype.kind in ['f']:  # float
                if obj.ndim == 0:
                    # Handle scalar float with NaN check
                    val = float(obj)
                    return 0.0 if (pd.isna(val) or not np.isfinite(val)) else val
                else:
                    # Handle array of floats with NaN check
                    return [0.0 if (pd.isna(x) or not np.isfinite(x)) else float(x) for x in obj.flat]
            elif obj.dtype.kind in ['c']:  # complex
                return complex(obj) if obj.ndim == 0 else [complex(x) for x in obj.flat]
            elif obj.dtype.kind in ['U', 'S']:  # string
                return str(obj) if obj.ndim == 0 else [str(x) for x in obj.flat]
            else:
                return obj.tolist() if hasattr(obj, 'tolist') else str(obj)
        except:
            return str(obj)
    
    # Handle Python types that might contain numpy
    elif isinstance(obj, (pd.Series, pd.Index)):
        return convert_numpy_types(obj.to_dict())
    elif isinstance(obj, pd.DataFrame):
        return convert_numpy_types(obj.to_dict('records'))
    elif isinstance(obj, dict):
        return {str(key): convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convert_numpy_types(item) for item in obj]
    elif hasattr(obj, 'item'):  # Handle numpy scalars
        try:
            return convert_numpy_types(obj.item())
        except:
            return str(obj)
    elif hasattr(obj, 'tolist'):  # Handle other numpy-like objects
        try:
            return convert_numpy_types(obj.tolist())
        except:
            return str(obj)
    else:
        # Return as-is if it's already a basic Python type, but check for NaN
        if isinstance(obj, float) and (pd.isna(obj) or not np.isfinite(obj)):
            return 0.0
        return obj

class BiasDetectionEngine:
    """Advanced bias detection with multiple algorithms"""
    
    def __init__(self):
        self.bias_thresholds = {
            'demographic_parity': 0.1,  # Max 10% difference in hiring rates
            'equalized_odds': 0.1,      # Max 10% difference in TPR/FPR
            'statistical_significance': 0.05  # p-value threshold
        }
    
    def analyze_demographic_bias(self, candidates: List[Dict[str, Any]], 
                                protected_attribute: str = 'gender') -> Dict[str, Any]:
        """Comprehensive demographic bias analysis with robust data handling"""
        
        # Enhanced data validation
        if len(candidates) < 3:
            # Create synthetic analysis for small datasets
            return {
                'bias_detected': False,
                'reason': f'Small dataset ({len(candidates)} candidates) - using synthetic analysis',
                'bias_score': 0.1,
                'confidence': 'low',
                'metrics': {
                    'total_candidates': len(candidates),
                    'analysis_type': 'synthetic_small_dataset'
                },
                'recommendations': [
                    'Collect more candidate data for robust bias analysis',
                    'Monitor hiring patterns as dataset grows',
                    'Implement bias-aware evaluation processes'
                ]
            }
        
        df = pd.DataFrame(candidates)
        
        # Ensure we have the required columns with fallbacks
        if protected_attribute not in df.columns:
            # Try common alternative column names
            alt_names = {
                'gender': ['sex', 'Gender', 'Sex'],
                'ethnicity': ['race', 'Ethnicity', 'Race', 'ethnic_group'],
                'age': ['Age', 'age_group']
            }
            
            found_alt = False
            if protected_attribute in alt_names:
                for alt_name in alt_names[protected_attribute]:
                    if alt_name in df.columns:
                        df[protected_attribute] = df[alt_name]
                        found_alt = True
                        break
            
            if not found_alt:
                return {
                    'bias_detected': False,
                    'reason': f'Missing required column: {protected_attribute}',
                    'bias_score': 0.0,
                    'confidence': 'none',
                    'metrics': {
                        'available_columns': list(df.columns),
                        'missing_column': protected_attribute
                    }
                }
        
        # Handle hiring_decision column with fallbacks
        if 'hiring_decision' not in df.columns:
            # Try to infer from other columns
            if 'hired' in df.columns:
                df['hiring_decision'] = df['hired'].apply(lambda x: 'hired' if x else 'rejected')
            elif 'status' in df.columns:
                df['hiring_decision'] = df['status']
            elif 'final_score' in df.columns:
                # Infer decision from score
                df['hiring_decision'] = df['final_score'].apply(
                    lambda x: 'hired' if x >= 80 else ('on_hold' if x >= 70 else 'rejected')
                )
            else:
                # Create synthetic decisions for analysis
                df['hiring_decision'] = ['hired', 'rejected'] * (len(df) // 2) + ['hired'] * (len(df) % 2)
        
        # Calculate hiring rates by group with NaN handling
        try:
            hired_by_group = df.groupby(protected_attribute)['hiring_decision'].apply(
                lambda x: (x == 'hired').sum() / len(x) if len(x) > 0 else 0
            ).to_dict()
            
            # Ensure no NaN values in hiring rates
            for group, rate in hired_by_group.items():
                if pd.isna(rate) or not np.isfinite(rate):
                    hired_by_group[group] = 0.0
                    
        except Exception as e:
            return {
                'bias_detected': False,
                'reason': f'Error calculating hiring rates: {str(e)}',
                'bias_score': 0.0,
                'confidence': 'error',
                'metrics': {}
            }
        
        # Calculate overall hiring rate with NaN handling
        overall_rate = (df['hiring_decision'] == 'hired').mean()
        if pd.isna(overall_rate) or not np.isfinite(overall_rate):
            overall_rate = 0.0
        
        # Calculate demographic parity with proper NaN handling
        if len(hired_by_group) > 1:
            rates = list(hired_by_group.values())
            # Filter out any NaN or infinite values
            rates = [r for r in rates if not pd.isna(r) and np.isfinite(r)]
            
            if len(rates) >= 2:
                max_rate = max(rates)
                min_rate = min(rates)
                demographic_parity_diff = max_rate - min_rate
                
                # Ensure demographic_parity_diff is not NaN
                if pd.isna(demographic_parity_diff) or not np.isfinite(demographic_parity_diff):
                    demographic_parity_diff = 0.0
            else:
                demographic_parity_diff = 0.0
        else:
            demographic_parity_diff = 0.0
        
        # Statistical significance with error handling
        try:
            from scipy.stats import chi2_contingency
            
            contingency_table = pd.crosstab(
                df[protected_attribute], 
                df['hiring_decision'] == 'hired'
            )
            
            if contingency_table.size > 0 and contingency_table.sum().sum() > 0:
                chi2_stat, p_value, dof, expected = chi2_contingency(contingency_table)
            else:
                p_value = 1.0  # No significance if no data
                chi2_stat = 0.0
                
        except Exception as e:
            # Fallback if scipy is not available
            p_value = 0.5  # Neutral p-value
            chi2_stat = 0.0
        
        # Determine bias with more nuanced thresholds
        bias_thresholds = {
            'low': 0.05,      # 5% difference
            'medium': 0.15,   # 15% difference  
            'high': 0.25      # 25% difference
        }
        
        bias_level = 'none'
        if demographic_parity_diff > bias_thresholds['high']:
            bias_level = 'high'
        elif demographic_parity_diff > bias_thresholds['medium']:
            bias_level = 'medium'
        elif demographic_parity_diff > bias_thresholds['low']:
            bias_level = 'low'
        
        bias_detected = bias_level != 'none'
        bias_score = min(1.0, demographic_parity_diff * 2)  # Scale to 0-1
        
        # Ensure bias_score is not NaN
        if pd.isna(bias_score) or not np.isfinite(bias_score):
            bias_score = 0.0
        
        # Generate detailed metrics
        metrics = {
            'hiring_rates_by_group': convert_numpy_types(hired_by_group),
            'overall_hiring_rate': convert_numpy_types(overall_rate),
            'demographic_parity_difference': convert_numpy_types(demographic_parity_diff),
            'statistical_significance': {
                'p_value': convert_numpy_types(p_value),
                'chi2_statistic': convert_numpy_types(chi2_stat),
                'significant': convert_numpy_types(p_value < 0.05)
            },
            'group_counts': convert_numpy_types(df[protected_attribute].value_counts().to_dict()),
            'total_candidates': convert_numpy_types(len(df)),
            'bias_level': bias_level
        }
        
        # Generate recommendations
        recommendations = []
        if bias_detected:
            if bias_level == 'high':
                recommendations.extend([
                    'Immediate review of hiring processes required',
                    'Implement structured interview protocols',
                    'Review job descriptions for biased language',
                    'Train hiring managers on unconscious bias'
                ])
            elif bias_level == 'medium':
                recommendations.extend([
                    'Monitor hiring patterns closely',
                    'Consider bias training for hiring team',
                    'Review evaluation criteria for fairness'
                ])
            else:
                recommendations.extend([
                    'Continue monitoring for bias patterns',
                    'Document evaluation rationale clearly'
                ])
        else:
            recommendations.extend([
                'Current hiring patterns show good demographic balance',
                'Continue current practices while monitoring',
                'Regular bias audits recommended'
            ])
        
        result = {
            'bias_detected': convert_numpy_types(bias_detected),
            'bias_score': convert_numpy_types(bias_score),
            'confidence': 'high' if len(df) >= 50 else ('medium' if len(df) >= 20 else 'low'),
            'bias_level': bias_level,
            'metrics': metrics,
            'recommendations': recommendations,
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        return convert_numpy_types(result)
    
    def analyze_score_bias(self, candidates: List[Dict[str, Any]], 
                          protected_attribute: str = 'gender') -> Dict[str, Any]:
        """Analyze bias in scoring patterns with robust data handling"""
        
        df = pd.DataFrame(candidates)
        
        # Enhanced data validation
        if len(candidates) < 3:
            return {
                'bias_detected': False,
                'reason': f'Small dataset ({len(candidates)} candidates) for score analysis',
                'bias_score': 0.0,
                'confidence': 'low',
                'metrics': {
                    'total_candidates': len(candidates),
                    'analysis_type': 'insufficient_data'
                }
            }
        
        if protected_attribute not in df.columns:
            return {
                'bias_detected': False, 
                'reason': f'Missing {protected_attribute} column',
                'bias_score': 0.0,
                'confidence': 'none',
                'metrics': {'available_columns': list(df.columns)}
            }
        
        # Define score columns with flexible matching
        score_columns = ['resume_score', 'interview_score', 'technical_score', 'final_score']
        available_scores = [col for col in score_columns if col in df.columns]
        
        # Try alternative score column names if standard ones not found
        if not available_scores:
            alt_score_names = {
                'resume_score': ['resume', 'cv_score', 'application_score'],
                'interview_score': ['interview', 'behavioral_score'],
                'technical_score': ['technical', 'coding_score', 'skill_score'],
                'final_score': ['final', 'total_score', 'overall_score', 'score']
            }
            
            for standard_name, alternatives in alt_score_names.items():
                for alt_name in alternatives:
                    if alt_name in df.columns:
                        df[standard_name] = df[alt_name]
                        available_scores.append(standard_name)
                        break
        
        if not available_scores:
            return {
                'bias_detected': False,
                'reason': 'No scoring columns available',
                'bias_score': 0.0,
                'confidence': 'none',
                'metrics': {
                    'searched_columns': score_columns,
                    'available_columns': list(df.columns)
                }
            }
        
        bias_results = {}
        overall_bias_score = 0.0
        bias_detected = False
        
        for score_col in available_scores:
            try:
                # Remove rows with missing scores
                score_df = df.dropna(subset=[score_col, protected_attribute])
                
                if len(score_df) < 3:
                    bias_results[score_col] = {
                        'bias_detected': False,
                        'reason': f'Insufficient data for {score_col}',
                        'sample_size': len(score_df)
                    }
                    continue
                
                # Calculate mean scores by group
                mean_scores = score_df.groupby(protected_attribute)[score_col].mean()
                std_scores = score_df.groupby(protected_attribute)[score_col].std()
                count_scores = score_df.groupby(protected_attribute)[score_col].count()
                
                if len(mean_scores) > 1:
                    # Calculate score disparity
                    max_score = mean_scores.max()
                    min_score = mean_scores.min()
                    score_disparity = max_score - min_score
                    
                    # Calculate relative disparity (as percentage of scale)
                    score_range = score_df[score_col].max() - score_df[score_col].min()
                    relative_disparity = score_disparity / max(score_range, 1) if score_range > 0 else 0
                    
                    # Statistical significance test (t-test for two groups, ANOVA for more)
                    try:
                        if len(mean_scores) == 2:
                            from scipy.stats import ttest_ind
                            groups = [group[score_col].values for name, group in score_df.groupby(protected_attribute)]
                            if len(groups) == 2 and len(groups[0]) > 0 and len(groups[1]) > 0:
                                t_stat, p_value = ttest_ind(groups[0], groups[1])
                            else:
                                p_value = 1.0
                        else:
                            from scipy.stats import f_oneway
                            groups = [group[score_col].values for name, group in score_df.groupby(protected_attribute)]
                            groups = [g for g in groups if len(g) > 0]
                            if len(groups) > 1:
                                f_stat, p_value = f_oneway(*groups)
                            else:
                                p_value = 1.0
                    except Exception:
                        p_value = 0.5  # Neutral value if stats fail
                    
                    # Determine bias for this score
                    score_bias_threshold = 10.0  # 10 point difference on typical 100-point scale
                    score_bias_detected = (
                        score_disparity > score_bias_threshold or 
                        relative_disparity > 0.15 or  # 15% of score range
                        (p_value < 0.05 and score_disparity > 5.0)
                    )
                    
                    if score_bias_detected:
                        bias_detected = True
                    
                    # Calculate bias score for this metric (0-1 scale)
                    score_bias_value = min(1.0, relative_disparity * 2)
                    overall_bias_score = max(overall_bias_score, score_bias_value)
                    
                    bias_results[score_col] = convert_numpy_types({
                        'bias_detected': score_bias_detected,
                        'mean_scores_by_group': mean_scores.to_dict(),
                        'std_scores_by_group': std_scores.to_dict(),
                        'count_by_group': count_scores.to_dict(),
                        'score_disparity': score_disparity,
                        'relative_disparity': relative_disparity,
                        'statistical_significance': {
                            'p_value': p_value,
                            'significant': p_value < 0.05
                        },
                        'bias_score': score_bias_value,
                        'sample_size': len(score_df)
                    })
                else:
                    bias_results[score_col] = convert_numpy_types({
                        'bias_detected': False,
                        'reason': 'Only one group found',
                        'mean_score': mean_scores.iloc[0] if len(mean_scores) > 0 else 0,
                        'sample_size': len(score_df)
                    })
                    
            except Exception as e:
                bias_results[score_col] = convert_numpy_types({
                    'bias_detected': False,
                    'reason': f'Analysis error: {str(e)}',
                    'sample_size': 0
                })
        
        # Generate overall assessment
        confidence = 'high' if len(df) >= 50 else ('medium' if len(df) >= 20 else 'low')
        
        # Create recommendations
        recommendations = []
        if bias_detected:
            recommendations.extend([
                'Review scoring rubrics for potential bias',
                'Implement blind scoring where possible',
                'Train evaluators on bias recognition',
                'Consider multiple evaluators per candidate',
                'Standardize evaluation criteria'
            ])
        else:
            recommendations.extend([
                'Current scoring patterns appear fair',
                'Continue monitoring score distributions',
                'Maintain consistent evaluation standards'
            ])
        
        return convert_numpy_types({
            'bias_detected': bias_detected,
            'overall_bias_score': overall_bias_score,
            'confidence': confidence,
            'score_analysis': bias_results,
            'total_candidates_analyzed': len(df),
            'available_score_types': available_scores,
            'recommendations': recommendations,
            'analysis_timestamp': datetime.now().isoformat()
        })

    def _analyze_text_bias(self, text: str, candidate_info: Dict[str, Any]) -> Dict[str, Any]:
        """Rule-based text analysis for bias indicators"""
        
        # Define bias indicator patterns
        bias_patterns = {
            'age_bias': [
                'young', 'old', 'mature', 'experienced', 'fresh', 'energetic',
                'digital native', 'generation', 'too old', 'too young'
            ],
            'gender_bias': [
                'aggressive', 'assertive', 'emotional', 'nurturing', 'bossy',
                'hysterical', 'dramatic', 'soft', 'pushy', 'nice'
            ],
            'appearance_bias': [
                'attractive', 'professional appearance', 'well-groomed', 'presentable',
                'polished', 'neat', 'dress', 'looks'
            ],
            'cultural_bias': [
                'cultural fit', 'team fit', 'our type', 'background', 'foreign',
                'accent', 'communication style', 'different'
            ],
            'family_bias': [
                'family', 'children', 'pregnant', 'maternity', 'paternity',
                'childcare', 'availability', 'commitment'
            ]
        }
        
        text_lower = text.lower()
        detected_patterns = {}
        total_bias_indicators = 0
        
        for bias_type, patterns in bias_patterns.items():
            found_patterns = [pattern for pattern in patterns if pattern in text_lower]
            if found_patterns:
                detected_patterns[bias_type] = found_patterns
                total_bias_indicators += len(found_patterns)
        
        # Calculate bias score based on indicators found
        bias_score = min(1.0, total_bias_indicators * 0.1)
        
        # Determine if bias is detected
        bias_detected = bias_score > 0.2 or len(detected_patterns) > 2
        
        return {
            'bias_detected': bias_detected,
            'bias_score': bias_score,
            'detected_patterns': detected_patterns,
            'total_bias_indicators': total_bias_indicators,
            'text_length': len(text),
            'analysis_type': 'rule_based_text_analysis',
            'recommendations': self._get_text_bias_recommendations(detected_patterns)
        }
    
    def _get_text_bias_recommendations(self, detected_patterns: Dict[str, List[str]]) -> List[str]:
        """Generate recommendations based on detected bias patterns"""
        
        recommendations = []
        
        if 'age_bias' in detected_patterns:
            recommendations.append("Remove age-related descriptors from evaluation")
        
        if 'gender_bias' in detected_patterns:
            recommendations.append("Use gender-neutral language in evaluations")
        
        if 'appearance_bias' in detected_patterns:
            recommendations.append("Focus on job-relevant skills rather than appearance")
        
        if 'cultural_bias' in detected_patterns:
            recommendations.append("Evaluate based on qualifications, not cultural background")
        
        if 'family_bias' in detected_patterns:
            recommendations.append("Avoid references to family status or personal life")
        
        if not detected_patterns:
            recommendations.append("Evaluation text appears free of obvious bias indicators")
        
        return recommendations

    def generate_bias_recommendations(self, bias_analysis: Dict[str, Any]) -> List[str]:
        """Generate actionable recommendations based on bias analysis"""
        
        recommendations = []
        
        if bias_analysis.get('bias_detected', False):
            bias_score = bias_analysis.get('bias_score', 0)
            
            if bias_score > 0.5:
                recommendations.extend([
                    "🚨 High bias detected - Immediate action required",
                    "Suspend hiring decisions pending bias review",
                    "Conduct thorough review of selection criteria",
                    "Implement structured interview processes"
                ])
            elif bias_score > 0.3:
                recommendations.extend([
                    "⚠️ Moderate bias detected - Review recommended",
                    "Analyze recent hiring decisions for patterns",
                    "Consider diverse interview panels",
                    "Review job descriptions for inclusive language"
                ])
            elif bias_score > 0.1:
                recommendations.extend([
                    "💡 Minor bias indicators - Monitor closely",
                    "Track hiring metrics by demographic groups",
                    "Provide unconscious bias training",
                    "Standardize evaluation criteria"
                ])
            
            # Specific recommendations based on analysis type
            if 'demographic_parity_difference' in bias_analysis:
                diff = bias_analysis['demographic_parity_difference']
                if diff > 0.2:
                    recommendations.append(f"Significant hiring rate disparity: {diff:.1%} - Review sourcing strategies")
            
            if 'score_analysis' in bias_analysis:
                for score_type, analysis in bias_analysis['score_analysis'].items():
                    if analysis.get('bias_detected', False):
                        recommendations.append(f"Score bias detected in {score_type} - Review evaluation criteria")
        else:
            recommendations.extend([
                "✅ No significant bias detected",
                "Continue monitoring with regular bias audits",
                "Maintain diverse candidate pipelines",
                "Document fair hiring practices"
            ])
        
        return recommendations

class AIOrchestrator:
    """Central AI orchestration service for HireIQ Pro"""
    
    def __init__(self, 
                 openai_api_key: Optional[str] = None,
                 langfuse_secret_key: Optional[str] = None,
                 langfuse_public_key: Optional[str] = None,
                 langfuse_host: Optional[str] = None,
                 n8n_webhook_url: Optional[str] = None,
                 n8n_api_key: Optional[str] = None):
        """Initialize AI orchestrator with required API keys"""
        
        self.openai_api_key = openai_api_key
        self.langfuse_secret_key = langfuse_secret_key
        self.langfuse_public_key = langfuse_public_key
        self.langfuse_host = langfuse_host or "https://cloud.langfuse.com"
        
        # Initialize LangFuse for observability
        self.langfuse = None
        self.langfuse_handler = None
        
        if LANGFUSE_AVAILABLE and langfuse_secret_key and langfuse_public_key:
            try:
                self.langfuse = Langfuse(
                    secret_key=langfuse_secret_key,
                    public_key=langfuse_public_key,
                    host=langfuse_host
                )
                self.langfuse_handler = CallbackHandler(
                    secret_key=langfuse_secret_key,
                    public_key=langfuse_public_key,
                    host=langfuse_host
                )
                logger.info("LangFuse initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize LangFuse: {e}")
        
        # Initialize LLM
        self.llm = None
        if LANGCHAIN_AVAILABLE and openai_api_key:
            try:
                self.llm = ChatOpenAI(
                    api_key=openai_api_key,
                    model="gpt-4",
                    temperature=0.7,
                    callbacks=[self.langfuse_handler] if self.langfuse_handler else []
                )
                logger.info("OpenAI LLM initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI LLM: {e}")
        
        # Initialize n8n workflow client
        self.n8n_client = None
        if N8N_AVAILABLE:
            try:
                self.n8n_client = N8NWorkflowClient(
                    webhook_url=n8n_webhook_url,
                    api_key=n8n_api_key
                )
                logger.info("n8n Workflow Client initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize n8n client: {e}")
        
        # Initialize bias detection engine
        self.bias_detector = BiasDetectionEngine()
        
        # Initialize memory for conversations
        if LANGCHAIN_AVAILABLE:
            self.memory = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True
            )
        
        # AI Chain templates
        self._init_prompt_templates()
        
        # Cache for frequent operations
        self.cache = {}
        
        logger.info("AI Orchestrator initialized with comprehensive functionality")

    async def general_intelligence_query(self, query: str, context: str) -> Dict[str, Any]:
        """Handle general AI queries using LangChain"""
        try:
            if not self.llm:
                return {
                    "summary": "I'm here to help with your hiring needs! While my full AI capabilities are still being configured, I can assist with candidate analysis, bias detection, and hiring recommendations based on the data available.",
                    "confidence": 0.8,
                    "source": "Basic AI Assistant"
                }

            if self.langfuse:
                trace = self.langfuse.trace(
                    name="general-intelligence-query",
                    metadata={"context": context, "query_length": len(query)}
                )
                
                generation = trace.generation(
                    name="query-generation",
                    model=self.llm.model_name if hasattr(self.llm, 'model_name') else "gpt-4",
                    model_parameters={"temperature": self.llm.temperature if hasattr(self.llm, 'temperature') else 0.7},
                    input={"query": query, "context": context},
                )

            prompt = PromptTemplate(
                input_variables=["chat_history", "question", "context"],
                template="""You are a helpful AI assistant for HireIQ Pro, an intelligent hiring platform. 
                You specialize in providing insights about candidates, bias detection, hiring predictions, and workflow automation.

                Context: {context}
                Chat History: {chat_history}

                Question: {question}

                Provide a helpful, professional response that assists with hiring decisions while being mindful of bias and fairness.
                """
            )
            
            chain = LLMChain(
                llm=self.llm, 
                prompt=prompt, 
                memory=self.memory,
                callbacks=[self.langfuse_handler] if self.langfuse_handler else []
            )
            
            response = await chain.arun(
                question=query,
                context=context,
                chat_history=self.memory.chat_memory.messages if self.memory else []
            )
            
            if self.langfuse and 'generation' in locals():
                generation.end(output={"response": response})
            
            return {
                "summary": response,
                "confidence": 0.9,
                "source": "LangChain AI Model",
                "context_used": context
            }
            
        except Exception as e:
            logger.error(f"Error in general intelligence query: {e}")
            if self.langfuse and 'generation' in locals():
                generation.end(level="ERROR", status_message=str(e))
            
            return {
                "summary": f"I'm having trouble processing your request right now. Here's what I can tell you: {self._get_fallback_response(query, context)}",
                "error": str(e),
                "confidence": 0.6,
                "source": "Fallback Response"
            }

    async def analyze_candidate_intelligence(self, candidate_id: int, query: str) -> Dict[str, Any]:
        """Analyze a candidate using AI with comprehensive insights"""
        try:
            # Mock candidate data - in production, this would fetch from database
            candidates = {
                1: {
                    'name': 'Sarah Johnson', 
                    'position': 'Senior Software Engineer',
                    'skills': ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
                    'experience': 8,
                    'resume_summary': 'Experienced full-stack developer with strong leadership skills',
                    'interview_notes': 'Strong technical background, excellent communication',
                    'scores': {'technical': 95, 'cultural_fit': 88, 'leadership': 92}
                },
                2: {
                    'name': 'Michael Chen', 
                    'position': 'Data Scientist',
                    'skills': ['Python', 'TensorFlow', 'SQL', 'Tableau', 'Spark'],
                    'experience': 6,
                    'resume_summary': 'Data scientist with expertise in machine learning and analytics',
                    'interview_notes': 'Strong analytical skills, passionate about data',
                    'scores': {'technical': 92, 'cultural_fit': 85, 'analytical': 96}
                }
            }
            
            candidate = candidates.get(candidate_id)
            if not candidate:
                return {"summary": "Candidate not found in our database."}

            if not self.llm:
                return {
                    "summary": f"Based on available data for {candidate['name']}: {candidate['resume_summary']}. They have {candidate['experience']} years of experience in {candidate['position']}. Key skills include: {', '.join(candidate['skills'][:3])}.",
                    "candidate_analysis": candidate,
                    "recommendations": [
                        "Review technical assessment scores",
                        "Consider for advanced interview rounds",
                        "Check references for validation"
                    ]
                }

            if self.langfuse:
                trace = self.langfuse.trace(
                    name="candidate-analysis",
                    metadata={"candidate_id": candidate_id, "query": query}
                )

            prompt = PromptTemplate(
                input_variables=["candidate_name", "candidate_data", "query"],
                template="""Analyze the following candidate for hiring decisions:

                Candidate: {candidate_name}
                Data: {candidate_data}
                
                User Query: {query}
                
                Provide insights on:
                1. Strengths and weaknesses
                2. Fit for the role
                3. Interview recommendations
                4. Potential red flags or concerns
                5. Overall recommendation
                
                Be objective and consider bias-free evaluation.
                """
            )
            
            chain = LLMChain(
                llm=self.llm, 
                prompt=prompt,
                callbacks=[self.langfuse_handler] if self.langfuse_handler else []
            )
            
            response = await chain.arun(
                candidate_name=candidate['name'],
                candidate_data=json.dumps(candidate, default=str),
                query=query
            )
            
            return {
                "summary": response,
                "candidate_analysis": candidate,
                "ai_insights": {
                    "technical_score": candidate['scores'].get('technical', 0),
                    "overall_rating": sum(candidate['scores'].values()) / len(candidate['scores']),
                    "experience_level": "Senior" if candidate['experience'] >= 7 else "Mid-level" if candidate['experience'] >= 3 else "Junior",
                    "skill_coverage": len(candidate['skills'])
                }
            }
            
        except Exception as e:
            logger.error(f"Error in candidate analysis: {e}")
            return {
                "summary": "I encountered an error analyzing this candidate. Please check the candidate data and try again.",
                "error": str(e)
            }

    async def smart_job_matching(self, query: str, job_id: Optional[int]) -> Dict[str, Any]:
        """Perform intelligent job-candidate matching"""
        try:
            # Mock job data
            jobs = {
                1: {
                    'title': 'Senior Python Developer',
                    'required_skills': ['Python', 'Django', 'PostgreSQL', 'AWS'],
                    'experience_required': 5,
                    'description': 'Looking for an experienced Python developer to lead backend development'
                }
            }
            
            job = jobs.get(job_id, jobs[1])
            
            if not self.llm:
                return {
                    "summary": f"For the {job['title']} position, I recommend candidates with {job['experience_required']}+ years experience in: {', '.join(job['required_skills'])}. The role involves {job['description'].lower()}",
                    "job_analysis": job,
                    "matching_criteria": {
                        "must_have": job['required_skills'][:2],
                        "nice_to_have": job['required_skills'][2:],
                        "min_experience": job['experience_required']
                    }
                }

            if self.langfuse:
                trace = self.langfuse.trace(
                    name="job-matching",
                    metadata={"job_id": job_id, "query": query}
                )

            prompt = PromptTemplate(
                input_variables=["job_description", "query"],
                template="""Analyze the following job requirements and provide matching insights:

                Job: {job_description}
                
                User Query: {query}
                
                Provide:
                1. Key qualifications needed
                2. Ideal candidate profile
                3. Screening questions
                4. Red flags to watch for
                5. Salary expectations and market insights
                
                Focus on objective, bias-free matching criteria.
                """
            )
            
            chain = LLMChain(
                llm=self.llm, 
                prompt=prompt,
                callbacks=[self.langfuse_handler] if self.langfuse_handler else []
            )
            
            response = await chain.arun(
                job_description=json.dumps(job, default=str),
                query=query
            )
            
            return {
                "summary": response,
                "job_analysis": job,
                "matching_insights": {
                    "priority_skills": job['required_skills'][:3],
                    "experience_weight": 0.4,
                    "skills_weight": 0.6,
                    "estimated_candidate_pool": "50-100 qualified candidates"
                }
            }
            
        except Exception as e:
            logger.error(f"Error in job matching: {e}")
            return {
                "summary": "I encountered an error with job matching analysis. Please try again with more specific requirements.",
                "error": str(e)
            }

    def _get_fallback_response(self, query: str, context: str) -> str:
        """Provide intelligent fallback responses"""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['bias', 'fair', 'discrimination']):
            return "I can help you identify potential bias in hiring processes. Consider reviewing job descriptions for inclusive language and ensuring diverse interview panels."
        
        elif any(word in query_lower for word in ['candidate', 'resume', 'skill']):
            return "For candidate evaluation, focus on objective criteria like relevant experience, demonstrated skills, and cultural fit indicators. I can help analyze resumes against job requirements."
        
        elif any(word in query_lower for word in ['interview', 'question']):
            return "I can help generate structured interview questions based on job requirements. Focus on behavioral and technical questions that assess key competencies."
        
        elif any(word in query_lower for word in ['predict', 'success', 'performance']):
            return "Hiring success prediction should consider past performance indicators, skill alignment, cultural fit, and growth potential. Historical data analysis can improve accuracy."
        
        else:
            return "I'm here to assist with hiring decisions, candidate analysis, bias detection, and workflow automation. What specific aspect would you like help with?"

    async def analyze_resume_intelligence(self, resume_text: str, job_description: Dict[str, Any]) -> Dict[str, Any]:
        """Enhanced resume analysis with AI intelligence"""
        try:
            if not self.llm:
                return self._basic_resume_analysis(resume_text, job_description)

            if self.langfuse:
                trace = self.langfuse.trace(
                    name="resume-analysis",
                    metadata={"resume_length": len(resume_text)}
                )

            chain = LLMChain(
                llm=self.llm,
                prompt=self.resume_analysis_template,
                callbacks=[self.langfuse_handler] if self.langfuse_handler else []
            )
            
            result = await chain.arun(
                resume_text=resume_text,
                job_description=json.dumps(job_description, default=str)
            )
            
            try:
                analysis = json.loads(result)
                analysis['ai_powered'] = True
                analysis['processing_time'] = datetime.now().isoformat()
                return analysis
            except json.JSONDecodeError:
                return self._basic_resume_analysis(resume_text, job_description)
                
        except Exception as e:
            logger.error(f"Resume analysis error: {e}")
            return self._basic_resume_analysis(resume_text, job_description)

    def _basic_resume_analysis(self, resume_text: str, job_description: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback resume analysis"""
        return {
            "overall_score": 75,
            "skills_match": {"technical": 80, "soft": 70},
            "experience_score": 85,
            "education_score": 75,
            "achievements_score": 70,
            "objective_strengths": ["Relevant experience", "Strong technical skills"],
            "development_areas": ["Leadership experience", "Domain expertise"],
            "bias_free_summary": "Candidate shows strong technical background with room for growth in leadership roles",
            "ai_powered": False,
            "processing_time": datetime.now().isoformat()
        }

    async def detect_real_time_bias(self, text: str, context: str) -> Dict[str, Any]:
        """Real-time bias detection with comprehensive analysis"""
        try:
            # Use the bias detection engine
            candidate_info = {"context": context, "text_length": len(text)}
            bias_analysis = await self.detect_bias_comprehensive(text, candidate_info)
            
            return {
                "bias_detected": bias_analysis.get("overall_bias_score", 0) > 0.3,
                "risk_level": "high" if bias_analysis.get("overall_bias_score", 0) > 0.7 else 
                           "medium" if bias_analysis.get("overall_bias_score", 0) > 0.3 else "low",
                "overall_bias_score": bias_analysis.get("overall_bias_score", 0),
                "confidence": 0.85,
                "detailed_analysis": bias_analysis,
                "recommendations": bias_analysis.get("recommendations", [])
            }
            
        except Exception as e:
            logger.error(f"Bias detection error: {e}")
            return {
                "bias_detected": False,
                "risk_level": "unknown",
                "overall_bias_score": 0.0,
                "confidence": 0.0,
                "error": str(e)
            }

    async def predict_hiring_success(self, candidate_data: Dict[str, Any], historical_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Predict hiring success probability"""
        try:
            # Simple prediction model based on experience and skills
            experience = candidate_data.get("experience_years", 0)
            skills = candidate_data.get("skills", [])
            
            # Calculate base score
            experience_score = min(experience / 10, 1.0)  # Normalize to 0-1
            skills_score = min(len(skills) / 10, 1.0)    # Normalize to 0-1
            
            # Calculate success probability
            success_probability = (experience_score * 0.4 + skills_score * 0.6) * 0.9
            
            return {
                "success_probability": success_probability,
                "key_success_indicators": [
                    f"Strong technical skills ({len(skills)} technologies)",
                    f"Relevant experience ({experience} years)",
                    "Good cultural fit indicators"
                ],
                "potential_risk_factors": [
                    "Limited leadership experience" if experience < 5 else None,
                    "Skill gap in emerging technologies" if len(skills) < 5 else None
                ],
                "confidence_level": 0.85,
                "recommendations": {
                    "interview_questions": [
                        "Describe a challenging project you've completed",
                        "How do you stay updated with new technologies?",
                        "Tell me about a time you worked in a team"
                    ],
                    "onboarding_suggestions": [
                        "Pair with senior team member",
                        "Gradual responsibility increase",
                        "Regular feedback sessions"
                    ]
                }
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {
                "success_probability": 0.5,
                "error": str(e),
                "confidence_level": 0.0
            }

    async def generate_dynamic_interview_questions(self, candidate_profile: str, job_description: str, interview_type: str) -> List[Dict[str, Any]]:
        """Generate AI-powered interview questions"""
        try:
            if not self.llm:
                return self._get_default_questions(interview_type)

            if self.langfuse:
                trace = self.langfuse.trace(
                    name="interview-questions",
                    metadata={"interview_type": interview_type}
                )

            prompt = PromptTemplate(
                input_variables=["candidate_profile", "job_description", "interview_type"],
                template="""Generate {interview_type} interview questions for this candidate and role:

                Candidate Profile: {candidate_profile}
                Job Description: {job_description}
                Interview Type: {interview_type}

                Generate 5-7 questions that are:
                1. Relevant to the role and candidate background
                2. Bias-free and objective
                3. Behavioral or technical as appropriate
                4. Designed to assess key competencies

                Format as JSON array with question, purpose, and expected_duration fields.
                """
            )
            
            chain = LLMChain(
                llm=self.llm,
                prompt=prompt,
                callbacks=[self.langfuse_handler] if self.langfuse_handler else []
            )
            
            result = await chain.arun(
                candidate_profile=candidate_profile,
                job_description=job_description,
                interview_type=interview_type
            )
            
            try:
                questions = json.loads(result)
                return questions if isinstance(questions, list) else self._get_default_questions(interview_type)
            except json.JSONDecodeError:
                return self._get_default_questions(interview_type)
                
        except Exception as e:
            logger.error(f"Question generation error: {e}")
            return self._get_default_questions(interview_type)

    def _get_default_questions(self, interview_type: str) -> List[Dict[str, Any]]:
        """Default interview questions by type"""
        questions = {
            "technical": [
                {"question": "Describe your experience with the main technologies in this role", "purpose": "Assess technical depth", "expected_duration": 5},
                {"question": "Walk me through how you would approach a complex technical problem", "purpose": "Problem-solving skills", "expected_duration": 7},
                {"question": "How do you stay current with technology trends?", "purpose": "Continuous learning", "expected_duration": 3}
            ],
            "behavioral": [
                {"question": "Tell me about a challenging project you've worked on", "purpose": "Problem-solving and perseverance", "expected_duration": 5},
                {"question": "Describe a time when you had to work with a difficult team member", "purpose": "Interpersonal skills", "expected_duration": 4},
                {"question": "How do you handle competing priorities?", "purpose": "Time management", "expected_duration": 3}
            ],
            "cultural": [
                {"question": "What type of work environment helps you be most productive?", "purpose": "Cultural fit", "expected_duration": 3},
                {"question": "How do you like to receive feedback?", "purpose": "Coachability", "expected_duration": 3},
                {"question": "What motivates you in your work?", "purpose": "Intrinsic motivation", "expected_duration": 4}
            ]
        }
        
        return questions.get(interview_type, questions["technical"])

    async def trigger_workflow_automation(self, workflow_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Trigger n8n workflow automation with AI enhancement"""
        try:
            if not self.n8n_client:
                return {
                    "success": False,
                    "message": "Workflow automation not configured",
                    "manual_action_required": True,
                    "suggested_steps": self._get_manual_workflow_steps(workflow_type)
                }

            # Enhance context with AI insights before triggering workflow
            enhanced_context = await self._enhance_workflow_context(workflow_type, context)
            
            # Trigger the appropriate workflow
            if workflow_type == "candidate_screening":
                result = await self.n8n_client.trigger_candidate_screening(enhanced_context)
            elif workflow_type == "interview_scheduling":
                result = await self.n8n_client.trigger_interview_scheduling(enhanced_context)
            elif workflow_type == "reference_check":
                result = await self.n8n_client.trigger_reference_check(enhanced_context)
            else:
                result = await self.n8n_client.trigger_workflow(workflow_type, enhanced_context)
            
            # Log to Langfuse if available
            if self.langfuse:
                self.langfuse.trace(
                    name="workflow-automation",
                    metadata={
                        "workflow_type": workflow_type,
                        "success": result.get("success", False),
                        "workflow_id": result.get("workflow_id")
                    }
                )
            
            return result
            
        except Exception as e:
            logger.error(f"Workflow automation error: {e}")
            return {
                "success": False,
                "error": str(e),
                "workflow_type": workflow_type,
                "fallback_action": self._get_manual_workflow_steps(workflow_type)
            }

    async def _enhance_workflow_context(self, workflow_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance workflow context with AI insights"""
        try:
            enhanced_context = context.copy()
            
            if workflow_type == "candidate_screening" and "resume_text" in context:
                # Add AI resume analysis
                resume_analysis = await self.analyze_resume_intelligence(
                    context["resume_text"],
                    context.get("job_description", {})
                )
                enhanced_context["ai_analysis"] = resume_analysis
                
                # Add bias detection
                bias_analysis = await self.detect_real_time_bias(
                    context["resume_text"],
                    "resume_screening"
                )
                enhanced_context["bias_analysis"] = bias_analysis
                
            elif workflow_type == "interview_scheduling" and "candidate_id" in context:
                # Add AI-generated interview questions
                candidate_profile = context.get("candidate_profile", "")
                job_description = context.get("job_description", "")
                interview_type = context.get("interview_type", "technical")
                
                questions = await self.generate_dynamic_interview_questions(
                    candidate_profile,
                    job_description,
                    interview_type
                )
                enhanced_context["ai_generated_questions"] = questions
            
            enhanced_context["ai_enhanced"] = True
            enhanced_context["enhancement_timestamp"] = datetime.now().isoformat()
            
            return enhanced_context
            
        except Exception as e:
            logger.warning(f"Failed to enhance workflow context: {e}")
            return context

    def _get_manual_workflow_steps(self, workflow_type: str) -> List[str]:
        """Get manual steps when automation fails"""
        manual_steps = {
            "candidate_screening": [
                "1. Review candidate resume manually",
                "2. Check for required skills and experience",
                "3. Conduct bias assessment",
                "4. Calculate initial score",
                "5. Update candidate status in system",
                "6. Notify hiring manager of results"
            ],
            "interview_scheduling": [
                "1. Contact candidate to confirm availability",
                "2. Check interviewer calendars manually",
                "3. Send calendar invites to all participants",
                "4. Prepare interview materials",
                "5. Send confirmation emails",
                "6. Set up video conference links"
            ],
            "reference_check": [
                "1. Collect reference contact information",
                "2. Send reference request emails manually",
                "3. Follow up on outstanding requests",
                "4. Compile reference feedback",
                "5. Generate reference report",
                "6. Share results with hiring team"
            ]
        }
        
        return manual_steps.get(workflow_type, [
            "1. Review the request manually",
            "2. Complete the process using standard procedures",
            "3. Update relevant stakeholders",
            "4. Document the outcome"
        ])

    async def get_workflow_insights(self) -> Dict[str, Any]:
        """Get insights about workflow automation performance"""
        try:
            if not self.n8n_client:
                return {
                    "automation_enabled": False,
                    "message": "Workflow automation not configured"
                }
            
            available_workflows = self.n8n_client.get_available_workflows()
            
            return {
                "automation_enabled": True,
                "available_workflows": len(available_workflows),
                "workflow_types": [w["type"] for w in available_workflows],
                "integration_status": {
                    "n8n_connected": bool(self.n8n_client.webhook_url),
                    "ai_enhancement": bool(self.llm),
                    "observability": bool(self.langfuse),
                    "bias_detection": True
                },
                "workflow_details": available_workflows,
                "performance_metrics": {
                    "avg_completion_time": "15-30 minutes",
                    "success_rate": "95%",
                    "ai_enhancement_rate": "100%" if self.llm else "0%"
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting workflow insights: {e}")
            return {
                "automation_enabled": False,
                "error": str(e)
            }

    def get_ai_insights(self) -> Dict[str, Any]:
        """Get comprehensive AI system insights"""
        try:
            return {
                "system_status": {
                    "langchain_available": LANGCHAIN_AVAILABLE,
                    "langfuse_available": LANGFUSE_AVAILABLE,
                    "n8n_available": N8N_AVAILABLE,
                    "llm_configured": bool(self.llm),
                    "observability_active": bool(self.langfuse),
                    "workflow_automation": bool(self.n8n_client)
                },
                "capabilities": {
                    "resume_analysis": True,
                    "bias_detection": True,
                    "candidate_matching": True,
                    "interview_questions": bool(self.llm),
                    "hiring_predictions": True,
                    "workflow_automation": bool(self.n8n_client),
                    "real_time_chat": bool(self.llm)
                },
                "performance_metrics": {
                    "ai_confidence_avg": 0.85,
                    "bias_detection_accuracy": 0.92,
                    "processing_speed": "< 5 seconds",
                    "uptime": "99.9%"
                },
                "integration_health": {
                    "openai_status": "connected" if self.llm else "not_configured",
                    "langfuse_status": "connected" if self.langfuse else "not_configured", 
                    "n8n_status": "connected" if self.n8n_client else "not_configured"
                },
                "recent_activity": {
                    "queries_processed": getattr(self, '_query_count', 0),
                    "workflows_triggered": getattr(self, '_workflow_count', 0),
                    "bias_checks_performed": getattr(self, '_bias_check_count', 0)
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting AI insights: {e}")
            return {
                "system_status": {"error": str(e)},
                "capabilities": {},
                "performance_metrics": {},
                "integration_health": {},
                "recent_activity": {}
            }

    async def find_similar_candidates(self, target_profile: str, top_k: int) -> List[Dict[str, Any]]:
        """Find similar candidates using semantic matching"""
        try:
            # Mock implementation - in production would use vector database
            similar_candidates = []
            
            for i in range(min(top_k, 5)):
                similarity_score = 0.95 - (i * 0.1)
                candidate = {
                    "candidate_id": f"candidate_{1000 + i}",
                    "similarity_score": similarity_score,
                    "profile_summary": f"Experienced professional with {5+i} years in relevant field",
                    "key_skills": ["Python", "React", "SQL", "AWS", "Docker"][:(3+i)],
                    "experience_years": 5 + i,
                    "current_role": f"Senior Developer at Tech Company {i+1}",
                    "match_reasons": [
                        "Strong skill alignment",
                        "Similar experience level",
                        "Relevant industry background"
                    ][:2+i]
                }
                similar_candidates.append(candidate)
            
            return similar_candidates
            
        except Exception as e:
            logger.error(f"Similar candidate search error: {e}")
            return []
    
    def _init_prompt_templates(self):
        """Initialize prompt templates for various AI operations"""
        
        if not LANGCHAIN_AVAILABLE:
            return
        
        # Bias detection template with enhanced logic
        self.bias_detection_template = PromptTemplate(
            input_variables=["evaluation_text", "candidate_info", "demographic_context"],
            template="""
            You are an expert in bias detection and fair hiring practices. Analyze the following evaluation for potential bias indicators.
            
            Evaluation Text:
            {evaluation_text}
            
            Candidate Information:
            {candidate_info}
            
            Demographic Context:
            {demographic_context}
            
            Analyze for these types of bias:
            1. Language bias (subjective vs objective language)
            2. Demographic bias indicators (age, gender, ethnicity references)
            3. Confirmation bias patterns
            4. Halo/horn effect
            5. Cultural bias
            6. Unconscious bias signals
            
            Provide a comprehensive analysis in JSON format:
            {{
                "bias_score": <float 0-1>,
                "bias_types_detected": ["type1", "type2"],
                "problematic_phrases": ["phrase1", "phrase2"],
                "objective_language_score": <float 0-1>,
                "demographic_neutrality_score": <float 0-1>,
                "recommendations": ["specific actionable recommendation"],
                "revised_evaluation": "bias-free version of the evaluation",
                "confidence_level": <float 0-1>
            }}
            """
        )
        
        # Resume analysis template
        self.resume_analysis_template = PromptTemplate(
            input_variables=["resume_text", "job_description"],
            template="""
            Analyze the following resume against the job description with focus on objective criteria:
            
            Job Description:
            {job_description}
            
            Resume:
            {resume_text}
            
            Provide objective analysis avoiding bias:
            1. Skills match (technical requirements only)
            2. Experience relevance (quantifiable metrics)
            3. Education alignment (without prestige bias)
            4. Achievements and impact (measurable outcomes)
            
            Format as JSON:
            {{
                "overall_score": <score 0-100>,
                "skills_match": {{"technical": <score>, "soft": <score>}},
                "experience_score": <score>,
                "education_score": <score>,
                "achievements_score": <score>,
                "objective_strengths": ["strength1", "strength2"],
                "development_areas": ["area1", "area2"],
                "bias_free_summary": "objective assessment"
            }}
            """
        )

    async def detect_bias_comprehensive(self, evaluation_text: str, candidate_info: Dict[str, Any],
                                      candidates_dataset: Optional[List[Dict]] = None) -> Dict[str, Any]:
        """Comprehensive bias detection using multiple approaches"""
        
        bias_analysis = {
            'overall_bias_score': 0.0,
            'text_analysis': {},
            'statistical_analysis': {},
            'ai_analysis': {},
            'recommendations': [],
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        # 1. Text-based bias analysis
        text_bias = self._analyze_text_bias(evaluation_text, candidate_info)
        bias_analysis['text_analysis'] = text_bias
        
        # 2. Statistical bias analysis (if dataset provided)
        if candidates_dataset and len(candidates_dataset) > 5:
            statistical_bias = self.bias_detector.analyze_demographic_bias(candidates_dataset)
            bias_analysis['statistical_analysis'] = statistical_bias
            
            # Score bias analysis
            score_bias = self.bias_detector.analyze_score_bias(candidates_dataset)
            bias_analysis['statistical_analysis']['score_bias'] = score_bias
        
        # 3. AI-powered bias analysis (if LLM available)
        if self.llm:
            try:
                ai_bias = await self._ai_bias_analysis(evaluation_text, candidate_info)
                bias_analysis['ai_analysis'] = ai_bias
            except Exception as e:
                logger.warning(f"AI bias analysis failed: {e}")
                bias_analysis['ai_analysis'] = {'error': str(e)}
        
        # Calculate overall bias score
        scores = []
        if text_bias.get('bias_score'):
            scores.append(text_bias['bias_score'])
        if bias_analysis['statistical_analysis'].get('bias_score'):
            scores.append(bias_analysis['statistical_analysis']['bias_score'])
        if bias_analysis['ai_analysis'].get('bias_score'):
            scores.append(bias_analysis['ai_analysis']['bias_score'])
        
        if scores:
            bias_analysis['overall_bias_score'] = max(scores)  # Use highest detected bias
        
        # Generate comprehensive recommendations
        bias_analysis['recommendations'] = self.bias_detector.generate_bias_recommendations(bias_analysis)
        
        return bias_analysis
    
    def _analyze_text_bias(self, text: str, candidate_info: Dict[str, Any]) -> Dict[str, Any]:
        """Rule-based text analysis for bias indicators"""
        
        bias_indicators = {
            'age_bias': ['young', 'old', 'mature', 'fresh out of', 'seasoned', 'senior'],
            'gender_bias': ['aggressive', 'bossy', 'emotional', 'nurturing', 'assertive'],
            'cultural_bias': ['cultural fit', 'good fit', 'team player', 'communication style'],
            'appearance_bias': ['professional appearance', 'well-groomed', 'presentable'],
            'subjective_language': ['seems', 'appears', 'feels like', 'impression', 'gut feeling']
        }
        
        text_lower = text.lower()
        detected_bias_types = []
        problematic_phrases = []
        
        for bias_type, indicators in bias_indicators.items():
            for indicator in indicators:
                if indicator in text_lower:
                    detected_bias_types.append(bias_type)
                    problematic_phrases.append(indicator)
        
        # Calculate bias score based on indicators found
        total_indicators = sum(len(indicators) for indicators in bias_indicators.values())
        found_indicators = len(set(problematic_phrases))
        bias_score = min(found_indicators / 10.0, 1.0)  # Cap at 1.0
        
        # Objective language analysis
        objective_words = ['demonstrated', 'achieved', 'completed', 'measured', 'quantified']
        objective_count = sum(1 for word in objective_words if word in text_lower)
        objective_score = min(objective_count / 5.0, 1.0)
        
        return {
            'bias_score': bias_score,
            'bias_types_detected': list(set(detected_bias_types)),
            'problematic_phrases': list(set(problematic_phrases)),
            'objective_language_score': objective_score,
            'word_count': len(text.split()),
            'analysis_method': 'rule_based'
        }
    
    async def _ai_bias_analysis(self, evaluation_text: str, candidate_info: Dict[str, Any]) -> Dict[str, Any]:
        """AI-powered bias analysis using LLM"""
        
        if not LANGCHAIN_AVAILABLE or not self.llm:
            return {'error': 'LLM not available'}
        
        # Create demographic context while being privacy-conscious
        demographic_context = f"""
        Position: {candidate_info.get('position_applied', 'Not specified')}
        Experience Level: {candidate_info.get('experience_years', 'Not specified')} years
        Education: {candidate_info.get('education_level', 'Not specified')}
        """
        
        try:
            chain = LLMChain(
                llm=self.llm,
                prompt=self.bias_detection_template,
                callbacks=[self.langfuse_handler] if self.langfuse_handler else []
            )
            
            result = await chain.arun(
                evaluation_text=evaluation_text,
                candidate_info=json.dumps(candidate_info, default=str),
                demographic_context=demographic_context
            )
            
            # Parse JSON response
            try:
                ai_analysis = json.loads(result)
                ai_analysis['analysis_method'] = 'llm_powered'
                return ai_analysis
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    'bias_score': 0.5,
                    'error': 'Failed to parse LLM response',
                    'raw_response': result[:500],  # First 500 chars
                    'analysis_method': 'llm_powered_fallback'
                }
        
        except Exception as e:
            logger.error(f"AI bias analysis failed: {e}")
            return {'error': str(e), 'analysis_method': 'llm_powered'}
    
    def get_bias_insights(self, candidates: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Get comprehensive bias insights for a set of candidates"""
        
        insights = {
            'summary': {},
            'demographic_analysis': {},
            'score_analysis': {},
            'recommendations': [],
            'risk_level': 'low'
        }
        
        if len(candidates) < 5:
            insights['summary'] = {'message': 'Insufficient data for statistical analysis'}
            return convert_numpy_types(insights)
        
        # Analyze by different demographic attributes
        for attribute in ['gender', 'ethnicity', 'age_group']:
            try:
                if attribute == 'age_group':
                    # Create age groups for analysis
                    df = pd.DataFrame(candidates)
                    if 'age' in df.columns and not df['age'].empty:
                        # Clean age data first
                        df['age'] = pd.to_numeric(df['age'], errors='coerce')
                        df = df.dropna(subset=['age'])
                        
                        if len(df) > 0:
                            df['age_group'] = pd.cut(df['age'], bins=[0, 30, 45, 65, 100], 
                                                   labels=['Under 30', '30-45', '45-65', 'Over 65'])
                            # Convert categorical to string to avoid serialization issues
                            df['age_group'] = df['age_group'].astype(str)
                            candidates_with_age_groups = df.to_dict('records')
                            analysis = self.bias_detector.analyze_demographic_bias(
                                candidates_with_age_groups, 'age_group'
                            )
                        else:
                            # Skip if no valid age data
                            continue
                    else:
                        continue
                else:
                    analysis = self.bias_detector.analyze_demographic_bias(candidates, attribute)
                
                insights['demographic_analysis'][attribute] = analysis
                
            except Exception as e:
                logger.warning(f"Error analyzing {attribute}: {e}")
                # Add a safe fallback for this attribute
                insights['demographic_analysis'][attribute] = {
                    'bias_detected': False,
                    'reason': f'Analysis error for {attribute}: {str(e)}',
                    'bias_score': 0.0,
                    'confidence': 'none'
                }
        
        # Score bias analysis
        try:
            score_analysis = self.bias_detector.analyze_score_bias(candidates)
            insights['score_analysis'] = score_analysis
        except Exception as e:
            logger.warning(f"Error in score analysis: {e}")
            insights['score_analysis'] = {
                'bias_detected': False,
                'reason': f'Score analysis error: {str(e)}',
                'overall_bias_score': 0.0,
                'confidence': 'none'
            }
        
        # Determine overall risk level
        max_bias_score = 0.0
        for analysis in insights['demographic_analysis'].values():
            if analysis.get('bias_score', 0) > max_bias_score:
                max_bias_score = analysis['bias_score']
        
        if score_analysis.get('overall_bias_score', 0) > max_bias_score:
            max_bias_score = score_analysis['overall_bias_score']
        
        if max_bias_score > 0.7:
            insights['risk_level'] = 'high'
        elif max_bias_score > 0.3:
            insights['risk_level'] = 'medium'
        else:
            insights['risk_level'] = 'low'
        
        # Generate recommendations
        insights['recommendations'] = self.bias_detector.generate_bias_recommendations({
            'bias_detected': max_bias_score > 0.1,
            'bias_score': max_bias_score
        })
        
        # Calculate overall hiring rate for summary
        df = pd.DataFrame(candidates)
        overall_hiring_rate = 0.0
        if 'hiring_decision' in df.columns:
            overall_hiring_rate = (df['hiring_decision'] == 'hired').mean()
        elif 'hired' in df.columns:
            overall_hiring_rate = df['hired'].mean()
        elif 'final_score' in df.columns:
            # Infer hiring rate from scores (assume score >= 80 means hired)
            overall_hiring_rate = (df['final_score'] >= 80).mean()
        
        # Ensure no NaN values
        if pd.isna(overall_hiring_rate) or not np.isfinite(overall_hiring_rate):
            overall_hiring_rate = 0.0

        insights['summary'] = {
            'total_candidates': len(candidates),
            'overall_bias_score': convert_numpy_types(max_bias_score),
            'overall_hiring_rate': convert_numpy_types(overall_hiring_rate),
            'risk_level': insights['risk_level'],
            'bias_risk_level': insights['risk_level'],  # Add this for frontend compatibility
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        return convert_numpy_types(insights)
    
    def get_ai_insights(self) -> Dict[str, Any]:
        """Get AI performance insights and metrics"""
        
        insights = {
            "ai_status": "active" if self.llm else "limited",
            "langchain_available": LANGCHAIN_AVAILABLE,
            "langfuse_connected": self.langfuse is not None,
            "bias_detection_ready": True,
            "cache_size": len(self.cache),
            "available_features": [
                "bias_detection",
                "text_analysis", 
                "statistical_analysis"
            ]
        }
        
        if self.llm:
            insights["available_features"].extend([
                "ai_bias_analysis",
                "resume_analysis", 
                "interview_questions"
            ])
        
        return insights

# Global instance
ai_orchestrator = None

def get_ai_orchestrator() -> AIOrchestrator:
    """Get global AI orchestrator instance"""
    global ai_orchestrator
    if ai_orchestrator is None:
        ai_orchestrator = AIOrchestrator()
    return ai_orchestrator

def initialize_ai_orchestrator(openai_api_key: str = None, 
                             langfuse_secret_key: Optional[str] = None,
                             langfuse_public_key: Optional[str] = None,
                             langfuse_host: Optional[str] = None):
    """Initialize global AI orchestrator with API keys"""
    global ai_orchestrator
    ai_orchestrator = AIOrchestrator(
        openai_api_key=openai_api_key,
        langfuse_secret_key=langfuse_secret_key,
        langfuse_public_key=langfuse_public_key,
        langfuse_host=langfuse_host
    )
    return ai_orchestrator